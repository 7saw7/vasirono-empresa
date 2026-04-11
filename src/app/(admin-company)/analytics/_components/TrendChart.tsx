"use client";

import { SectionCard } from "@/components/ui/SectionCard";
import type { AnalyticsPoint } from "@/features/admin-company/analytics/types";

type TrendChartProps = {
  title: string;
  description?: string;
  data: AnalyticsPoint[];
};

export function TrendChart({
  title,
  description,
  data,
}: TrendChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <SectionCard title={title} description={description}>
      {data.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay datos suficientes para mostrar esta serie.
        </p>
      ) : (
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-4 text-xs text-neutral-500">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-neutral-900 transition-all"
                  style={{
                    width: `${Math.max(4, (item.value / max) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}