import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";
import type { BranchDetail } from "@/features/admin-company/branches/types";

export function BranchReviewsPreview({
  branch,
}: {
  branch: BranchDetail;
}) {
  return (
    <SectionCard
      title="Reseñas"
      description="Accede a las reseñas relacionadas con esta sucursal desde el módulo central."
    >
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">
          La gestión de reseñas se centraliza en el módulo de reseñas del panel
          empresarial.
        </p>

        <Link
          href={`/resenias?branchId=${branch.branchId}`}
          className="inline-flex text-sm font-medium text-neutral-950 hover:underline"
        >
          Ver reseñas de esta sucursal
        </Link>
      </div>
    </SectionCard>
  );
}