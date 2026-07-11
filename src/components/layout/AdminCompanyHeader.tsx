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
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px] dark:text-white">
          {title}
        </h1>

        {description ? (
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
