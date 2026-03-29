export function pct(made: number, attempts: number): string {
  if (attempts === 0) return "-";
  return `${Math.round((made / attempts) * 100)}%`;
}
