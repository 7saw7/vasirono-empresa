import type { ReactNode } from "react";
import { AdminCompanySidebar } from "./AdminCompanySidebar";

type AdminCompanyShellProps = {
  children: ReactNode;
};

export default function AdminCompanyShell({
  children,
}: AdminCompanyShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <div className="mx-auto flex min-h-screen w-full">
        <AdminCompanySidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 xl:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}