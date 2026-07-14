"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  ImageIcon,
  RefreshCcw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";
import type {
  GalleryMediaItem,
  GalleryOverview,
  MediaOwnerType,
} from "@/features/admin-company/media/types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_MEDIA_TYPES = new Set(["logo", "cover", "gallery", "menu"]);

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
  const [data, setData] = useState(overview);
  const [form, setForm] = useState<UploadState>({
    ownerType: "company",
    ownerId: "",
    mediaTypeId: String(
      overview.mediaTypes.find((type) => IMAGE_MEDIA_TYPES.has(type.name.toLowerCase()))?.id ?? "",
    ),
    altText: "",
    isCover: false,
    file: null,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionKey, setActionKey] = useState<string | null>(null);

  const media = useMemo(
    () => [...data.companyMedia, ...data.branchMedia],
    [data.companyMedia, data.branchMedia],
  );
  const companyMedia = data.companyMedia;
  const branchMedia = data.branchMedia;
  const used = media.length;
  const limitReached = data.planLimit !== null && used >= data.planLimit;
  const available = data.planLimit === null ? `${used} · sin límite` : `${used}/${data.planLimit}`;
  const imageMediaTypes = useMemo(
    () => data.mediaTypes.filter((type) => IMAGE_MEDIA_TYPES.has(type.name.toLowerCase())),
    [data.mediaTypes],
  );
  const selectedType = imageMediaTypes.find((type) => String(type.id) === form.mediaTypeId);

  async function refresh(showMessage = false) {
    setError(null);
    const response = await fetch("/api/admin-company/media", { cache: "no-store" });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error?.message ?? "No se pudo actualizar la galería.");
    }

    const refreshed: GalleryOverview = payload?.data ?? payload;
    setData(refreshed);
    if (showMessage) setMessage("Galería actualizada.");
  }

  function selectFile(file: File | null) {
    setError(null);
    if (!file) {
      setForm((current) => ({ ...current, file: null }));
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Solo se admiten imágenes JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("La imagen supera el límite de 8 MB.");
      return;
    }
    setForm((current) => ({ ...current, file }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (limitReached) {
      setError("Alcanzaste el límite de archivos del plan. Elimina un recurso o actualiza tu plan.");
      return;
    }
    if (!form.file) {
      setError("Selecciona una imagen JPG, PNG o WEBP antes de subir.");
      return;
    }
    if (!form.mediaTypeId) {
      setError("Selecciona el tipo de imagen.");
      return;
    }
    if (form.ownerType === "branch" && !form.ownerId) {
      setError("Selecciona la sucursal de destino.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const body = new FormData();
      body.set("file", form.file);
      body.set("ownerType", form.ownerType);
      body.set("ownerId", form.ownerType === "company" ? "0" : form.ownerId);
      body.set("mediaTypeId", form.mediaTypeId);
      body.set("altText", form.altText);
      body.set("isCover", String(selectedType?.isUnique ? true : form.isCover));

      const response = await fetch("/api/admin-company/media", { method: "POST", body });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "No se pudo subir la imagen.");
      }

      setMessage(
        selectedType?.isUnique
          ? `${selectedType.name} reemplazado correctamente.`
          : "Imagen subida correctamente.",
      );
      setForm((current) => ({ ...current, file: null, altText: "", isCover: false }));
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo subir la imagen.");
    } finally {
      setLoading(false);
    }
  }

  async function updateMedia(
    item: GalleryMediaItem,
    patch: { altText?: string | null; isActive?: boolean },
  ) {
    const key = `update-${item.ownerType}-${item.mediaId}`;
    setActionKey(key);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin-company/media/${item.ownerType}/${item.ownerId}/${item.mediaId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo actualizar el recurso.");
      setMessage("Recurso actualizado.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo actualizar el recurso.");
    } finally {
      setActionKey(null);
    }
  }

  async function deleteMedia(item: GalleryMediaItem) {
    if (!confirm("¿Eliminar este recurso? El archivo también se eliminará del almacenamiento.")) return;
    const key = `delete-${item.ownerType}-${item.mediaId}`;
    setActionKey(key);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin-company/media/${item.ownerType}/${item.ownerId}/${item.mediaId}`,
        { method: "DELETE" },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo eliminar el recurso.");
      setMessage("Recurso eliminado. La limpieza física quedó programada.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo eliminar el recurso.");
    } finally {
      setActionKey(null);
    }
  }

  async function moveMedia(item: GalleryMediaItem, direction: -1 | 1) {
    const group = media
      .filter((candidate) => candidate.ownerType === item.ownerType && candidate.ownerId === item.ownerId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.mediaId - b.mediaId);
    const index = group.findIndex((candidate) => candidate.mediaId === item.mediaId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= group.length) return;

    const reordered = [...group];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const key = `reorder-${item.ownerType}-${item.ownerId}`;
    setActionKey(key);
    setError(null);
    try {
      const response = await fetch("/api/admin-company/media/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerType: item.ownerType,
          ownerId: item.ownerId,
          items: reordered.map((candidate, sortIndex) => ({
            mediaId: candidate.mediaId,
            sortOrder: sortIndex + 1,
          })),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo cambiar el orden.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cambiar el orden.");
    } finally {
      setActionKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-neutral-950 p-6 text-white shadow-sm dark:shadow-none">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">Galería</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Identidad visual y fotos del negocio</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Administra imágenes del perfil y de las sucursales. Los logos y portadas se reemplazan de forma segura, sin consumir un cupo adicional.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Uso del plan" value={available} helper="Archivos almacenados" />
        <StatCard label="Negocio" value={String(companyMedia.length)} helper="Logo, portada y galería" />
        <StatCard label="Sucursales" value={String(branchMedia.length)} helper="Fotos de sedes activas" />
        <StatCard label="Tipos de imagen" value={String(imageMediaTypes.length)} helper="JPG, PNG y WEBP" />
      </div>

      {limitReached ? (
        <div className="rounded-2xl border border-amber-400/50 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
          Alcanzaste el límite de {data.planLimit} archivos del plan. Ocultar una imagen no libera espacio; debes eliminarla o actualizar el plan.
        </div>
      ) : null}
      {message ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</div> : null}
      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <SectionCard title="Subir imagen" description="Formatos admitidos: JPG, PNG y WEBP. Tamaño máximo: 8 MB.">
          <form className="space-y-4" onSubmit={submit}>
            <Select
              label="Destino"
              value={form.ownerType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  ownerType: event.target.value as MediaOwnerType,
                  ownerId: "",
                }))
              }
            >
              <option value="company">Perfil del negocio</option>
              <option value="branch">Sucursal específica</option>
            </Select>

            {form.ownerType === "branch" ? (
              <Select label="Sucursal activa" value={form.ownerId} onChange={(event) => setForm({ ...form, ownerId: event.target.value })} required>
                <option value="">Selecciona sucursal</option>
                {data.branches.map((branch) => <option key={branch.branchId} value={branch.branchId}>{branch.name}</option>)}
              </Select>
            ) : null}

            <Select
              label="Tipo de imagen"
              value={form.mediaTypeId}
              onChange={(event) => setForm({ ...form, mediaTypeId: event.target.value, isCover: false })}
              required
            >
              <option value="">Selecciona tipo</option>
              {imageMediaTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}{type.isUnique ? " · reemplaza el actual" : ""}
                </option>
              ))}
            </Select>

            <Input label="Texto alternativo" value={form.altText} onChange={(event) => setForm({ ...form, altText: event.target.value })} placeholder="Ej.: Fachada principal de Miraflores" />

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800/70">
              <UploadCloud className="h-5 w-5" /> {form.file ? `${form.file.name} · ${(form.file.size / 1024 / 1024).toFixed(2)} MB` : "Seleccionar imagen"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => selectFile(event.target.files?.[0] ?? null)} />
            </label>

            {!selectedType?.isUnique ? (
              <label className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-sky-500 dark:border-slate-600 dark:bg-slate-900" checked={form.isCover} onChange={(event) => setForm({ ...form, isCover: event.target.checked })} /> Usar como imagen principal de este tipo
              </label>
            ) : (
              <p className="rounded-2xl bg-sky-950/20 p-3 text-xs text-sky-200">
                Este tipo es único. Al subirlo, el archivo anterior se sustituirá y se programará su eliminación física.
              </p>
            )}

            <Button type="submit" disabled={loading || limitReached || imageMediaTypes.length === 0}>
              <ImageIcon className="mr-2 h-4 w-4" /> {loading ? "Subiendo…" : "Subir imagen"}
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Recursos cargados" description="Oculta, ordena, describe o elimina cada recurso.">
          <div className="mb-4 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void refresh(true).catch((caught) => setError(caught instanceof Error ? caught.message : "No se pudo actualizar."))}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />Actualizar
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {media.length ? media.map((item) => {
              const group = media
                .filter((candidate) => candidate.ownerType === item.ownerType && candidate.ownerId === item.ownerId)
                .sort((a, b) => a.sortOrder - b.sortOrder || a.mediaId - b.mediaId);
              const position = group.findIndex((candidate) => candidate.mediaId === item.mediaId);
              const busy = actionKey?.includes(`${item.ownerType}-${item.mediaId}`) || actionKey === `reorder-${item.ownerType}-${item.ownerId}`;

              return (
                <article key={`${item.ownerType}-${item.mediaId}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#101821] dark:shadow-none">
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800/70">
                    {item.mimeType?.startsWith("image/") && item.url ? (
                      <img src={item.url} alt={item.altText ?? ""} className="h-full w-full object-cover" />
                    ) : item.mimeType?.startsWith("video/") && item.url ? (
                      <video src={item.url} controls className="h-full w-full object-cover" />
                    ) : (
                      <a href={item.url} target="_blank" rel="noreferrer" className="flex h-full flex-col items-center justify-center gap-2 text-sm text-slate-500">
                        <FileText className="h-10 w-10" /> Abrir archivo <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge label={item.ownerType === "company" ? "Negocio" : item.ownerLabel} tone={item.ownerType === "company" ? "info" : "default"} />
                      {item.isCover ? <StatusBadge label="Principal" tone="success" /> : null}
                      {!item.isActive ? <StatusBadge label="Oculta" tone="warning" /> : null}
                    </div>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {item.mediaTypeName ?? "media"} · {item.mimeType ?? "archivo"} · posición {position + 1}
                    </p>
                    <Input
                      label="Texto alternativo"
                      defaultValue={item.altText ?? ""}
                      onBlur={(event) => {
                        const value = event.target.value.trim();
                        if (value !== (item.altText ?? "")) void updateMedia(item, { altText: value || null });
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="secondary" disabled={busy || position <= 0} onClick={() => void moveMedia(item, -1)} aria-label="Mover a la izquierda">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="sm" variant="secondary" disabled={busy || position >= group.length - 1} onClick={() => void moveMedia(item, 1)} aria-label="Mover a la derecha">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => void updateMedia(item, { isActive: !item.isActive })}>
                        {item.isActive ? "Ocultar" : "Mostrar"}
                      </Button>
                      <Button type="button" size="sm" variant="danger" disabled={busy} onClick={() => void deleteMedia(item)}>
                        <Trash2 className="mr-1 h-4 w-4" />Eliminar
                      </Button>
                    </div>
                  </div>
                </article>
              );
            }) : (
              <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                Aún no hay recursos cargados.
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
