import type { CompanyProfile } from "@/features/admin-company/company/types";
import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import { CompanyProfileForm } from "./CompanyProfileForm";
import { CompanyContactsForm } from "./CompanyContactsForm";
import { CompanyCategoriesForm } from "./CompanyCategoriesForm";
import { CompanyMediaManager } from "./CompanyMediaManager";

export function CompanyProfileView({ data }: { data: CompanyProfile }) {
  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title={data.name}
        description="Gestiona la información pública principal de tu negocio dentro de Vasirono."
      />

      <CompanyProfileForm data={data} />

      <div className="grid gap-6 xl:grid-cols-2">
        <CompanyContactsForm contacts={data.contacts} />
        <CompanyCategoriesForm categories={data.categories} />
      </div>

      <CompanyMediaManager media={data.media} />
    </div>
  );
}