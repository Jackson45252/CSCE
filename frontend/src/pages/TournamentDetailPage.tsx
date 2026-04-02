import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Tournament, TournamentTeam, Game, LeaderboardEntry, TournamentStanding } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import Tabs from "../components/Tabs";
import { useState } from "react";

export default function TournamentDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("standings");

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
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard", id],
    queryFn: () => fetchApi<LeaderboardEntry[]>(`/tournaments/${id}/leaderboard`),
  });
  const { data: standings } = useQuery({
    queryKey: ["standings", id],
    queryFn: () => fetchApi<TournamentStanding[]>(`/tournaments/${id}/standings`),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;
  if (!tournament) return null;

  return (
    <div>
      {/* Tournament header banner */}
      <div className="scoreboard-bg rounded-xl px-8 py-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide">{tournament.name}</h1>
            <p className="text-blue-200 text-sm mt-1">
              賽季 {tournament.season} &middot; {tournament.startDate} ~ {tournament.endDate}
            </p>
          </div>
          <StatusBadge status={tournament.status} />
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "standings", label: "戰績" },
          { key: "teams", label: "參賽隊伍" },
          { key: "games", label: "比賽" },
          { key: "leaderboard", label: "排行榜" },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "standings" && (
        <>
          {!standings || standings.length === 0 ? (
            <EmptyState message="尚無戰績資料" />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-sm nba-table">
                <thead>
                  <tr className="bg-nba-navy text-white text-[11px] uppercase tracking-wider">
                    <th className="px-4 py-2.5 text-left font-semibold w-10">#</th>
                    <th className="px-4 py-2.5 text-left font-semibold">隊伍</th>
                    <th className="px-4 py-2.5 text-center font-semibold">勝</th>
                    <th className="px-4 py-2.5 text-center font-semibold">敗</th>
                    <th className="px-4 py-2.5 text-center font-semibold">總得分</th>
                    <th className="px-4 py-2.5 text-center font-semibold">總失分</th>
                    <th className="px-4 py-2.5 text-center font-semibold">得失分差</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, i) => {
                    const diff = s.pointsFor - s.pointsAgainst;
                    return (
                      <tr key={s.teamId} className="border-b border-gray-100">
                        <td className="px-4 py-2.5 text-gray-400 text-center">{i + 1}</td>
                        <td className="px-4 py-2.5">
                          <Link to={`/teams/${s.teamId}`} className="font-semibold text-nba-navy hover:text-nba-blue transition-colors">
                            {s.teamName}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-center font-extrabold text-green-600 tabular-nums">{s.wins}</td>
                        <td className="px-4 py-2.5 text-center font-extrabold text-nba-red tabular-nums">{s.losses}</td>
                        <td className="px-4 py-2.5 text-center tabular-nums">{s.pointsFor}</td>
                        <td className="px-4 py-2.5 text-center tabular-nums">{s.pointsAgainst}</td>
                        <td className={`px-4 py-2.5 text-center font-semibold tabular-nums ${diff > 0 ? "text-green-600" : diff < 0 ? "text-nba-red" : "text-gray-400"}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "teams" && (
        <>
          {!teams || teams.length === 0 ? (
            <EmptyState message="尚無報名隊伍" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((t) => (
                <Link key={t.teamId} to={`/teams/${t.teamId}`}
                  className="flex items-center gap-3 rounded-lg bg-white border border-gray-200 px-4 py-3 hover:shadow-md hover:border-nba-blue transition group">
                  <div className="w-10 h-10 rounded-full bg-nba-navy flex items-center justify-center text-white font-bold text-sm">
                    {t.teamName[0]}
                  </div>
                  <span className="font-semibold text-nba-navy group-hover:text-nba-blue transition-colors">{t.teamName}</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "games" && (
        <>
          {!games || games.length === 0 ? (
            <EmptyState message="尚無排定比賽" />
          ) : (
            <div className="space-y-2">
              {games.map((g) => (
                <Link key={g.id} to={`/games/${g.id}`}
                  className="flex items-center justify-between rounded-lg bg-white border border-gray-200 px-5 py-3 hover:shadow-md hover:border-nba-blue transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-bold text-nba-navy">{g.homeTeamName}</span>
                    {g.status === "Finished" ? (
                      <span className="font-extrabold text-nba-navy tabular-nums">
                        {g.homeScore} - {g.awayScore}
                      </span>
                    ) : (
                      <span className="text-gray-300 font-bold">VS</span>
                    )}
                    <span className="font-bold text-nba-navy">{g.awayTeamName}</span>
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

      {activeTab === "leaderboard" && (
        <>
          {!leaderboard || leaderboard.length === 0 ? (
            <EmptyState message="暫無統計資料" />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-sm nba-table">
                <thead>
                  <tr className="bg-nba-navy text-white text-[11px] uppercase tracking-wider">
                    <th className="px-4 py-2.5 text-left font-semibold w-12">#</th>
                    <th className="px-4 py-2.5 text-left font-semibold">球員</th>
                    <th className="px-4 py-2.5 text-left font-semibold">隊伍</th>
                    <th className="px-4 py-2.5 text-right font-semibold">總得分</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((e, i) => (
                    <tr key={e.playerId} className="border-b border-gray-100">
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          i < 3 ? "bg-nba-gold text-nba-navy" : "text-gray-400"
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium">
                        <Link to={`/players/${e.playerId}`} className="text-nba-blue hover:underline">{e.playerName}</Link>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{e.teamName}</td>
                      <td className="px-4 py-2.5 text-right font-extrabold text-nba-navy tabular-nums">{e.tournamentTotalPoints}</td>
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
