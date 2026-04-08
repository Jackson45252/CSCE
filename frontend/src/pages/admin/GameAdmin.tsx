import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Game, Tournament, Team } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import PageHeader from "../../components/PageHeader";
import { useState } from "react";

const defaultForm = { tournamentId: "", homeTeamId: "", awayTeamId: "", scheduledAt: "", location: "" };
const defaultUpdate = { scheduledAt: "", location: "", status: "Upcoming", homeScore: "", awayScore: "" };

export default function GameAdmin() {
  const qc = useQueryClient();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<Game | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [upd, setUpd] = useState(defaultUpdate);

  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const { data, isLoading, error } = useQuery({ queryKey: ["games"], queryFn: () => fetchApi<Game[]>("/games") });
  const { data: tournaments } = useQuery({ queryKey: ["tournaments"], queryFn: () => fetchApi<Tournament[]>("/tournaments") });
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: () => fetchApi<Team[]>("/teams") });

  const create = useMutation({
    mutationFn: () => postApi("/games", {
      tournamentId: Number(form.tournamentId), homeTeamId: Number(form.homeTeamId),
      awayTeamId: Number(form.awayTeamId), scheduledAt: form.scheduledAt, location: form.location || null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["games"] }); setAddModal(false); },
  });

  const update = useMutation({
    mutationFn: () => putApi(`/games/${editModal!.id}`, {
      scheduledAt: upd.scheduledAt, location: upd.location || null, status: upd.status,
      homeScore: upd.homeScore ? Number(upd.homeScore) : null,
      awayScore: upd.awayScore ? Number(upd.awayScore) : null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["games"] }); setEditModal(null); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteApi(`/games/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["games"] }),
  });

  const openEdit = (g: Game) => {
    setUpd({ scheduledAt: g.scheduledAt, location: g.location ?? "", status: g.status,
      homeScore: g.homeScore?.toString() ?? "", awayScore: g.awayScore?.toString() ?? "" });
    setEditModal(g);
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  const filteredGames = data?.filter(g => {
    if (selectedTournament && g.tournamentId.toString() !== selectedTournament) return false;
    if (selectedStatus && g.status !== selectedStatus) return false;
    if (selectedTeam && g.homeTeamId.toString() !== selectedTeam && g.awayTeamId.toString() !== selectedTeam) return false;
    return true;
  }) ?? [];

  return (
    <div>
      <PageHeader title="比賽管理" size="sm">
        {selectedTournament && (
          <button onClick={() => { setForm({ ...defaultForm, tournamentId: selectedTournament }); setAddModal(true); }}
            className="rounded-lg bg-nba-navy px-3 py-1.5 text-sm text-white font-semibold hover:bg-nba-blue transition-colors">+ 新增比賽</button>
        )}
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-4 bg-white p-4 rounded shadow-sm border border-gray-200">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">選擇賽事</label>
          <select value={selectedTournament} onChange={e => { setSelectedTournament(e.target.value); setSelectedStatus(""); setSelectedTeam(""); }} 
            className="border rounded px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-nba-blue transition-colors">
            <option value="">-- 請先選擇賽事 --</option>
            {tournaments?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        
        {selectedTournament && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">比賽狀態</label>
              <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} 
                className="border rounded px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-nba-blue transition-colors">
                <option value="">全部狀態</option>
                <option value="Upcoming">即將開始</option>
                <option value="Ongoing">進行中</option>
                <option value="Finished">已結束</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">隊伍篩選</label>
              <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} 
                className="border rounded px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-nba-blue transition-colors">
                <option value="">全部隊伍</option>
                {teams?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      {!selectedTournament ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded border border-dashed">
          👆 請在上方選擇賽事以查看與管理比賽
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm nba-table">
          <thead><tr className="bg-nba-navy text-white text-[11px] uppercase tracking-wider">
            <th className="px-4 py-2.5 text-left font-semibold">主隊</th><th className="px-4 py-2.5 text-left font-semibold">客隊</th>
            <th className="px-4 py-2.5 text-left font-semibold">比分</th><th className="px-4 py-2.5 text-left font-semibold">狀態</th><th className="px-4 py-2.5 text-right font-semibold">操作</th>
          </tr></thead>
          <tbody>
            {filteredGames.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">此條件下沒有比賽</td></tr>
            ) : (
              filteredGames.map((g) => (
                <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2.5">{g.homeTeamName}</td>
                  <td className="px-4 py-2.5">{g.awayTeamName}</td>
                  <td className="px-4 py-2.5">{g.status === "Finished" ? `${g.homeScore} - ${g.awayScore}` : "-"}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={g.status} /></td>
                  <td className="px-4 py-2.5 text-right space-x-2">
                    <button onClick={() => openEdit(g)} className="text-nba-blue hover:underline text-xs font-semibold">編輯</button>
                    <button onClick={() => { if (confirm("確定刪除？")) remove.mutate(g.id); }} className="text-nba-red hover:underline text-xs font-semibold">刪除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="新增比賽">
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
          <select value={form.tournamentId} onChange={(e) => setForm({ ...form, tournamentId: e.target.value })} required className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-nba-blue transition-colors">
            <option value="">賽事</option>
            {tournaments?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={form.homeTeamId} onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })} required className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-nba-blue transition-colors">
            <option value="">主隊</option>
            {teams?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={form.awayTeamId} onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })} required className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-nba-blue transition-colors">
            <option value="">客隊</option>
            {teams?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required
            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-nba-blue transition-colors" />
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="地點"
            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-nba-blue transition-colors" />
          <button type="submit" className="w-full rounded-lg bg-nba-navy py-2.5 text-sm text-white font-bold uppercase tracking-wider hover:bg-nba-blue transition-colors">
            {create.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="編輯比賽">
        <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-3">
          <input type="datetime-local" value={upd.scheduledAt.slice(0, 16)} onChange={(e) => setUpd({ ...upd, scheduledAt: e.target.value })}
            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-nba-blue transition-colors" />
          <input value={upd.location} onChange={(e) => setUpd({ ...upd, location: e.target.value })} placeholder="地點"
            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-nba-blue transition-colors" />
          <select value={upd.status} onChange={(e) => setUpd({ ...upd, status: e.target.value })} className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-nba-blue transition-colors">
            <option value="Upcoming">即將開始</option><option value="Ongoing">進行中</option><option value="Finished">已結束</option>
          </select>
          <div className="flex gap-2">
            <input type="number" value={upd.homeScore} onChange={(e) => setUpd({ ...upd, homeScore: e.target.value })}
              placeholder="主隊得分" className="flex-1 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-nba-blue transition-colors" />
            <input type="number" value={upd.awayScore} onChange={(e) => setUpd({ ...upd, awayScore: e.target.value })}
              placeholder="客隊得分" className="flex-1 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-nba-blue transition-colors" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-nba-navy py-2.5 text-sm text-white font-bold uppercase tracking-wider hover:bg-nba-blue transition-colors">
            {update.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
