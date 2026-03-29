import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Team } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

export default function TeamsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["teams"],
    queryFn: () => fetchApi<Team[]>("/teams"),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;
  if (!data || data.length === 0) return <EmptyState message="暫無隊伍" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">隊伍</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((t) => (
          <Link key={t.id} to={`/teams/${t.id}`}
            className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-lg">
              {t.name[0]}
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{t.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
