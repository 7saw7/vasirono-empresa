import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import AdminCompanyShell from "@/components/layout/AdminCompanyShell";

export default async function AdminCompanyLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();

  if (!session.companyId) {
    redirect("/login");
  }

  return <AdminCompanyShell>{children}</AdminCompanyShell>;
}