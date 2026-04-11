"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { getBranchDistrictOptions } from "@/features/admin-company/branches/service";
import type { BranchDistrictOption } from "@/features/admin-company/branches/types";

type BranchFormState = {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  districtId: string;
  isMain: "false" | "true";
  isActive: "true" | "false";
};

type FieldErrors = Partial<Record<keyof BranchFormState, string>>;

const initialForm: BranchFormState = {
  name: "",
  description: "",
  address: "",
  phone: "",
  email: "",
  districtId: "",
  isMain: "false",
  isActive: "true",
};

function mapApiErrors(details: unknown): FieldErrors {
  if (!details || typeof details !== "object") return {};

  const source = details as Record<string, unknown>;
  const fieldErrors: FieldErrors = {};

  for (const key of Object.keys(initialForm) as Array<keyof BranchFormState>) {
    const raw = source[key];
    if (Array.isArray(raw) && typeof raw[0] === "string") {
      fieldErrors[key] = raw[0];
    }
  }

  return fieldErrors;
}

export function BranchForm() {
  const router = useRouter();
  const [form, setForm] = useState<BranchFormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const [districtOptions, setDistrictOptions] = useState<
    BranchDistrictOption[]
  >([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDistricts() {
      try {
        setIsLoadingDistricts(true);
        const districts = await getBranchDistrictOptions();

        if (!active) return;
        setDistrictOptions(districts);
      } catch (error) {
        if (!active) return;

        setSubmitError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los distritos."
        );
      } finally {
        if (active) {
          setIsLoadingDistricts(false);
        }
      }
    }

    void loadDistricts();

    return () => {
      active = false;
    };
  }, []);

  function updateField<K extends keyof BranchFormState>(
    key: K,
    value: BranchFormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));

    setSubmitError("");
  }

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.address.trim().length >= 5 &&
      form.districtId.trim().length > 0 &&
      !isLoadingDistricts
    );
  }, [form, isLoadingDistricts]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setSubmitError("Completa los campos obligatorios antes de continuar.");
      return;
    }

    setIsLoading(true);
    setSubmitError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/admin-company/branches", {
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

      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        setFieldErrors(mapApiErrors(payload?.error?.details));
        setSubmitError(
          payload?.error?.message || "No se pudo crear la sucursal."
        );
        return;
      }

      const createdBranchId = payload?.data?.branchId;

      if (typeof createdBranchId === "number" && createdBranchId > 0) {
        router.push(`/sucursales/${createdBranchId}`);
        router.refresh();
        return;
      }

      router.push("/sucursales");
      router.refresh();
    } catch {
      setSubmitError(
        "Ocurrió un problema al crear la sucursal. Intenta nuevamente."
      );
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
        error={fieldErrors.name}
        placeholder="Ej. Sede Villa El Salvador"
        maxLength={120}
        required
      />

      <Select
        label="Distrito"
        value={form.districtId}
        onChange={(event) => updateField("districtId", event.target.value)}
        error={fieldErrors.districtId}
        required
        disabled={isLoadingDistricts}
      >
        <option value="">
          {isLoadingDistricts
            ? "Cargando distritos..."
            : "Selecciona un distrito"}
        </option>
        {districtOptions.map((district) => (
          <option key={district.id} value={String(district.id)}>
            {district.name}
          </option>
        ))}
      </Select>

      <div className="md:col-span-2">
        <Input
          label="Dirección"
          value={form.address}
          onChange={(event) => updateField("address", event.target.value)}
          error={fieldErrors.address}
          placeholder="Av., calle, número y referencia"
          maxLength={240}
          required
        />
      </div>

      <Input
        label="Teléfono"
        value={form.phone}
        onChange={(event) => updateField("phone", event.target.value)}
        error={fieldErrors.phone}
        placeholder="Ej. 987654321"
        maxLength={40}
      />

      <Input
        label="Correo"
        type="email"
        value={form.email}
        onChange={(event) => updateField("email", event.target.value)}
        error={fieldErrors.email}
        placeholder="sucursal@empresa.com"
        maxLength={120}
      />

      <div className="md:col-span-2">
        <Textarea
          label="Descripción"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          error={fieldErrors.description}
          placeholder="Describe brevemente esta sede."
          maxLength={500}
          rows={5}
        />
      </div>

      <Select
        label="¿Es principal?"
        value={form.isMain}
        onChange={(event) =>
          updateField("isMain", event.target.value as "false" | "true")
        }
        error={fieldErrors.isMain}
      >
        <option value="false">No</option>
        <option value="true">Sí</option>
      </Select>

      <Select
        label="Estado"
        value={form.isActive}
        onChange={(event) =>
          updateField("isActive", event.target.value as "true" | "false")
        }
        error={fieldErrors.isActive}
      >
        <option value="true">Activa</option>
        <option value="false">Inactiva</option>
      </Select>

      <div className="md:col-span-2 space-y-3">
        {submitError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!canSubmit || isLoading || isLoadingDistricts}
          >
            {isLoading ? "Creando..." : "Crear sucursal"}
          </Button>
        </div>
      </div>
    </form>
  );
}