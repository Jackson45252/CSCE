import { useState } from "react";
import PlayerAdmin from "./PlayerAdmin";
import TeamAdmin from "./TeamAdmin";
import TournamentAdmin from "./TournamentAdmin";
import GameAdmin from "./GameAdmin";
import StatsAdmin from "./StatsAdmin";

const tabs = [
  { key: "players", label: "球員", component: PlayerAdmin },
  { key: "teams", label: "隊伍", component: TeamAdmin },
  { key: "tournaments", label: "賽事", component: TournamentAdmin },
  { key: "games", label: "比賽", component: GameAdmin },
  { key: "stats", label: "數據登錄", component: StatsAdmin },
];

export default function AdminPage() {
  const [active, setActive] = useState("players");
  const ActiveComponent = tabs.find((t) => t.key === active)!.component;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">管理後台</h1>
      <div className="flex gap-1 border-b mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActive(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              active === t.key ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      <ActiveComponent />
    </div>
  );
}
