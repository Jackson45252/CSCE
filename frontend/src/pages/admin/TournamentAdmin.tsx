import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi } from "../../api/client";
import type { Tournament, TournamentCategory, Team, TournamentTeam, TournamentRoster, Player } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import PageHeader from "../../components/PageHeader";
import { useState } from "react";

const defaultForm = { name: "", season: "", startDate: "", endDate: "", status: "Upcoming", categoryId: "" };
const defaultCatForm = { name: "", description: "" };

export default function TournamentAdmin() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"tournaments" | "categories">("tournaments");

  // Tournament state
  const [modal, setModal] = useState<{ mode: "add" | "edit"; tournament?: Tournament } | null>(null);
  const [teamModal, setTeamModal] = useState<number | null>(null);
  const [rosterModal, setRosterModal] = useState<{ tournamentId: number; teamId: number; teamName: string } | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [rosterJersey, setRosterJersey] = useState("");

  // Category state
  const [catModal, setCatModal] = useState<{ mode: "add" | "edit"; category?: TournamentCategory } | null>(null);
  const [catForm, setCatForm] = useState(defaultCatForm);

  const { data, isLoading, error } = useQuery({ queryKey: ["tournaments"], queryFn: () => fetchApi<Tournament[]>("/tournaments") });
  const { data: categories } = useQuery({ queryKey: ["tournament-categories"], queryFn: () => fetchApi<TournamentCategory[]>("/tournament-categories") });
  const { data: allTeams } = useQuery({ queryKey: ["teams"], queryFn: () => fetchApi<Team[]>("/teams") });
  const { data: allPlayers } = useQuery({ queryKey: ["players"], queryFn: () => fetchApi<Player[]>("/players"), enabled: !!rosterModal });
  const { data: regTeams } = useQuery({
    queryKey: ["tournament-teams", teamModal],
    queryFn: () => fetchApi<TournamentTeam[]>(`/tournaments/${teamModal}/teams`),
    enabled: !!teamModal,
  });
  const { data: rosterPlayers } = useQuery({
    queryKey: ["tournament-roster", rosterModal?.tournamentId, rosterModal?.teamId],
    queryFn: () => fetchApi<TournamentRoster[]>(`/tournaments/${rosterModal!.tournamentId}/teams/${rosterModal!.teamId}/roster`),
    enabled: !!rosterModal,
  });

  // Tournament mutations
  const save = useMutation({
    mutationFn: () => {
      const body = {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      };
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

  const addToRoster = useMutation({
    mutationFn: () => postApi(
      `/tournaments/${rosterModal!.tournamentId}/teams/${rosterModal!.teamId}/roster`,
      { playerId: Number(selectedPlayerId), jerseyNumber: rosterJersey ? Number(rosterJersey) : null }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tournament-roster", rosterModal?.tournamentId, rosterModal?.teamId] });
      setSelectedPlayerId("");
      setRosterJersey("");
    },
  });

  const removeFromRoster = useMutation({
    mutationFn: (rosterId: number) => deleteApi(`/tournaments/${rosterModal!.tournamentId}/teams/${rosterModal!.teamId}/roster/${rosterId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tournament-roster", rosterModal?.tournamentId, rosterModal?.teamId] }),
  });

  // Category mutations
  const saveCat = useMutation({
    mutationFn: () => {
      const body = { name: catForm.name, description: catForm.description || null };
      return catModal?.mode === "edit" ? putApi(`/tournament-categories/${catModal.category!.id}`, body) : postApi("/tournament-categories", body);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tournament-categories"] }); setCatModal(null); },
  });

  const removeCat = useMutation({
    mutationFn: (id: number) => deleteApi(`/tournament-categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tournament-categories"] }),
  });

  const openAdd = () => { setForm(defaultForm); setModal({ mode: "add" }); };
  const openEdit = (t: Tournament) => {
    setForm({ name: t.name, season: t.season, startDate: t.startDate ?? "", endDate: t.endDate ?? "", status: t.status, categoryId: t.categoryId?.toString() ?? "" });
    setModal({ mode: "edit", tournament: t });
  };

  const openRoster = (tournamentId: number, teamId: number, teamName: string) => {
    setSelectedPlayerId("");
    setRosterJersey("");
    setRosterModal({ tournamentId, teamId, teamName });
  };

  const openAddCat = () => { setCatForm(defaultCatForm); setCatModal({ mode: "add" }); };
  const openEditCat = (c: TournamentCategory) => {
    setCatForm({ name: c.name, description: c.description ?? "" });
    setCatModal({ mode: "edit", category: c });
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div>
      <PageHeader title="賽事管理" size="sm">
        <div className="flex gap-2">
          <div className="flex bg-gray-200 rounded-lg p-0.5">
            <button onClick={() => setTab("tournaments")} className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${tab === "tournaments" ? "bg-nba-navy text-white" : "text-gray-500 hover:text-gray-700"}`}>賽事</button>
            <button onClick={() => setTab("categories")} className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${tab === "categories" ? "bg-nba-navy text-white" : "text-gray-500 hover:text-gray-700"}`}>分類管理</button>
          </div>
          {tab === "tournaments" && (
            <button onClick={openAdd} className="rounded-lg bg-nba-navy px-3 py-1.5 text-sm text-white font-semibold hover:bg-nba-blue transition-colors">+ 新增賽事</button>
          )}
          {tab === "categories" && (
            <button onClick={openAddCat} className="rounded-lg bg-nba-navy px-3 py-1.5 text-sm text-white font-semibold hover:bg-nba-blue transition-colors">+ 新增分類</button>
          )}
        </div>
      </PageHeader>

      {tab === "tournaments" && (
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50 text-left text-gray-500">
            <th className="px-3 py-2">名稱</th><th className="px-3 py-2">分類</th><th className="px-3 py-2">屆次</th><th className="px-3 py-2">狀態</th><th className="px-3 py-2 text-right">操作</th>
          </tr></thead>
          <tbody>
            {data!.map((t) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{t.name}</td>
                <td className="px-3 py-2 text-gray-400 text-xs">{t.categoryName ?? "—"}</td>
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
      )}

      {tab === "categories" && (
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50 text-left text-gray-500">
            <th className="px-3 py-2">分類名稱</th><th className="px-3 py-2">說明</th><th className="px-3 py-2 text-right">操作</th>
          </tr></thead>
          <tbody>
            {(categories ?? []).map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 font-semibold">{c.name}</td>
                <td className="px-3 py-2 text-gray-400">{c.description ?? "—"}</td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button onClick={() => openEditCat(c)} className="text-nba-blue hover:underline text-xs font-semibold">編輯</button>
                  <button onClick={() => { if (confirm("確定刪除？刪除後該分類的賽事將變為未分類。")) removeCat.mutate(c.id); }} className="text-nba-red hover:underline text-xs font-semibold">刪除</button>
                </td>
              </tr>
            ))}
            {(categories ?? []).length === 0 && (
              <tr><td colSpan={3} className="px-3 py-6 text-center text-gray-400 text-sm">尚無分類，請新增</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Tournament Create/Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "編輯賽事" : "新增賽事"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm">
            <option value="">無分類</option>
            {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="賽事名稱" required
            className="w-full rounded border px-3 py-2 text-sm" />
          <input value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} placeholder="屆次（例如 114年、第一屆）" required
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

      {/* Category Create/Edit Modal */}
      <Modal open={!!catModal} onClose={() => setCatModal(null)} title={catModal?.mode === "edit" ? "編輯分類" : "新增分類"}>
        <form onSubmit={(e) => { e.preventDefault(); saveCat.mutate(); }} className="space-y-3">
          <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="分類名稱（例如 春燕盃）" required
            className="w-full rounded border px-3 py-2 text-sm" />
          <input value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder="說明（選填）"
            className="w-full rounded border px-3 py-2 text-sm" />
          <button type="submit" className="w-full rounded-lg bg-nba-navy py-2.5 text-sm text-white font-bold uppercase tracking-wider hover:bg-nba-blue transition-colors">
            {saveCat.isPending ? "儲存中..." : "儲存"}
          </button>
        </form>
      </Modal>

      {/* Team Modal */}
      <Modal open={!!teamModal} onClose={() => setTeamModal(null)} title="已報名隊伍">
        <div className="mb-4 space-y-2">
          {regTeams?.map((rt) => (
            <div key={rt.teamId} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <span>{rt.teamName}</span>
              <div className="flex gap-3">
                <button onClick={() => openRoster(teamModal!, rt.teamId, rt.teamName)} className="text-nba-blue text-xs hover:underline font-semibold">名單</button>
                <button onClick={() => removeTeam.mutate(rt.teamId)} className="text-red-500 text-xs hover:underline">移除</button>
              </div>
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

      {/* Roster Modal */}
      <Modal open={!!rosterModal} onClose={() => setRosterModal(null)} title={`出賽名單 — ${rosterModal?.teamName}`}>
        <div className="mb-4 space-y-2">
          {rosterPlayers?.length === 0 && <p className="text-sm text-gray-400 text-center py-2">尚無球員</p>}
          {rosterPlayers?.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <span>
                {r.jerseyNumber != null && <span className="mr-2 text-gray-400">#{r.jerseyNumber}</span>}
                {r.playerName}
              </span>
              <button onClick={() => removeFromRoster.mutate(r.id)} className="text-red-500 text-xs hover:underline">移除</button>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); addToRoster.mutate(); }} className="flex gap-2">
          <select value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)} required className="flex-1 rounded border px-2 py-1.5 text-sm">
            <option value="">選擇球員</option>
            {allPlayers?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input
            type="number" min="0" placeholder="#"
            value={rosterJersey} onChange={(e) => setRosterJersey(e.target.value)}
            className="w-16 rounded border px-2 py-1.5 text-sm"
          />
          <button type="submit" className="rounded-lg bg-nba-navy px-3 py-1.5 text-xs text-white font-semibold hover:bg-nba-blue transition-colors">新增</button>
        </form>
      </Modal>
    </div>
  );
}
