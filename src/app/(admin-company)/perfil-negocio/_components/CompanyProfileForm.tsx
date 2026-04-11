"use client";

import { useState } from "react";
import type {
  CompanyProfile,
  UpdateCompanyProfileInput,
} from "@/features/admin-company/company/types";
import { updateCompanyProfile } from "@/features/admin-company/company/service";
import { SectionCard } from "@/components/ui/SectionCard";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function CompanyProfileForm({ data }: { data: CompanyProfile }) {
  const [form, setForm] = useState<UpdateCompanyProfileInput>({
    name: data.name,
    description: data.description,
    address: data.address,
    phone: data.phone,
    email: data.email,
    website: data.website,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateField<K extends keyof UpdateCompanyProfileInput>(
    key: K,
    value: UpdateCompanyProfileInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateCompanyProfile(form);
      setSuccess("Perfil actualizado correctamente.");
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
      description="Esta información representa la identidad base de tu negocio."
    >
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <Input
          label="Nombre del negocio"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
        />

        <Input
          label="Correo"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
        />

        <Input
          label="Teléfono"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />

        <Input
          label="Sitio web"
          value={form.website}
          onChange={(e) => updateField("website", e.target.value)}
          placeholder="https://..."
        />

        <div className="md:col-span-2">
          <Input
            label="Dirección"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={5}
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-neutral-500">
              Estado de verificación actual:{" "}
              <span className="font-medium text-neutral-900">
                {data.verificationStatus}
              </span>
            </p>

            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : success ? (
              <p className="text-sm text-emerald-600">{success}</p>
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