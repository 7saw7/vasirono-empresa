import { StatCard } from "@/components/ui/StatCard";
import type { DashboardKpi } from "@/features/admin-company/dashboard/types";

export function KpiCard({ item }: { item: DashboardKpi }) {
  const helperParts = [item.helper, item.trend?.value].filter(Boolean);
  const helper = helperParts.length > 0 ? helperParts.join(" · ") : undefined;

  return <StatCard label={item.label} value={item.value} helper={helper} />;
}