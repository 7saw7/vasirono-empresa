import { StatCard } from "@/components/ui/StatCard";
import type { DashboardKpi } from "@/features/admin-company/dashboard/types";

export function KpiCard({ item }: { item: DashboardKpi }) {
  const helper = item.trend
    ? `${item.helper ?? ""} ${item.trend.value}`.trim()
    : item.helper;

  return <StatCard label={item.label} value={item.value} helper={helper} />;
}