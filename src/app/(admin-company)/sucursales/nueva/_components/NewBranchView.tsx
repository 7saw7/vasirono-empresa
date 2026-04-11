import Link from "next/link";
import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { BranchForm } from "../../_components/BranchForm";

export function NewBranchView() {
  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title="Nueva sucursal"
        description="Registra una nueva sede de tu negocio con información válida y lista para publicación."
        actions={
          <Button asChild variant="secondary">
            <Link href="/sucursales">Volver a sucursales</Link>
          </Button>
        }
      />

      <SectionCard
        title="Datos de la sucursal"
        description="Completa la información principal. Luego podrás ampliar horarios, contactos, servicios y media desde el detalle."
      >
        <BranchForm />
      </SectionCard>
    </div>
  );
}