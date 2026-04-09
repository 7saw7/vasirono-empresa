import { SectionCard } from "@/components/ui/SectionCard";
import type { BranchMediaItem } from "@/features/admin-company/branches/types";

export function BranchMediaManager({
  items,
}: {
  items: BranchMediaItem[];
}) {
  return (
    <SectionCard
      title="Media de sucursal"
      description="Imágenes y recursos visuales de esta sede."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.mediaId}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
          >
            <div className="aspect-video bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.typeLabel}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-neutral-900">
                {item.typeLabel}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}