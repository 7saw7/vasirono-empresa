import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";
import { formatDate } from "@/lib/utils/dates";
import type {
  BillingOverview,
  CurrentPlan,
  PaymentHistoryItem,
  PlanFeatures,
  PlanLimits,
  SubscriptionHistoryItem,
  UpgradeTarget,
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
};

export function BillingView({ data }: BillingViewProps) {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-neutral-950 p-6 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
          Plan y facturación
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Beneficios, límites y pagos del negocio
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
              El frontend consume los entitlements del billing-service. Así el
              panel no adivina permisos: solo renderiza lo que el plan y la
              verificación permiten.
            </p>
          </div>
          <StatusBadge
            label={`Plan ${data.currentPlan.plan.toUpperCase()}`}
            tone={data.currentPlan.isActive ? "success" : "warning"}
          />
        </div>
      </header>

      <PlanSummary currentPlan={data.currentPlan} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <FeatureMatrix features={data.currentPlan.features} />
        <LimitsCard limits={data.currentPlan.limits} />
      </div>

      <UpgradeSection targets={data.currentPlan.upgradeTargets} />

      <div className="grid gap-6 xl:grid-cols-2">
        <PaymentsTable payments={data.payments} />
        <SubscriptionsTable subscriptions={data.subscriptions} />
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
      description="Estos valores vienen del endpoint de entitlements del billing-service."
    >
      <div className="space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3"
          >
            <span className="text-sm font-medium text-neutral-700">{label}</span>
            <span className="text-sm font-semibold text-neutral-950">
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
      description="El bloqueo/desbloqueo de módulos parte de estas banderas."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {FEATURE_LABELS.map(([key, label, description]) => {
          const enabled = features[key];

          return (
            <div
              key={key}
              className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
            >
              <div className="flex items-center gap-2">
                {enabled ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Lock className="h-4 w-4 text-neutral-400" />
                )}
                <p className="text-sm font-semibold text-neutral-950">
                  {label}
                </p>
              </div>
              <p className="mt-2 text-sm leading-5 text-neutral-500">
                {description}
              </p>
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

function UpgradeSection({ targets }: { targets: UpgradeTarget[] }) {
  if (!targets.length) {
    return (
      <SectionCard
        title="Upgrade"
        description="Tu negocio ya está en el plan más alto configurado."
      >
        <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
          Tienes todos los beneficios disponibles para este ciclo.
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Upgrade a Pro / Premium"
      description="Los CTAs quedan listos para conectarse al checkout manual del billing-service."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {targets.map((target) => (
          <div
            key={target.plan}
            className="relative rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            {target.recommended ? (
              <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                <Sparkles className="h-3.5 w-3.5" /> Recomendado
              </div>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Plan
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-neutral-950">
              {target.label}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              {(target.benefits.length ? target.benefits : fallbackBenefits(target.plan)).slice(0, 5).map((benefit) => (
                <li key={benefit} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-2xl bg-neutral-50 p-3 text-xs leading-5 text-neutral-500">
              Checkout manual preparado vía <strong>/api/company/billing/checkout</strong>. Falta configurar precios/método de pago productivo para activar el botón final.
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function PaymentsTable({ payments }: { payments: PaymentHistoryItem[] }) {
  return (
    <SectionCard title="Historial de pagos" description="Últimos movimientos de facturación.">
      {payments.length ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 text-neutral-600">{formatDate(payment.createdAt)}</td>
                  <td className="px-4 py-3 text-neutral-600">{payment.paymentMethodName}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-950">S/ {payment.amount.toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge label={payment.statusName ?? payment.statusKind} tone={statusTone(payment.statusKind)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyBillingState text="Aún no hay pagos registrados para esta empresa." />
      )}
    </SectionCard>
  );
}

function SubscriptionsTable({ subscriptions }: { subscriptions: SubscriptionHistoryItem[] }) {
  return (
    <SectionCard title="Historial de suscripciones" description="Cambios de plan y estado de suscripción.">
      {subscriptions.length ? (
        <div className="space-y-3">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-neutral-950">{subscription.planName}</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {formatDate(subscription.startDate)} — {formatDate(subscription.endDate)}
                  </p>
                </div>
                <StatusBadge label={subscription.statusName ?? subscription.statusKind} tone={subscription.isActive ? "success" : statusTone(subscription.statusKind)} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyBillingState text="No hay cambios de suscripción registrados." />
      )}
    </SectionCard>
  );
}

function EmptyBillingState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-500">
      {text}
    </div>
  );
}

function formatLimit(value: number | null): string {
  if (value === null) return "Ilimitado";
  return String(value);
}

function statusTone(status: string): "default" | "success" | "warning" | "danger" | "info" {
  const value = status.toLowerCase();
  if (["active", "paid", "completed", "activo", "pagado"].includes(value)) return "success";
  if (["pending", "past_due", "pendiente"].includes(value)) return "warning";
  if (["failed", "cancelled", "expired", "fallido", "cancelado", "expirado"].includes(value)) return "danger";
  return "default";
}

function fallbackBenefits(plan: string): string[] {
  if (plan === "premium") {
    return [
      "Verificación prioritaria",
      "Analytics avanzado",
      "Mayor capacidad de equipo",
      "Más media y promociones",
      "Soporte prioritario",
    ];
  }

  return [
    "Promociones activas",
    "Analytics por sucursal",
    "Galería ampliada",
    "Equipo con roles básicos",
    "Más capacidad comercial",
  ];
}
