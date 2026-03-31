import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Player } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import { useState } from "react";

export default function PlayerAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; player?: Player } | null>(null);
  const [name, setName] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["players"],
    queryFn: () => fetchApi<Player[]>("/players"),
  });

  const save = useMutation({
    mutationFn: () =>
      modal?.mode === "edit"
        ? putApi(`/players/${modal.player!.id}`, { name })
        : postApi("/players", { name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["players"] }); setModal(null); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteApi(`/players/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });

  const openAdd = () => { setName(""); setModal({ mode: "add" }); };
  const openEdit = (p: Player) => { setName(p.name); setModal({ mode: "edit", player: p }); };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div>
      <PageHeader title="球員管理" size="sm">
        <button onClick={openAdd} className="rounded-lg bg-nba-navy px-3 py-1.5 text-sm text-white font-semibold hover:bg-nba-blue transition-colors">
          + 新增球員
        </button>
      </PageHeader>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm nba-table">
        <thead>
          <tr className="bg-nba-navy text-white text-[11px] uppercase tracking-wider">
            <th className="px-4 py-2.5 text-left font-semibold">ID</th>
            <th className="px-4 py-2.5 text-left font-semibold">姓名</th>
            <th className="px-4 py-2.5 text-right font-semibold">操作</th>
          </tr>
        </thead>
        <tbody>
          {data!.map((p) => (
            <tr key={p.id} className="border-b border-gray-100">
              <td className="px-4 py-2.5 text-gray-400">{p.id}</td>
              <td className="px-4 py-2.5 font-medium">{p.name}</td>
              <td className="px-4 py-2.5 text-right space-x-2">
                <button onClick={() => openEdit(p)} className="text-nba-blue hover:underline text-xs font-semibold">編輯</button>
                <button onClick={() => { if (confirm("確定刪除？")) remove.mutate(p.id); }} className="text-nba-red hover:underline text-xs font-semibold">刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "編輯球員" : "新增球員"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <label className="block text-sm text-gray-600 mb-1">姓名</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm mb-4 focus:outline-none focus:border-nba-blue transition-colors" />
          <button type="submit" className="w-full rounded-lg bg-nba-navy py-2.5 text-sm text-white font-bold uppercase tracking-wider hover:bg-nba-blue transition-colors">
            {save.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
