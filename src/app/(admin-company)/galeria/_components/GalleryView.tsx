"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ImageIcon, UploadCloud, Trash2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";
import type { GalleryMediaItem, GalleryOverview, MediaOwnerType } from "@/features/admin-company/media/types";

type Props = { overview: GalleryOverview };

type UploadState = {
  ownerType: MediaOwnerType;
  ownerId: string;
  mediaTypeId: string;
  altText: string;
  isCover: boolean;
  file: File | null;
};

export function GalleryView({ overview }: Props) {
  const [media, setMedia] = useState<GalleryMediaItem[]>([...overview.companyMedia, ...overview.branchMedia]);
  const [form, setForm] = useState<UploadState>({
    ownerType: "company",
    ownerId: "company",
    mediaTypeId: String(overview.mediaTypes[0]?.id ?? ""),
    altText: "",
    isCover: false,
    file: null,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const companyMedia = useMemo(() => media.filter((item) => item.ownerType === "company"), [media]);
  const branchMedia = useMemo(() => media.filter((item) => item.ownerType === "branch"), [media]);
  const used = media.length;
  const available = overview.planLimit === null ? "Ilimitado" : `${used}/${overview.planLimit}`;

  async function refresh() {
    const response = await fetch("/api/admin-company/media", { cache: "no-store" });
    const payload = await response.json();
    const data: GalleryOverview = payload?.data ?? payload;
    setMedia([...(data.companyMedia ?? []), ...(data.branchMedia ?? [])]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.file) {
      setError("Selecciona una imagen antes de subir.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    const body = new FormData();
    body.set("file", form.file);
    body.set("ownerType", form.ownerType);
    body.set("ownerId", form.ownerType === "company" ? "0" : form.ownerId);
    body.set("mediaTypeId", form.mediaTypeId);
    body.set("altText", form.altText);
    body.set("isCover", String(form.isCover));

    const response = await fetch("/api/admin-company/media", { method: "POST", body });
    const payload = await response.json().catch(() => null);
    setLoading(false);
    if (!response.ok) {
      setError(payload?.error?.message ?? "No se pudo subir la imagen.");
      return;
    }
    setMessage("Imagen subida correctamente.");
    setForm((current) => ({ ...current, file: null, altText: "", isCover: false }));
    await refresh();
  }

  async function updateMedia(item: GalleryMediaItem, patch: { altText?: string | null; isActive?: boolean }) {
    const response = await fetch(`/api/admin-company/media/${item.ownerType}/${item.ownerId}/${item.mediaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? "No se pudo actualizar la imagen.");
      return;
    }
    setMessage("Media actualizada.");
    await refresh();
  }

  async function deleteMedia(item: GalleryMediaItem) {
    if (!confirm("¿Eliminar esta imagen de la galería?")) return;
    const response = await fetch(`/api/admin-company/media/${item.ownerType}/${item.ownerId}/${item.mediaId}`, { method: "DELETE" });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? "No se pudo eliminar la imagen.");
      return;
    }
    setMessage("Imagen eliminada.");
    await refresh();
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-neutral-950 p-6 text-white shadow-sm dark:shadow-none">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">Galería</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Media completa del negocio</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Administra logo, portada y fotos de las sucursales desde media-service, respetando el límite del plan activo.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Uso del plan" value={available} helper="Imágenes cargadas" />
        <StatCard label="Negocio" value={String(companyMedia.length)} helper="Logo, portada o galería" />
        <StatCard label="Sucursales" value={String(branchMedia.length)} helper="Fotos por sede" />
        <StatCard label="Tipos" value={String(overview.mediaTypes.length)} helper="Catálogo media_types" />
      </div>

      {message ? <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</div> : null}
      {error ? <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard title="Subir recurso" description="Usa imágenes reales del negocio. Logo y portada pueden ser únicos según media_types.">
          <form className="space-y-4" onSubmit={submit}>
            <Select label="Destino" value={form.ownerType} onChange={(event) => setForm({ ...form, ownerType: event.target.value as MediaOwnerType })}>
              <option value="company">Perfil del negocio</option>
              <option value="branch">Sucursal específica</option>
            </Select>
            {form.ownerType === "branch" ? (
              <Select label="Sucursal" value={form.ownerId} onChange={(event) => setForm({ ...form, ownerId: event.target.value })} required>
                <option value="">Selecciona sucursal</option>
                {overview.branches.map((branch) => <option key={branch.branchId} value={branch.branchId}>{branch.name}</option>)}
              </Select>
            ) : null}
            <Select label="Tipo de media" value={form.mediaTypeId} onChange={(event) => setForm({ ...form, mediaTypeId: event.target.value })} required>
              <option value="">Selecciona tipo</option>
              {overview.mediaTypes.map((type) => <option key={type.id} value={type.id}>{type.name}{type.isUnique ? " · único" : ""}</option>)}
            </Select>
            <Input label="Texto alternativo" value={form.altText} onChange={(event) => setForm({ ...form, altText: event.target.value })} placeholder="Logo principal, fachada, salón principal..." />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-slate-50 dark:bg-slate-900/50 px-4 py-6 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800/70">
              <UploadCloud className="h-5 w-5" /> {form.file ? form.file.name : "Seleccionar imagen"}
              <input type="file" accept="image/*" className="hidden" onChange={(event) => setForm({ ...form, file: event.target.files?.[0] ?? null })} />
            </label>
            <label className="flex items-center gap-2 rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4 text-sm text-slate-700 dark:text-slate-300">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-sky-500 dark:border-slate-600 dark:bg-slate-900" checked={form.isCover} onChange={(event) => setForm({ ...form, isCover: event.target.checked })} /> Marcar como portada/cobertura
            </label>
            <Button type="submit" disabled={loading || (overview.planLimit !== null && used >= overview.planLimit)}>
              <ImageIcon className="mr-2 h-4 w-4" /> Subir a galería
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Recursos cargados" description="Puedes ocultar, editar descripción o eliminar cada recurso.">
          <div className="mb-4 flex justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={refresh}><RefreshCcw className="mr-2 h-4 w-4" />Actualizar</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {media.length ? media.map((item) => (
              <article key={`${item.ownerType}-${item.mediaId}`} className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#101821] shadow-sm dark:shadow-none">
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800/70">
                  {item.url ? <img src={item.url} alt={item.altText ?? ""} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={item.ownerType === "company" ? "Negocio" : item.ownerLabel} tone={item.ownerType === "company" ? "info" : "default"} />
                    {item.isCover ? <StatusBadge label="Portada" tone="success" /> : null}
                    {!item.isActive ? <StatusBadge label="Oculta" tone="warning" /> : null}
                  </div>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.mediaTypeName ?? "media"} · {item.mimeType ?? "archivo"}</p>
                  <Input label="Texto alternativo" defaultValue={item.altText ?? ""} onBlur={(event) => updateMedia(item, { altText: event.target.value })} />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => updateMedia(item, { isActive: !item.isActive })}>{item.isActive ? "Ocultar" : "Mostrar"}</Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => deleteMedia(item)}><Trash2 className="mr-1 h-4 w-4" />Eliminar</Button>
                  </div>
                </div>
              </article>
            )) : (
              <div className="col-span-full rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-8 text-center text-sm text-slate-500 dark:text-slate-400">Aún no hay imágenes cargadas.</div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
