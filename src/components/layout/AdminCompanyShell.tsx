import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth/session";
import { AdminCompanyMobileHeader } from "./AdminCompanyMobileHeader";
import { AdminCompanySidebar } from "./AdminCompanySidebar";

type AdminCompanyShellProps = {
  children: ReactNode;
  session: SessionUser;
};

export default function AdminCompanyShell({
  children,
  session,
}: AdminCompanyShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <AdminCompanyMobileHeader session={session} />

      <div className="mx-auto flex min-h-screen w-full">
        <AdminCompanySidebar session={session} />

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
