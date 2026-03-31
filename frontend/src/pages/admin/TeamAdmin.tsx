import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Team, Player, TeamMember } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import { useState } from "react";

export default function TeamAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; team?: Team } | null>(null);
  const [memberModal, setMemberModal] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", logoUrl: "" });
  const [memberForm, setMemberForm] = useState({ playerId: "", jerseyNumber: "" });

  const { data, isLoading, error } = useQuery({ queryKey: ["teams"], queryFn: () => fetchApi<Team[]>("/teams") });
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => fetchApi<Player[]>("/players") });
  const { data: members } = useQuery({
    queryKey: ["team-members", memberModal],
    queryFn: () => fetchApi<TeamMember[]>(`/teams/${memberModal}/members`),
    enabled: !!memberModal,
  });

  const save = useMutation({
    mutationFn: () =>
      modal?.mode === "edit"
        ? putApi(`/teams/${modal.team!.id}`, form)
        : postApi("/teams", form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teams"] }); setModal(null); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteApi(`/teams/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });

  const addMember = useMutation({
    mutationFn: () => postApi(`/teams/${memberModal}/members`, {
      playerId: Number(memberForm.playerId),
      jerseyNumber: memberForm.jerseyNumber ? Number(memberForm.jerseyNumber) : null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["team-members", memberModal] }); setMemberForm({ playerId: "", jerseyNumber: "" }); },
  });

  const removeMember = useMutation({
    mutationFn: (memberId: number) => deleteApi(`/teams/${memberModal}/members/${memberId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-members", memberModal] }),
  });

  const openAdd = () => { setForm({ name: "", logoUrl: "" }); setModal({ mode: "add" }); };
  const openEdit = (t: Team) => { setForm({ name: t.name, logoUrl: t.logoUrl ?? "" }); setModal({ mode: "edit", team: t }); };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div>
      <PageHeader title="隊伍管理" size="sm">
        <button onClick={openAdd} className="rounded-lg bg-nba-navy px-3 py-1.5 text-sm text-white font-semibold hover:bg-nba-blue transition-colors">+ 新增隊伍</button>
      </PageHeader>
      <table className="w-full text-sm">
        <thead><tr className="border-b bg-gray-50 text-left text-gray-500">
          <th className="px-3 py-2">ID</th><th className="px-3 py-2">名稱</th><th className="px-3 py-2 text-right">操作</th>
        </tr></thead>
        <tbody>
          {data!.map((t) => (
            <tr key={t.id} className="border-b hover:bg-gray-50">
              <td className="px-3 py-2 text-gray-400">{t.id}</td>
              <td className="px-3 py-2">{t.name}</td>
              <td className="px-3 py-2 text-right space-x-2">
                <button onClick={() => setMemberModal(t.id)} className="text-nba-gold hover:underline text-xs font-semibold">成員</button>
                <button onClick={() => openEdit(t)} className="text-nba-blue hover:underline text-xs font-semibold">編輯</button>
                <button onClick={() => { if (confirm("確定刪除？")) remove.mutate(t.id); }} className="text-nba-red hover:underline text-xs font-semibold">刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Team CRUD Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "編輯隊伍" : "新增隊伍"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <label className="block text-sm text-gray-600 mb-1">名稱</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
            className="w-full rounded border px-3 py-2 text-sm mb-3 focus:outline-none focus:border-nba-blue transition-colors" />
          <label className="block text-sm text-gray-600 mb-1">Logo 網址</label>
          <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm mb-4 focus:outline-none focus:border-nba-blue transition-colors" />
          <button type="submit" className="w-full rounded-lg bg-nba-navy py-2.5 text-sm text-white font-bold uppercase tracking-wider hover:bg-nba-blue transition-colors">
            {save.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>

      {/* Members Modal */}
      <Modal open={!!memberModal} onClose={() => setMemberModal(null)} title="隊伍成員">
        <div className="mb-4 space-y-2">
          {members?.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <span>#{m.jerseyNumber ?? "-"} {m.playerName}</span>
              <button onClick={() => removeMember.mutate(m.id)} className="text-red-500 text-xs hover:underline">移除</button>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); addMember.mutate(); }} className="flex gap-2">
          <select value={memberForm.playerId} onChange={(e) => setMemberForm({ ...memberForm, playerId: e.target.value })} required
            className="flex-1 rounded border px-2 py-1.5 text-sm">
            <option value="">選擇球員</option>
            {players?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input value={memberForm.jerseyNumber} onChange={(e) => setMemberForm({ ...memberForm, jerseyNumber: e.target.value })}
            placeholder="#" className="w-16 rounded border px-2 py-1.5 text-sm" type="number" />
          <button type="submit" className="rounded-lg bg-nba-navy px-3 py-1.5 text-xs text-white font-semibold hover:bg-nba-blue transition-colors">新增</button>
        </form>
      </Modal>
    </div>
  );
}
