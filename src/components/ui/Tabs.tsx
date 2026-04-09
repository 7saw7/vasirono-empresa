"use client";

import { cn } from "@/lib/utils/cn";

export type TabItem = {
  label: string;
  value: string;
};

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm">
      {items.map((item) => {
        const active = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-neutral-950 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}