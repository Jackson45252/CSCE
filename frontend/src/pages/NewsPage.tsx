import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { NewsListItem } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function NewsCard({ item }: { item: NewsListItem }) {
  return (
    <Link
      to={`/news/${item.id}`}
      className="block rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-200 group bg-white"
    >
      {/* Cover image */}
      {item.coverImageUrl ? (
        <img
          src={item.coverImageUrl}
          alt={item.title}
          className="w-full h-44 object-cover group-hover:opacity-90 transition-opacity"
        />
      ) : (
        <div className="w-full h-44 bg-nba-navy flex items-center justify-center">
          <span className="text-nba-muted text-3xl">📰</span>
        </div>
      )}
      <div className="p-4">
        <div className="h-1 w-10 bg-nba-blue group-hover:bg-nba-red transition-colors rounded mb-3" />
        <h2 className="font-bold text-nba-navy group-hover:text-nba-blue transition-colors line-clamp-2">
          {item.title}
        </h2>
        {item.publishedAt && (
          <p className="mt-2 text-xs text-gray-400">{formatDate(item.publishedAt)}</p>
        )}
      </div>
    </Link>
  );
}

export default function NewsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["news"],
    queryFn: () => fetchApi<NewsListItem[]>("/news"),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <PageHeader title="最新消息" />
      {!data || data.length === 0 ? (
        <EmptyState message="目前尚無消息" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
