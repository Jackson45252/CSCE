import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Game, Player, Team, PlayerGameStats } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import { useState } from "react";
import { pct } from "../../utils/format";

const defaultForm = { gameId: "", playerId: "", teamId: "",
  twoPointAttempts: "0", twoPointPoints: "0", threePointAttempts: "0", threePointPoints: "0",
  freeThrowAttempts: "0", freeThrowPoints: "0" };

export default function StatsAdmin() {
  const qc = useQueryClient();
  const [selectedGame, setSelectedGame] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "away">("home");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; stats?: PlayerGameStats } | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: games } = useQuery({ queryKey: ["games"], queryFn: () => fetchApi<Game[]>("/games") });
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => fetchApi<Player[]>("/players") });
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: () => fetchApi<Team[]>("/teams") });
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["game-stats", selectedGame],
    queryFn: () => fetchApi<PlayerGameStats[]>(`/playergamestats?gameId=${selectedGame}`),
    enabled: !!selectedGame,
  });

  const save = useMutation({
    mutationFn: () => {
      const body = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, ["gameId", "playerId", "teamId"].includes(k) ? Number(v) : Number(v)]));
      return modal?.mode === "edit" ? putApi(`/playergamestats/${modal.stats!.id}`, body) : postApi("/playergamestats", body);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["game-stats", selectedGame] }); setModal(null); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteApi(`/playergamestats/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["game-stats", selectedGame] }),
  });

  const currentGame = games?.find((g) => g.id.toString() === selectedGame);
  const homeStats = stats?.filter((s) => s.teamId === currentGame?.homeTeamId) ?? [];
  const awayStats = stats?.filter((s) => s.teamId === currentGame?.awayTeamId) ?? [];
  const displayedStats = activeTab === "home" ? homeStats : awayStats;

  const openAdd = () => { setForm({ ...defaultForm, gameId: selectedGame }); setModal({ mode: "add" }); };
  const openEdit = (s: PlayerGameStats) => {
    setForm({ gameId: s.gameId.toString(), playerId: s.playerId.toString(), teamId: s.teamId.toString(),
      twoPointAttempts: s.twoPointAttempts.toString(), twoPointPoints: s.twoPointPoints.toString(),
      threePointAttempts: s.threePointAttempts.toString(), threePointPoints: s.threePointPoints.toString(),
      freeThrowAttempts: s.freeThrowAttempts.toString(), freeThrowPoints: s.freeThrowPoints.toString() });
    setModal({ mode: "edit", stats: s });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">數據登錄</h2>
        <div className="flex gap-2">
          <select value={selectedGame} onChange={(e) => { setSelectedGame(e.target.value); setActiveTab("home"); }} className="rounded border px-2 py-1.5 text-sm">
            <option value="">選擇比賽</option>
            {games?.map((g) => <option key={g.id} value={g.id}>{g.homeTeamName} vs {g.awayTeamName}</option>)}
          </select>
          {selectedGame && <button onClick={openAdd} className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">+ 新增數據</button>}
        </div>
      </div>

      {isLoading && <Loading />}
      {error && <ErrorMessage message={(error as Error).message} />}
      {stats && currentGame && (
        <>
          <div className="flex border-b mb-4">
            {([["home", currentGame.homeTeamName], ["away", currentGame.awayTeamName]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-3 py-2">球員</th>
              <th className="px-3 py-2 text-right">2PT</th><th className="px-3 py-2 text-right">3PT</th>
              <th className="px-3 py-2 text-right">FT</th><th className="px-3 py-2 text-right">FG%</th><th className="px-3 py-2 text-right font-bold">PTS</th>
              <th className="px-3 py-2 text-right">操作</th>
            </tr></thead>
            <tbody>
              {displayedStats.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{s.playerName}</td>
                  <td className="px-3 py-2 text-right">{s.twoPointPoints}/{s.twoPointAttempts} <span className="text-gray-400">{pct(s.twoPointPoints, s.twoPointAttempts)}</span></td>
                  <td className="px-3 py-2 text-right">{s.threePointPoints}/{s.threePointAttempts} <span className="text-gray-400">{pct(s.threePointPoints, s.threePointAttempts)}</span></td>
                  <td className="px-3 py-2 text-right">{s.freeThrowPoints}/{s.freeThrowAttempts} <span className="text-gray-400">{pct(s.freeThrowPoints, s.freeThrowAttempts)}</span></td>
                  <td className="px-3 py-2 text-right">{pct(s.twoPointPoints + s.threePointPoints, s.twoPointAttempts + s.threePointAttempts)}</td>
                  <td className="px-3 py-2 text-right font-bold">{s.totalPoints}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button onClick={() => openEdit(s)} className="text-indigo-600 hover:underline text-xs">編輯</button>
                    <button onClick={() => { if (confirm("確定刪除？")) remove.mutate(s.id); }} className="text-red-500 hover:underline text-xs">刪除</button>
                  </td>
                </tr>
              ))}
              {displayedStats.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-400">尚無數據</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "編輯數據" : "新增數據"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
          {modal?.mode === "add" && (
            <>
              <select value={form.playerId} onChange={(e) => setForm({ ...form, playerId: e.target.value })} required className="w-full rounded border px-3 py-2 text-sm">
                <option value="">球員</option>
                {players?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })} required className="w-full rounded border px-3 py-2 text-sm">
                <option value="">隊伍</option>
                {teams?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </>
          )}
          {([
            ["twoPointAttempts", "兩分出手"],
            ["twoPointPoints", "兩分命中"],
            ["threePointAttempts", "三分出手"],
            ["threePointPoints", "三分命中"],
            ["freeThrowAttempts", "罰球出手"],
            ["freeThrowPoints", "罰球命中"],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <label className="w-40 text-sm text-gray-600">{label}</label>
              <input type="number" min="0" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="flex-1 rounded border px-3 py-2 text-sm" />
            </div>
          ))}
          <button type="submit" className="w-full rounded bg-indigo-600 py-2 text-sm text-white hover:bg-indigo-700">
            {save.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
