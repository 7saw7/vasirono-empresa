"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, ImageIcon, RefreshCcw, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { GalleryMediaItem, MediaTypeOption } from "@/features/admin-company/media/types";

export function BranchMediaManager({ branchId, branchName }: { branchId: number; branchName: string }) {
  const [mediaTypes, setMediaTypes] = useState<MediaTypeOption[]>([]);
  const [media, setMedia] = useState<GalleryMediaItem[]>([]);
  const [mediaTypeId, setMediaTypeId] = useState("");
  const [altText, setAltText] = useState("");
  const [isCover, setIsCover] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, [branchId]);

  async function readPayload(response: Response) {
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error?.message ?? "No se pudo completar la operación de media.");
    }
    return payload?.data ?? payload;
  }

  async function refresh() {
    setError(null);
    try {
      const response = await fetch(`/api/admin-company/branches/${branchId}/media`, { cache: "no-store" });
      const data = (await readPayload(response)) as { mediaTypes: MediaTypeOption[]; media: GalleryMediaItem[] };
      setMediaTypes(data.mediaTypes ?? []);
      setMedia(data.media ?? []);
      setMediaTypeId((current) => current || String(data.mediaTypes?.[0]?.id ?? ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la galería de la sucursal.");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Selecciona una imagen antes de subir.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("ownerType", "branch");
      body.set("ownerId", String(branchId));
      body.set("mediaTypeId", mediaTypeId);
      body.set("altText", altText);
      body.set("isCover", String(isCover));
      const response = await fetch("/api/admin-company/media", { method: "POST", body });
      await readPayload(response);
      setFile(null);
      setAltText("");
      setIsCover(false);
      setMessage("Imagen subida correctamente mediante Media Service.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setBusy(false);
    }
  }

  async function updateMedia(item: GalleryMediaItem, patch: { altText?: string | null; isActive?: boolean }) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin-company/media/branch/${branchId}/${item.mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      await readPayload(response);
      setMessage("Imagen actualizada.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la imagen.");
    } finally {
      setBusy(false);
    }
  }

  async function moveMedia(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= media.length) return;

    const reordered = [...media];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin-company/branches/${branchId}/media/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map((item, sortIndex) => ({ mediaId: item.mediaId, sortOrder: sortIndex + 1 })),
        }),
      });
      await readPayload(response);
      setMedia(reordered.map((item, sortIndex) => ({ ...item, sortOrder: sortIndex + 1 })));
      setMessage("Orden de imágenes actualizado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo ordenar las imágenes.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteMedia(item: GalleryMediaItem) {
    if (!confirm("¿Eliminar esta imagen de la sucursal?")) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin-company/media/branch/${branchId}/${item.mediaId}`, { method: "DELETE" });
      await readPayload(response);
      setMessage("Imagen eliminada.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la imagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SectionCard
      title="Media de la sucursal"
      description={`Gestiona las imágenes de ${branchName} desde Media Service, propietario único de branch_media.`}
    >
      {message ? <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</div> : null}
      {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <form className="space-y-4" onSubmit={submit}>
          <Select label="Tipo de media" value={mediaTypeId} onChange={(event) => setMediaTypeId(event.target.value)} required>
            <option value="">Selecciona tipo</option>
            {mediaTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}{type.isUnique ? " · único" : ""}</option>
            ))}
          </Select>
          <Input label="Texto alternativo" value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Fachada, salón principal..." />
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800/70">
            <UploadCloud className="h-5 w-5" /> {file ? file.name : "Seleccionar imagen"}
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </label>
          <label className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
            <input type="checkbox" checked={isCover} onChange={(event) => setIsCover(event.target.checked)} /> Marcar como portada
          </label>
          <Button type="submit" disabled={busy || !mediaTypeId}>
            <ImageIcon className="mr-2 h-4 w-4" />Subir imagen
          </Button>
        </form>

        <div>
          <div className="mb-4 flex justify-end">
            <Button type="button" size="sm" variant="secondary" onClick={() => void refresh()} disabled={busy}>
              <RefreshCcw className="mr-2 h-4 w-4" />Actualizar
            </Button>
          </div>
          {media.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Esta sucursal aún no tiene imágenes.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {media.map((item) => (
                <article key={item.mediaId} className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#101821]">
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800/70">
                    {item.url ? <img src={item.url} alt={item.altText ?? branchName} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge label={item.mediaTypeName ?? "Imagen"} tone="default" />
                      {item.isCover ? <StatusBadge label="Portada" tone="success" /> : null}
                      {!item.isActive ? <StatusBadge label="Oculta" tone="warning" /> : null}
                    </div>
                    <Input label="Texto alternativo" defaultValue={item.altText ?? ""} onBlur={(event) => {
                      if (event.target.value !== (item.altText ?? "")) void updateMedia(item, { altText: event.target.value });
                    }} />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="ghost" onClick={() => void moveMedia(media.indexOf(item), -1)} disabled={busy || media.indexOf(item) === 0} aria-label="Mover arriba"><ArrowUp className="h-4 w-4" /></Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => void moveMedia(media.indexOf(item), 1)} disabled={busy || media.indexOf(item) === media.length - 1} aria-label="Mover abajo"><ArrowDown className="h-4 w-4" /></Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => void updateMedia(item, { isActive: !item.isActive })} disabled={busy}>{item.isActive ? "Ocultar" : "Mostrar"}</Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => void deleteMedia(item)} disabled={busy}><Trash2 className="mr-1 h-4 w-4" />Eliminar</Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
