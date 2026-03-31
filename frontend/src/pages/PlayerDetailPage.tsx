import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Player, PlayerGameStats, PlayerTeam } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import ShootingStatsTable from "../components/ShootingStatsTable";
import Tabs from "../components/Tabs";
import { useState } from "react";

export default function PlayerDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("stats");

  const { data: player, isLoading, error } = useQuery({
    queryKey: ["player", id],
    queryFn: () => fetchApi<Player>(`/players/${id}`),
  });
  const { data: stats } = useQuery({
    queryKey: ["player-stats", id],
    queryFn: () => fetchApi<PlayerGameStats[]>(`/playergamestats`),
    select: (all) => all.filter((s) => s.playerId === Number(id)),
  });
  const { data: teams } = useQuery({
    queryKey: ["player-teams", id],
    queryFn: () => fetchApi<PlayerTeam[]>(`/players/${id}/teams`),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;
  if (!player) return null;

  const prefixColumns = [
    {
      key: "game",
      label: "比賽",
      render: (s: PlayerGameStats) => (
        <Link to={`/games/${s.gameId}`} className="text-nba-blue hover:underline font-medium">比賽 #{s.gameId}</Link>
      ),
    },
    {
      key: "team",
      label: "隊伍",
      render: (s: PlayerGameStats) => (
        <Link to={`/teams/${s.teamId}`} className="hover:underline text-gray-600">{s.teamName}</Link>
      ),
    },
  ];

  return (
    <div>
      {/* Player header */}
      <div className="scoreboard-bg rounded-xl px-8 py-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white font-extrabold text-2xl border-2 border-white/20">
          {player.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">{player.name}</h1>
          <p className="text-blue-200 text-sm mt-0.5">
            {stats?.length ?? 0} 場比賽 &middot; {teams?.length ?? 0} 支隊伍
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "stats", label: "比賽數據" },
          { key: "teams", label: "所屬隊伍" },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "stats" && (
        <>
          {!stats || stats.length === 0 ? (
            <EmptyState message="暫無比賽數據" />
          ) : (
            <ShootingStatsTable data={stats} prefixColumns={prefixColumns} />
          )}
        </>
      )}

      {activeTab === "teams" && (
        <>
          {!teams || teams.length === 0 ? (
            <EmptyState message="尚未加入任何隊伍" />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-sm nba-table">
                <thead>
                  <tr className="bg-nba-navy text-white text-[11px] uppercase tracking-wider">
                    <th className="px-4 py-2.5 text-left font-semibold">隊伍</th>
                    <th className="px-4 py-2.5 text-left font-semibold">背號</th>
                    <th className="px-4 py-2.5 text-left font-semibold">加入日期</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t.teamId} className="border-b border-gray-100">
                      <td className="px-4 py-2.5 font-medium">
                        <Link to={`/teams/${t.teamId}`} className="text-nba-blue hover:underline">{t.teamName}</Link>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-nba-navy">#{t.jerseyNumber ?? "-"}</td>
                      <td className="px-4 py-2.5 text-gray-500">{new Date(t.joinedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
