import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { LeaderboardEntry, Tournament } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { useState, useMemo } from "react";

type SortKey = "rank" | "playerName" | "teamName" | "tournamentTotalPoints";

export default function LeaderboardPage() {
  const { id } = useParams();
  const [sortKey, setSortKey] = useState<SortKey>("tournamentTotalPoints");
  const [asc, setAsc] = useState(false);

  const { data: tournament } = useQuery({
    queryKey: ["tournament", id],
    queryFn: () => fetchApi<Tournament>(`/tournaments/${id}`),
  });
  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard", id],
    queryFn: () => fetchApi<LeaderboardEntry[]>(`/tournaments/${id}/leaderboard`),
  });

  const sorted = useMemo(() => {
    if (!data) return [];
    const list = data.map((e, i) => ({ ...e, rank: i + 1 }));
    if (sortKey === "rank" || sortKey === "tournamentTotalPoints") {
      list.sort((a, b) => asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);
    } else {
      list.sort((a, b) => asc ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]));
    }
    return list;
  }, [data, sortKey, asc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setAsc(!asc);
    else { setSortKey(key); setAsc(key === "playerName" || key === "teamName"); }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div>
      <div className="scoreboard-bg rounded-xl px-8 py-6 mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-wide">排行榜</h1>
        {tournament && <p className="text-blue-200 text-sm mt-1">{tournament.name}</p>}
      </div>

      {sorted.length === 0 ? (
        <EmptyState message="暫無統計資料" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm nba-table">
            <thead>
              <tr className="bg-nba-navy text-white text-[11px] uppercase tracking-wider">
                {([["rank", "#"], ["playerName", "球員"], ["teamName", "隊伍"], ["tournamentTotalPoints", "總得分"]] as [SortKey, string][]).map(
                  ([key, label]) => (
                    <th key={key}
                      className={`px-4 py-2.5 cursor-pointer select-none hover:text-nba-gold transition-colors font-semibold ${key === "tournamentTotalPoints" ? "text-right" : "text-left"}`}
                      onClick={() => toggleSort(key)}>
                      {label} {sortKey === key ? (asc ? "\u25B2" : "\u25BC") : ""}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => (
                <tr key={e.playerId} className="border-b border-gray-100">
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      e.rank <= 3 ? "bg-nba-gold text-nba-navy" : "text-gray-400"
                    }`}>
                      {e.rank}
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
    </div>
  );
}
