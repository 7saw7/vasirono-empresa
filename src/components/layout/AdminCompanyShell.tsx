import * as React from "react";
import { AdminCompanySidebar } from "./AdminCompanySidebar";

export function AdminCompanyShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        <AdminCompanySidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}