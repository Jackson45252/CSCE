import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const publicNavItems = [
  { to: "/", label: "賽事" },
  { to: "/teams", label: "隊伍" },
  { to: "/players", label: "球員" },
];

const adminNavItems = [
  { to: "/admin", label: "管理" },
];

export default function Layout() {
  const { pathname } = useLocation();
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-wide">
            籃球數據
          </Link>
          <nav className="flex gap-4 items-center">
            {[...publicNavItems, ...(isLoggedIn ? adminNavItems : [])].map((item) => {
              const isActive =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    isActive ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded text-sm font-medium hover:bg-white/10 transition"
              >
                登出
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
