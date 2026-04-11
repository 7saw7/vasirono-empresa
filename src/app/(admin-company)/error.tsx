"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AdminCompanyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium text-red-600">Panel de empresa</p>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Ocurrió un problema al cargar esta sección
          </h2>
          <p className="text-sm leading-6 text-neutral-600">
            La pantalla no pudo renderizarse correctamente. Puedes reintentar o
            volver a la sección anterior.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={reset}>Reintentar</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.history.back()}
          >
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
}