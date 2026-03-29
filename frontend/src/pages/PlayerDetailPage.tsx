import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Player, PlayerGameStats } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { pct } from "../utils/format";

export default function PlayerDetailPage() {
  const { id } = useParams();

  const { data: player, isLoading, error } = useQuery({
    queryKey: ["player", id],
    queryFn: () => fetchApi<Player>(`/players/${id}`),
  });
  const { data: stats } = useQuery({
    queryKey: ["player-stats", id],
    queryFn: () => fetchApi<PlayerGameStats[]>(`/playergamestats`),
    select: (all) => all.filter((s) => s.playerId === Number(id)),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;
  if (!player) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{player.name}</h1>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">比賽數據</h2>
        {!stats || stats.length === 0 ? (
          <EmptyState message="暫無比賽數據" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-gray-500">
                  <th className="px-3 py-2">比賽</th>
                  <th className="px-3 py-2">隊伍</th>
                  <th className="px-3 py-2 text-right">2PT</th>
                  <th className="px-3 py-2 text-right">3PT</th>
                  <th className="px-3 py-2 text-right">FT</th>
                  <th className="px-3 py-2 text-right">FG%</th>
                  <th className="px-3 py-2 text-right font-bold">PTS</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <Link to={`/games/${s.gameId}`} className="text-indigo-600 hover:underline">比賽 #{s.gameId}</Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link to={`/teams/${s.teamId}`} className="hover:underline">{s.teamName}</Link>
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
        )}
      </section>
    </div>
  );
}
