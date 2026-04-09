import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CompanyProfileForm } from "./CompanyProfileForm";
import { CompanyMediaManager } from "./CompanyMediaManager";
import { CompanyContactsForm } from "./CompanyContactsForm";
import { CompanyCategoriesForm } from "./CompanyCategoriesForm";
import type { CompanyProfile } from "@/features/admin-company/company/types";

export function CompanyProfileView({ data }: { data: CompanyProfile }) {
  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title="Perfil del negocio"
        description="Administra la información corporativa que representa a tu empresa."
      />

      <SectionCard
        title={data.name}
        description="Resumen corporativo actual."
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge label={data.verificationStatus} tone="warning" />
          {data.priceLabel ? <StatusBadge label={data.priceLabel} tone="info" /> : null}
        </div>
      </SectionCard>

      <SectionCard
        title="Datos principales"
        description="Edita la información central del negocio."
      >
        <CompanyProfileForm data={data} />
      </SectionCard>

      <CompanyMediaManager items={data.media} />
      <CompanyContactsForm items={data.contacts} />
      <CompanyCategoriesForm items={data.categories} />
    </div>
  );
}