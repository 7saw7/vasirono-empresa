import { SectionCard } from "./SectionCard";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <SectionCard className="p-5">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
        {value}
      </p>
      {helper ? (
        <p className="mt-2 text-sm text-neutral-500">{helper}</p>
      ) : null}
    </SectionCard>
  );
}