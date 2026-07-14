"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Lock,
  Megaphone,
  PauseCircle,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import type { BranchListItem } from "@/features/admin-company/branches/types";
import type {
  PromotionGate,
  PromotionListItem,
  PromotionPagination,
  PromotionRedemptionItem,
} from "@/features/admin-company/promotions/types";
import { ADMIN_COMPANY_ROUTES } from "@/lib/constants/admin-company-routes";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/dates";

type Props = {
  initialPromotions: PromotionListItem[];
  initialPagination: PromotionPagination;
  gate: PromotionGate;
  branches: BranchListItem[];
};

type FormState = {
  promotionId?: number;
  branchId: string;
  title: string;
  description: string;
  terms: string;
  discountPercent: string;
  startDate: string;
  endDate: string;
  coverUrl: string;
  maxRedemptions: string;
  maxRedemptionsPerUser: string;
  requiresStaffValidation: boolean;
  publishAfterSave: boolean;
};

type StatusAction = "activate" | "pause" | "delete";
type PendingStatusAction = {
  promotion: PromotionListItem;
  action: StatusAction;
};

type RedemptionAction = "validate" | "cancel";
type PendingRedemptionAction = {
  promotionId: number;
  branchId: number;
  code: string;
  action: RedemptionAction;
};

const EMPTY_FORM: FormState = {
  branchId: "",
  title: "",
  description: "",
  terms: "",
  discountPercent: "",
  startDate: "",
  endDate: "",
  coverUrl: "",
  maxRedemptions: "",
  maxRedemptionsPerUser: "1",
  requiresStaffValidation: true,
  publishAfterSave: false,
};

export function PromotionsView({
  initialPromotions,
  initialPagination,
  gate,
  branches,
}: Props) {
  const activeBranches = useMemo(
    () => branches.filter((branch) => branch.isActive),
    [branches],
  );
  const [promotions, setPromotions] = useState(initialPromotions);
  const [pagination, setPagination] = useState(initialPagination);
  const [currentActivePromotions, setCurrentActivePromotions] = useState(
    gate.currentActivePromotions,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "cover" | "refresh" | null>(null);
  const [pendingStatusAction, setPendingStatusAction] =
    useState<PendingStatusAction | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [redemptionsBusyId, setRedemptionsBusyId] = useState<number | null>(null);
  const [openRedemptions, setOpenRedemptions] = useState<
    Record<number, PromotionRedemptionItem[]>
  >({});
  const [pendingRedemptionAction, setPendingRedemptionAction] =
    useState<PendingRedemptionAction | null>(null);
  const [redemptionActionBusy, setRedemptionActionBusy] = useState(false);

  const effectiveGate = useMemo(() => {
    const hasPromotionCapacity =
      gate.promotionLimit === null ||
      currentActivePromotions < gate.promotionLimit;

    return {
      ...gate,
      currentActivePromotions,
      hasPromotionCapacity,
      canCreatePromotions:
        gate.planAllowsPromotions &&
        gate.verifiedForPromotions &&
        hasPromotionCapacity,
    };
  }, [gate, currentActivePromotions]);

  const canCreate = effectiveGate.canCreatePromotions && activeBranches.length > 0;

  async function loadPromotions(input?: {
    page?: number;
    search?: string;
    status?: string;
  }) {
    setBusy("refresh");
    setError(null);

    const nextPage = input?.page ?? pagination.page;
    const nextSearch = input?.search ?? search;
    const nextStatus = input?.status ?? statusFilter;
    const params = new URLSearchParams({
      page: String(nextPage),
      pageSize: String(pagination.pageSize || 20),
    });

    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    if (nextStatus === "active") params.set("active", "true");
    else if (nextStatus === "inactive") params.set("active", "false");
    else if (nextStatus !== "all") params.set("status", nextStatus);

    try {
      const response = await fetch(
        `/api/admin-company/promotions?${params.toString()}`,
        { cache: "no-store" },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "No se pudo actualizar la lista.");
      }

      const data = payload?.data ?? payload;
      setPromotions(data?.items ?? []);
      setPagination(data?.pagination ?? pagination);
    } catch (caught) {
      setError(getErrorMessage(caught, "No se pudo actualizar la lista."));
    } finally {
      setBusy(null);
    }
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadPromotions({ page: 1, search, status: statusFilter });
  }

  function openCreateModal() {
    setError(null);
    setMessage(null);

    if (!effectiveGate.canCreatePromotions) {
      setError("Primero completa los requisitos comerciales indicados arriba.");
      return;
    }
    if (!activeBranches.length) {
      setError("Activa o crea una sucursal antes de registrar una promoción.");
      return;
    }

    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function editPromotion(promotion: PromotionListItem) {
    setError(null);
    setMessage(null);
    setForm({
      promotionId: promotion.promotionId,
      branchId: String(promotion.branchId),
      title: promotion.title,
      description: promotion.description ?? "",
      terms: promotion.terms ?? "",
      discountPercent:
        promotion.discountPercent === null ? "" : String(promotion.discountPercent),
      startDate: toDateInput(promotion.startDate),
      endDate: toDateInput(promotion.endDate),
      coverUrl: promotion.coverUrl ?? "",
      maxRedemptions:
        promotion.maxRedemptions === null ? "" : String(promotion.maxRedemptions),
      maxRedemptionsPerUser: String(promotion.maxRedemptionsPerUser || 1),
      requiresStaffValidation: promotion.requiresStaffValidation,
      publishAfterSave: false,
    });
    setFormOpen(true);
  }

  function closeFormModal() {
    if (busy === "save" || busy === "cover") return;
    setFormOpen(false);
    setForm(EMPTY_FORM);
  }

  function validateForm() {
    if (!form.promotionId && !form.branchId) return "Selecciona una sucursal.";
    if (form.title.trim().length < 3) {
      return "El título debe tener al menos 3 caracteres.";
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      return "La fecha de fin debe ser igual o posterior a la fecha de inicio.";
    }
    if (Number(form.maxRedemptionsPerUser || 0) < 1) {
      return "El límite por usuario debe ser mayor que cero.";
    }
    return null;
  }

  async function submitPromotion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy("save");

    try {
      const content = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        terms: form.terms.trim() || null,
        discountPercent: form.discountPercent
          ? Number(form.discountPercent)
          : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        coverUrl: form.coverUrl.trim() || null,
        maxRedemptions: form.maxRedemptions
          ? Number(form.maxRedemptions)
          : null,
        maxRedemptionsPerUser: Number(form.maxRedemptionsPerUser || 1),
        requiresStaffValidation: form.requiresStaffValidation,
      };

      const editing = Boolean(form.promotionId);
      const response = await fetch(
        editing
          ? `/api/admin-company/promotions/${form.promotionId}`
          : "/api/admin-company/promotions",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            editing
              ? content
              : { ...content, branchId: Number(form.branchId) },
          ),
        },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "No se pudo guardar la promoción.");
      }

      const promotionId = Number(
        payload?.data?.promotionId ?? payload?.promotionId ?? form.promotionId ?? 0,
      );
      let resultMessage = editing
        ? "Promoción actualizada sin alterar su estado."
        : "Promoción creada como borrador.";

      if (!editing && form.publishAfterSave && promotionId > 0) {
        const activateResponse = await fetch(
          `/api/admin-company/promotions/${promotionId}/activate`,
          { method: "PATCH" },
        );
        const activatePayload = await activateResponse.json().catch(() => null);
        if (!activateResponse.ok) {
          resultMessage =
            "La promoción se creó como borrador, pero no pudo activarse: " +
            (activatePayload?.error?.message ?? "revisa el plan y la verificación.");
        } else {
          resultMessage = "Promoción creada y activada correctamente.";
          setCurrentActivePromotions((current) => current + 1);
        }
      }

      setFormOpen(false);
      setForm(EMPTY_FORM);
      setMessage(resultMessage);
      await loadPromotions({ page: editing ? pagination.page : 1 });
    } catch (caught) {
      setError(getErrorMessage(caught, "No se pudo guardar la promoción."));
    } finally {
      setBusy(null);
    }
  }

  async function uploadCover(file: File | null) {
    if (!file) return;
    setError(null);
    setMessage(null);

    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen válido.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("La portada no puede superar los 8 MB.");
      return;
    }

    setBusy("cover");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("altText", form.title || "Portada de promoción");
      const response = await fetch("/api/admin-company/promotions/cover", {
        method: "POST",
        body,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "No se pudo subir la portada.");
      }
      const url = payload?.data?.url ?? payload?.url;
      if (typeof url !== "string" || !url) {
        throw new Error("Media Service no devolvió la URL de la portada.");
      }
      setForm((current) => ({ ...current, coverUrl: url }));
      setMessage("Portada promocional cargada correctamente.");
    } catch (caught) {
      setError(getErrorMessage(caught, "No se pudo subir la portada."));
    } finally {
      setBusy(null);
    }
  }

  async function confirmStatusAction() {
    if (!pendingStatusAction) return;
    setStatusBusy(true);
    setError(null);
    setMessage(null);

    try {
      const { promotion, action } = pendingStatusAction;
      const method = action === "delete" ? "DELETE" : "PATCH";
      const suffix = action === "delete" ? "" : `/${action}`;
      const response = await fetch(
        `/api/admin-company/promotions/${promotion.promotionId}${suffix}`,
        { method },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "No se pudo actualizar la promoción.");
      }
      if (action === "activate") {
        setCurrentActivePromotions((current) => current + 1);
      } else if (action === "pause" || (action === "delete" && (promotion.active || promotion.isPubliclyAvailable))) {
        setCurrentActivePromotions((current) => Math.max(0, current - 1));
      }

      setMessage(
        action === "activate"
          ? "Promoción activada."
          : action === "pause"
            ? "Promoción pausada."
            : "Promoción archivada.",
      );
      setPendingStatusAction(null);
      await loadPromotions();
    } catch (caught) {
      setPendingStatusAction(null);
      setError(getErrorMessage(caught, "No se pudo actualizar la promoción."));
    } finally {
      setStatusBusy(false);
    }
  }

  async function loadRedemptions(promotionId: number, force = false) {
    if (!force && openRedemptions[promotionId]) {
      setOpenRedemptions((current) => {
        const next = { ...current };
        delete next[promotionId];
        return next;
      });
      return;
    }

    setRedemptionsBusyId(promotionId);
    try {
      const response = await fetch(
        `/api/admin-company/promotions/${promotionId}/redemptions`,
        { cache: "no-store" },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "No se pudieron cargar las redenciones.");
      }
      setOpenRedemptions((current) => ({
        ...current,
        [promotionId]: payload?.data ?? [],
      }));
    } catch (caught) {
      setError(getErrorMessage(caught, "No se pudieron cargar las redenciones."));
    } finally {
      setRedemptionsBusyId(null);
    }
  }

  async function confirmRedemptionAction() {
    if (!pendingRedemptionAction) return;
    setRedemptionActionBusy(true);
    setError(null);
    setMessage(null);

    try {
      const { promotionId, branchId, code, action } = pendingRedemptionAction;
      const response = await fetch(
        `/api/admin-company/promotions/redemptions/${encodeURIComponent(code)}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action === "validate" ? { branchId } : {}),
        },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          payload?.error?.message ??
            (action === "validate"
              ? "No se pudo validar el canje."
              : "No se pudo cancelar el canje."),
        );
      }
      setMessage(action === "validate" ? "Canje validado." : "Canje cancelado.");
      setPendingRedemptionAction(null);
      await Promise.all([loadRedemptions(promotionId, true), loadPromotions()]);
    } catch (caught) {
      setPendingRedemptionAction(null);
      setError(getErrorMessage(caught, "No se pudo procesar la redención."));
    } finally {
      setRedemptionActionBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-slate-800 bg-neutral-950 text-white shadow-sm">
        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Promociones
              </p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Ofertas visibles para tus clientes
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Crea borradores, activa campañas por sucursal y valida canjes sin mezclar el estado con la edición.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <StatusBadge
                label={effectiveGate.canCreatePromotions ? "Módulo habilitado" : "Requisitos pendientes"}
                tone={effectiveGate.canCreatePromotions ? "success" : "warning"}
              />
              <Button type="button" size="lg" onClick={openCreateModal} disabled={!canCreate}>
                {effectiveGate.canCreatePromotions ? (
                  <Plus className="mr-2 h-4 w-4" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Nueva promoción
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Promociones" value={String(pagination.total)} helper="Según el filtro actual" />
        <StatCard label="Activas" value={String(effectiveGate.currentActivePromotions)} helper="Total visibles para clientes" />
        <StatCard
          label="Límite del plan"
          value={gate.promotionLimit === null ? "Ilimitado" : String(gate.promotionLimit)}
          helper={gate.planLabel}
        />
        <StatCard
          label="Verificación"
          value={gate.verifiedForPromotions ? "Cumple" : "Pendiente"}
          helper={gate.verificationLabel}
        />
      </div>

      {!effectiveGate.canCreatePromotions ? <PromotionGatePanel gate={effectiveGate} /> : null}

      {effectiveGate.canCreatePromotions && !activeBranches.length ? (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Necesitas una sucursal activa</p>
                <p className="mt-1 text-sm opacity-85">
                  Las sucursales inactivas no pueden publicar promociones.
                </p>
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link href="/sucursales">Gestionar sucursales</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {message ? <Feedback tone="success" message={message} /> : null}
      {error ? <Feedback tone="error" message={error} /> : null}

      <SectionCard
        title="Promociones del negocio"
        description="Los filtros y la paginación se aplican en el servicio, no solo sobre la página visible."
      >
        <form
          onSubmit={applyFilters}
          className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_auto_auto]"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título, sucursal o descripción"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/20"
            />
          </div>
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">No activas</option>
            <option value="draft">Borradores</option>
            <option value="paused">Pausadas</option>
            <option value="pending_review">En revisión</option>
            <option value="rejected">Rechazadas</option>
            <option value="expired">Expiradas</option>
          </Select>
          <Button type="submit" disabled={busy === "refresh"}>
            Aplicar filtros
          </Button>
          <Button type="button" variant="secondary" onClick={() => void loadPromotions()} disabled={busy === "refresh"}>
            {busy === "refresh" ? "Actualizando..." : "Actualizar"}
          </Button>
        </form>

        <div className="space-y-4">
          {promotions.length ? (
            promotions.map((promotion) => (
              <PromotionCard
                key={promotion.promotionId}
                promotion={promotion}
                gate={effectiveGate}
                redemptions={openRedemptions[promotion.promotionId]}
                redemptionsLoading={redemptionsBusyId === promotion.promotionId}
                onEdit={() => editPromotion(promotion)}
                onToggleRedemptions={() => void loadRedemptions(promotion.promotionId)}
                onAction={(action) => setPendingStatusAction({ promotion, action })}
                onRedemptionAction={(code, action) =>
                  setPendingRedemptionAction({
                    promotionId: promotion.promotionId,
                    branchId: promotion.branchId,
                    code,
                    action,
                  })
                }
              />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center dark:border-slate-700 dark:bg-slate-900/35">
              <Megaphone className="mx-auto h-9 w-9 text-slate-400" />
              <p className="mt-3 font-semibold text-slate-800 dark:text-slate-100">
                No hay promociones para este filtro
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Cambia los filtros o crea una nueva promoción.
              </p>
            </div>
          )}
        </div>

        {pagination.totalPages > 1 ? (
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Página {pagination.page} de {pagination.totalPages} · {pagination.total} resultados
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={pagination.page <= 1 || busy === "refresh"}
                onClick={() => void loadPromotions({ page: pagination.page - 1 })}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={pagination.page >= pagination.totalPages || busy === "refresh"}
                onClick={() => void loadPromotions({ page: pagination.page + 1 })}
              >
                Siguiente
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </SectionCard>

      <PromotionFormModal
        open={formOpen}
        form={form}
        setForm={setForm}
        branches={activeBranches}
        gate={effectiveGate}
        busy={busy}
        onClose={closeFormModal}
        onSubmit={submitPromotion}
        onUploadCover={uploadCover}
      />

      <ConfirmDialog
        open={pendingStatusAction !== null}
        onClose={() => !statusBusy && setPendingStatusAction(null)}
        onConfirm={confirmStatusAction}
        loading={statusBusy}
        title={confirmationCopy(pendingStatusAction).title}
        description={confirmationCopy(pendingStatusAction).description}
        confirmLabel={confirmationCopy(pendingStatusAction).confirmLabel}
        confirmVariant={pendingStatusAction?.action === "delete" ? "danger" : "primary"}
      />

      <ConfirmDialog
        open={pendingRedemptionAction !== null}
        onClose={() => !redemptionActionBusy && setPendingRedemptionAction(null)}
        onConfirm={confirmRedemptionAction}
        loading={redemptionActionBusy}
        title={
          pendingRedemptionAction?.action === "validate"
            ? "Validar canje"
            : "Cancelar redención"
        }
        description={
          pendingRedemptionAction?.action === "validate"
            ? `El código ${pendingRedemptionAction.code} quedará marcado como utilizado.`
            : `El código ${pendingRedemptionAction?.code ?? ""} dejará de estar disponible.`
        }
        confirmLabel={pendingRedemptionAction?.action === "validate" ? "Validar" : "Cancelar redención"}
        confirmVariant={pendingRedemptionAction?.action === "cancel" ? "danger" : "primary"}
      />
    </div>
  );
}

function PromotionGatePanel({ gate }: { gate: PromotionGate }) {
  return (
    <div className="rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-5 text-amber-950 dark:border-amber-900/60 dark:from-amber-950/30 dark:to-orange-950/20 dark:text-amber-100 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold">Completa los requisitos para publicar</p>
            <ul className="mt-3 space-y-2 text-sm">
              {gate.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {!gate.planAllowsPromotions || !gate.hasPromotionCapacity ? (
            <Button asChild variant="secondary">
              <Link href={ADMIN_COMPANY_ROUTES.billing}>
                Ver plan
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          {!gate.verifiedForPromotions ? (
            <Button asChild>
              <Link href={ADMIN_COMPANY_ROUTES.verifications}>
                Completar verificación
                <ShieldCheck className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PromotionFormModal({
  open,
  form,
  setForm,
  branches,
  gate,
  busy,
  onClose,
  onSubmit,
  onUploadCover,
}: {
  open: boolean;
  form: FormState;
  setForm: (value: FormState | ((current: FormState) => FormState)) => void;
  branches: BranchListItem[];
  gate: PromotionGate;
  busy: "save" | "cover" | "refresh" | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUploadCover: (file: File | null) => void;
}) {
  const editing = Boolean(form.promotionId);
  const formBusy = busy === "save" || busy === "cover";

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeDisabled={formBusy}
      size="xl"
      title={editing ? "Editar promoción" : "Nueva promoción"}
      description={
        editing
          ? "La edición cambia únicamente el contenido. Usa Activar o Pausar para modificar el estado."
          : "La promoción se crea como borrador. Puedes solicitar su activación al terminar."
      }
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={formBusy}>
            Cancelar
          </Button>
          <Button type="submit" form="promotion-form" disabled={formBusy}>
            {busy === "save" ? "Guardando..." : editing ? "Guardar cambios" : "Crear promoción"}
          </Button>
        </div>
      }
    >
      <form id="promotion-form" className="space-y-6" onSubmit={onSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Sucursal"
                value={form.branchId}
                onChange={(event) => setForm({ ...form, branchId: event.target.value })}
                required
                disabled={formBusy || editing}
                hint={editing ? "La sucursal no puede cambiarse después de crear la promoción." : "Solo se muestran sucursales activas."}
              >
                <option value="">Selecciona sucursal</option>
                {branches.map((branch) => (
                  <option key={branch.branchId} value={branch.branchId}>
                    {branch.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Descuento %"
                type="number"
                min="0"
                max="100"
                value={form.discountPercent}
                onChange={(event) => setForm({ ...form, discountPercent: event.target.value })}
                placeholder="20"
                disabled={formBusy}
              />
            </div>
            <Input
              label="Título"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="2x1 en postres de la casa"
              maxLength={120}
              required
              disabled={formBusy}
              hint={`${form.title.length}/120 caracteres`}
            />
            <Textarea
              label="Descripción"
              rows={4}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Explica el beneficio de forma clara y atractiva."
              disabled={formBusy}
            />
            <Textarea
              label="Términos y condiciones"
              rows={3}
              value={form.terms}
              onChange={(event) => setForm({ ...form, terms: event.target.value })}
              placeholder="Válido de lunes a viernes, no acumulable..."
              disabled={formBusy}
            />
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/35">
              {form.coverUrl ? (
                <img src={form.coverUrl} alt="Vista previa" className="h-44 w-full object-cover" />
              ) : (
                <div className="flex h-44 flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                  <ImagePlus className="h-8 w-8" />
                  <p className="mt-2 text-sm font-medium">Portada exclusiva de la promoción</p>
                  <p className="mt-1 text-xs">No modifica la portada del negocio.</p>
                </div>
              )}
              <div className="border-t border-slate-200 p-4 dark:border-slate-700">
                <label className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold dark:border-slate-700 dark:bg-[#101821]",
                  formBusy && "pointer-events-none opacity-60",
                )}>
                  {busy === "cover" ? <UploadCloud className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
                  {busy === "cover" ? "Subiendo..." : "Seleccionar portada"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={formBusy}
                    onChange={(event) => onUploadCover(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
            <Input
              label="URL de portada"
              value={form.coverUrl}
              onChange={(event) => setForm({ ...form, coverUrl: event.target.value })}
              placeholder="Se completa al subir una imagen"
              disabled={formBusy}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <p className="font-semibold text-slate-950 dark:text-white">Vigencia y límites</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="Inicio" type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} disabled={formBusy} />
            <Input label="Fin" type="date" min={form.startDate || undefined} value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} disabled={formBusy} />
            <Input label="Máximo de redenciones" type="number" min="1" value={form.maxRedemptions} onChange={(event) => setForm({ ...form, maxRedemptions: event.target.value })} placeholder="Sin límite" disabled={formBusy} />
            <Input label="Por usuario" type="number" min="1" value={form.maxRedemptionsPerUser} onChange={(event) => setForm({ ...form, maxRedemptionsPerUser: event.target.value })} disabled={formBusy} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleCard
            checked={form.requiresStaffValidation}
            onChange={(checked) => setForm({ ...form, requiresStaffValidation: checked })}
            title="Validación por personal"
            description="El equipo confirma el código antes de marcar el canje como utilizado."
            icon={Users}
            disabled={formBusy}
          />
          {!editing ? (
            <ToggleCard
              checked={form.publishAfterSave}
              onChange={(checked) => setForm({ ...form, publishAfterSave: checked })}
              title="Activar después de crear"
              description={
                gate.canCreatePromotions
                  ? "Primero se guarda el borrador y luego se usa el endpoint de activación."
                  : "No disponible hasta cumplir los requisitos."
              }
              icon={CheckCircle2}
              disabled={formBusy || !gate.canCreatePromotions}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
              <p className="font-semibold text-slate-950 dark:text-white">Estado protegido</p>
              <p className="mt-1">Guardar cambios no activa, pausa ni modifica el estado de moderación.</p>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

function PromotionCard({
  promotion,
  gate,
  redemptions,
  redemptionsLoading,
  onEdit,
  onToggleRedemptions,
  onAction,
  onRedemptionAction,
}: {
  promotion: PromotionListItem;
  gate: PromotionGate;
  redemptions?: PromotionRedemptionItem[];
  redemptionsLoading: boolean;
  onEdit: () => void;
  onToggleRedemptions: () => void;
  onAction: (action: StatusAction) => void;
  onRedemptionAction: (code: string, action: RedemptionAction) => void;
}) {
  const active = promotion.isPubliclyAvailable || promotion.active;
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#101821]">
      <div className="grid lg:grid-cols-[240px_1fr]">
        <div className="min-h-44 bg-slate-100 dark:bg-slate-900/60">
          {promotion.coverUrl ? (
            <img src={promotion.coverUrl} alt={`Portada de ${promotion.title}`} className="h-full min-h-44 w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-44 items-center justify-center text-slate-400">
              <Megaphone className="h-10 w-10" />
            </div>
          )}
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge label={promotion.statusName ?? promotion.status} tone={statusTone(promotion.status, promotion.isPubliclyAvailable)} />
                {promotion.isPubliclyAvailable ? <StatusBadge label="Visible" tone="success" /> : null}
              </div>
              <h3 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">{promotion.title}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Building2 className="h-4 w-4" /> {promotion.branchName}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={onEdit}>
                <Pencil className="mr-1.5 h-4 w-4" /> Editar
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={onToggleRedemptions} disabled={redemptionsLoading}>
                <Users className="mr-1.5 h-4 w-4" />
                {redemptionsLoading ? "Cargando..." : redemptions ? "Ocultar canjes" : "Ver canjes"}
              </Button>
              {active ? (
                <Button type="button" size="sm" variant="secondary" onClick={() => onAction("pause")}>
                  <PauseCircle className="mr-1.5 h-4 w-4" /> Pausar
                </Button>
              ) : (
                <Button type="button" size="sm" variant="secondary" disabled={!gate.canCreatePromotions} onClick={() => onAction("activate")}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Activar
                </Button>
              )}
              <Button type="button" size="sm" variant="danger" onClick={() => onAction("delete")}>
                <Trash2 className="mr-1.5 h-4 w-4" /> Archivar
              </Button>
            </div>
          </div>

          {promotion.description ? <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">{promotion.description}</p> : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Vigencia" value={`${formatDate(promotion.startDate)} – ${formatDate(promotion.endDate)}`} icon={<CalendarDays className="h-4 w-4" />} />
            <Metric label="Redenciones" value={`${promotion.redemptionsTotal}/${promotion.maxRedemptions ?? "∞"}`} icon={<Users className="h-4 w-4" />} />
            <Metric label="Emitidas" value={String(promotion.issuedCount)} icon={<Sparkles className="h-4 w-4" />} />
            <Metric label="Por usuario" value={String(promotion.maxRedemptionsPerUser)} icon={<ShieldCheck className="h-4 w-4" />} />
          </div>

          {redemptions ? (
            <RedemptionsList items={redemptions} onAction={onRedemptionAction} />
          ) : null}
        </div>
      </div>
    </article>
  );
}

function RedemptionsList({
  items,
  onAction,
}: {
  items: PromotionRedemptionItem[];
  onAction: (code: string, action: RedemptionAction) => void;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Redenciones</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Valida o cancela códigos emitidos desde el panel.</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold dark:bg-slate-800">{items.length}</span>
      </div>
      {items.length ? (
        <div className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-[#101821]">
          {items.map((item) => (
            <div key={item.redemptionId} className="flex flex-col gap-3 px-3 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-950 dark:text-slate-100">{item.userName || item.userEmail || "Usuario"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Código {item.redemptionCode || "—"} · {formatDate(item.redeemedAt ?? item.issuedAt)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  label={item.statusName ?? item.status}
                  tone={item.status === "redeemed" ? "success" : item.status === "issued" ? "warning" : "default"}
                />
                {item.status === "issued" && item.redemptionCode ? (
                  <>
                    <Button type="button" size="sm" onClick={() => onAction(item.redemptionCode, "validate")}>
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Validar
                    </Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => onAction(item.redemptionCode, "cancel")}>
                      <XCircle className="mr-1 h-4 w-4" /> Cancelar
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Aún no hay redenciones registradas.</p>
      )}
    </div>
  );
}

function ToggleCard({ checked, onChange, title, description, icon: Icon, disabled }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
  icon: typeof Users;
  disabled: boolean;
}) {
  return (
    <label className={cn(
      "flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition dark:border-slate-700",
      checked && "border-sky-300 bg-sky-50/70 dark:border-sky-800 dark:bg-sky-950/20",
      disabled && "cursor-not-allowed opacity-60",
    )}>
      <input type="checkbox" className="mt-1 h-4 w-4 accent-sky-600" checked={checked} onChange={(event) => onChange(event.target.checked)} disabled={disabled} />
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
      <span>
        <span className="block text-sm font-semibold text-slate-950 dark:text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</span>
      </span>
    </label>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/50">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">{icon}{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-950 dark:text-slate-100">{value}</p>
    </div>
  );
}

function Feedback({ tone, message }: { tone: "success" | "error"; message: string }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn(
      "rounded-2xl border px-4 py-3 text-sm",
      tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200"
        : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200",
    )}>{message}</div>
  );
}

function statusTone(status: string, publicAvailable: boolean) {
  if (publicAvailable || status === "approved") return "success" as const;
  if (["draft", "paused", "pending_review"].includes(status)) return "warning" as const;
  if (["rejected", "expired", "deleted"].includes(status)) return "danger" as const;
  return "default" as const;
}

function confirmationCopy(pending: PendingStatusAction | null) {
  if (!pending) return { title: "Confirmar acción", description: "", confirmLabel: "Confirmar" };
  if (pending.action === "activate") return {
    title: "Activar promoción",
    description: `La promoción “${pending.promotion.title}” será visible si cumple el plan, la verificación y la vigencia.`,
    confirmLabel: "Activar",
  };
  if (pending.action === "pause") return {
    title: "Pausar promoción",
    description: `La promoción “${pending.promotion.title}” dejará de mostrarse a clientes.`,
    confirmLabel: "Pausar",
  };
  return {
    title: "Archivar promoción",
    description: `La promoción “${pending.promotion.title}” se retirará de la gestión activa.`,
    confirmLabel: "Archivar",
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function toDateInput(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}
