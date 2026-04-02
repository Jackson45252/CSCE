import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, postApi, putApi, deleteApi, postFormApi } from "../../api/client";
import type { NewsListItem, News, NewsAttachment } from "../../types";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import RichTextEditor from "../../components/RichTextEditor";
import { useState, useRef } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PaperClipIcon,
  PhotoIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

const defaultForm = {
  title: "",
  content: "",
  isPublished: false,
  publishedAt: "",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NewsAdmin() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: NewsListItem } | null>(null);
  const [attachmentNewsId, setAttachmentNewsId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [dragging, setDragging] = useState(false);

  // Queries
  const { data, isLoading, error } = useQuery({
    queryKey: ["news-admin"],
    queryFn: () => fetchApi<NewsListItem[]>("/news/admin"),
  });

  const { data: detail } = useQuery({
    queryKey: ["news-detail", attachmentNewsId],
    queryFn: () => fetchApi<News>(`/news/admin/${attachmentNewsId}`),
    enabled: !!attachmentNewsId,
  });

  // Mutations
  const save = useMutation({
    mutationFn: () => {
      const body = {
        title: form.title,
        content: form.content,
        isPublished: form.isPublished,
        publishedAt: form.isPublished && form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      };
      return modal?.mode === "edit"
        ? putApi(`/news/${modal.item!.id}`, body)
        : postApi("/news", body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news-admin"] });
      setModal(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteApi(`/news/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news-admin"] });
      if (attachmentNewsId) setAttachmentNewsId(null);
    },
  });

  const uploadFiles = useMutation({
    mutationFn: (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));
      return postFormApi<NewsAttachment[]>(`/news/${attachmentNewsId}/attachments`, formData);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news-detail", attachmentNewsId] }),
  });

  const removeAttachment = useMutation({
    mutationFn: (attachmentId: number) =>
      deleteApi(`/news/${attachmentNewsId}/attachments/${attachmentId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news-detail", attachmentNewsId] }),
  });

  function openAdd() {
    setForm(defaultForm);
    setModal({ mode: "add" });
  }

  function openEdit(item: NewsListItem) {
    setForm({
      title: item.title,
      content: "",  // will be loaded fresh when modal queries detail
      isPublished: item.isPublished,
      publishedAt: item.publishedAt
        ? new Date(item.publishedAt).toISOString().slice(0, 16)
        : "",
    });
    setModal({ mode: "edit", item });
  }

  // Load full content when editing
  useQuery({
    queryKey: ["news-detail-edit", modal?.item?.id],
    queryFn: async () => {
      const full = await fetchApi<News>(`/news/admin/${modal!.item!.id}`);
      setForm((f) => ({ ...f, content: full.content }));
      return full;
    },
    enabled: modal?.mode === "edit" && !!modal.item?.id,
  });

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || !attachmentNewsId) return;
    uploadFiles.mutate(files);
  }

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  const items = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">最新消息管理</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-nba-blue text-white text-sm hover:bg-nba-blue/80 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          新增消息
        </button>
      </div>

      {/* News list table */}
      <div className="overflow-x-auto rounded-lg border border-nba-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-nba-surface text-nba-muted text-left">
              <th className="px-4 py-3 font-medium">標題</th>
              <th className="px-4 py-3 font-medium">狀態</th>
              <th className="px-4 py-3 font-medium">發布日期</th>
              <th className="px-4 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-nba-muted">
                  尚無消息
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-nba-border hover:bg-nba-surface/50 transition-colors"
                >
                  <td className="px-4 py-3 text-white max-w-xs truncate">{item.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.isPublished
                          ? "bg-green-900/40 text-green-400"
                          : "bg-nba-border text-nba-muted"
                      }`}
                    >
                      {item.isPublished ? "已發布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-nba-muted">{formatDate(item.publishedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setAttachmentNewsId(item.id)}
                        title="附件管理"
                        className="p-1.5 rounded text-nba-muted hover:text-nba-gold hover:bg-nba-border transition-colors"
                      >
                        <PaperClipIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        title="編輯"
                        className="p-1.5 rounded text-nba-muted hover:text-nba-blue hover:bg-nba-border transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`確定刪除「${item.title}」？此操作無法復原。`))
                            remove.mutate(item.id);
                        }}
                        title="刪除"
                        className="p-1.5 rounded text-nba-muted hover:text-nba-red hover:bg-nba-border transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit modal */}
      {modal && (
        <Modal
          title={modal.mode === "add" ? "新增消息" : "編輯消息"}
          onClose={() => setModal(null)}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-nba-muted mb-1">標題 *</label>
              <input
                type="text"
                maxLength={200}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-nba-dark border border-nba-border text-white focus:outline-none focus:border-nba-blue"
                placeholder="消息標題"
              />
            </div>

            <div>
              <label className="block text-sm text-nba-muted mb-1">內容 *</label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-nba-blue"
                />
                <span className="text-sm text-white">立即發布</span>
              </label>
            </div>

            {form.isPublished && (
              <div>
                <label className="block text-sm text-nba-muted mb-1">發布時間</label>
                <input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-nba-dark border border-nba-border text-white focus:outline-none focus:border-nba-blue"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-lg text-sm text-nba-muted hover:text-white border border-nba-border hover:border-nba-muted transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => save.mutate()}
                disabled={!form.title.trim() || save.isPending}
                className="px-4 py-2 rounded-lg text-sm bg-nba-blue text-white hover:bg-nba-blue/80 disabled:opacity-50 transition-colors"
              >
                {save.isPending ? "儲存中…" : "儲存"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Attachment management modal */}
      {attachmentNewsId && (
        <Modal
          title="附件管理"
          onClose={() => setAttachmentNewsId(null)}
          size="md"
        >
          <div className="space-y-4">
            {/* Upload area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-8 cursor-pointer transition-colors ${
                dragging
                  ? "border-nba-blue bg-nba-blue/10"
                  : "border-nba-border hover:border-nba-blue/50"
              }`}
            >
              <ArrowUpTrayIcon className="w-8 h-8 text-nba-muted" />
              <p className="text-sm text-nba-muted">拖曳檔案至此或點擊上傳</p>
              <p className="text-xs text-nba-muted/60">支援任意檔案類型，單檔上限 10 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {uploadFiles.isPending && (
              <p className="text-sm text-nba-muted text-center">上傳中…</p>
            )}

            {/* Attachment list */}
            {detail && detail.attachments.length > 0 ? (
              <ul className="space-y-2">
                {detail.attachments.map((att) => (
                  <li
                    key={att.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-nba-surface border border-nba-border"
                  >
                    {att.isImage ? (
                      <img
                        src={att.fileUrl}
                        alt={att.fileName}
                        className="w-10 h-10 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <DocumentIcon className="w-8 h-8 text-nba-muted flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{att.fileName}</p>
                      <p className="text-xs text-nba-muted">{formatFileSize(att.fileSize)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {att.isImage ? (
                        <PhotoIcon className="w-4 h-4 text-nba-blue" />
                      ) : null}
                      <button
                        onClick={() => {
                          if (confirm(`確定刪除附件「${att.fileName}」？`))
                            removeAttachment.mutate(att.id);
                        }}
                        className="p-1 rounded text-nba-muted hover:text-nba-red transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-nba-muted text-center py-4">尚無附件</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
