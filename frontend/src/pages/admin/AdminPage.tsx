import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const allTabs = [
  { to: "/admin/players", label: "球員", roles: ["SuperAdmin", "TournamentManager"] },
  { to: "/admin/teams", label: "隊伍", roles: ["SuperAdmin", "TournamentManager"] },
  { to: "/admin/tournaments", label: "賽事", roles: ["SuperAdmin", "TournamentManager"] },
  { to: "/admin/games", label: "比賽", roles: ["SuperAdmin", "TournamentManager"] },
  { to: "/admin/stats", label: "數據登錄", roles: ["SuperAdmin", "DataEditor"] },
  { to: "/admin/batch-roster", label: "批次名單", roles: ["SuperAdmin", "TournamentManager"] },
  { to: "/admin/accounts", label: "帳號", roles: ["SuperAdmin"] },
  { to: "/admin/roles", label: "角色", roles: ["SuperAdmin"] },
];

export default function AdminPage() {
  const { pathname } = useLocation();
  const { roles } = useAuth();

  const tabs = allTabs.filter((t) => t.roles.some(r => roles.includes(r)));

  if (pathname === "/admin") {
    const first = tabs[0];
    return <Navigate to={first?.to ?? "/admin/players"} replace />;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-nba-navy uppercase tracking-wide mb-4">管理後台</h1>
      <nav className="flex gap-1 border-b-2 border-gray-200 mb-6">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-3 -mb-0.5 transition-colors ${
                isActive
                  ? "border-nba-red text-nba-navy"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
