"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function BranchFilters() {
  return (
    <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:grid-cols-3">
      <Input label="Buscar" placeholder="Nombre, dirección o distrito" />
      <Select
        label="Estado"
        placeholder="Todos"
        options={[
          { label: "Activas", value: "active" },
          { label: "Inactivas", value: "inactive" },
        ]}
      />
      <Select
        label="Distrito"
        placeholder="Todos"
        options={[
          { label: "Villa El Salvador", value: "1" },
          { label: "San Juan de Miraflores", value: "2" },
          { label: "Chorrillos", value: "3" },
        ]}
      />
    </div>
  );
}