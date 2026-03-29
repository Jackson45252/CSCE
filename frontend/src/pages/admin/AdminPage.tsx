import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";

const tabs = [
  { to: "/admin/players", label: "球員" },
  { to: "/admin/teams", label: "隊伍" },
  { to: "/admin/tournaments", label: "賽事" },
  { to: "/admin/games", label: "比賽" },
  { to: "/admin/stats", label: "數據登錄" },
  { to: "/admin/accounts", label: "帳號" },
];

export default function AdminPage() {
  const { pathname } = useLocation();

  // /admin 自動導向第一個子頁面
  if (pathname === "/admin") return <Navigate to="/admin/players" replace />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">管理後台</h1>
      <nav className="flex gap-1 border-b mb-6">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium border-b-2 transition ${
                isActive
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
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
