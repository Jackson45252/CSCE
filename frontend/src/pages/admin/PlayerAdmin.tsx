import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Player } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">球員管理</h2>
        <button onClick={openAdd} className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">
          + 新增球員
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-gray-500">
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">姓名</th>
            <th className="px-3 py-2 text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {data!.map((p) => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td className="px-3 py-2 text-gray-400">{p.id}</td>
              <td className="px-3 py-2">{p.name}</td>
              <td className="px-3 py-2 text-right space-x-2">
                <button onClick={() => openEdit(p)} className="text-indigo-600 hover:underline text-xs">編輯</button>
                <button onClick={() => { if (confirm("確定刪除？")) remove.mutate(p.id); }} className="text-red-500 hover:underline text-xs">刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "編輯球員" : "新增球員"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <label className="block text-sm text-gray-600 mb-1">姓名</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full rounded border px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <button type="submit" className="w-full rounded bg-indigo-600 py-2 text-sm text-white hover:bg-indigo-700">
            {save.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
