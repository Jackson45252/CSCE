import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import TournamentsPage from "./pages/TournamentsPage";
import TournamentDetailPage from "./pages/TournamentDetailPage";
import GameDetailPage from "./pages/GameDetailPage";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import PlayersPage from "./pages/PlayersPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/admin/AdminPage";
import PlayerAdmin from "./pages/admin/PlayerAdmin";
import TeamAdmin from "./pages/admin/TeamAdmin";
import TournamentAdmin from "./pages/admin/TournamentAdmin";
import GameAdmin from "./pages/admin/GameAdmin";
import StatsAdmin from "./pages/admin/StatsAdmin";
import AccountAdmin from "./pages/admin/AccountAdmin";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<TournamentsPage />} />
        <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
        <Route path="/tournaments/:id/leaderboard" element={<LeaderboardPage />} />
        <Route path="/games/:id" element={<GameDetailPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/teams/:id" element={<TeamDetailPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players/:id" element={<PlayerDetailPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        >
          <Route path="players" element={<PlayerAdmin />} />
          <Route path="teams" element={<TeamAdmin />} />
          <Route path="tournaments" element={<TournamentAdmin />} />
          <Route path="games" element={<GameAdmin />} />
          <Route path="stats" element={<StatsAdmin />} />
          <Route path="accounts" element={<AccountAdmin />} />
        </Route>
      </Route>
    </Routes>
  );
}
