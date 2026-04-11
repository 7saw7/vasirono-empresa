"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AuthError({
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
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-500">
            Autenticación
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
            No se pudo completar esta operación
          </h2>
          <p className="text-sm leading-6 text-neutral-600">
            Ocurrió un problema en el flujo de autenticación. Reintenta para
            continuar.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={reset}>Reintentar</Button>
        </div>
      </div>
    </div>
  );
}