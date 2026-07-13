import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { CompanyMediaItem } from "@/features/admin-company/company/types";

export function CompanyMediaManager({ media }: { media: CompanyMediaItem[] }) {
  return (
    <SectionCard
      title="Media del negocio"
      description="Recursos reales leídos desde Media Service. La administración completa se realiza en Galería."
    >
      <div className="mb-4 flex justify-end">
        <Button asChild variant="secondary" size="sm">
          <Link href="/galeria">Administrar en Galería</Link>
        </Button>
      </div>

      {media.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Este negocio aún no tiene recursos multimedia cargados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => (
            <div
              key={`company-media-${item.id}-${item.url}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#101821]"
            >
              <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800/70">
                <Image
                  src={item.url}
                  alt={item.altText || item.typeLabel}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {item.typeLabel}
                  </p>
                  {item.isCover ? <StatusBadge label="Portada" tone="success" /> : null}
                  {!item.isActive ? <StatusBadge label="Oculta" tone="warning" /> : null}
                </div>
                {item.altText ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.altText}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
