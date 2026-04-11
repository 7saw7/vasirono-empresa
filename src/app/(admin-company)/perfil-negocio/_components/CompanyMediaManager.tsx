import Image from "next/image";
import { SectionCard } from "@/components/ui/SectionCard";
import type { CompanyMediaItem } from "@/features/admin-company/company/types";

export function CompanyMediaManager({ media }: { media: CompanyMediaItem[] }) {
  return (
    <SectionCard
      title="Media del negocio"
      description="Galería actual asociada al perfil del negocio."
    >
      {media.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Este negocio aún no tiene recursos multimedia cargados.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => (
            <div
              key={item.id}
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