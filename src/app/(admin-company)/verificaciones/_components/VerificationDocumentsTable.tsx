"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { VerificationDocumentItem } from "@/features/admin-company/verifications/types";
import { formatDateTime } from "@/lib/utils/dates";

export function VerificationDocumentsTable({
  items,
}: {
  items: VerificationDocumentItem[];
}) {
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openDocument(row: VerificationDocumentItem) {
    setOpeningId(row.id);
    setError(null);

    try {
      const response = await fetch(row.fileUrl, { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      const url = payload?.data?.url;

      if (!response.ok || !payload?.success || typeof url !== "string" || !url) {
        throw new Error(
          payload?.error?.message || "No se pudo generar el acceso al documento.",
        );
      }

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo abrir el documento.",
      );
    } finally {
      setOpeningId(null);
    }
  }

  const columns: DataTableColumn<VerificationDocumentItem>[] = [
    {
      key: "type",
      header: "Tipo",
      render: (row) => row.typeLabel,
    },
    {
      key: "file",
      header: "Archivo",
      render: (row) => (
        <div className="space-y-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openDocument(row)}
            disabled={openingId !== null}
            className="h-auto justify-start px-0 py-0 text-left"
          >
            {openingId === row.id ? "Abriendo..." : row.fileName}
          </Button>
          {row.reviewNotes ? (
            <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
              {row.reviewNotes}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => (
        <StatusBadge
          label={row.statusLabel}
          tone={documentStatusTone(row.statusCode)}
        />
      ),
    },
    {
      key: "uploadedAt",
      header: "Subido",
      render: (row) => (row.uploadedAt ? formatDateTime(row.uploadedAt) : "—"),
    },
  ];

  return (
    <SectionCard
      title="Documentos"
      description="Archivos privados de soporte cargados para la verificación."
    >
      {error ? (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      ) : null}
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay documentos registrados.
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          getRowKey={(row) => String(row.id)}
        />
      )}
    </SectionCard>
  );
}

function documentStatusTone(
  statusCode: string,
): "default" | "success" | "warning" | "danger" | "info" {
  switch (statusCode.trim().toLowerCase()) {
    case "approved":
    case "verified":
      return "success";
    case "rejected":
      return "danger";
    case "needs_reupload":
      return "warning";
    case "pending":
    case "in_review":
      return "info";
    default:
      return "default";
  }
}
