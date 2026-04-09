"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

export function ReviewResponseForm({
  reviewId,
  initialValue = "",
}: {
  reviewId: number;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setServerError(null);
    setSaved(false);

    try {
      const response = await fetch(`/api/admin-company/reviews/${reviewId}/response`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responseText: value,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json?.error?.message ?? "No se pudo guardar la respuesta.");
      }

      setSaved(true);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Ocurrió un error inesperado."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        label="Respuesta del negocio"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Escribe una respuesta clara, respetuosa y útil."
      />

      {serverError ? (
        <p className="text-sm text-red-600">{serverError}</p>
      ) : null}

      {saved ? (
        <p className="text-sm text-emerald-600">Respuesta guardada correctamente.</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" size="sm" isLoading={isLoading}>
          Guardar respuesta
        </Button>
      </div>
    </form>
  );
}