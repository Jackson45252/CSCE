import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const publicNavItems = [
  { to: "/", label: "賽事" },
  { to: "/teams", label: "隊伍" },
  { to: "/players", label: "球員" },
];

const adminNavItems = [
  { to: "/admin", label: "管理後台" },
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top accent bar */}
      <div className="h-1 bg-nba-red" />

      <header className="bg-nba-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main nav row */}
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-nba-red flex items-center justify-center text-white font-black text-xs tracking-tighter">
                BB
              </div>
              <span className="text-lg font-extrabold tracking-wide group-hover:text-nba-gold transition-colors">
                BASKETBALL DATA
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              {[...publicNavItems, ...(isLoggedIn ? adminNavItems : [])].map((item) => {
                const isActive =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors rounded ${
                      isActive
                        ? "bg-nba-blue text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-1.5 rounded text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-gray-600 hover:border-gray-400"
                >
                  登出
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <Outlet />
      </main>

      <footer className="bg-nba-navy text-gray-500 text-center py-4 text-xs tracking-wide">
        <div className="max-w-7xl mx-auto px-4">
          BASKETBALL DATA &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
