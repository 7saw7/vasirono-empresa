import Link from "next/link";
import { getPublicBusinessOnboardingUrl } from "@/lib/constants/business-onboarding";
import { LoginForm } from "./LoginForm";

export function LoginView({ email }: { email?: string }) {
  const onboardingUrl = getPublicBusinessOnboardingUrl();

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-neutral-400">
            Vasirono
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
            Acceder al panel empresa
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Ingresa con tu cuenta empresarial para gestionar tu negocio.
          </p>
        </div>

        <LoginForm initialEmail={email} />

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
          <p className="font-medium text-neutral-900">¿Aún no tienes acceso?</p>
          <p className="mt-1 leading-6">
            La creación de cuentas empresa empieza reclamando o registrando el
            negocio en la web pública. No hay registro libre desde este panel.
          </p>
          <Link
            href={onboardingUrl}
            className="mt-3 inline-flex font-medium text-neutral-950 underline underline-offset-4"
          >
            Buscar o registrar mi negocio
          </Link>
        </div>
      </div>
    </div>
  );
}
