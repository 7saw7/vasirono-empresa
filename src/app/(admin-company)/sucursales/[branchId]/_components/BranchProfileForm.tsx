"use client";

import { useState } from "react";
import type {
  BranchDetail,
  UpsertBranchInput,
} from "@/features/admin-company/branches/types";
import { updateBranch } from "@/features/admin-company/branches/service";
import { SectionCard } from "@/components/ui/SectionCard";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function BranchProfileForm({ branch }: { branch: BranchDetail }) {
  const [form, setForm] = useState<UpsertBranchInput>({
    name: branch.name,
    description: branch.description,
    address: branch.address,
    phone: branch.phone,
    email: branch.email,
    districtId: branch.districtId ?? 0,
    isMain: branch.isMain,
    isActive: branch.isActive,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof UpsertBranchInput>(
    key: K,
    value: UpsertBranchInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await updateBranch(branch.branchId, form);
      setMessage("Sucursal actualizada correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la sucursal."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="Perfil de la sucursal"
      description="Edita la información principal visible para esta sede."
    >
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <Input
          label="Nombre"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          required
        />

        <Input
          label="Distrito"
          value={String(form.districtId || "")}
          onChange={(e) => setField("districtId", Number(e.target.value || 0))}
          required
        />

        <div className="md:col-span-2">
          <Input
            label="Dirección"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            required
          />
        </div>

        <Input
          label="Teléfono"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
        />

        <Input
          label="Correo"
          type="email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
        />

        <div className="md:col-span-2">
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={4}
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={form.isMain}
            onChange={(e) => setField("isMain", e.target.checked)}
          />
          Marcar como sucursal principal
        </label>

        <label className="flex items-center gap-3 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setField("isActive", e.target.checked)}
          />
          Sucursal activa
        </label>

        <div className="md:col-span-2 flex items-center justify-between gap-4">
          <div>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : message ? (
              <p className="text-sm text-emerald-600">{message}</p>
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