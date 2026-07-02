"use client";

import { useMemo, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { CalendarDays, CheckCircle2, ImagePlus, Lock, Megaphone, PauseCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";
import { Textarea } from "@/components/ui/Textarea";
import { formatDate } from "@/lib/utils/dates";
import type { BranchListItem } from "@/features/admin-company/branches/types";
import type { PromotionGate, PromotionListItem, PromotionPagination, PromotionRedemptionItem } from "@/features/admin-company/promotions/types";

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
  active: boolean;
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
  active: false,
};

export function PromotionsView({ initialPromotions, initialPagination, gate, branches }: Props) {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [pagination, setPagination] = useState(initialPagination);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openRedemptions, setOpenRedemptions] = useState<Record<number, PromotionRedemptionItem[]>>({});
  const [isPending, startTransition] = useTransition();

  const activeCount = useMemo(
    () => promotions.filter((item) => item.isPubliclyAvailable || item.active).length,
    [promotions],
  );

  function refresh() {
    startTransition(async () => {
      const response = await fetch("/api/admin-company/promotions", { cache: "no-store" });
      const payload = await response.json();
      const data = payload?.data ?? payload;
      setPromotions(data?.items ?? []);
      setPagination(data?.pagination ?? pagination);
    });
  }

  async function submitPromotion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const body = {
      branchId: Number(form.branchId),
      title: form.title,
      description: form.description || null,
      terms: form.terms || null,
      discountPercent: form.discountPercent ? Number(form.discountPercent) : null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      active: form.active,
      coverUrl: form.coverUrl || null,
      maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
      maxRedemptionsPerUser: Number(form.maxRedemptionsPerUser || 1),
      requiresStaffValidation: form.requiresStaffValidation,
    };

    const url = form.promotionId
      ? `/api/admin-company/promotions/${form.promotionId}`
      : "/api/admin-company/promotions";
    const method = form.promotionId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error?.message ?? "No se pudo guardar la promoción.");
      return;
    }

    setMessage(form.promotionId ? "Promoción actualizada." : "Promoción creada.");
    setForm(EMPTY_FORM);
    refresh();
  }

  async function uploadCover(file: File | null) {
    if (!file) return;
    setError(null);
    setMessage(null);

    const body = new FormData();
    body.set("file", file);
    body.set("altText", form.title || "Portada de promoción");

    const response = await fetch("/api/admin-company/promotions/cover", {
      method: "POST",
      body,
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error?.message ?? "No se pudo subir la portada.");
      return;
    }

    const url = payload?.data?.url ?? payload?.url;
    if (url) {
      setForm((current) => ({ ...current, coverUrl: url }));
      setMessage("Portada subida y enlazada al formulario.");
    }
  }

  async function mutateStatus(promotionId: number, action: "activate" | "pause" | "delete") {
    setError(null);
    setMessage(null);
    const method = action === "delete" ? "DELETE" : "PATCH";
    const suffix = action === "delete" ? "" : `/${action}`;
    const response = await fetch(`/api/admin-company/promotions/${promotionId}${suffix}`, { method });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error?.message ?? "No se pudo actualizar la promoción.");
      return;
    }

    setMessage(action === "activate" ? "Promoción activada." : action === "pause" ? "Promoción pausada." : "Promoción archivada.");
    refresh();
  }


  async function toggleRedemptions(promotionId: number) {
    if (openRedemptions[promotionId]) {
      setOpenRedemptions((current) => {
        const next = { ...current };
        delete next[promotionId];
        return next;
      });
      return;
    }

    const response = await fetch(`/api/admin-company/promotions/${promotionId}/redemptions`, { cache: "no-store" });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? "No se pudieron cargar las redenciones.");
      return;
    }
    setOpenRedemptions((current) => ({ ...current, [promotionId]: payload?.data ?? [] }));
  }

  function editPromotion(promotion: PromotionListItem) {
    setForm({
      promotionId: promotion.promotionId,
      branchId: String(promotion.branchId),
      title: promotion.title,
      description: promotion.description ?? "",
      terms: promotion.terms ?? "",
      discountPercent: promotion.discountPercent === null ? "" : String(promotion.discountPercent),
      startDate: promotion.startDate ?? "",
      endDate: promotion.endDate ?? "",
      coverUrl: promotion.coverUrl ?? "",
      maxRedemptions: promotion.maxRedemptions === null ? "" : String(promotion.maxRedemptions),
      maxRedemptionsPerUser: String(promotion.maxRedemptionsPerUser || 1),
      requiresStaffValidation: promotion.requiresStaffValidation,
      active: promotion.active || promotion.isPubliclyAvailable,
    });
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-neutral-950 p-6 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">Promociones</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Ofertas visibles para clientes de Vasirono</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
              Crea, pausa y archiva promociones respetando el plan activo y el nivel de verificación del negocio.
            </p>
          </div>
          <StatusBadge label={gate.canCreatePromotions ? "Habilitado" : "Bloqueado"} tone={gate.canCreatePromotions ? "success" : "warning"} />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Promociones" value={String(pagination.total)} helper="Total registradas" />
        <StatCard label="Activas" value={String(activeCount)} helper="Visibles o aprobadas" />
        <StatCard label="Límite del plan" value={gate.promotionLimit === null ? "Ilimitado" : String(gate.promotionLimit)} helper={gate.planLabel} />
        <StatCard label="Verificación" value={gate.verifiedForPromotions ? "OK" : "Pendiente"} helper={gate.verificationLabel} />
      </div>

      {!gate.canCreatePromotions ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Promociones bloqueadas por reglas comerciales.</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {gate.reasons.map((reason) => <li key={reason}>{reason}</li>)}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {message ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard
          title={form.promotionId ? "Editar promoción" : "Nueva promoción"}
          description="Las publicaciones activas requieren plan Pro/Premium y verificación mínima."
        >
          <form className="space-y-4" onSubmit={submitPromotion}>
            <Select label="Sucursal" value={form.branchId} onChange={(event) => setForm({ ...form, branchId: event.target.value })} required>
              <option value="">Selecciona sucursal</option>
              {branches.map((branch) => <option key={branch.branchId} value={branch.branchId}>{branch.name}</option>)}
            </Select>
            <Input label="Título" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="2x1 en postres de la casa" required />
            <Textarea label="Descripción" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe la oferta y qué la hace atractiva." />
            <Textarea label="Términos" rows={3} value={form.terms} onChange={(event) => setForm({ ...form, terms: event.target.value })} placeholder="Válido de lunes a viernes, no acumulable..." />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Descuento %" type="number" min="0" max="100" value={form.discountPercent} onChange={(event) => setForm({ ...form, discountPercent: event.target.value })} />
              <Input label="Máximo redenciones" type="number" min="1" value={form.maxRedemptions} onChange={(event) => setForm({ ...form, maxRedemptions: event.target.value })} />
              <Input label="Inicio" type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
              <Input label="Fin" type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
            </div>
            <Input label="URL de portada" value={form.coverUrl} onChange={(event) => setForm({ ...form, coverUrl: event.target.value })} placeholder="https://..." />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100">
              <ImagePlus className="h-4 w-4" /> Subir portada desde media-service
              <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadCover(event.target.files?.[0] ?? null)} />
            </label>
            <div className="grid gap-3 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700 md:grid-cols-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.requiresStaffValidation} onChange={(event) => setForm({ ...form, requiresStaffValidation: event.target.checked })} /> Requiere validación por staff</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} disabled={!gate.canCreatePromotions} /> Publicar como activa</label>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isPending || (!gate.canCreatePromotions && !form.promotionId)}>
                <Plus className="mr-2 h-4 w-4" /> {form.promotionId ? "Guardar cambios" : "Crear promoción"}
              </Button>
              {form.promotionId ? <Button type="button" variant="secondary" onClick={() => setForm(EMPTY_FORM)}>Cancelar edición</Button> : null}
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Promociones del negocio" description="Listado operativo con estado, redenciones y acciones rápidas.">
          <div className="space-y-4">
            {promotions.length ? promotions.map((promotion) => (
              <article key={promotion.promotionId} className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
                {promotion.coverUrl ? <img src={promotion.coverUrl} alt="" className="h-40 w-full object-cover" /> : null}
                <div className="p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge label={promotion.statusName ?? promotion.status} tone={statusTone(promotion.status, promotion.isPubliclyAvailable)} />
                        {promotion.isPubliclyAvailable ? <StatusBadge label="Visible en app" tone="success" /> : null}
                      </div>
                      <h3 className="mt-3 text-xl font-semibold text-neutral-950">{promotion.title}</h3>
                      <p className="mt-1 text-sm text-neutral-500">{promotion.branchName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => editPromotion(promotion)}>Editar</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => toggleRedemptions(promotion.promotionId)}>{openRedemptions[promotion.promotionId] ? "Ocultar" : "Redenciones"}</Button>
                      {promotion.isPubliclyAvailable || promotion.active ? (
                        <Button type="button" size="sm" variant="secondary" onClick={() => mutateStatus(promotion.promotionId, "pause")}><PauseCircle className="mr-1 h-4 w-4" /> Pausar</Button>
                      ) : (
                        <Button type="button" size="sm" variant="secondary" disabled={!gate.canCreatePromotions} onClick={() => mutateStatus(promotion.promotionId, "activate")}><CheckCircle2 className="mr-1 h-4 w-4" /> Activar</Button>
                      )}
                      <Button type="button" size="sm" variant="danger" onClick={() => mutateStatus(promotion.promotionId, "delete")}><Trash2 className="mr-1 h-4 w-4" /> Archivar</Button>
                    </div>
                  </div>
                  {promotion.description ? <p className="mt-4 text-sm leading-6 text-neutral-600">{promotion.description}</p> : null}
                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                    <Metric label="Descuento" value={promotion.discountPercent === null ? "—" : `${promotion.discountPercent}%`} />
                    <Metric label="Vigencia" value={`${formatDate(promotion.startDate)} - ${formatDate(promotion.endDate)}`} icon={<CalendarDays className="h-4 w-4" />} />
                    <Metric label="Redenciones" value={`${promotion.redemptionsTotal}/${promotion.maxRedemptions ?? "∞"}`} />
                    <Metric label="Por usuario" value={String(promotion.maxRedemptionsPerUser)} />
                  </div>
                  {openRedemptions[promotion.promotionId] ? (
                    <RedemptionsList items={openRedemptions[promotion.promotionId]} />
                  ) : null}
                </div>
              </article>
            )) : (
              <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
                <Megaphone className="mx-auto mb-3 h-8 w-8 text-neutral-400" />
                Aún no hay promociones registradas para esta empresa.
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-3">
      <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-neutral-400">{icon}{label}</p>
      <p className="mt-1 font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

function statusTone(status: string, visible: boolean): "default" | "success" | "warning" | "danger" | "info" {
  const value = status.toLowerCase();
  if (visible || value === "approved") return "success";
  if (["draft", "pending_review", "paused"].includes(value)) return "warning";
  if (["rejected", "expired", "deleted"].includes(value)) return "danger";
  return "default";
}


function RedemptionsList({ items }: { items: PromotionRedemptionItem[] }) {
  return (
    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-semibold text-neutral-950">Usuarios interesados / redenciones</p>
      {items.length ? (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.redemptionId} className="flex flex-col gap-1 rounded-xl bg-white px-3 py-2 text-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-neutral-950">{item.userName || item.userEmail || "Usuario"}</p>
                <p className="text-xs text-neutral-500">Código {item.redemptionCode || "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge label={item.statusName ?? item.status} tone={item.status === "redeemed" ? "success" : item.status === "issued" ? "warning" : "default"} />
                <span className="text-xs text-neutral-500">{formatDate(item.redeemedAt ?? item.issuedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-neutral-500">Aún no hay usuarios interesados o redenciones registradas.</p>
      )}
    </div>
  );
}
