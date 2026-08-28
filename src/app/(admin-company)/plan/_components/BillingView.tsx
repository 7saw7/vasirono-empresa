"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FlaskConical,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";
import { formatDate } from "@/lib/utils/dates";
import type {
  BillingOverview,
  BillingPlanOption,
  CurrentPlan,
  PaymentHistoryItem,
  PlanFeatures,
  PlanLimits,
  SubscriptionHistoryItem,
} from "@/features/admin-company/billing/types";

const FEATURE_LABELS: Array<[keyof PlanFeatures, string, string]> = [
  ["promotions", "Promociones", "Crear ofertas visibles en la app"],
  ["analyticsAdvanced", "Analytics avanzado", "Fuentes, funnel, scores e histórico"],
  ["teamManagement", "Equipo y permisos", "Roles para colaboradores por empresa"],
  ["priorityVerification", "Verificación prioritaria", "Revisión documental y prioridad operativa"],
  ["reviewResponses", "Respuesta a reseñas", "Gestionar reputación desde el panel"],
  ["verificationCenter", "Centro de verificación", "Estado, documentos y observaciones"],
];

type BillingViewProps = {
  data: BillingOverview;
  canChangePlan: boolean;
};

export function BillingView({ data, canChangePlan }: BillingViewProps) {
  const router = useRouter();
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [promotionCode, setPromotionCode] = useState("");
  const [feedback, setFeedback] = useState<
    { tone: "success" | "error"; message: string } | null
  >(null);

  async function changePlan(target: BillingPlanOption) {
    if (
      pendingPlan ||
      target.isCurrent ||
      !target.checkoutEnabled ||
      !canChangePlan
    ) {
      return;
    }

    setPendingPlan(target.plan);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin-company/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: target.plan,
          idempotencyKey: createIdempotencyKey(target.plan),
          ...(promotionCode.trim()
            ? { promotionCode: promotionCode.trim().toUpperCase() }
            : {}),
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        setFeedback({
          tone: "error",
          message:
            payload?.error?.message ??
            "No se pudo completar el cambio de plan.",
        });
        return;
      }

      const status = payload?.data?.status;
      setFeedback({
        tone: "success",
        message:
          status === "pending"
            ? "El checkout quedó pendiente de confirmación."
            : status === "unchanged"
              ? "La empresa ya tenía ese plan activo."
              : `Plan ${target.label} aplicado. Las restricciones se actualizarán en todos los módulos.`,
      });
      router.refresh();
    } catch {
      setFeedback({
        tone: "error",
        message: "No se pudo conectar con Billing. Intenta nuevamente.",
      });
    } finally {
      setPendingPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-neutral-950 p-6 text-white shadow-sm dark:shadow-none">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
          Plan y facturación
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Beneficios, límites y pagos del negocio
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Billing es la fuente real de entitlements. Al cambiar de plan se
              actualizan los límites de sucursales, promociones, galería,
              analytics y equipo.
            </p>
          </div>
          <StatusBadge
            label={`Plan ${data.currentPlan.plan.toUpperCase()}`}
            tone={data.currentPlan.isActive ? "success" : "warning"}
          />
        </div>
      </header>

      <CheckoutModeBanner currentPlan={data.currentPlan} />
      <PlanSummary currentPlan={data.currentPlan} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <FeatureMatrix features={data.currentPlan.features} />
        <LimitsCard limits={data.currentPlan.limits} />
      </div>

      <PlanSelector
        plans={data.currentPlan.availablePlans}
        currentPlan={data.currentPlan}
        canChangePlan={canChangePlan}
        pendingPlan={pendingPlan}
        promotionCode={promotionCode}
        onPromotionCodeChange={setPromotionCode}
        feedback={feedback}
        onChangePlan={changePlan}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <PaymentsTable payments={data.payments} />
        <SubscriptionsTable subscriptions={data.subscriptions} />
      </div>
    </div>
  );
}

function CheckoutModeBanner({ currentPlan }: { currentPlan: CurrentPlan }) {
  const isMock = currentPlan.checkoutMode === "mock";

  return (
    <div
      className={
        isMock
          ? "flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
          : "flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
      }
    >
      {isMock ? (
        <FlaskConical className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <div>
        <p className="text-sm font-semibold">
          {isMock ? "Billing en modo mock de preproducción" : "Billing conectado a proveedor"}
        </p>
        <p className="mt-1 text-sm leading-5 opacity-80">
          {isMock
            ? "Los cambios se aprueban inmediatamente y se guardan como pagos y suscripciones reales de prueba. No se realiza ningún cobro externo."
            : "Los cambios de plan siguen el checkout y la confirmación de la pasarela configurada."}
        </p>
      </div>
    </div>
  );
}

function PlanSummary({ currentPlan }: { currentPlan: CurrentPlan }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard
        label="Plan actual"
        value={currentPlan.plan.toUpperCase()}
        helper={currentPlan.planName ?? "Plan base"}
      />
      <StatCard
        label="Estado"
        value={currentPlan.isActive ? "Activo" : "Inactivo"}
        helper={currentPlan.statusLabel}
      />
      <StatCard
        label="Promociones"
        value={formatLimit(currentPlan.limits.promotions)}
        helper={currentPlan.features.promotions ? "Función habilitada" : "Disponible desde Pro"}
      />
      <StatCard
        label="Equipo"
        value={formatLimit(currentPlan.limits.teamMembers)}
        helper={currentPlan.features.teamManagement ? "Roles habilitados" : "Solo propietario"}
      />
    </div>
  );
}

function LimitsCard({ limits }: { limits: PlanLimits }) {
  const items = [
    ["Sucursales", limits.branches],
    ["Promociones activas", limits.promotions],
    ["Archivos / media", limits.media],
    ["Miembros de equipo", limits.teamMembers],
  ] as const;

  return (
    <SectionCard
      title="Límites activos"
      description="Valores consumidos por los demás microservicios mediante entitlements."
    >
      <div className="space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
            <span className="text-sm font-semibold text-slate-950 dark:text-slate-100">
              {formatLimit(value)}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function FeatureMatrix({ features }: { features: PlanFeatures }) {
  return (
    <SectionCard
      title="Beneficios activos"
      description="El bloqueo y desbloqueo de módulos parte de estas banderas."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {FEATURE_LABELS.map(([key, label, description]) => {
          const enabled = features[key];
          return (
            <div
              key={key}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="flex items-center gap-2">
                {enabled ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                )}
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{label}</p>
              </div>
              <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">{description}</p>
              <div className="mt-3">
                <StatusBadge
                  label={enabled ? "Habilitado" : "Bloqueado"}
                  tone={enabled ? "success" : "default"}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function PlanSelector({
  plans,
  currentPlan,
  canChangePlan,
  pendingPlan,
  promotionCode,
  onPromotionCodeChange,
  feedback,
  onChangePlan,
}: {
  plans: BillingPlanOption[];
  currentPlan: CurrentPlan;
  canChangePlan: boolean;
  pendingPlan: string | null;
  promotionCode: string;
  onPromotionCodeChange: (value: string) => void;
  feedback: { tone: "success" | "error"; message: string } | null;
  onChangePlan: (target: BillingPlanOption) => Promise<void>;
}) {
  return (
    <SectionCard
      title="Simular cambio de plan"
      description="Usa el mismo endpoint de checkout que utilizará la pasarela productiva."
    >
      {!canChangePlan ? (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
          Puedes consultar el plan, pero solo el propietario de la empresa puede cambiarlo.
        </div>
      ) : null}

      <div className="mb-4">
        <label htmlFor="promotion-code" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Código comercial (opcional)
        </label>
        <input
          id="promotion-code"
          value={promotionCode}
          onChange={(event) => onPromotionCodeChange(event.target.value)}
          placeholder="FOUNDERS_LAUNCH_2026"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Aplica solo a invitaciones comerciales (p. ej. cohorte fundadores en plan Impulso).
        </p>
      </div>

      {feedback ? (
        <div
          className={
            feedback.tone === "success"
              ? "mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
              : "mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
          }
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((target) => {
          const isLoading = pendingPlan === target.plan;
          const disabled =
            Boolean(pendingPlan) ||
            target.isCurrent ||
            !target.checkoutEnabled ||
            !canChangePlan;

          return (
            <div
              key={target.plan}
              className={
                target.isCurrent
                  ? "relative rounded-3xl border-2 border-sky-300 bg-sky-50/60 p-5 shadow-sm dark:border-sky-800 dark:bg-sky-950/20"
                  : "relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#121a23] dark:shadow-none"
              }
            >
              {target.recommended ? (
                <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300">
                  <Sparkles className="h-3.5 w-3.5" /> Recomendado
                </div>
              ) : null}
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Plan</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{target.label}</h3>
              <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                {target.price === 0 ? "Gratis" : `${currencySymbol(target.currency)} ${target.price.toFixed(2)}`}
                {target.price > 0 ? <span className="text-sm font-normal text-slate-500"> / mes</span> : null}
              </p>
              <ul className="mt-4 min-h-36 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {(target.benefits.length ? target.benefits : fallbackBenefits(target.plan)).slice(0, 6).map((benefit) => (
                  <li key={benefit} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                className="mt-5 w-full"
                variant={target.isCurrent ? "secondary" : "primary"}
                disabled={disabled}
                onClick={() => void onChangePlan(target)}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aplicando...</>
                ) : target.isCurrent ? (
                  "Plan actual"
                ) : !canChangePlan ? (
                  "Solo propietario"
                ) : !target.checkoutEnabled ? (
                  currentPlan.checkoutMode === "provider" ? "Precio no configurado" : "No disponible"
                ) : (
                  `Cambiar a ${target.label}`
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function PaymentsTable({ payments }: { payments: PaymentHistoryItem[] }) {
  return (
    <SectionCard title="Historial de pagos" description="Últimos movimientos de facturación.">
      {payments.length ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Método</th><th className="px-4 py-3">Monto</th><th className="px-4 py-3">Estado</th></tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white dark:bg-[#101821]">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(payment.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{payment.paymentMethodName}</td>
                  <td className="px-4 py-3 font-semibold text-slate-950 dark:text-slate-100">S/ {payment.amount.toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge label={payment.statusName ?? payment.statusKind} tone={statusTone(payment.statusKind)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyBillingState text="Aún no hay pagos registrados para esta empresa." />}
    </SectionCard>
  );
}

function SubscriptionsTable({ subscriptions }: { subscriptions: SubscriptionHistoryItem[] }) {
  return (
    <SectionCard title="Historial de suscripciones" description="Cambios de plan y estado de suscripción.">
      {subscriptions.length ? (
        <div className="space-y-3">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950 dark:text-slate-100">{subscription.planName}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(subscription.startDate)} — {formatDate(subscription.endDate)}</p>
                </div>
                <StatusBadge label={subscription.statusName ?? subscription.statusKind} tone={subscription.isActive ? "success" : statusTone(subscription.statusKind)} />
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyBillingState text="No hay cambios de suscripción registrados." />}
    </SectionCard>
  );
}

function EmptyBillingState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">{text}</div>;
}

function createIdempotencyKey(plan: string): string {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `billing-${plan}-${random}`;
}

function formatLimit(value: number | null): string {
  return value === null ? "Ilimitado" : String(value);
}

function currencySymbol(currency: string): string {
  return currency.toUpperCase() === "PEN" ? "S/" : currency.toUpperCase();
}

function statusTone(status: string): "default" | "success" | "warning" | "danger" | "info" {
  const value = status.toLowerCase();
  if (["active", "paid", "completed", "activo", "pagado"].includes(value)) return "success";
  if (["pending", "past_due", "pendiente"].includes(value)) return "warning";
  if (["failed", "cancelled", "expired", "fallido", "cancelado", "expirado"].includes(value)) return "danger";
  return "default";
}

function fallbackBenefits(plan: string): string[] {
  if (plan === "free") return ["1 sucursal", "Perfil básico", "Respuesta a reseñas", "Centro de verificación"];
  if (plan === "premium") return ["Verificación prioritaria", "Analytics avanzado", "Mayor capacidad de equipo", "Más media y promociones", "Soporte prioritario"];
  return ["Promociones activas", "Analytics por sucursal", "Galería ampliada", "Equipo con roles básicos", "Más capacidad comercial"];
}
