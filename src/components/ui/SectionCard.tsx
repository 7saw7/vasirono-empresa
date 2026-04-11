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
        "rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm",
        className
      )}
    >
      {title || description ? (
        <div className="mb-5">
          {title ? (
            <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
              {title}
            </h2>
          ) : null}

          {description ? (
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}