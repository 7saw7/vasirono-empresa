"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type TabItem = {
  key: string;
  label: string;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900/70",
        className
      )}
    >
      {items.map((item) => {
        const active = item.key === value;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-slate-950 text-white dark:bg-sky-500 dark:text-slate-950"
                : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

type TabPanelProps = {
  active: boolean;
  children: ReactNode;
};

export function TabPanel({ active, children }: TabPanelProps) {
  if (!active) return null;
  return <div>{children}</div>;
}
