import * as React from "react";
import { cn } from "@/lib/utils/cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? React.useId();

  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-neutral-800"
        >
          {label}
        </label>
      ) : null}

      <textarea
        id={textareaId}
        className={cn(
          "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200",
          error && "border-red-300 focus:border-red-400 focus:ring-red-100",
          className
        )}
        {...props}
      />

      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}