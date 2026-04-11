import { cn } from "@/lib/utils/cn";

type StatusTone = "default" | "success" | "warning" | "danger" | "info";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
};

const toneClasses: Record<StatusTone, string> = {
  default: "bg-neutral-100 text-neutral-700 border-neutral-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

export function StatusBadge({
  label,
  tone = "default",
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone]
      )}
    >
      {label}
    </span>
  );
}