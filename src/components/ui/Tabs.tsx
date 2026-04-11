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
        "inline-flex rounded-2xl border border-neutral-200 bg-white p-1",
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
                ? "bg-neutral-950 text-white"
                : "text-neutral-600 hover:text-neutral-950"
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