import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Team } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

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
      <PageHeader title="隊伍" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((t) => (
          <Link key={t.id} to={`/teams/${t.id}`}
            className="flex items-center gap-4 rounded-lg bg-white border border-gray-200 p-5 hover:shadow-lg hover:border-nba-blue transition group">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-nba-navy text-white font-extrabold text-lg shrink-0">
              {t.name[0]}
            </div>
            <div>
              <h2 className="font-bold text-nba-navy group-hover:text-nba-blue transition-colors">{t.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">EST. {new Date(t.createdAt).getFullYear()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
