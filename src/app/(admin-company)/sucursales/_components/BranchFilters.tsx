"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { BranchDistrictOption } from "@/features/admin-company/branches/types";

type BranchFiltersProps = {
  districts: BranchDistrictOption[];
};

export function BranchFilters({ districts }: BranchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchValue = searchParams.get("search") ?? "";
  const statusValue = searchParams.get("status") ?? "";
  const districtValue = searchParams.get("districtId") ?? "";

  const paramsString = useMemo(() => searchParams.toString(), [searchParams]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(paramsString);

    if (value.trim()) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:grid-cols-3">
      <Input
        label="Buscar"
        placeholder="Nombre, dirección o distrito"
        defaultValue={searchValue}
        onChange={(event) => updateParam("search", event.target.value)}
      />

      <Select
        label="Estado"
        value={statusValue}
        onChange={(event) => updateParam("status", event.target.value)}
      >
        <option value="">Todos</option>
        <option value="active">Activas</option>
        <option value="inactive">Inactivas</option>
      </Select>

      <Select
        label="Distrito"
        value={districtValue}
        onChange={(event) => updateParam("districtId", event.target.value)}
      >
        <option value="">Todos</option>
        {districts.map((district) => (
          <option key={district.id} value={String(district.id)}>
            {district.name}
          </option>
        ))}
      </Select>
    </div>
  );
}