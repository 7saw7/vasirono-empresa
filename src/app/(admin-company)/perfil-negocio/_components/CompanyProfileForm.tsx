"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  CompanyProfile,
  UpdateCompanyProfileInput,
} from "@/features/admin-company/company/types";
import { updateCompanyProfile } from "@/features/admin-company/company/service";
import { SectionCard } from "@/components/ui/SectionCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type FormState = Omit<UpdateCompanyProfileInput, "lat" | "lon" | "priceId"> & {
  lat: string;
  lon: string;
  priceId: string;
};

function createFormState(data: CompanyProfile): FormState {
  return {
    name: data.name,
    description: data.description,
    address: data.address,
    phone: data.phone,
    email: data.email,
    website: data.website,
    lat: data.lat === null ? "" : String(data.lat),
    lon: data.lon === null ? "" : String(data.lon),
    priceId: data.priceId === null ? "" : String(data.priceId),
  };
}

export function CompanyProfileForm({ data }: { data: CompanyProfile }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => createFormState(data));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setForm(createFormState(data));
  }, [data]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateCompanyProfile({
        name: form.name,
        description: form.description,
        address: form.address,
        phone: form.phone,
        email: form.email,
        website: form.website,
        lat: form.lat.trim() ? Number(form.lat) : null,
        lon: form.lon.trim() ? Number(form.lon) : null,
        priceId: form.priceId ? Number(form.priceId) : null,
      });

      setForm(createFormState(updated));
      setSuccess("Perfil actualizado correctamente.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el perfil del negocio."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="Perfil principal"
      description="Información pública base, ubicación y rango general del negocio."
    >
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <Input
          label="Nombre del negocio"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          minLength={2}
          maxLength={160}
          required
        />

        <Input
          label="Correo"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          maxLength={160}
        />

        <Input
          label="Teléfono"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          maxLength={40}
        />

        <Input
          label="Sitio web"
          type="url"
          value={form.website}
          onChange={(e) => updateField("website", e.target.value)}
          placeholder="https://..."
          maxLength={220}
        />

        <div className="md:col-span-2">
          <Input
            label="Dirección"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            maxLength={220}
          />
        </div>

        <Input
          label="Latitud"
          type="number"
          step="any"
          min={-90}
          max={90}
          value={form.lat}
          onChange={(e) => updateField("lat", e.target.value)}
          placeholder="-12.0464"
          hint="Opcional. Se usa para mapas y proximidad."
        />

        <Input
          label="Longitud"
          type="number"
          step="any"
          min={-180}
          max={180}
          value={form.lon}
          onChange={(e) => updateField("lon", e.target.value)}
          placeholder="-77.0428"
          hint="Opcional. Se usa para mapas y proximidad."
        />

        <div className="md:col-span-2">
          <Select
            label="Rango general de precio"
            value={form.priceId}
            onChange={(e) => updateField("priceId", e.target.value)}
          >
            <option value="">Sin rango general</option>
            {data.taxonomy.priceRanges.map((range) => (
              <option key={range.priceId} value={range.priceId}>
                {range.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={5}
            maxLength={1500}
          />
          <p className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">
            {form.description.length}/1500
          </p>
        </div>

        <div className="md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Estado de verificación actual:{" "}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {data.verificationStatus}
              </span>
            </p>

            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : success ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {success}
              </p>
            ) : null}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
