import type { ReactNode } from "react";

interface Props {
  title: string;
  children?: ReactNode;
  size?: "lg" | "sm";
}

export default function PageHeader({ title, children, size = "lg" }: Props) {
  const titleClass =
    size === "lg"
      ? "text-2xl font-extrabold text-nba-navy uppercase tracking-wide"
      : "text-lg font-bold text-nba-navy";

  return (
    <div className={`flex items-center justify-between ${size === "lg" ? "mb-6" : "mb-4"}`}>
      <h2 className={titleClass}>{title}</h2>
      {children && <div className="flex gap-2 items-center">{children}</div>}
    </div>
  );
}
