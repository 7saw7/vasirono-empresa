import type { ReactNode } from "react";

type AdminCompanyHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminCompanyHeader({
  title,
  description,
  actions,
}: AdminCompanyHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}