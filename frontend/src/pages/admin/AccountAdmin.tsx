import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Admin } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import { useState } from "react";

export default function AccountAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; admin?: Admin } | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admins"],
    queryFn: () => fetchApi<Admin[]>("/auth/accounts"),
  });

  const save = useMutation({
    mutationFn: () =>
      modal?.mode === "edit"
        ? putApi(`/auth/accounts/${modal.admin!.id}`, { password })
        : postApi("/auth/accounts", { username, password }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admins"] }); setModal(null); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteApi(`/auth/accounts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admins"] }),
  });

  const openAdd = () => { setUsername(""); setPassword(""); setModal({ mode: "add" }); };
  const openEdit = (a: Admin) => { setPassword(""); setModal({ mode: "edit", admin: a }); };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">帳號管理</h2>
        <button onClick={openAdd} className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">
          + 新增帳號
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-gray-500">
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">帳號</th>
            <th className="px-3 py-2">建立時間</th>
            <th className="px-3 py-2 text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {data!.map((a) => (
            <tr key={a.id} className="border-b hover:bg-gray-50">
              <td className="px-3 py-2 text-gray-400">{a.id}</td>
              <td className="px-3 py-2">{a.username}</td>
              <td className="px-3 py-2 text-gray-500">{new Date(a.createdAt).toLocaleString()}</td>
              <td className="px-3 py-2 text-right space-x-2">
                <button onClick={() => openEdit(a)} className="text-indigo-600 hover:underline text-xs">修改密碼</button>
                <button onClick={() => { if (confirm("確定刪除？")) remove.mutate(a.id); }} className="text-red-500 hover:underline text-xs">刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "修改密碼" : "新增帳號"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          {modal?.mode === "add" && (
            <>
              <label className="block text-sm text-gray-600 mb-1">帳號</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required
                className="w-full rounded border px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </>
          )}
          {modal?.mode === "edit" && (
            <p className="text-sm text-gray-500 mb-3">修改帳號 <span className="font-medium text-gray-800">{modal.admin!.username}</span> 的密碼</p>
          )}
          <label className="block text-sm text-gray-600 mb-1">密碼</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full rounded border px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <button type="submit" className="w-full rounded bg-indigo-600 py-2 text-sm text-white hover:bg-indigo-700">
            {save.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
