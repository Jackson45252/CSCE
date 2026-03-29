import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Game, Tournament, Team } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import { useState } from "react";

const defaultForm = { tournamentId: "", homeTeamId: "", awayTeamId: "", scheduledAt: "", location: "" };
const defaultUpdate = { scheduledAt: "", location: "", status: "Upcoming", homeScore: "", awayScore: "" };

export default function GameAdmin() {
  const qc = useQueryClient();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<Game | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [upd, setUpd] = useState(defaultUpdate);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">比賽管理</h2>
        <button onClick={() => { setForm(defaultForm); setAddModal(true); }}
          className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">+ 新增比賽</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50 text-left text-gray-500">
            <th className="px-3 py-2">主隊</th><th className="px-3 py-2">客隊</th>
            <th className="px-3 py-2">比分</th><th className="px-3 py-2">狀態</th><th className="px-3 py-2 text-right">操作</th>
          </tr></thead>
          <tbody>
            {data!.map((g) => (
              <tr key={g.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{g.homeTeamName}</td>
                <td className="px-3 py-2">{g.awayTeamName}</td>
                <td className="px-3 py-2">{g.status === "Finished" ? `${g.homeScore} - ${g.awayScore}` : "-"}</td>
                <td className="px-3 py-2"><StatusBadge status={g.status} /></td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button onClick={() => openEdit(g)} className="text-indigo-600 hover:underline text-xs">編輯</button>
                  <button onClick={() => { if (confirm("確定刪除？")) remove.mutate(g.id); }} className="text-red-500 hover:underline text-xs">刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="新增比賽">
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
          <select value={form.tournamentId} onChange={(e) => setForm({ ...form, tournamentId: e.target.value })} required className="w-full rounded border px-3 py-2 text-sm">
            <option value="">賽事</option>
            {tournaments?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={form.homeTeamId} onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })} required className="w-full rounded border px-3 py-2 text-sm">
            <option value="">主隊</option>
            {teams?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={form.awayTeamId} onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })} required className="w-full rounded border px-3 py-2 text-sm">
            <option value="">客隊</option>
            {teams?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required
            className="w-full rounded border px-3 py-2 text-sm" />
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="地點"
            className="w-full rounded border px-3 py-2 text-sm" />
          <button type="submit" className="w-full rounded bg-indigo-600 py-2 text-sm text-white hover:bg-indigo-700">
            {create.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="編輯比賽">
        <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-3">
          <input type="datetime-local" value={upd.scheduledAt.slice(0, 16)} onChange={(e) => setUpd({ ...upd, scheduledAt: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm" />
          <input value={upd.location} onChange={(e) => setUpd({ ...upd, location: e.target.value })} placeholder="地點"
            className="w-full rounded border px-3 py-2 text-sm" />
          <select value={upd.status} onChange={(e) => setUpd({ ...upd, status: e.target.value })} className="w-full rounded border px-3 py-2 text-sm">
            <option>Upcoming</option><option>Finished</option>
          </select>
          <div className="flex gap-2">
            <input type="number" value={upd.homeScore} onChange={(e) => setUpd({ ...upd, homeScore: e.target.value })}
              placeholder="主隊得分" className="flex-1 rounded border px-3 py-2 text-sm" />
            <input type="number" value={upd.awayScore} onChange={(e) => setUpd({ ...upd, awayScore: e.target.value })}
              placeholder="客隊得分" className="flex-1 rounded border px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="w-full rounded bg-indigo-600 py-2 text-sm text-white hover:bg-indigo-700">
            {update.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
