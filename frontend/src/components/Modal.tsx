import type { ReactNode } from "react";

const sizeClass: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

interface Props {
  open?: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({ open = true, onClose, title, children, size = "md" }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full ${sizeClass[size]} rounded-lg bg-white shadow-2xl overflow-hidden`} onClick={(e) => e.stopPropagation()}>
        <div className="bg-nba-navy px-6 py-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
