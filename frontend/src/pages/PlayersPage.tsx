import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Player } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import { useState } from "react";

export default function PlayersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["players"],
    queryFn: () => fetchApi<Player[]>("/players"),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  const filtered = data!.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="球員">
        <input
          type="text"
          placeholder="搜尋球員..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border-2 border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-nba-blue transition-colors w-48"
        />
      </PageHeader>
      {filtered.length === 0 ? (
        <EmptyState message="找不到球員" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm nba-table">
            <thead>
              <tr className="bg-nba-navy text-white text-[11px] uppercase tracking-wider">
                <th className="px-4 py-2.5 text-left font-semibold">姓名</th>
                <th className="px-4 py-2.5 text-left font-semibold">建立日期</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="px-4 py-2.5 font-medium">
                    <Link to={`/players/${p.id}`} className="text-nba-blue hover:underline">{p.name}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
