import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchApi } from "../api/client";
import type { News, NewsAttachment } from "../types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { DocumentIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ImageGallery({ attachments }: { attachments: NewsAttachment[] }) {
  const images = attachments.filter((a) => a.isImage);
  if (images.length === 0) return null;
  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-nba-muted uppercase tracking-wider mb-3">圖片</h3>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        {images.map((img) => (
          <a key={img.id} href={img.fileUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={img.fileUrl}
              alt={img.fileName}
              className="w-full h-40 object-cover rounded-lg border border-nba-border hover:opacity-90 transition-opacity"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

function FileList({ attachments }: { attachments: NewsAttachment[] }) {
  const files = attachments.filter((a) => !a.isImage);
  if (files.length === 0) return null;
  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-nba-muted uppercase tracking-wider mb-3">附件</h3>
      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.id}>
            <a
              href={file.fileUrl}
              download={file.fileName}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-nba-surface border border-nba-border hover:border-nba-blue transition-colors group"
            >
              <DocumentIcon className="w-5 h-5 text-nba-muted group-hover:text-nba-blue flex-shrink-0" />
              <span className="text-sm text-white group-hover:text-nba-blue flex-1 truncate">
                {file.fileName}
              </span>
              <span className="text-xs text-nba-muted flex-shrink-0">
                {formatFileSize(file.fileSize)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: news, isLoading, error } = useQuery({
    queryKey: ["news", id],
    queryFn: () => fetchApi<News>(`/news/${id}`),
    enabled: !!id,
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;
  if (!news) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/news"
        className="inline-flex items-center gap-1 text-sm text-nba-muted hover:text-white mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        返回最新消息
      </Link>

      {/* Hero */}
      <div className="mb-6">
        <div className="h-1 w-10 bg-nba-red rounded mb-4" />
        <h1 className="text-2xl font-bold text-white">{news.title}</h1>
        {news.publishedAt && (
          <p className="mt-2 text-sm text-nba-muted">{formatDate(news.publishedAt)}</p>
        )}
      </div>

      {/* Content */}
      <div
        className="news-content text-white"
        dangerouslySetInnerHTML={{ __html: news.content }}
      />

      <ImageGallery attachments={news.attachments} />
      <FileList attachments={news.attachments} />

      <style>{`
        .news-content h1 { font-size: 1.75rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .news-content h2 { font-size: 1.375rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .news-content h3 { font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.25rem; }
        .news-content p { margin: 0.5rem 0; line-height: 1.75; }
        .news-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .news-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .news-content blockquote {
          border-left: 3px solid #1D428A;
          padding-left: 1rem;
          color: #8C8C96;
          margin: 0.75rem 0;
        }
        .news-content strong { font-weight: 700; }
        .news-content em { font-style: italic; }
        .news-content u { text-decoration: underline; }
        .news-content s { text-decoration: line-through; }
      `}</style>
    </div>
  );
}
