import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Tournament, TournamentTeam, Game } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

export default function TournamentDetailPage() {
  const { id } = useParams();

  const { data: tournament, isLoading, error } = useQuery({
    queryKey: ["tournament", id],
    queryFn: () => fetchApi<Tournament>(`/tournaments/${id}`),
  });
  const { data: teams } = useQuery({
    queryKey: ["tournament-teams", id],
    queryFn: () => fetchApi<TournamentTeam[]>(`/tournaments/${id}/teams`),
  });
  const { data: games } = useQuery({
    queryKey: ["tournament-games", id],
    queryFn: () => fetchApi<Game[]>(`/games?tournamentId=${id}`),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;
  if (!tournament) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{tournament.name}</h1>
          <p className="text-gray-500">賽季 {tournament.season} &middot; {tournament.startDate} ~ {tournament.endDate}</p>
        </div>
        <div className="flex gap-2 items-center">
          <StatusBadge status={tournament.status} />
          <Link to={`/tournaments/${id}/leaderboard`} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
            排行榜
          </Link>
        </div>
      </div>

      {/* Teams */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">參賽隊伍</h2>
        {!teams || teams.length === 0 ? (
          <EmptyState message="尚無報名隊伍" />
        ) : (
          <div className="flex flex-wrap gap-3">
            {teams.map((t) => (
              <Link key={t.teamId} to={`/teams/${t.teamId}`}
                className="rounded-lg border bg-white px-4 py-2 hover:shadow transition text-sm font-medium text-gray-700">
                {t.teamName}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Games */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">比賽</h2>
        {!games || games.length === 0 ? (
          <EmptyState message="尚無排定比賽" />
        ) : (
          <div className="space-y-3">
            {games.map((g) => (
              <Link key={g.id} to={`/games/${g.id}`}
                className="flex items-center justify-between rounded-lg border bg-white px-5 py-3 hover:shadow transition">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-800">{g.homeTeamName}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="font-medium text-gray-800">{g.awayTeamName}</span>
                </div>
                <div className="flex items-center gap-4">
                  {g.status === "Finished" && (
                    <span className="font-bold text-gray-700">{g.homeScore} - {g.awayScore}</span>
                  )}
                  <StatusBadge status={g.status} />
                  <span className="text-xs text-gray-400">{new Date(g.scheduledAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
