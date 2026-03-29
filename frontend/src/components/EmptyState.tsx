export default function EmptyState({ message = "暫無資料" }: { message?: string }) {
  return (
    <div className="py-12 text-center text-gray-400">{message}</div>
  );
}
