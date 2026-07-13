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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Esta sucursal aún no tiene recursos multimedia cargados.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => (
            <div
              key={item.mediaId}
              className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#101821]"
            >
              <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800/70">
                <Image
                  src={item.url}
                  alt={item.typeLabel}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-4">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {item.typeLabel}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
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