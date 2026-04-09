import { SectionCard } from "@/components/ui/SectionCard";

export function BranchReviewsPreview() {
  return (
    <SectionCard
      title="Vista previa de reseñas"
      description="Esta sección se conectará con el dominio de reseñas en la siguiente fase."
    >
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6">
        <p className="text-sm text-neutral-500">
          Aquí mostraremos las reseñas recientes de la sucursal, su estado de
          respuesta y accesos rápidos al módulo de reputación.
        </p>
      </div>
    </SectionCard>
  );
}