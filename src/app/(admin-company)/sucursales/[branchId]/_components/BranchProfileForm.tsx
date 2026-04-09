"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { BranchDetail } from "@/features/admin-company/branches/types";

export function BranchProfileForm({ branch }: { branch: BranchDetail }) {
  const [form, setForm] = useState({
    name: branch.name,
    description: branch.description,
    address: branch.address,
    phone: branch.phone,
    email: branch.email,
  });

  const [isLoading, setIsLoading] = useState(false);

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await fetch(`/api/admin-company/branches/${branch.branchId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          districtId: 1,
          isMain: branch.isMain,
          isActive: branch.isActive,
        }),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <Input
        label="Nombre"
        value={form.name}
        onChange={(event) => updateField("name", event.target.value)}
      />
      <Input
        label="Correo"
        value={form.email}
        onChange={(event) => updateField("email", event.target.value)}
      />
      <div className="md:col-span-2">
        <Input
          label="Dirección"
          value={form.address}
          onChange={(event) => updateField("address", event.target.value)}
        />
      </div>
      <Input
        label="Teléfono"
        value={form.phone}
        onChange={(event) => updateField("phone", event.target.value)}
      />
      <div className="md:col-span-2">
        <Textarea
          label="Descripción"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Guardar sucursal
        </Button>
      </div>
    </form>
  );
}