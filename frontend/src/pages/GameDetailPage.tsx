import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Game, BoxScoreEntry } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import StatusBadge from "../components/StatusBadge";
import Tabs from "../components/Tabs";
import ShootingStatsTable from "../components/ShootingStatsTable";
import { useState } from "react";

export default function GameDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("home");

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
  const displayedStats = activeTab === "home" ? homeStats : awayStats;

  const prefixColumns = [
    {
      key: "jersey",
      label: "#",
      className: "px-3 py-2.5 w-12",
      render: (s: BoxScoreEntry) => <span className="font-bold text-nba-navy">{s.jerseyNumber ?? "-"}</span>,
    },
    {
      key: "player",
      label: "球員",
      render: (s: BoxScoreEntry) => (
        <Link to={`/players/${s.playerId}`} className="text-nba-blue hover:underline font-medium">
          {s.playerName}
        </Link>
      ),
    },
  ];

  return (
    <div>
      {/* Scoreboard */}
      <div className="scoreboard-bg rounded-xl px-8 py-8 mb-6 text-center">
        <div className="flex items-center justify-center gap-8">
          <Link to={`/teams/${game.homeTeamId}`} className="text-center group">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-2 border-2 border-white/20 group-hover:border-nba-gold transition-colors">
              {game.homeTeamName[0]}
            </div>
            <span className="text-white font-bold text-sm group-hover:text-nba-gold transition-colors">{game.homeTeamName}</span>
          </Link>

          <div className="text-center">
            {game.status === "Finished" ? (
              <div className="text-4xl font-extrabold text-white tabular-nums tracking-wider">
                {game.homeScore} <span className="text-white/40 mx-1">-</span> {game.awayScore}
              </div>
            ) : (
              <div className="text-3xl font-bold text-white/40">VS</div>
            )}
            <div className="mt-2 flex items-center justify-center gap-2">
              <StatusBadge status={game.status} />
            </div>
          </div>

          <Link to={`/teams/${game.awayTeamId}`} className="text-center group">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-2 border-2 border-white/20 group-hover:border-nba-gold transition-colors">
              {game.awayTeamName[0]}
            </div>
            <span className="text-white font-bold text-sm group-hover:text-nba-gold transition-colors">{game.awayTeamName}</span>
          </Link>
        </div>

        <div className="mt-3 text-blue-200 text-xs">
          {new Date(game.scheduledAt).toLocaleString()}
          {game.location && <span> &middot; {game.location}</span>}
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "home", label: game.homeTeamName },
          { key: "away", label: game.awayTeamName },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      <ShootingStatsTable
        data={displayedStats}
        prefixColumns={prefixColumns}
        emptyText="尚無數據"
      />
    </div>
  );
}
