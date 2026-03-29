const colors: Record<string, string> = {
  Upcoming: "bg-blue-100 text-blue-700",
  Ongoing: "bg-green-100 text-green-700",
  Finished: "bg-gray-100 text-gray-600",
};

const labels: Record<string, string> = {
  Upcoming: "即將開始",
  Ongoing: "進行中",
  Finished: "已結束",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}
