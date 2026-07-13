"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import type { DashboardSyncState } from "@/features/admin-company/dashboard/types";
import { formatDateTime } from "@/lib/utils/dates";

export function DashboardSyncIndicator({ sync }: { sync: DashboardSyncState }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isPartial = sync.status === "partial";
  const sourceTimestamp = sync.analyticsDataUpdatedAt;
  const label = sourceTimestamp
    ? `Último dato ${formatDateTime(sourceTimestamp)}`
    : `Consultado ${formatDateTime(sync.analyticsGeneratedAt)}`;
  const freshnessDetails = [
    { name: "Respuesta", timestamp: sync.analyticsGeneratedAt },
    { name: "Score", timestamp: sync.analyticsCompanyScoreCalculatedAt },
    { name: "Embudo", timestamp: sync.analyticsFunnelCalculatedAt },
    { name: "Eventos", timestamp: sync.analyticsLatestEventAt },
    { name: "Reseñas", timestamp: sync.analyticsReviewsUpdatedAt },
  ]
    .filter(
      (entry): entry is { name: string; timestamp: string } =>
        Boolean(entry.timestamp)
    )
    .map(
      ({ name, timestamp }) => `${name}: ${formatDateTime(timestamp)}`
    )
    .join("\n");

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      {isPartial ? (
        <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
      )}

      <span
        className={isPartial ? "text-amber-700 dark:text-amber-400" : undefined}
        title={freshnessDetails}
      >
        {isPartial ? `Actualización parcial · ${label}` : label}
      </span>

      <button
        type="button"
        onClick={refresh}
        disabled={isPending}
        className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-sky-600 disabled:cursor-wait disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-sky-400"
        aria-label="Actualizar dashboard"
        title="Actualizar dashboard"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
