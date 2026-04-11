import { SectionCard } from "@/components/ui/SectionCard";
import type { CompanyCategoryItem } from "@/features/admin-company/company/types";

export function CompanyCategoriesForm({
  categories,
}: {
  categories: CompanyCategoryItem[];
}) {
  return (
    <SectionCard
      title="Categorías del negocio"
      description="Clasificación actual usada para descubrimiento y ranking."
    >
      {categories.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Este negocio aún no tiene categorías asociadas.
        </p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={`${category.categoryName}-${category.subcategoryId}`}
              className="rounded-2xl border border-neutral-200 p-4"
            >
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                {category.categoryName}
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {category.subcategoryName}
              </p>

              {category.priceLabel ? (
                <p className="mt-2 text-sm text-neutral-500">
                  Rango de precio: {category.priceLabel}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}