import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { Team, TeamMember } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

export default function TeamDetailPage() {
  const { id } = useParams();

  const { data: team, isLoading, error } = useQuery({
    queryKey: ["team", id],
    queryFn: () => fetchApi<Team>(`/teams/${id}`),
  });
  const { data: members } = useQuery({
    queryKey: ["team-members", id],
    queryFn: () => fetchApi<TeamMember[]>(`/teams/${id}/members`),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;
  if (!team) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{team.name}</h1>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">球員名單</h2>
        {!members || members.length === 0 ? (
          <EmptyState message="尚無成員" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-gray-500">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">球員</th>
                  <th className="px-3 py-2">加入日期</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400">{m.jerseyNumber ?? "-"}</td>
                    <td className="px-3 py-2">
                      <Link to={`/players/${m.playerId}`} className="text-indigo-600 hover:underline">{m.playerName}</Link>
                    </td>
                    <td className="px-3 py-2 text-gray-500">{new Date(m.joinedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
