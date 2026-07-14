"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { VerificationRequestSummary } from "@/features/admin-company/verifications/types";

type ActionName = "request" | "upload" | "submit";

type ApiEnvelope = {
  success?: boolean;
  data?: unknown;
  error?: { message?: string };
};

const TERMINAL_STATUSES = new Set([
  "approved",
  "verified",
  "completed",
  "rejected",
  "failed",
  "cancelled",
  "expired",
]);

const LOCKED_FOR_REVIEW_STATUSES = new Set([
  "submitted",
  "assigned",
  "in_review",
  "under_review",
]);

export function VerificationActionsCard({
  request,
}: {
  request: VerificationRequestSummary | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<ActionName | null>(null);
  const [levelCode, setLevelCode] = useState("basic");
  const [publicSummary, setPublicSummary] = useState("");
  const [documentTypeCode, setDocumentTypeCode] = useState("ruc_certificate");
  const [documentNotes, setDocumentNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusCode = (request?.statusCode ?? "").trim().toLowerCase();
  const canStart = !request || TERMINAL_STATUSES.has(statusCode);
  const canUpload = Boolean(request) && !TERMINAL_STATUSES.has(statusCode);
  const canSubmit =
    Boolean(request) &&
    !TERMINAL_STATUSES.has(statusCode) &&
    !LOCKED_FOR_REVIEW_STATUSES.has(statusCode);

  const helpText = useMemo(() => {
    if (!request) {
      return "Inicia una solicitud para cargar evidencias y enviarla a revisión.";
    }
    if (TERMINAL_STATUSES.has(statusCode)) {
      return "El proceso anterior terminó. Puedes iniciar una nueva solicitud cuando necesites renovar la verificación.";
    }
    if (LOCKED_FOR_REVIEW_STATUSES.has(statusCode)) {
      return "La solicitud ya está en revisión. Puedes adjuntar evidencia adicional mientras el proceso siga abierto.";
    }
    return "Carga la evidencia necesaria y luego envía la solicitud a revisión.";
  }, [request, statusCode]);

  async function runAction(
    action: ActionName,
    task: () => Promise<void>,
    successMessage: string,
  ) {
    setBusy(action);
    setError(null);
    setMessage(null);

    try {
      await task();
      setMessage(successMessage);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo completar la operación.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function createRequest() {
    await runAction(
      "request",
      async () => {
        const response = await fetch("/api/admin-company/verifications/request", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            levelCode,
            publicSummary: publicSummary.trim() || undefined,
          }),
        });
        await readApiResponse(response, "No se pudo iniciar la verificación.");
      },
      "Solicitud de verificación iniciada.",
    );
  }

  async function uploadDocument() {
    const file = selectedFile;
    if (!file) {
      setMessage(null);
      setError("Selecciona un documento antes de cargarlo.");
      return;
    }

    await runAction(
      "upload",
      async () => {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("documentTypeCode", documentTypeCode);
        if (documentNotes.trim()) formData.set("notes", documentNotes.trim());

        const response = await fetch(
          "/api/admin-company/verifications/documents",
          {
            method: "POST",
            body: formData,
          },
        );
        await readApiResponse(response, "No se pudo cargar el documento.");
        setSelectedFile(null);
        setDocumentNotes("");
      },
      "Documento cargado correctamente.",
    );
  }

  async function submitRequest() {
    await runAction(
      "submit",
      async () => {
        const response = await fetch("/api/admin-company/verifications/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            publicSummary: publicSummary.trim() || undefined,
          }),
        });
        await readApiResponse(response, "No se pudo enviar la verificación.");
      },
      "Solicitud enviada a revisión.",
    );
  }

  return (
    <SectionCard
      title="Gestionar verificación"
      description={helpText}
    >
      <div className="space-y-5">
        {message ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-3">
          <div className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div>
              <p className="font-semibold text-slate-950 dark:text-slate-100">
                1. Iniciar solicitud
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Crea o renueva el proceso de verificación del negocio.
              </p>
            </div>
            <Select
              label="Nivel solicitado"
              value={levelCode}
              onChange={(event) => setLevelCode(event.target.value)}
              disabled={!canStart || busy !== null}
            >
              <option value="basic">Básico</option>
              <option value="standard">Estándar</option>
              <option value="advanced">Avanzado</option>
              <option value="manual">Revisión manual</option>
            </Select>
            <Button
              type="button"
              onClick={createRequest}
              disabled={!canStart || busy !== null}
              className="w-full"
            >
              {busy === "request" ? "Iniciando..." : "Iniciar verificación"}
            </Button>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div>
              <p className="font-semibold text-slate-950 dark:text-slate-100">
                2. Cargar evidencia
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                PDF, JPG, PNG o WEBP de hasta 10 MB.
              </p>
            </div>
            <Select
              label="Tipo de documento"
              value={documentTypeCode}
              onChange={(event) => setDocumentTypeCode(event.target.value)}
              disabled={!canUpload || busy !== null}
            >
              <option value="ruc_certificate">Ficha o constancia de RUC</option>
              <option value="municipal_license">Licencia municipal</option>
              <option value="utility_bill">Recibo de servicio</option>
              <option value="onsite_visit_act">Acta de visita</option>
              <option value="storefront_photo">Foto de fachada</option>
              <option value="authorization_document">Documento de autorización</option>
              <option value="other">Otro documento</option>
            </Select>
            <Input
              type="file"
              label="Archivo"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              disabled={!canUpload || busy !== null}
            />
            <Input
              label="Nota opcional"
              value={documentNotes}
              maxLength={1000}
              onChange={(event) => setDocumentNotes(event.target.value)}
              disabled={!canUpload || busy !== null}
              placeholder="Describe brevemente la evidencia"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={uploadDocument}
              disabled={!canUpload || busy !== null}
              className="w-full"
            >
              {busy === "upload" ? "Cargando..." : "Cargar documento"}
            </Button>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div>
              <p className="font-semibold text-slate-950 dark:text-slate-100">
                3. Enviar a revisión
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Confirma que la información y los documentos estén completos.
              </p>
            </div>
            <Textarea
              label="Resumen público opcional"
              value={publicSummary}
              onChange={(event) => setPublicSummary(event.target.value)}
              maxLength={2000}
              rows={6}
              disabled={busy !== null}
              placeholder="Información adicional para el equipo revisor"
            />
            <Button
              type="button"
              onClick={submitRequest}
              disabled={!canSubmit || busy !== null}
              className="w-full"
            >
              {busy === "submit" ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

async function readApiResponse(
  response: Response,
  fallbackMessage: string,
): Promise<unknown> {
  let payload: ApiEnvelope | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error?.message || fallbackMessage);
  }

  return payload?.data;
}
