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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Este negocio aún no tiene categorías asociadas.
        </p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={`${category.categoryName}-${category.subcategoryId}`}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {category.categoryName}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-100">
                {category.subcategoryName}
              </p>

              {category.priceLabel ? (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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