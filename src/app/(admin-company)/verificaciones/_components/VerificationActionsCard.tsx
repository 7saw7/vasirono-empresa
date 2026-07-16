"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Lock,
  Plus,
  Send,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type {
  VerificationDocumentItem,
  VerificationRequestSummary,
} from "@/features/admin-company/verifications/types";
import { cn } from "@/lib/utils/cn";

type ActionName = "request" | "upload" | "submit";
type FlowStep = "level" | "documents" | "review" | "success";

type ApiEnvelope = {
  success?: boolean;
  data?: unknown;
  error?: { message?: string };
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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
  "pending_review",
  "assigned",
  "in_review",
  "under_review",
]);

const LEVEL_LABELS: Record<string, string> = {
  basic: "Básico",
  standard: "Estándar",
  advanced: "Avanzado",
  manual: "Revisión manual",
};

export function VerificationActionsCard({
  request,
  documents,
  canRequestVerification,
  canSubmitVerification,
}: {
  request: VerificationRequestSummary | null;
  documents: VerificationDocumentItem[];
  canRequestVerification: boolean;
  canSubmitVerification: boolean;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<FlowStep>("level");
  const [busy, setBusy] = useState<ActionName | null>(null);
  const [levelCode, setLevelCode] = useState("basic");
  const [publicSummary, setPublicSummary] = useState("");
  const [documentTypeCode, setDocumentTypeCode] = useState("ruc_certificate");
  const [documentNotes, setDocumentNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [flowDocuments, setFlowDocuments] = useState<string[]>([]);
  const [localRequestStage, setLocalRequestStage] = useState<
    "none" | "draft" | "submitted"
  >("none");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusCode = (request?.statusCode ?? "").trim().toLowerCase();
  const backendCanStart = !request || TERMINAL_STATUSES.has(statusCode);
  const backendLockedForReview =
    Boolean(request) && LOCKED_FOR_REVIEW_STATUSES.has(statusCode);
  const backendEditable =
    Boolean(request) && !backendCanStart && !backendLockedForReview;
  const isLockedForReview =
    backendLockedForReview || localRequestStage === "submitted";
  const isEditable =
    !isLockedForReview &&
    (backendEditable || localRequestStage === "draft");
  const canStart =
    backendCanStart && localRequestStage === "none" && canRequestVerification;
  const requestedLevelLabel =
    localRequestStage === "draft"
      ? LEVEL_LABELS[levelCode]
      : isEditable
        ? "Solicitud actual"
        : LEVEL_LABELS[levelCode];

  const panel = useMemo(() => {
    if (isLockedForReview) {
      return {
        eyebrow: "Solicitud en seguimiento",
        title: "Tu verificación está siendo revisada",
        description:
          "La evidencia ya fue enviada. Aquí podrás seguir el estado, las observaciones y la decisión final.",
        actionLabel: null,
        actionStatus: "En revisión",
        icon: Lock,
        tone: "info" as const,
      };
    }

    if (isEditable && !canSubmitVerification) {
      return {
        eyebrow: "Acceso de solo lectura",
        title: "Hay una solicitud pendiente de completar",
        description:
          "Tu rol permite consultar el estado, pero no cargar evidencia ni enviar la solicitud.",
        actionLabel: null,
        actionStatus: "Solo lectura",
        icon: Lock,
        tone: "default" as const,
      };
    }

    if (!isEditable && !canRequestVerification) {
      return {
        eyebrow: "Acceso de solo lectura",
        title: request ? "Consulta el historial de verificación" : "Verificación sin iniciar",
        description:
          "Tu rol permite revisar el estado y los documentos, pero no iniciar una nueva solicitud.",
        actionLabel: null,
        actionStatus: "Solo lectura",
        icon: Lock,
        tone: "default" as const,
      };
    }

    if (isEditable) {
      return {
        eyebrow: "Borrador disponible",
        title: "Continúa tu solicitud de verificación",
        description:
          "Carga la evidencia pendiente y revisa el resumen antes de enviarlo al equipo de validación.",
        actionLabel: "Continuar solicitud",
        icon: FileCheck2,
        tone: "warning" as const,
      };
    }

    if (request) {
      return {
        eyebrow: "Proceso finalizado",
        title: "Renueva o actualiza tu verificación",
        description:
          "La solicitud anterior se conserva como historial. Para adjuntar nuevos documentos, crea un proceso independiente.",
        actionLabel: "Nueva solicitud",
        icon: ShieldCheck,
        tone: "success" as const,
      };
    }

    return {
      eyebrow: "Primer paso",
      title: "Verifica la información de tu negocio",
      description:
        "El asistente te guiará para seleccionar el nivel, cargar documentos y enviar la solicitud sin saltarte pasos.",
      actionLabel: "Iniciar verificación",
      icon: ShieldCheck,
      tone: "default" as const,
    };
  }, [
    canRequestVerification,
    canSubmitVerification,
    isEditable,
    isLockedForReview,
    request,
  ]);

  function openFlow() {
    if (isEditable && !canSubmitVerification) return;
    if (!isEditable && !canRequestVerification) return;

    setError(null);
    setMessage(null);
    setSelectedFile(null);
    setDocumentNotes("");
    setPublicSummary("");
    setFileInputKey((current) => current + 1);

    if (isEditable) {
      setStep("documents");
      if (localRequestStage !== "draft") {
        setFlowDocuments(documents.map((document) => document.fileName));
      }
    } else {
      setStep("level");
      setFlowDocuments([]);
    }

    setModalOpen(true);
  }

  function closeFlow() {
    if (busy) return;
    setModalOpen(false);
    setError(null);
  }

  async function createRequest() {
    if (!canRequestVerification) {
      setError("No tienes permisos para iniciar una verificación.");
      return;
    }

    setBusy("request");
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin-company/verifications/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ levelCode }),
      });
      await readApiResponse(response, "No se pudo iniciar la verificación.");

      setFlowDocuments([]);
      setLocalRequestStage("draft");
      setMessage("Solicitud creada. Ahora carga la evidencia necesaria.");
      setStep("documents");
      router.refresh();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  function validateSelectedFile(file: File) {
    if (!ACCEPTED_FILE_TYPES.has(file.type)) {
      throw new Error("El archivo debe ser PDF, JPG, PNG o WEBP.");
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error("El archivo supera el límite de 10 MB.");
    }
  }

  async function uploadDocument() {
    if (!canSubmitVerification) {
      setError("No tienes permisos para cargar documentos de verificación.");
      return;
    }

    const file = selectedFile;
    if (!file) {
      setMessage(null);
      setError("Selecciona un documento antes de cargarlo.");
      return;
    }

    setBusy("upload");
    setError(null);
    setMessage(null);

    try {
      validateSelectedFile(file);

      const formData = new FormData();
      formData.set("file", file);
      formData.set("documentTypeCode", documentTypeCode);
      if (documentNotes.trim()) formData.set("notes", documentNotes.trim());

      const response = await fetch("/api/admin-company/verifications/documents", {
        method: "POST",
        body: formData,
      });
      await readApiResponse(response, "No se pudo cargar el documento.");

      setFlowDocuments((current) =>
        current.includes(file.name) ? current : [...current, file.name],
      );
      setSelectedFile(null);
      setDocumentNotes("");
      setFileInputKey((current) => current + 1);
      setMessage("Documento cargado correctamente.");
      router.refresh();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  async function submitRequest() {
    if (!canSubmitVerification) {
      setError("No tienes permisos para enviar la solicitud a revisión.");
      return;
    }

    if (flowDocuments.length === 0) {
      setError("Carga al menos un documento antes de enviar la solicitud.");
      setStep("documents");
      return;
    }

    setBusy("submit");
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin-company/verifications/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          publicSummary: publicSummary.trim() || undefined,
        }),
      });
      await readApiResponse(response, "No se pudo enviar la verificación.");

      setLocalRequestStage("submitted");
      setStep("success");
      router.refresh();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  const Icon = panel.icon;
  const activeStepIndex = step === "level" ? 0 : step === "documents" ? 1 : 2;

  return (
    <>
      <SectionCard className="overflow-hidden p-0 sm:p-0">
        <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-4 p-5 sm:p-6">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                panel.tone === "success" &&
                  "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
                panel.tone === "warning" &&
                  "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
                panel.tone === "info" &&
                  "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300",
                panel.tone === "default" &&
                  "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300",
              )}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600 dark:text-sky-400">
                {panel.eyebrow}
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950 dark:text-white sm:text-xl">
                {panel.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                {panel.description}
              </p>

              {isEditable ? (
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                    Solicitud creada
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                    {documents.length} documento{documents.length === 1 ? "" : "s"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                    Pendiente de envío
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center border-t border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/30 lg:border-l lg:border-t-0 sm:p-6">
            {panel.actionLabel ? (
              <Button type="button" size="lg" onClick={openFlow} className="w-full lg:w-auto">
                {canStart ? <Plus className="mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                {panel.actionLabel}
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300">
                <Clock3 className="h-4 w-4" />
                {"actionStatus" in panel ? panel.actionStatus : "En revisión"}
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <Modal
        open={modalOpen}
        onClose={closeFlow}
        closeDisabled={busy !== null}
        size="lg"
        title={isEditable ? "Continuar verificación" : "Nueva solicitud de verificación"}
        description="Completa cada paso en orden. Tus avances se guardan después de cada operación exitosa."
        footer={
          step === "success" ? (
            <div className="flex justify-end">
              <Button type="button" onClick={closeFlow}>
                Cerrar y ver estado
              </Button>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {step === "documents" && !isEditable && canStart ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("level")}
                    disabled={busy !== null}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                  </Button>
                ) : null}
                {step === "review" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("documents")}
                    disabled={busy !== null}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a documentos
                  </Button>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeFlow}
                  disabled={busy !== null}
                >
                  {step === "level" ? "Cancelar" : "Guardar y cerrar"}
                </Button>

                {step === "level" ? (
                  <Button
                    type="button"
                    onClick={createRequest}
                    disabled={busy !== null || !canRequestVerification}
                  >
                    {busy === "request" ? "Creando solicitud..." : "Crear y continuar"}
                    {busy !== "request" ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                  </Button>
                ) : null}

                {step === "documents" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMessage(null);
                      setStep("review");
                    }}
                    disabled={
                      busy !== null ||
                      flowDocuments.length === 0 ||
                      !canSubmitVerification
                    }
                  >
                    Revisar solicitud
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : null}

                {step === "review" ? (
                  <Button
                    type="button"
                    onClick={submitRequest}
                    disabled={busy !== null || !canSubmitVerification}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {busy === "submit" ? "Enviando..." : "Enviar a revisión"}
                  </Button>
                ) : null}
              </div>
            </div>
          )
        }
      >
        {step !== "success" ? (
          <VerificationStepIndicator activeStepIndex={activeStepIndex} />
        ) : null}

        {message ? <FeedbackMessage tone="success" message={message} /> : null}
        {error ? <FeedbackMessage tone="error" message={error} /> : null}

        {step === "level" ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/25 dark:text-sky-200">
              Primero crea la solicitud. Después se habilitará la carga de documentos y, al final, el envío a revisión.
            </div>

            <Select
              label="Nivel solicitado"
              value={levelCode}
              onChange={(event) => setLevelCode(event.target.value)}
              disabled={busy !== null}
              hint="El equipo revisor validará los requisitos correspondientes a este nivel."
            >
              <option value="basic">Básico</option>
              <option value="standard">Estándar</option>
              <option value="advanced">Avanzado</option>
              <option value="manual">Revisión manual</option>
            </Select>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoTile icon={ShieldCheck} title="Nivel" value={requestedLevelLabel} />
              <InfoTile icon={UploadCloud} title="Siguiente paso" value="Cargar evidencia" />
              <InfoTile icon={FileCheck2} title="Cierre" value="Enviar a revisión" />
            </div>
          </div>
        ) : null}

        {step === "documents" ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <Select
                label="Tipo de documento"
                value={documentTypeCode}
                onChange={(event) => setDocumentTypeCode(event.target.value)}
                disabled={busy !== null}
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
                key={fileInputKey}
                type="file"
                label="Archivo"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setSelectedFile(file);
                  setError(null);
                }}
                disabled={busy !== null}
                hint="Formatos admitidos: PDF, JPG, PNG o WEBP. Máximo 10 MB."
              />

              <Input
                label="Nota opcional"
                value={documentNotes}
                maxLength={1000}
                onChange={(event) => setDocumentNotes(event.target.value)}
                disabled={busy !== null}
                placeholder="Ejemplo: documento actualizado en julio"
              />

              <Button
                type="button"
                variant="secondary"
                onClick={uploadDocument}
                disabled={!selectedFile || busy !== null || !canSubmitVerification}
                className="w-full sm:w-auto"
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                {busy === "upload" ? "Cargando documento..." : "Cargar documento"}
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/35">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white">Evidencias cargadas</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Puedes adjuntar más de un documento.
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                  {flowDocuments.length}
                </span>
              </div>

              {flowDocuments.length ? (
                <ul className="mt-4 space-y-2">
                  {flowDocuments.map((fileName, index) => (
                    <li
                      key={`${fileName}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-[#101821] dark:text-slate-200"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                      <span className="min-w-0 flex-1 truncate">{fileName}</span>
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
                  <UploadCloud className="mx-auto h-7 w-7 text-slate-400" />
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Aún no hay documentos
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Carga al menos uno para continuar.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {step === "review" ? (
          <div className="mt-6 space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoTile icon={ShieldCheck} title="Nivel" value={requestedLevelLabel} />
              <InfoTile
                icon={FileText}
                title="Documentos"
                value={String(flowDocuments.length)}
              />
              <InfoTile icon={Send} title="Estado siguiente" value="En revisión" />
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="font-semibold text-slate-950 dark:text-white">Documentos incluidos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {flowDocuments.map((fileName, index) => (
                  <span
                    key={`${fileName}-${index}`}
                    className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{fileName}</span>
                  </span>
                ))}
              </div>
            </div>

            <Textarea
              label="Resumen para el equipo revisor (opcional)"
              value={publicSummary}
              onChange={(event) => setPublicSummary(event.target.value)}
              maxLength={2000}
              rows={5}
              disabled={busy !== null}
              placeholder="Añade información que ayude a revisar tu solicitud."
              hint={`${publicSummary.length}/2000 caracteres`}
            />

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200">
              Al enviar, la solicitud quedará bloqueada mientras el equipo la revisa. Verifica que los documentos sean legibles y estén vigentes.
            </div>
          </div>
        ) : null}

        {step === "success" ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
              Solicitud enviada correctamente
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              El equipo de Vasirono revisará la evidencia. Recibirás una notificación cuando el estado cambie o se requiera una corrección.
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

function VerificationStepIndicator({ activeStepIndex }: { activeStepIndex: number }) {
  const steps = [
    { label: "Nivel", icon: ShieldCheck },
    { label: "Documentos", icon: UploadCloud },
    { label: "Revisar y enviar", icon: Send },
  ];

  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Progreso de la solicitud">
      {steps.map((item, index) => {
        const Icon = item.icon;
        const complete = index < activeStepIndex;
        const active = index === activeStepIndex;

        return (
          <li
            key={item.label}
            aria-current={active ? "step" : undefined}
            className={cn(
              "rounded-2xl border px-3 py-3 text-center transition",
              complete &&
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-300",
              active &&
                "border-sky-300 bg-sky-50 text-sky-700 ring-2 ring-sky-100 dark:border-sky-800 dark:bg-sky-950/25 dark:text-sky-300 dark:ring-sky-900/40",
              !complete &&
                !active &&
                "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/35 dark:text-slate-500",
            )}
          >
            <div className="flex items-center justify-center gap-2">
              {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              <span className="hidden text-xs font-semibold sm:inline">{item.label}</span>
              <span className="text-xs font-semibold sm:hidden">{index + 1}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function InfoTile({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof ShieldCheck;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/35">
      <Icon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className="mt-1 font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function FeedbackMessage({
  tone,
  message,
}: {
  tone: "success" | "error";
  message: string;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "mt-5 rounded-2xl border px-4 py-3 text-sm",
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
      )}
    >
      {message}
    </p>
  );
}

function getErrorMessage(caught: unknown) {
  return caught instanceof Error
    ? caught.message
    : "No se pudo completar la operación.";
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
