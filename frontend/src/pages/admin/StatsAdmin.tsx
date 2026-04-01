import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Game, Tournament, TournamentRoster, PlayerGameStats } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Tabs from "../../components/Tabs";
import PageHeader from "../../components/PageHeader";
import { pct } from "../../utils/format";
import { useState, useEffect, useCallback } from "react";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

// ---------- types ----------
interface RowState {
  statsId?: number;
  playerId: number;
  playerName: string;
  jerseyNumber?: number;
  teamId: number;
  twoPointAttempts: string;
  twoPointPoints: string;
  threePointAttempts: string;
  threePointPoints: string;
  freeThrowAttempts: string;
  freeThrowPoints: string;
  isNew: boolean;
  isDirty: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

// ---------- helpers ----------
const statsToRow = (s: PlayerGameStats): RowState => ({
  statsId: s.id,
  playerId: s.playerId,
  playerName: s.playerName,
  teamId: s.teamId,
  twoPointAttempts: s.twoPointAttempts.toString(),
  twoPointPoints: s.twoPointPoints.toString(),
  threePointAttempts: s.threePointAttempts.toString(),
  threePointPoints: s.threePointPoints.toString(),
  freeThrowAttempts: s.freeThrowAttempts.toString(),
  freeThrowPoints: s.freeThrowPoints.toString(),
  isNew: false,
  isDirty: false,
  saveStatus: "idle",
});

const rosterToNewRow = (r: TournamentRoster, teamId: number): RowState => ({
  playerId: r.playerId,
  playerName: r.playerName,
  jerseyNumber: r.jerseyNumber,
  teamId,
  twoPointAttempts: "0",
  twoPointPoints: "0",
  threePointAttempts: "0",
  threePointPoints: "0",
  freeThrowAttempts: "0",
  freeThrowPoints: "0",
  isNew: true,
  isDirty: false,
  saveStatus: "idle",
});

const calcPts = (r: RowState) =>
  Number(r.twoPointPoints) * 2 +
  Number(r.threePointPoints) * 3 +
  Number(r.freeThrowPoints);

const statFields = [
  { key: "twoPointAttempts" as const, label: "2PT出" },
  { key: "twoPointPoints" as const, label: "2PT進" },
  { key: "threePointAttempts" as const, label: "3PT出" },
  { key: "threePointPoints" as const, label: "3PT進" },
  { key: "freeThrowAttempts" as const, label: "FT出" },
  { key: "freeThrowPoints" as const, label: "FT進" },
];

// ---------- component ----------
export default function StatsAdmin() {
  const qc = useQueryClient();

  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "away">("home");
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [checkedPlayerIds, setCheckedPlayerIds] = useState<Set<number>>(new Set());
  const [bulkEdit, setBulkEdit] = useState(false);
  const [rows, setRows] = useState<RowState[]>([]);
  const [saving, setSaving] = useState(false);

  // --- queries ---
  const { data: tournaments } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => fetchApi<Tournament[]>("/tournaments"),
  });
  const { data: games, isLoading: gamesLoading, error: gamesError } = useQuery({
    queryKey: ["games"],
    queryFn: () => fetchApi<Game[]>("/games"),
  });

  const currentGame = games?.find((g) => g.id.toString() === selectedGame);
  const filteredGames =
    games?.filter((g) => !selectedTournament || g.tournamentId.toString() === selectedTournament) ?? [];

  const addTeamId = activeTab === "home" ? currentGame?.homeTeamId : currentGame?.awayTeamId;
  const { data: rosterPlayers } = useQuery({
    queryKey: ["tournament-roster-for-stats", currentGame?.tournamentId, addTeamId],
    queryFn: () =>
      fetchApi<TournamentRoster[]>(
        `/tournaments/${currentGame!.tournamentId}/teams/${addTeamId}/roster`
      ),
    enabled: showAddPanel && !!addTeamId && !!currentGame,
  });

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["game-stats", selectedGame],
    queryFn: () => fetchApi<PlayerGameStats[]>(`/playergamestats?gameId=${selectedGame}`),
    enabled: !!selectedGame,
  });

  // --- sync stats → rows (keep pending new rows) ---
  const syncRows = useCallback(() => {
    if (!stats || !currentGame) return;
    const tabTeamId = activeTab === "home" ? currentGame.homeTeamId : currentGame.awayTeamId;
    setRows((prev) => {
      const pending = prev.filter((r) => r.isNew);
      const existing = stats.filter((s) => s.teamId === tabTeamId).map(statsToRow);
      return [...existing, ...pending];
    });
  }, [stats, activeTab, currentGame]);

  useEffect(() => { syncRows(); }, [syncRows]);

  useEffect(() => {
    setShowAddPanel(false);
    setCheckedPlayerIds(new Set());
  }, [activeTab, selectedGame]);

  // --- derived ---
  const dirtyOrNewRows = rows.filter((r) => r.isNew || r.isDirty);
  const canSave = dirtyOrNewRows.length > 0 && !saving;
  const alreadyInRows = new Set(rows.map((r) => r.playerId));

  // --- row helpers ---
  const updateRow = (playerId: number, field: keyof RowState, value: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.playerId === playerId
          ? { ...r, [field]: value, isDirty: !r.isNew, saveStatus: "idle" }
          : r
      )
    );

  const removeRow = (playerId: number) =>
    setRows((prev) => prev.filter((r) => r.playerId !== playerId));

  const toggleCheck = (id: number) =>
    setCheckedPlayerIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // --- add panel ---
  const addSelectedPlayers = () => {
    if (!rosterPlayers || !addTeamId) return;
    const toAdd = rosterPlayers.filter(
      (r) => checkedPlayerIds.has(r.playerId) && !alreadyInRows.has(r.playerId)
    );
    setRows((prev) => [...prev, ...toAdd.map((r) => rosterToNewRow(r, addTeamId))]);
    setCheckedPlayerIds(new Set());
    setShowAddPanel(false);
  };

  const cancelEdit = () => { setBulkEdit(false); syncRows(); };

  // --- save all ---
  const saveAll = async () => {
    setSaving(true);
    const toSave = rows.filter((r) => r.isNew || r.isDirty);

    for (const row of toSave) {
      setRows((prev) =>
        prev.map((r) => (r.playerId === row.playerId ? { ...r, saveStatus: "saving" } : r))
      );
      try {
        const body = {
          gameId: Number(selectedGame),
          playerId: row.playerId,
          teamId: row.teamId,
          twoPointAttempts: Number(row.twoPointAttempts),
          twoPointPoints: Number(row.twoPointPoints),
          threePointAttempts: Number(row.threePointAttempts),
          threePointPoints: Number(row.threePointPoints),
          freeThrowAttempts: Number(row.freeThrowAttempts),
          freeThrowPoints: Number(row.freeThrowPoints),
        };
        if (row.isNew) await postApi("/playergamestats", body);
        else await putApi(`/playergamestats/${row.statsId}`, body);
        setRows((prev) =>
          prev.map((r) =>
            r.playerId === row.playerId
              ? { ...r, saveStatus: "saved", isNew: false, isDirty: false }
              : r
          )
        );
      } catch {
        setRows((prev) =>
          prev.map((r) =>
            r.playerId === row.playerId ? { ...r, saveStatus: "error" } : r
          )
        );
      }
    }

    await qc.invalidateQueries({ queryKey: ["game-stats", selectedGame] });
    setSaving(false);
    setBulkEdit(false);
  };

  const deleteStats = async (statsId: number) => {
    if (!confirm("確定刪除？")) return;
    await deleteApi(`/playergamestats/${statsId}`);
    qc.invalidateQueries({ queryKey: ["game-stats", selectedGame] });
  };

  const isLoading = gamesLoading || statsLoading;
  const error = gamesError || statsError;

  // Total cols: player(1) + 6 stats + FG%(1) + PTS(1) + actions(1) = 11
  const TOTAL_COLS = 11;

  return (
    <div>
      <PageHeader title="數據登錄" size="sm">
        <select
          value={selectedTournament}
          onChange={(e) => { setSelectedTournament(e.target.value); setSelectedGame(""); setRows([]); }}
          className="rounded border px-2 py-1.5 text-sm"
        >
          <option value="">所有賽事</option>
          {tournaments?.map((t) => (
            <option key={t.id} value={t.id}>{t.name}（{t.season}）</option>
          ))}
        </select>
        <select
          value={selectedGame}
          onChange={(e) => {
            setSelectedGame(e.target.value);
            setActiveTab("home");
            setBulkEdit(false);
            setShowAddPanel(false);
            setRows([]);
          }}
          className="rounded border px-2 py-1.5 text-sm"
        >
          <option value="">選擇比賽</option>
          {filteredGames.map((g) => (
            <option key={g.id} value={g.id}>{g.homeTeamName} vs {g.awayTeamName}</option>
          ))}
        </select>
      </PageHeader>

      {isLoading && <Loading />}
      {error && <ErrorMessage message={(error as Error).message} />}

      {currentGame && (
        <>
          <Tabs
            tabs={[
              { key: "home", label: currentGame.homeTeamName },
              { key: "away", label: currentGame.awayTeamName },
            ]}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as "home" | "away")}
          />

          {/* toolbar */}
          <div className="my-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setShowAddPanel((v) => !v); setCheckedPlayerIds(new Set()); }}
              className="rounded-lg bg-nba-navy px-3 py-1.5 text-sm text-white font-semibold hover:bg-nba-blue transition-colors"
            >
              {showAddPanel ? "收起" : "+ 新增數據"}
            </button>
            {!bulkEdit ? (
              <button
                onClick={() => setBulkEdit(true)}
                className="rounded-lg border border-nba-blue px-3 py-1.5 text-sm text-nba-blue font-semibold hover:bg-blue-50 transition-colors"
              >
                編輯全部
              </button>
            ) : (
              <button
                onClick={cancelEdit}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-500 font-semibold hover:bg-gray-50 transition-colors"
              >
                取消編輯
              </button>
            )}
            {canSave && (
              <button
                onClick={saveAll}
                disabled={saving}
                className="ml-auto rounded-lg bg-green-600 px-4 py-1.5 text-sm text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {saving ? "儲存中..." : `儲存全部（${dirtyOrNewRows.length} 筆）`}
              </button>
            )}
          </div>

          {/* add panel */}
          {showAddPanel && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                選擇球員 —{" "}
                {activeTab === "home" ? currentGame.homeTeamName : currentGame.awayTeamName}
              </p>
              {!rosterPlayers ? (
                <p className="text-xs text-gray-400">載入中...</p>
              ) : rosterPlayers.filter((r) => !alreadyInRows.has(r.playerId)).length === 0 ? (
                <p className="text-xs text-gray-400">所有名單球員皆已加入</p>
              ) : (
                <div className="mb-3 grid grid-cols-2 gap-1 sm:grid-cols-3">
                  {rosterPlayers
                    .filter((r) => !alreadyInRows.has(r.playerId))
                    .map((r) => (
                      <label key={r.playerId} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-white">
                        <input
                          type="checkbox"
                          checked={checkedPlayerIds.has(r.playerId)}
                          onChange={() => toggleCheck(r.playerId)}
                          className="accent-nba-navy"
                        />
                        {r.jerseyNumber != null && (
                          <span className="text-xs text-gray-400">#{r.jerseyNumber}</span>
                        )}
                        {r.playerName}
                      </label>
                    ))}
                </div>
              )}
              <button
                onClick={addSelectedPlayers}
                disabled={checkedPlayerIds.size === 0}
                className="rounded-lg bg-nba-navy px-3 py-1.5 text-sm text-white font-semibold hover:bg-nba-blue transition-colors disabled:opacity-40"
              >
                加入（{checkedPlayerIds.size} 位）
              </button>
            </div>
          )}

          {/* stats table — unified 11-col layout */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-nba-navy text-white text-[11px] uppercase tracking-wider">
                  <th className="px-3 py-2.5 text-left font-semibold">球員</th>
                  {statFields.map((f) => (
                    <th key={f.key} className="px-2 py-2.5 text-center font-semibold">{f.label}</th>
                  ))}
                  <th className="px-3 py-2.5 text-right font-semibold">FG%</th>
                  <th className="px-3 py-2.5 text-right font-semibold">PTS</th>
                  <th className="px-3 py-2.5 text-right font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={TOTAL_COLS} className="px-3 py-10 text-center text-gray-400 text-sm">
                      尚無數據，點「+ 新增數據」選取球員
                    </td>
                  </tr>
                )}
                {rows.map((row) => {
                  const editable = bulkEdit || row.isNew;
                  const pts = calcPts(row);
                  const fg = pct(
                    Number(row.twoPointPoints) + Number(row.threePointPoints),
                    Number(row.twoPointAttempts) + Number(row.threePointAttempts)
                  );
                  return (
                    <tr
                      key={row.playerId}
                      className={`border-b border-gray-100 transition-colors ${
                        row.isNew ? "bg-blue-50/50" : "hover:bg-blue-50/30"
                      }`}
                    >
                      {/* player */}
                      <td className="px-3 py-2 font-medium whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          {row.jerseyNumber != null && (
                            <span className="text-xs text-gray-400">#{row.jerseyNumber}</span>
                          )}
                          {row.playerName}
                          {row.saveStatus === "saving" && (
                            <span className="text-xs text-gray-400">…</span>
                          )}
                          {row.saveStatus === "saved" && (
                            <CheckCircleIcon className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          )}
                          {row.saveStatus === "error" && (
                            <ExclamationCircleIcon className="w-3.5 h-3.5 text-red-500 shrink-0" title="儲存失敗" />
                          )}
                        </span>
                      </td>

                      {/* 6 stat fields */}
                      {statFields.map((f) =>
                        editable ? (
                          <td key={f.key} className="px-1 py-1.5">
                            <input
                              type="number"
                              min="0"
                              value={row[f.key]}
                              onChange={(e) => updateRow(row.playerId, f.key, e.target.value)}
                              className="w-14 rounded border px-1 py-1 text-xs text-center tabular-nums focus:border-nba-blue focus:outline-none"
                            />
                          </td>
                        ) : (
                          <td key={f.key} className="px-2 py-2.5 text-center tabular-nums text-gray-700">
                            {row[f.key]}
                          </td>
                        )
                      )}

                      {/* FG% */}
                      <td className="px-3 py-2.5 text-right tabular-nums text-gray-500 text-xs">{fg}</td>

                      {/* PTS */}
                      <td className="px-3 py-2.5 text-right font-bold tabular-nums text-nba-navy">{pts}</td>

                      {/* actions */}
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        {row.isNew ? (
                          <button
                            onClick={() => removeRow(row.playerId)}
                            className="text-gray-400 hover:text-red-500 text-xs"
                          >
                            移除
                          </button>
                        ) : (
                          <button
                            onClick={() => deleteStats(row.statsId!)}
                            className="text-nba-red hover:underline text-xs font-semibold"
                          >
                            刪除
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* bottom save bar */}
          {canSave && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={saveAll}
                disabled={saving}
                className="rounded-lg bg-green-600 px-6 py-2.5 text-sm text-white font-bold shadow hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {saving ? "儲存中..." : `儲存全部（${dirtyOrNewRows.length} 筆）`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
