import type { ReactNode } from "react";
import { SectionCard } from "./SectionCard";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <SectionCard className="text-center">
      <div className="mx-auto max-w-md space-y-3 py-6">
        <h3 className="text-lg font-semibold text-neutral-950">{title}</h3>

        {description ? (
          <p className="text-sm leading-6 text-neutral-500">{description}</p>
        ) : null}

        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </SectionCard>
  );
}