import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Tournament, Team, TournamentTeam } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import PageHeader from "../../components/PageHeader";
import { useState } from "react";

const defaultForm = { name: "", season: "", startDate: "", endDate: "", status: "Upcoming" };

export default function TournamentAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; tournament?: Tournament } | null>(null);
  const [teamModal, setTeamModal] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const { data, isLoading, error } = useQuery({ queryKey: ["tournaments"], queryFn: () => fetchApi<Tournament[]>("/tournaments") });
  const { data: allTeams } = useQuery({ queryKey: ["teams"], queryFn: () => fetchApi<Team[]>("/teams") });
  const { data: regTeams } = useQuery({
    queryKey: ["tournament-teams", teamModal],
    queryFn: () => fetchApi<TournamentTeam[]>(`/tournaments/${teamModal}/teams`),
    enabled: !!teamModal,
  });

  const save = useMutation({
    mutationFn: () => {
      const body = { ...form, startDate: form.startDate || null, endDate: form.endDate || null };
      return modal?.mode === "edit" ? putApi(`/tournaments/${modal.tournament!.id}`, body) : postApi("/tournaments", body);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tournaments"] }); setModal(null); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteApi(`/tournaments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tournaments"] }),
  });

  const addTeam = useMutation({
    mutationFn: () => postApi(`/tournaments/${teamModal}/teams`, { teamId: Number(selectedTeamId) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tournament-teams", teamModal] }); setSelectedTeamId(""); },
  });

  const removeTeam = useMutation({
    mutationFn: (teamId: number) => deleteApi(`/tournaments/${teamModal}/teams/${teamId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tournament-teams", teamModal] }),
  });

  const openAdd = () => { setForm(defaultForm); setModal({ mode: "add" }); };
  const openEdit = (t: Tournament) => {
    setForm({ name: t.name, season: t.season, startDate: t.startDate ?? "", endDate: t.endDate ?? "", status: t.status });
    setModal({ mode: "edit", tournament: t });
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div>
      <PageHeader title="賽事管理" size="sm">
        <button onClick={openAdd} className="rounded-lg bg-nba-navy px-3 py-1.5 text-sm text-white font-semibold hover:bg-nba-blue transition-colors">+ 新增賽事</button>
      </PageHeader>
      <table className="w-full text-sm">
        <thead><tr className="border-b bg-gray-50 text-left text-gray-500">
          <th className="px-3 py-2">名稱</th><th className="px-3 py-2">賽季</th><th className="px-3 py-2">狀態</th><th className="px-3 py-2 text-right">操作</th>
        </tr></thead>
        <tbody>
          {data!.map((t) => (
            <tr key={t.id} className="border-b hover:bg-gray-50">
              <td className="px-3 py-2">{t.name}</td>
              <td className="px-3 py-2">{t.season}</td>
              <td className="px-3 py-2"><StatusBadge status={t.status} /></td>
              <td className="px-3 py-2 text-right space-x-2">
                <button onClick={() => setTeamModal(t.id)} className="text-nba-gold hover:underline text-xs font-semibold">隊伍</button>
                <button onClick={() => openEdit(t)} className="text-nba-blue hover:underline text-xs font-semibold">編輯</button>
                <button onClick={() => { if (confirm("確定刪除？")) remove.mutate(t.id); }} className="text-nba-red hover:underline text-xs font-semibold">刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "編輯賽事" : "新增賽事"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="名稱" required
            className="w-full rounded border px-3 py-2 text-sm" />
          <input value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} placeholder="賽季（例如 2026）" required
            className="w-full rounded border px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="flex-1 rounded border px-3 py-2 text-sm" />
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="flex-1 rounded border px-3 py-2 text-sm" />
          </div>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm">
            <option>Upcoming</option><option>Ongoing</option><option>Finished</option>
          </select>
          <button type="submit" className="w-full rounded-lg bg-nba-navy py-2.5 text-sm text-white font-bold uppercase tracking-wider hover:bg-nba-blue transition-colors">
            {save.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>

      <Modal open={!!teamModal} onClose={() => setTeamModal(null)} title="已報名隊伍">
        <div className="mb-4 space-y-2">
          {regTeams?.map((rt) => (
            <div key={rt.teamId} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <span>{rt.teamName}</span>
              <button onClick={() => removeTeam.mutate(rt.teamId)} className="text-red-500 text-xs hover:underline">移除</button>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); addTeam.mutate(); }} className="flex gap-2">
          <select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)} required className="flex-1 rounded border px-2 py-1.5 text-sm">
            <option value="">選擇隊伍</option>
            {allTeams?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button type="submit" className="rounded-lg bg-nba-navy px-3 py-1.5 text-xs text-white font-semibold hover:bg-nba-blue transition-colors">新增</button>
        </form>
      </Modal>
    </div>
  );
}
