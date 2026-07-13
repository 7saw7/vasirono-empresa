"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { updateCompanyTaxonomy } from "@/features/admin-company/company/service";
import type { CompanyTaxonomy } from "@/features/admin-company/company/types";

export function CompanyCategoriesForm({ taxonomy }: { taxonomy: CompanyTaxonomy }) {
  const router = useRouter();
  const [businessTypeIds, setBusinessTypeIds] = useState<number[]>(
    taxonomy.selectedBusinessTypeIds
  );
  const [subcategoryPrices, setSubcategoryPrices] = useState<Record<number, string>>(
    Object.fromEntries(
      taxonomy.selectedSubcategories.map((item) => [
        item.subcategoryId,
        item.priceId === null ? "" : String(item.priceId),
      ])
    )
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subcategoriesByCategory = useMemo(() => {
    return taxonomy.categories.map((category) => ({
      ...category,
      subcategories: taxonomy.subcategories.filter(
        (item) => item.categoryId === category.categoryId
      ),
    }));
  }, [taxonomy.categories, taxonomy.subcategories]);

  function toggleBusinessType(typeId: number) {
    setBusinessTypeIds((current) =>
      current.includes(typeId)
        ? current.filter((id) => id !== typeId)
        : [...current, typeId]
    );
  }

  function toggleSubcategory(subcategoryId: number) {
    setSubcategoryPrices((current) => {
      const next = { ...current };
      if (Object.prototype.hasOwnProperty.call(next, subcategoryId)) {
        delete next[subcategoryId];
      } else {
        next[subcategoryId] = "";
      }
      return next;
    });
  }

  async function save() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const updated = await updateCompanyTaxonomy({
        businessTypeIds,
        subcategories: Object.entries(subcategoryPrices).map(
          ([subcategoryId, priceId]) => ({
            subcategoryId: Number(subcategoryId),
            priceId: priceId ? Number(priceId) : null,
          })
        ),
      });

      setBusinessTypeIds(updated.selectedBusinessTypeIds);
      setSubcategoryPrices(
        Object.fromEntries(
          updated.selectedSubcategories.map((item) => [
            item.subcategoryId,
            item.priceId === null ? "" : String(item.priceId),
          ])
        )
      );
      setMessage("Clasificación actualizada correctamente.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la clasificación."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="Clasificación del negocio"
      description="Tipos de negocio, categorías y rangos usados para descubrimiento y ranking."
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
            Tipos de negocio
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {taxonomy.businessTypes.map((type) => (
              <label
                key={type.typeId}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 accent-sky-500"
                  checked={businessTypeIds.includes(type.typeId)}
                  onChange={() => toggleBusinessType(type.typeId)}
                />
                {type.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
            Categorías y subcategorías
          </h3>
          <div className="mt-3 max-h-[34rem] space-y-4 overflow-y-auto pr-1">
            {subcategoriesByCategory.map((category) => (
              <div
                key={category.categoryId}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {category.name}
                </p>
                <div className="mt-3 space-y-3">
                  {category.subcategories.map((subcategory) => {
                    const selected = Object.prototype.hasOwnProperty.call(
                      subcategoryPrices,
                      subcategory.subcategoryId
                    );

                    return (
                      <div
                        key={subcategory.subcategoryId}
                        className="grid gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50 sm:grid-cols-[1fr_13rem] sm:items-center"
                      >
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 accent-sky-500"
                            checked={selected}
                            onChange={() => toggleSubcategory(subcategory.subcategoryId)}
                          />
                          {subcategory.name}
                        </label>

                        {selected ? (
                          <Select
                            aria-label={`Rango de precio para ${subcategory.name}`}
                            value={subcategoryPrices[subcategory.subcategoryId] ?? ""}
                            onChange={(event) =>
                              setSubcategoryPrices((current) => ({
                                ...current,
                                [subcategory.subcategoryId]: event.target.value,
                              }))
                            }
                          >
                            <option value="">Sin rango específico</option>
                            {taxonomy.priceRanges.map((range) => (
                              <option key={range.priceId} value={range.priceId}>
                                {range.label}
                              </option>
                            ))}
                          </Select>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : message ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {message}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="button" onClick={save} disabled={loading}>
            {loading ? "Guardando..." : "Guardar clasificación"}
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
