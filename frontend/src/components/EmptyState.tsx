export default function EmptyState({ message = "暫無資料" }: { message?: string }) {
  return (
    <div className="py-16 text-center">
      <div className="text-4xl mb-3 opacity-30">--</div>
      <p className="text-gray-400 text-sm font-medium">{message}</p>
    </div>
  );
}
