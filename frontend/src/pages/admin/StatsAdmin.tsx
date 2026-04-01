import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Game, TournamentRoster, PlayerGameStats } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import Tabs from "../../components/Tabs";
import PageHeader from "../../components/PageHeader";
import ShootingStatsTable from "../../components/ShootingStatsTable";
import { useState } from "react";

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
  const currentGame = games?.find((g) => g.id.toString() === selectedGame);
  const { data: rosterPlayers } = useQuery({
    queryKey: ["tournament-roster-for-stats", currentGame?.tournamentId, form.teamId],
    queryFn: () => fetchApi<TournamentRoster[]>(`/tournaments/${currentGame!.tournamentId}/teams/${form.teamId}/roster`),
    enabled: !!form.teamId && !!currentGame,
  });
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

  const prefixColumns = [
    {
      key: "player",
      label: "球員",
      render: (s: PlayerGameStats) => <span>{s.playerName}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="數據登錄" size="sm">
        <select value={selectedGame} onChange={(e) => { setSelectedGame(e.target.value); setActiveTab("home"); }} className="rounded border px-2 py-1.5 text-sm">
          <option value="">選擇比賽</option>
          {games?.map((g) => <option key={g.id} value={g.id}>{g.homeTeamName} vs {g.awayTeamName}</option>)}
        </select>
        {selectedGame && <button onClick={openAdd} className="rounded-lg bg-nba-navy px-3 py-1.5 text-sm text-white font-semibold hover:bg-nba-blue transition-colors">+ 新增數據</button>}
      </PageHeader>

      {isLoading && <Loading />}
      {error && <ErrorMessage message={(error as Error).message} />}
      {stats && currentGame && (
        <>
          <Tabs
            tabs={[
              { key: "home", label: currentGame.homeTeamName },
              { key: "away", label: currentGame.awayTeamName },
            ]}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as "home" | "away")}
          />
          <ShootingStatsTable
            data={displayedStats}
            prefixColumns={prefixColumns}
            emptyText="尚無數據"
            actions={(s) => (
              <>
                <button onClick={() => openEdit(s)} className="text-nba-blue hover:underline text-xs font-semibold">編輯</button>
                <button onClick={() => { if (confirm("確定刪除？")) remove.mutate(s.id); }} className="text-nba-red hover:underline text-xs font-semibold">刪除</button>
              </>
            )}
          />
        </>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "編輯數據" : "新增數據"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
          {modal?.mode === "add" && (
            <>
              <select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value, playerId: "" })} required className="w-full rounded border px-3 py-2 text-sm">
                <option value="">隊伍</option>
                {currentGame && [
                  { id: currentGame.homeTeamId, name: currentGame.homeTeamName },
                  { id: currentGame.awayTeamId, name: currentGame.awayTeamName },
                ].map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select value={form.playerId} onChange={(e) => setForm({ ...form, playerId: e.target.value })} required disabled={!form.teamId} className="w-full rounded border px-3 py-2 text-sm disabled:bg-gray-100">
                <option value="">球員</option>
                {rosterPlayers?.map((r) => (
                  <option key={r.playerId} value={r.playerId}>
                    {r.jerseyNumber != null ? `#${r.jerseyNumber} ` : ""}{r.playerName}
                  </option>
                ))}
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
          <button type="submit" className="w-full rounded-lg bg-nba-navy py-2.5 text-sm text-white font-bold uppercase tracking-wider hover:bg-nba-blue transition-colors">
            {save.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
