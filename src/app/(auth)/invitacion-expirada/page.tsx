import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getPublicBusinessOnboardingUrl } from "@/lib/constants/business-onboarding";

export default function InvitationExpiredPage() {
  const onboardingUrl = getPublicBusinessOnboardingUrl();

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Invitación no disponible
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
          El enlace ya no está activo
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Por seguridad, las invitaciones solo pueden usarse una vez y tienen
          fecha de vencimiento. Solicita una nueva revisión desde la web pública
          o contacta al equipo Vasirono.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/login">
            <Button variant="secondary">Ir al login</Button>
          </Link>
          <Link href={onboardingUrl}>
            <Button>Buscar o registrar negocio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
