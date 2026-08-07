import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth/session";
import type { AdminCompanyPlanBadgeData } from "./AdminCompanyPlanBadge";
import { SessionRefreshManager } from "@/components/auth/SessionRefreshManager";
import { AdminCompanyMobileHeader } from "./AdminCompanyMobileHeader";
import { AdminCompanySidebar } from "./AdminCompanySidebar";
import { AdminCompanyTopbar } from "./AdminCompanyTopbar";

type AdminCompanyShellProps = {
  children: ReactNode;
  session: SessionUser;
  currentPlan: AdminCompanyPlanBadgeData | null;
};

export default function AdminCompanyShell({
  children,
  session,
  currentPlan,
}: AdminCompanyShellProps) {
  return (
    <div className="admin-company-shell min-h-screen bg-[#f4f7fa] text-slate-950 dark:bg-[#091017] dark:text-slate-100">
      <SessionRefreshManager
        sessionId={session.sessionId}
        expiresAt={session.expiresAt}
      />
      <AdminCompanyMobileHeader currentPlan={currentPlan} />

      <div className="flex min-h-screen w-full">
        <AdminCompanySidebar session={session} currentPlan={currentPlan} />

        <div className="min-w-0 flex-1">
          <AdminCompanyTopbar />

          <main className="min-w-0">
            <div className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 sm:py-6 xl:px-7 xl:py-7">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
