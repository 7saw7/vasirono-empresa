"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { CompanyProfile } from "@/features/admin-company/company/types";

export function CompanyProfileForm({ data }: { data: CompanyProfile }) {
  const [form, setForm] = useState({
    name: data.name,
    description: data.description,
    address: data.address,
    phone: data.phone,
    email: data.email,
    website: data.website,
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
      await fetch("/api/admin-company/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <Input
        label="Nombre del negocio"
        value={form.name}
        onChange={(event) => updateField("name", event.target.value)}
      />
      <Input
        label="Correo"
        type="email"
        value={form.email}
        onChange={(event) => updateField("email", event.target.value)}
      />
      <Input
        label="Teléfono"
        value={form.phone}
        onChange={(event) => updateField("phone", event.target.value)}
      />
      <Input
        label="Sitio web"
        value={form.website}
        onChange={(event) => updateField("website", event.target.value)}
      />
      <div className="md:col-span-2">
        <Input
          label="Dirección corporativa"
          value={form.address}
          onChange={(event) => updateField("address", event.target.value)}
        />
      </div>
      <div className="md:col-span-2">
        <Textarea
          label="Descripción"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}