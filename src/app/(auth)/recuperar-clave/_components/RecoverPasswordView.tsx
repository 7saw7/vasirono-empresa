"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";

export function RecoverPasswordView() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md">
        <SectionCard
          title="Recuperar contraseña"
          description="Ingresa tu correo empresarial para iniciar el proceso de recuperación."
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Correo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {submitted ? (
              <p className="text-sm text-emerald-600">
                Si el correo existe, recibirás instrucciones para recuperar tu acceso.
              </p>
            ) : null}

            <Button type="submit" className="w-full">
              Enviar instrucciones
            </Button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}