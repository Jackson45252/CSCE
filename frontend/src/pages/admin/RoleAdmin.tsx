import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Role } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import { useState } from "react";

export default function RoleAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; role?: Role } | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["roles"],
    queryFn: () => fetchApi<Role[]>("/roles"),
  });

  const save = useMutation({
    mutationFn: () =>
      modal?.mode === "edit"
        ? putApi(`/roles/${modal.role!.id}`, { name, description })
        : postApi("/roles", { name, description }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["roles"] }); setModal(null); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteApi(`/roles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });

  const openAdd = () => { setName(""); setDescription(""); setModal({ mode: "add" }); };
  const openEdit = (r: Role) => { setName(r.name); setDescription(r.description); setModal({ mode: "edit", role: r }); };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div>
      <PageHeader title="角色管理" size="sm">
        <button onClick={openAdd} className="rounded-lg bg-nba-navy px-3 py-1.5 text-sm text-white font-semibold hover:bg-nba-blue transition-colors">
          + 新增角色
        </button>
      </PageHeader>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="nba-table w-full text-sm">
          <thead>
            <tr className="bg-nba-navy text-white text-[11px] uppercase tracking-wider">
              <th className="px-4 py-2.5 text-left font-semibold">ID</th>
              <th className="px-4 py-2.5 text-left font-semibold">名稱</th>
              <th className="px-4 py-2.5 text-left font-semibold">說明</th>
              <th className="px-4 py-2.5 text-left font-semibold">建立時間</th>
              <th className="px-4 py-2.5 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {data!.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2.5 text-gray-400">{r.id}</td>
                <td className="px-4 py-2.5 font-medium">{r.name}</td>
                <td className="px-4 py-2.5 text-gray-500">{r.description}</td>
                <td className="px-4 py-2.5 text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right space-x-2">
                  <button onClick={() => openEdit(r)} className="text-nba-blue hover:underline text-xs font-semibold">編輯</button>
                  <button onClick={() => { if (confirm("確定刪除？")) remove.mutate(r.id); }} className="text-nba-red hover:underline text-xs font-semibold">刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "編輯角色" : "新增角色"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">角色名稱</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-nba-blue transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">說明</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-nba-blue transition-colors" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-nba-navy py-2.5 text-sm text-white font-bold uppercase tracking-wider hover:bg-nba-blue transition-colors">
            {save.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
