import Link from "next/link";
import { getPublicBusinessOnboardingUrl } from "@/lib/constants/business-onboarding";
import { ActivateAccountForm } from "./ActivateAccountForm";

export function ActivateAccountView({ token }: { token: string }) {
  const onboardingUrl = getPublicBusinessOnboardingUrl();

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="rounded-3xl border border-neutral-200 bg-neutral-950 p-8 text-white shadow-sm lg:sticky lg:top-10 lg:w-[360px]">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-neutral-400">
            Vasirono Empresas
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Activa tu acceso empresarial
          </h1>
          <p className="mt-4 text-sm leading-6 text-neutral-300">
            Esta pantalla solo está disponible para negocios aprobados por
            canal oficial o por verificación presencial. Si no tienes una
            invitación, primero debes buscar o registrar tu negocio en la web
            pública.
          </p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-300">
            <p className="font-medium text-white">Sin registro libre</p>
            <p className="mt-2 leading-6">
              La creación de usuarios empresa queda bloqueada sin una invitación
              válida emitida por Vasirono.
            </p>
          </div>
          <Link
            href={onboardingUrl}
            className="mt-6 inline-flex text-sm font-medium text-white underline underline-offset-4"
          >
            Buscar o registrar mi negocio
          </Link>
        </aside>

        <main className="flex-1 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <ActivateAccountForm token={token} />
        </main>
      </div>
    </div>
  );
}
