"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function BranchForm() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    districtId: "",
    isMain: "false",
    isActive: "true",
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
      await fetch("/api/admin-company/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          address: form.address,
          phone: form.phone,
          email: form.email,
          districtId: Number(form.districtId),
          isMain: form.isMain === "true",
          isActive: form.isActive === "true",
        }),
      });

      setForm({
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        districtId: "",
        isMain: "false",
        isActive: "true",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <Input
        label="Nombre de la sucursal"
        value={form.name}
        onChange={(event) => updateField("name", event.target.value)}
      />
      <Select
        label="Distrito"
        value={form.districtId}
        onChange={(event) => updateField("districtId", event.target.value)}
        placeholder="Selecciona uno"
        options={[
          { label: "Villa El Salvador", value: "1" },
          { label: "San Juan de Miraflores", value: "2" },
          { label: "Chorrillos", value: "3" },
        ]}
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
      <Input
        label="Correo"
        value={form.email}
        onChange={(event) => updateField("email", event.target.value)}
      />
      <div className="md:col-span-2">
        <Textarea
          label="Descripción"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
      </div>
      <Select
        label="¿Es principal?"
        value={form.isMain}
        onChange={(event) => updateField("isMain", event.target.value)}
        options={[
          { label: "No", value: "false" },
          { label: "Sí", value: "true" },
        ]}
      />
      <Select
        label="Estado"
        value={form.isActive}
        onChange={(event) => updateField("isActive", event.target.value)}
        options={[
          { label: "Activa", value: "true" },
          { label: "Inactiva", value: "false" },
        ]}
      />

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Crear sucursal
        </Button>
      </div>
    </form>
  );
}