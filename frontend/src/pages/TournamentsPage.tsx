import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Tournament } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { useState } from "react";

export default function TournamentsPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data, isLoading, error } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => fetchApi<Tournament[]>("/tournaments"),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  const filtered = filter === "all" ? data! : data!.filter((t) => t.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">賽事</h1>
        <div className="flex gap-2">
          {([["all", "全部"], ["Upcoming", "即將開始"], ["Ongoing", "進行中"], ["Finished", "已結束"]] as const).map(([s, label]) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded text-sm ${filter === s ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState message="找不到賽事" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Link
              key={t.id}
              to={`/tournaments/${t.id}`}
              className="block rounded-lg border bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <h2 className="font-semibold text-gray-800">{t.name}</h2>
                <StatusBadge status={t.status} />
              </div>
              <p className="mt-1 text-sm text-gray-500">賽季：{t.season}</p>
              {t.startDate && (
                <p className="text-sm text-gray-500">
                  {t.startDate} ~ {t.endDate}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
