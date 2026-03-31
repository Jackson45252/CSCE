import type { ReactNode } from "react";
import { pct } from "../utils/format";

interface ShootingStats {
  twoPointAttempts: number;
  twoPointPoints: number;
  threePointAttempts: number;
  threePointPoints: number;
  freeThrowAttempts: number;
  freeThrowPoints: number;
  totalPoints: number;
}

interface Column<T> {
  key: string;
  label: string;
  className?: string;
  render: (item: T) => ReactNode;
}

interface Props<T extends ShootingStats> {
  data: T[];
  prefixColumns: Column<T>[];
  actions?: (item: T) => ReactNode;
  emptyText?: string;
}

export function ShootingStatsHeader<T extends ShootingStats>({
  prefixColumns,
  hasActions,
}: {
  prefixColumns: Column<T>[];
  hasActions?: boolean;
}) {
  return (
    <tr className="bg-nba-navy text-white text-[11px] uppercase tracking-wider">
      {prefixColumns.map((col) => (
        <th key={col.key} className="px-3 py-2.5 text-left font-semibold">
          {col.label}
        </th>
      ))}
      <th className="px-3 py-2.5 text-right font-semibold">2PT</th>
      <th className="px-3 py-2.5 text-right font-semibold">3PT</th>
      <th className="px-3 py-2.5 text-right font-semibold">FT</th>
      <th className="px-3 py-2.5 text-right font-semibold">FG%</th>
      <th className="px-3 py-2.5 text-right font-semibold">PTS</th>
      {hasActions && <th className="px-3 py-2.5 text-right font-semibold">操作</th>}
    </tr>
  );
}

export function ShootingStatsRow({ stats }: { stats: ShootingStats }) {
  return (
    <>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {stats.twoPointPoints}/{stats.twoPointAttempts}{" "}
        <span className="text-gray-400 text-xs">{pct(stats.twoPointPoints, stats.twoPointAttempts)}</span>
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {stats.threePointPoints}/{stats.threePointAttempts}{" "}
        <span className="text-gray-400 text-xs">{pct(stats.threePointPoints, stats.threePointAttempts)}</span>
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {stats.freeThrowPoints}/{stats.freeThrowAttempts}{" "}
        <span className="text-gray-400 text-xs">{pct(stats.freeThrowPoints, stats.freeThrowAttempts)}</span>
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {pct(stats.twoPointPoints + stats.threePointPoints, stats.twoPointAttempts + stats.threePointAttempts)}
      </td>
      <td className="px-3 py-2.5 text-right font-bold tabular-nums text-nba-navy">{stats.totalPoints}</td>
    </>
  );
}

export default function ShootingStatsTable<T extends ShootingStats>({
  data,
  prefixColumns,
  actions,
  emptyText = "暫無數據",
}: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm nba-table">
        <thead>
          <ShootingStatsHeader prefixColumns={prefixColumns} hasActions={!!actions} />
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={prefixColumns.length + 5 + (actions ? 1 : 0)}
                className="px-3 py-10 text-center text-gray-400"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                {prefixColumns.map((col) => (
                  <td key={col.key} className={col.className ?? "px-3 py-2.5"}>
                    {col.render(item)}
                  </td>
                ))}
                <ShootingStatsRow stats={item} />
                {actions && (
                  <td className="px-3 py-2.5 text-right space-x-2">{actions(item)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
