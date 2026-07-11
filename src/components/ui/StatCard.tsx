import { SectionCard } from "./SectionCard";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <SectionCard className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
        {value}
      </p>
      {helper ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
      ) : null}
    </SectionCard>
  );
}
