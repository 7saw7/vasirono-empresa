import { AdminCompanyShell } from "@/components/layout/AdminCompanyShell";
import { requireAdminCompanyAccess } from "@/lib/auth/guards";

export default async function AdminCompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminCompanyAccess();

  return <AdminCompanyShell>{children}</AdminCompanyShell>;
}