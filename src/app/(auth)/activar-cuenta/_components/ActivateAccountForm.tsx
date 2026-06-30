"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  acceptBusinessInvitationService,
  previewBusinessInvitationService,
} from "@/features/auth/service";
import type { BusinessInvitationPreview } from "@/features/auth/types";
import { getPublicBusinessOnboardingUrl } from "@/lib/constants/business-onboarding";

const PASSWORD_HINT =
  "Mínimo 8 caracteres, con mayúscula, minúscula y número.";

type FormMode = "create_credentials" | "existing_account";

export function ActivateAccountForm({ token }: { token: string }) {
  const router = useRouter();
  const onboardingUrl = getPublicBusinessOnboardingUrl();

  const [preview, setPreview] = useState<BusinessInvitationPreview | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      if (!token) {
        setError("El enlace de invitación no contiene un token válido.");
        setLoading(false);
        return;
      }

      try {
        const invitation = await previewBusinessInvitationService(token);

        if (cancelled) return;

        setPreview(invitation);
        setName(invitation.name || "");
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "La invitación no es válida o expiró."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const mode: FormMode = useMemo(() => {
    if (preview?.activation.requiresExistingLogin) return "existing_account";
    return "create_credentials";
  }, [preview]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!preview) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (mode === "create_credentials") {
      if (!acceptTerms) {
        setError("Debes aceptar los términos para activar el acceso empresa.");
        setSubmitting(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        setSubmitting(false);
        return;
      }
    }

    try {
      const result = await acceptBusinessInvitationService({
        token,
        name: mode === "create_credentials" ? name : undefined,
        phone: mode === "create_credentials" ? phone : undefined,
        password,
        confirmPassword: mode === "create_credentials" ? confirmPassword : undefined,
        acceptTerms: mode === "create_credentials" ? acceptTerms : undefined,
      });

      if (result.loginRequired) {
        setSuccessMessage(
          "La invitación fue aceptada y el acceso al negocio quedó vinculado. Inicia sesión con tu cuenta empresarial para continuar."
        );
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(preview.email)}`);
        }, 1200);
        return;
      }

      setSuccessMessage("Cuenta activada correctamente. Redirigiendo al panel...");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo activar la cuenta empresa."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center text-sm text-neutral-500">
        Validando invitación...
      </div>
    );
  }

  if (error && !preview) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
            Invitación no disponible
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
            No pudimos validar este enlace
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">{error}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/login">
            <Button variant="secondary">Ir al login</Button>
          </Link>
          <Link href={onboardingUrl}>
            <Button>Buscar o registrar negocio</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Invitación aprobada
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
          Bienvenido a Vasirono Empresas
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Tu negocio pasó el filtro de verificación. Completa la activación para
          administrar el panel empresarial.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm md:grid-cols-2">
        <Info label="Negocio" value={preview.companyName} />
        <Info label="Local" value={preview.branchName || "Principal"} />
        <Info label="Correo invitado" value={preview.email} />
        <Info label="Rol" value={formatRole(preview.roleCode)} />
        <Info label="Origen" value={formatSource(preview.source)} />
        <Info label="Vence" value={formatDate(preview.expiresAt)} />
      </div>

      {mode === "existing_account" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Este correo ya tiene credenciales. Ingresa tu contraseña actual para
          aceptar la invitación y vincular el negocio a tu cuenta.
        </div>
      ) : null}

      <div className="grid gap-4">
        {mode === "create_credentials" ? (
          <>
            <Input
              label="Nombre del administrador"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={120}
            />
            <Input
              label="Teléfono opcional"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
              placeholder="Ej. 999888777"
            />
          </>
        ) : null}

        <Input
          label={
            mode === "existing_account"
              ? "Contraseña actual"
              : "Crear contraseña"
          }
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={mode === "create_credentials" ? PASSWORD_HINT : undefined}
          required
        />

        {mode === "create_credentials" ? (
          <Input
            label="Confirmar contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        ) : null}
      </div>

      {mode === "create_credentials" ? (
        <label className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-4 text-sm text-neutral-600">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-neutral-300"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          <span>
            Confirmo que soy representante autorizado del negocio y acepto que
            el acceso se otorga sobre la empresa/local indicado en la invitación.
          </span>
        </label>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {successMessage ? (
        <p className="text-sm text-emerald-700">{successMessage}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={submitting} className="sm:min-w-48">
          {submitting
            ? "Activando..."
            : mode === "existing_account"
              ? "Aceptar invitación"
              : "Crear cuenta empresa"}
        </Button>
        <Link href="/login">
          <Button type="button" variant="secondary" className="w-full sm:w-auto">
            Ya tengo acceso
          </Button>
        </Link>
      </div>
    </form>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-1 font-medium text-neutral-950">{value}</p>
    </div>
  );
}

function formatSource(source: string): string {
  if (source === "registration") return "Registro de nuevo negocio";
  return "Reclamo de negocio";
}

function formatRole(roleCode: string): string {
  const normalized = roleCode.replace(/_/g, " ").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
