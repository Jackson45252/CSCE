import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ username, password });
      navigate("/admin");
    } catch {
      setError("帳號或密碼錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nba-navy flex items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-nba-red flex items-center justify-center text-white font-black text-xl mx-auto mb-4">
            BB
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">BASKETBALL DATA</h1>
          <p className="text-gray-400 text-sm mt-1">管理員登入</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl rounded-lg p-8 space-y-5"
        >
          {error && (
            <p className="text-sm text-white bg-nba-red rounded px-3 py-2 font-medium">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              帳號
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-nba-blue transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-nba-blue transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nba-navy text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-nba-blue disabled:opacity-50 transition-colors"
          >
            {loading ? "登入中..." : "登入"}
          </button>
        </form>
      </div>
    </div>
  );
}
