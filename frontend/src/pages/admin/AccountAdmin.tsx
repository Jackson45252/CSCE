import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Admin, Role } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import { useState } from "react";

export default function AccountAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; admin?: Admin } | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>(["TournamentManager"]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admins"],
    queryFn: () => fetchApi<Admin[]>("/auth/accounts"),
  });

  const { data: allRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => fetchApi<Role[]>("/roles"),
  });

  const save = useMutation({
    mutationFn: () =>
      modal?.mode === "edit"
        ? putApi(`/auth/accounts/${modal.admin!.id}`, { password: password || null, roles })
        : postApi("/auth/accounts", { username, password, roles }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admins"] }); setModal(null); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteApi(`/auth/accounts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admins"] }),
  });

  const openAdd = () => { setUsername(""); setPassword(""); setRoles(["TournamentManager"]); setModal({ mode: "add" }); };
  const openEdit = (a: Admin) => { setPassword(""); setRoles(a.roles); setModal({ mode: "edit", admin: a }); };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div>
      <PageHeader title="帳號管理" size="sm">
        <button onClick={openAdd} className="rounded-lg bg-nba-navy px-3 py-1.5 text-sm text-white font-semibold hover:bg-nba-blue transition-colors">
          + 新增帳號
        </button>
      </PageHeader>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-gray-500">
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">帳號</th>
            <th className="px-3 py-2">角色</th>
            <th className="px-3 py-2">建立時間</th>
            <th className="px-3 py-2 text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {data!.map((a) => (
            <tr key={a.id} className="border-b hover:bg-gray-50">
              <td className="px-3 py-2 text-gray-400">{a.id}</td>
              <td className="px-3 py-2">{a.username}</td>
              <td className="px-3 py-2 space-x-1">
                {a.roles.map(r => (
                  <span key={r} className="inline-block rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs font-medium">
                    {r}
                  </span>
                ))}
              </td>
              <td className="px-3 py-2 text-gray-500">{new Date(a.createdAt).toLocaleString()}</td>
              <td className="px-3 py-2 text-right space-x-2">
                <button onClick={() => openEdit(a)} className="text-nba-blue hover:underline text-xs font-semibold">編輯</button>
                <button onClick={() => { if (confirm("確定刪除？")) remove.mutate(a.id); }} className="text-nba-red hover:underline text-xs font-semibold">刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "編輯帳號" : "新增帳號"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          {modal?.mode === "add" && (
            <>
              <label className="block text-sm text-gray-600 mb-1">帳號</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required
                className="w-full rounded border px-3 py-2 text-sm mb-4 focus:outline-none focus:border-nba-blue transition-colors" />
            </>
          )}
          {modal?.mode === "edit" && (
            <p className="text-sm text-gray-500 mb-3">編輯帳號 <span className="font-medium text-gray-800">{modal.admin!.username}</span></p>
          )}
          <label className="block text-sm text-gray-600 mb-1">
            {modal?.mode === "edit" ? "新密碼（留空不修改）" : "密碼"}
          </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required={modal?.mode === "add"}
            className="w-full rounded border px-3 py-2 text-sm mb-4 focus:outline-none focus:border-nba-blue transition-colors" />
          <label className="block text-sm text-gray-600 mb-1">角色</label>
          <div className="flex flex-wrap gap-4 mb-4">
            {allRoles?.map((r) => (
              <label key={r.name} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={roles.includes(r.name)} onChange={(e) => {
                  if (e.target.checked) setRoles([...roles, r.name]);
                  else setRoles(roles.filter(x => x !== r.name));
                }} />
                {r.name}
              </label>
            ))}
          </div>
          <button type="submit" className="w-full rounded-lg bg-nba-navy py-2.5 text-sm text-white font-bold uppercase tracking-wider hover:bg-nba-blue transition-colors">
            {save.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
