import Image from "next/image";
import { SectionCard } from "@/components/ui/SectionCard";
import type { BranchMediaItem } from "@/features/admin-company/branches/types";

export function BranchMediaManager({ media }: { media: BranchMediaItem[] }) {
  return (
    <SectionCard
      title="Media de la sucursal"
      description="Galería visual actualmente asociada a esta sede."
    >
      {media.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Esta sucursal aún no tiene recursos multimedia cargados.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => (
            <div
              key={item.mediaId}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
            >
              <div className="relative aspect-[4/3] bg-neutral-100">
                <Image
                  src={item.url}
                  alt={item.typeLabel}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-4">
                <p className="text-sm font-medium text-neutral-900">
                  {item.typeLabel}
                </p>
                <p className="mt-1 truncate text-xs text-neutral-500">
                  {item.url}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}