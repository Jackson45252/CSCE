const styles: Record<string, string> = {
  Upcoming: "bg-blue-600 text-white",
  Ongoing: "bg-nba-red text-white animate-pulse",
  Finished: "bg-gray-500 text-white",
};

const labels: Record<string, string> = {
  Upcoming: "UPCOMING",
  Ongoing: "LIVE",
  Finished: "FINAL",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${styles[status] ?? "bg-gray-500 text-white"}`}>
      {labels[status] ?? status}
    </span>
  );
}
