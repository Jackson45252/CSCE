import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi } from "../../api/client";
import type { Tournament, TournamentTeam, Player, TournamentRoster } from "../../types";
import PageHeader from "../../components/PageHeader";
import Loading from "../../components/Loading";
import { useState } from "react";
import { PlusIcon, TrashIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface RosterRow {
  id: number;
  playerId: string;
  jerseyNumber: string;
  status: "idle" | "success" | "error";
  error?: string;
}

let rowCounter = 0;
const newRow = (): RosterRow => ({ id: ++rowCounter, playerId: "", jerseyNumber: "", status: "idle" });

export default function BatchRosterAdmin() {
  const qc = useQueryClient();
  const [tournamentId, setTournamentId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [rows, setRows] = useState<RosterRow[]>([newRow()]);
  const [submitting, setSubmitting] = useState(false);

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => fetchApi<Tournament[]>("/tournaments"),
  });
  const { data: tournamentTeams } = useQuery({
    queryKey: ["tournament-teams", tournamentId],
    queryFn: () => fetchApi<TournamentTeam[]>(`/tournaments/${tournamentId}/teams`),
    enabled: !!tournamentId,
  });
  const { data: existingRoster } = useQuery({
    queryKey: ["tournament-roster", tournamentId, teamId],
    queryFn: () => fetchApi<TournamentRoster[]>(`/tournaments/${tournamentId}/teams/${teamId}/roster`),
    enabled: !!tournamentId && !!teamId,
  });
  const { data: allPlayers } = useQuery({
    queryKey: ["players"],
    queryFn: () => fetchApi<Player[]>("/players"),
  });

  const alreadyAdded = new Set(existingRoster?.map((r) => r.playerId) ?? []);
  const availablePlayers = allPlayers?.filter((p) => !alreadyAdded.has(p.id)) ?? [];

  const updateRow = (id: number, patch: Partial<RosterRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRow = () => setRows((prev) => [...prev, newRow()]);
  const removeRow = (id: number) => setRows((prev) => prev.filter((r) => r.id !== id));

  const handleSubmit = async () => {
    const validRows = rows.filter((r) => r.playerId);
    if (!validRows.length || !tournamentId || !teamId) return;

    setSubmitting(true);
    setRows((prev) =>
      prev.map((r) => (r.playerId ? { ...r, status: "idle", error: undefined } : r))
    );

    for (const row of validRows) {
      try {
        await postApi(`/tournaments/${tournamentId}/teams/${teamId}/roster`, {
          playerId: Number(row.playerId),
          jerseyNumber: row.jerseyNumber ? Number(row.jerseyNumber) : null,
        });
        updateRow(row.id, { status: "success" });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "失敗";
        updateRow(row.id, { status: "error", error: msg });
      }
    }

    qc.invalidateQueries({ queryKey: ["tournament-roster", tournamentId, teamId] });
    setSubmitting(false);
  };

  const clearSuccess = () => {
    setRows((prev) => prev.filter((r) => r.status !== "success"));
    if (rows.filter((r) => r.status !== "success").length === 0) setRows([newRow()]);
  };

  const selectedInRows = new Set(rows.map((r) => r.playerId).filter(Boolean));
  const successCount = rows.filter((r) => r.status === "success").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  const canSubmit = !!tournamentId && !!teamId && rows.some((r) => r.playerId) && !submitting;

  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader title="批次新增名單" size="sm" />

      {/* 選擇賽事 + 隊伍 */}
      <div className="mb-6 flex gap-3">
        <select
          value={tournamentId}
          onChange={(e) => { setTournamentId(e.target.value); setTeamId(""); setRows([newRow()]); }}
          className="rounded border px-3 py-2 text-sm flex-1"
        >
          <option value="">選擇賽事</option>
          {tournaments?.map((t) => (
            <option key={t.id} value={t.id}>{t.name}（{t.season}）</option>
          ))}
        </select>
        <select
          value={teamId}
          onChange={(e) => { setTeamId(e.target.value); setRows([newRow()]); }}
          disabled={!tournamentId}
          className="rounded border px-3 py-2 text-sm flex-1 disabled:bg-gray-100"
        >
          <option value="">選擇隊伍</option>
          {tournamentTeams?.map((tt) => (
            <option key={tt.teamId} value={tt.teamId}>{tt.teamName}</option>
          ))}
        </select>
      </div>

      {/* 已在名單提示 */}
      {existingRoster && existingRoster.length > 0 && (
        <div className="mb-4 rounded bg-gray-50 border px-4 py-2 text-xs text-gray-500">
          已在名單：{existingRoster.map((r) => r.playerName).join("、")}
        </div>
      )}

      {/* 批次輸入表格 */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-[1fr_80px_32px] gap-2 text-xs text-gray-400 px-1">
          <span>球員</span><span>背號（選填）</span><span />
        </div>
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_80px_32px] gap-2 items-center">
            <div className="relative">
              <select
                value={row.playerId}
                onChange={(e) => updateRow(row.id, { playerId: e.target.value, status: "idle", error: undefined })}
                disabled={!teamId || submitting}
                className={`w-full rounded border px-3 py-2 text-sm disabled:bg-gray-100 ${
                  row.status === "success" ? "border-green-400 bg-green-50" :
                  row.status === "error" ? "border-red-400 bg-red-50" : ""
                }`}
              >
                <option value="">選擇球員</option>
                {availablePlayers
                  .filter((p) => !selectedInRows.has(p.id.toString()) || row.playerId === p.id.toString())
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </select>
              {row.status === "success" && (
                <CheckCircleIcon className="absolute right-8 top-2.5 w-4 h-4 text-green-500 pointer-events-none" />
              )}
              {row.status === "error" && (
                <ExclamationCircleIcon className="absolute right-8 top-2.5 w-4 h-4 text-red-500 pointer-events-none" title={row.error} />
              )}
            </div>
            <input
              type="number" min="0" placeholder="#"
              value={row.jerseyNumber}
              onChange={(e) => updateRow(row.id, { jerseyNumber: e.target.value })}
              disabled={submitting}
              className="rounded border px-3 py-2 text-sm disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              disabled={rows.length === 1 || submitting}
              className="p-1.5 rounded text-gray-400 hover:text-red-500 disabled:opacity-30"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        disabled={!teamId || submitting}
        className="mb-6 flex items-center gap-1 text-sm text-nba-blue hover:underline disabled:opacity-40"
      >
        <PlusIcon className="w-4 h-4" /> 新增一行
      </button>

      {/* 結果摘要 */}
      {(successCount > 0 || errorCount > 0) && (
        <div className="mb-4 flex items-center gap-4 text-sm">
          {successCount > 0 && <span className="text-green-600 font-semibold">✓ {successCount} 位成功</span>}
          {errorCount > 0 && <span className="text-red-500 font-semibold">✗ {errorCount} 位失敗</span>}
          {successCount > 0 && (
            <button onClick={clearSuccess} className="text-gray-400 text-xs hover:underline">清除已成功列</button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full rounded-lg bg-nba-navy py-2.5 text-sm text-white font-bold uppercase tracking-wider hover:bg-nba-blue transition-colors disabled:opacity-40"
      >
        {submitting ? "新增中..." : `批次新增（${rows.filter((r) => r.playerId).length} 位球員）`}
      </button>
    </div>
  );
}
