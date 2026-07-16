import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getCurrentPlanQuery } from "@/lib/db/queries/admin-company/billing";
import { logger } from "@/lib/observability/logger";
import AdminCompanyShell from "@/components/layout/AdminCompanyShell";
import type { AdminCompanyPlanBadgeData } from "@/components/layout/AdminCompanyPlanBadge";

export const dynamic = "force-dynamic";

export default async function AdminCompanyLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();

  if (!session.companyId) {
    redirect("/login");
  }

  let currentPlan: AdminCompanyPlanBadgeData | null = null;

  try {
    const billingPlan = await getCurrentPlanQuery(session.companyId);
    currentPlan = {
      plan: billingPlan.plan,
      planName: billingPlan.planName,
      isActive: billingPlan.isActive,
      statusLabel: billingPlan.statusLabel,
    };
  } catch (error) {
    logger.warn("admin_company_plan_badge_unavailable", {
      companyId: session.companyId,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message }
          : { value: error },
    });
  }

  return (
    <AdminCompanyShell session={session} currentPlan={currentPlan}>
      {children}
    </AdminCompanyShell>
  );
}
