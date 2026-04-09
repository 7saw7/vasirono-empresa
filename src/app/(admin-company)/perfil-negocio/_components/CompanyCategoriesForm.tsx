import { SectionCard } from "@/components/ui/SectionCard";
import type { CompanyCategoryItem } from "@/features/admin-company/company/types";

export function CompanyCategoriesForm({
  items,
}: {
  items: CompanyCategoryItem[];
}) {
  return (
    <SectionCard
      title="Categorías y subcategorías"
      description="Clasificación actual del negocio."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.subcategoryId}
            className="rounded-2xl border border-neutral-200 p-4"
          >
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              {item.categoryName}
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-950">
              {item.subcategoryName}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {item.priceLabel ?? "Sin rango definido"}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}