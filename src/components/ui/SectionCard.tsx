import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  description,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#121a23] dark:shadow-none sm:p-6",
        className
      )}
    >
      {title || description ? (
        <div className="mb-5">
          {title ? (
            <h2 className="text-base font-bold tracking-tight text-slate-950 dark:text-white sm:text-lg">
              {title}
            </h2>
          ) : null}

          {description ? (
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}
