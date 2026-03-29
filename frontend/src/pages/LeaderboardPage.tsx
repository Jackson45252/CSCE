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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">排行榜</h1>
        {tournament && <p className="text-gray-500">{tournament.name}</p>}
      </div>
      {sorted.length === 0 ? (
        <EmptyState message="暫無統計資料" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                {([["rank", "#"], ["playerName", "球員"], ["teamName", "隊伍"], ["tournamentTotalPoints", "總得分"]] as [SortKey, string][]).map(
                  ([key, label]) => (
                    <th key={key}
                      className={`px-3 py-2 cursor-pointer select-none hover:text-gray-700 ${key === "tournamentTotalPoints" ? "text-right" : ""}`}
                      onClick={() => toggleSort(key)}>
                      {label} {sortKey === key ? (asc ? "\u25B2" : "\u25BC") : ""}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => (
                <tr key={e.playerId} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-400">{e.rank}</td>
                  <td className="px-3 py-2">
                    <Link to={`/players/${e.playerId}`} className="text-indigo-600 hover:underline">{e.playerName}</Link>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{e.teamName}</td>
                  <td className="px-3 py-2 text-right font-bold">{e.tournamentTotalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
