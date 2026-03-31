import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Team, TeamMember, Game } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import Tabs from "../components/Tabs";
import { useState } from "react";

export default function TeamDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("roster");

  const { data: team, isLoading, error } = useQuery({
    queryKey: ["team", id],
    queryFn: () => fetchApi<Team>(`/teams/${id}`),
  });
  const { data: members } = useQuery({
    queryKey: ["team-members", id],
    queryFn: () => fetchApi<TeamMember[]>(`/teams/${id}/members`),
  });
  const { data: games } = useQuery({
    queryKey: ["team-games", id],
    queryFn: () => fetchApi<Game[]>(`/teams/${id}/games`),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;
  if (!team) return null;

  return (
    <div>
      {/* Team header */}
      <div className="scoreboard-bg rounded-xl px-8 py-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white font-extrabold text-2xl border-2 border-white/20">
          {team.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">{team.name}</h1>
          <p className="text-blue-200 text-sm mt-0.5">{members?.length ?? 0} 位球員</p>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "roster", label: "球員名單" },
          { key: "games", label: "比賽紀錄" },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "roster" && (
        <>
          {!members || members.length === 0 ? (
            <EmptyState message="尚無成員" />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-sm nba-table">
                <thead>
                  <tr className="bg-nba-navy text-white text-[11px] uppercase tracking-wider">
                    <th className="px-4 py-2.5 text-left font-semibold w-16">#</th>
                    <th className="px-4 py-2.5 text-left font-semibold">球員</th>
                    <th className="px-4 py-2.5 text-left font-semibold">加入日期</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100">
                      <td className="px-4 py-2.5 font-bold text-nba-navy">{m.jerseyNumber ?? "-"}</td>
                      <td className="px-4 py-2.5 font-medium">
                        <Link to={`/players/${m.playerId}`} className="text-nba-blue hover:underline">{m.playerName}</Link>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">{new Date(m.joinedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "games" && (
        <>
          {!games || games.length === 0 ? (
            <EmptyState message="尚無比賽紀錄" />
          ) : (
            <div className="space-y-2">
              {games.map((g) => (
                <Link key={g.id} to={`/games/${g.id}`}
                  className="flex items-center justify-between rounded-lg bg-white border border-gray-200 px-5 py-3 hover:shadow-md hover:border-nba-blue transition">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${g.homeTeamId === Number(id) ? "text-nba-blue" : "text-nba-navy"}`}>
                      {g.homeTeamName}
                    </span>
                    {g.status === "Finished" ? (
                      <span className="font-extrabold text-nba-navy tabular-nums">
                        {g.homeScore} - {g.awayScore}
                      </span>
                    ) : (
                      <span className="text-gray-300 font-bold">VS</span>
                    )}
                    <span className={`font-bold ${g.awayTeamId === Number(id) ? "text-nba-blue" : "text-nba-navy"}`}>
                      {g.awayTeamName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={g.status} />
                    <span className="text-xs text-gray-400">{new Date(g.scheduledAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
