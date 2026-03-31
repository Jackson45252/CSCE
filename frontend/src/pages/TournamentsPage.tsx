import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Tournament } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { useState } from "react";

const filters = [
  ["all", "全部"],
  ["Upcoming", "即將開始"],
  ["Ongoing", "進行中"],
  ["Finished", "已結束"],
] as const;

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
      <PageHeader title="賽事">
        <div className="flex bg-gray-200 rounded-lg p-0.5">
          {filters.map(([s, label]) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
                filter === s
                  ? "bg-nba-navy text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </PageHeader>

      {filtered.length === 0 ? (
        <EmptyState message="找不到賽事" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Link
              key={t.id}
              to={`/tournaments/${t.id}`}
              className="block rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-200 group"
            >
              <div className="h-1.5 bg-nba-blue group-hover:bg-nba-red transition-colors" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold text-nba-navy group-hover:text-nba-blue transition-colors">{t.name}</h2>
                  <StatusBadge status={t.status} />
                </div>
                <p className="mt-2 text-sm text-gray-500">賽季：{t.season}</p>
                {t.startDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    {t.startDate} ~ {t.endDate}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
