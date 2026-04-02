import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Tournament, TournamentCategory } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { useState } from "react";

const statusFilters = [
  ["all", "全部"],
  ["Upcoming", "即將開始"],
  ["Ongoing", "進行中"],
  ["Finished", "已結束"],
] as const;

function TournamentCard({ t }: { t: Tournament }) {
  return (
    <Link
      to={`/tournaments/${t.id}`}
      className="block rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-200 group"
    >
      <div className="h-1.5 bg-nba-blue group-hover:bg-nba-red transition-colors" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-bold text-nba-navy group-hover:text-nba-blue transition-colors">{t.name}</h2>
          <StatusBadge status={t.status} />
        </div>
        <p className="mt-2 text-sm text-gray-500">屆次：{t.season}</p>
        {t.startDate && (
          <p className="text-xs text-gray-400 mt-1">
            {t.startDate} ~ {t.endDate}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function TournamentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");

  const { data: categories } = useQuery({
    queryKey: ["tournament-categories"],
    queryFn: () => fetchApi<TournamentCategory[]>("/tournament-categories"),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => fetchApi<Tournament[]>("/tournaments"),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  const filtered = data!.filter((t) => {
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchCategory = selectedCategory === "all" || t.categoryId === selectedCategory;
    return matchStatus && matchCategory;
  });

  // Group by category
  const uncategorized = filtered.filter((t) => !t.categoryId);
  const categoryGroups = (categories ?? [])
    .map((cat) => ({
      category: cat,
      tournaments: filtered.filter((t) => t.categoryId === cat.id),
    }))
    .filter((g) => g.tournaments.length > 0);

  return (
    <div>
      <PageHeader title="賽事">
        <div className="flex bg-gray-200 rounded-lg p-0.5">
          {statusFilters.map(([s, label]) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
                statusFilter === s
                  ? "bg-nba-navy text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Category filter tabs */}
      {categories && categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${
              selectedCategory === "all"
                ? "bg-nba-navy text-white border-nba-navy"
                : "bg-white text-gray-600 border-gray-300 hover:border-nba-blue"
            }`}
          >
            全部盃賽
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${
                selectedCategory === cat.id
                  ? "bg-nba-blue text-white border-nba-blue"
                  : "bg-white text-gray-600 border-gray-300 hover:border-nba-blue"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState message="找不到賽事" />
      ) : selectedCategory !== "all" ? (
        // Single category view — flat grid
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => <TournamentCard key={t.id} t={t} />)}
        </div>
      ) : (
        // All view — grouped by category
        <div className="space-y-8">
          {categoryGroups.map(({ category, tournaments }) => (
            <div key={category.id}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-extrabold text-nba-navy tracking-wide">{category.name}</h2>
                {category.description && (
                  <span className="text-sm text-gray-400">{category.description}</span>
                )}
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tournaments.map((t) => <TournamentCard key={t.id} t={t} />)}
              </div>
            </div>
          ))}
          {uncategorized.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-extrabold text-gray-400 tracking-wide">其他賽事</h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {uncategorized.map((t) => <TournamentCard key={t.id} t={t} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
