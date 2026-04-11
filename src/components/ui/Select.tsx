import * as React from "react";
import { cn } from "@/lib/utils/cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Select({
  label,
  hint,
  error,
  className,
  id,
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? React.useId();

  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-neutral-800"
        >
          {label}
        </label>
      ) : null}

      <select
        id={selectId}
        className={cn(
          "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200",
          error && "border-red-300 focus:border-red-400 focus:ring-red-100",
          className
        )}
        {...props}
      >
        {children}
      </select>

      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}