import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth/session";
import { AdminCompanyMobileHeader } from "./AdminCompanyMobileHeader";
import { AdminCompanySidebar } from "./AdminCompanySidebar";
import { AdminCompanyTopbar } from "./AdminCompanyTopbar";

type AdminCompanyShellProps = {
  children: ReactNode;
  session: SessionUser;
};

export default function AdminCompanyShell({
  children,
  session,
}: AdminCompanyShellProps) {
  return (
    <div className="min-h-screen bg-[#f4f7fa] text-slate-950 dark:bg-[#091017] dark:text-slate-100">
      <AdminCompanyMobileHeader session={session} />

      <div className="flex min-h-screen w-full">
        <AdminCompanySidebar session={session} />

        <div className="min-w-0 flex-1">
          <AdminCompanyTopbar session={session} />

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
