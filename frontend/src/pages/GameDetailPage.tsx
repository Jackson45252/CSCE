import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Game, BoxScoreEntry } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import StatusBadge from "../components/StatusBadge";
import { pct } from "../utils/format";

export default function GameDetailPage() {
  const { id } = useParams();

  const { data: game, isLoading, error } = useQuery({
    queryKey: ["game", id],
    queryFn: () => fetchApi<Game>(`/games/${id}`),
  });
  const { data: boxscore } = useQuery({
    queryKey: ["boxscore", id],
    queryFn: () => fetchApi<BoxScoreEntry[]>(`/games/${id}/boxscore`),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;
  if (!game) return null;

  const homeStats = boxscore?.filter((s) => s.teamId === game.homeTeamId) ?? [];
  const awayStats = boxscore?.filter((s) => s.teamId === game.awayTeamId) ?? [];

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-6 text-2xl font-bold text-gray-800">
          <Link to={`/teams/${game.homeTeamId}`} className="hover:text-indigo-600">{game.homeTeamName}</Link>
          {game.status === "Finished" ? (
            <span>{game.homeScore} - {game.awayScore}</span>
          ) : (
            <span className="text-gray-400">vs</span>
          )}
          <Link to={`/teams/${game.awayTeamId}`} className="hover:text-indigo-600">{game.awayTeamName}</Link>
        </div>
        <div className="mt-2 flex items-center justify-center gap-3 text-sm text-gray-500">
          <StatusBadge status={game.status} />
          <span>{new Date(game.scheduledAt).toLocaleString()}</span>
          {game.location && <span>&middot; {game.location}</span>}
        </div>
      </div>

      {[{ label: game.homeTeamName, stats: homeStats }, { label: game.awayTeamName, stats: awayStats }].map(
        ({ label, stats }) => (
          <section key={label} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">{label}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-500">
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">球員</th>
                    <th className="px-3 py-2 text-right">2PT</th>
                    <th className="px-3 py-2 text-right">3PT</th>
                    <th className="px-3 py-2 text-right">FT</th>
                    <th className="px-3 py-2 text-right">FG%</th>
                    <th className="px-3 py-2 text-right font-bold">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => (
                    <tr key={s.playerId} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400">{s.jerseyNumber ?? "-"}</td>
                      <td className="px-3 py-2">
                        <Link to={`/players/${s.playerId}`} className="text-indigo-600 hover:underline">{s.playerName}</Link>
                      </td>
                      <td className="px-3 py-2 text-right">{s.twoPointPoints}/{s.twoPointAttempts} <span className="text-gray-400">{pct(s.twoPointPoints, s.twoPointAttempts)}</span></td>
                      <td className="px-3 py-2 text-right">{s.threePointPoints}/{s.threePointAttempts} <span className="text-gray-400">{pct(s.threePointPoints, s.threePointAttempts)}</span></td>
                      <td className="px-3 py-2 text-right">{s.freeThrowPoints}/{s.freeThrowAttempts} <span className="text-gray-400">{pct(s.freeThrowPoints, s.freeThrowAttempts)}</span></td>
                      <td className="px-3 py-2 text-right">{pct(s.twoPointPoints + s.threePointPoints, s.twoPointAttempts + s.threePointAttempts)}</td>
                      <td className="px-3 py-2 text-right font-bold">{s.totalPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      )}
    </div>
  );
}
