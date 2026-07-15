"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Eye,
  LoaderCircle,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";
import type {
  TeamMember,
  TeamOverview,
} from "@/features/admin-company/team/types";

type Props = { overview: TeamOverview };
type PendingAction = "add" | `role:${string}` | `active:${string}` | null;

export function TeamView({ overview: initialOverview }: Props) {
  const [overview, setOverview] = useState(initialOverview);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(
    String(initialOverview.roles[0]?.roleId ?? ""),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const activeMembers = useMemo(
    () => overview.members.filter((member) => member.isActive),
    [overview.members],
  );
  const reachedLimit =
    overview.teamLimit !== null && activeMembers.length >= overview.teamLimit;
  const limitLabel = !overview.planAvailable
    ? "No disponible"
    : overview.teamLimit === null
      ? `${activeMembers.length} / Ilimitado`
      : `${activeMembers.length}/${overview.teamLimit}`;
  const canAddMember =
    overview.canManageTeam &&
    overview.teamManagementEnabled &&
    !reachedLimit &&
    overview.roles.length > 0 &&
    pendingAction === null;

  async function refresh() {
    const response = await fetch("/api/admin-company/team", {
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        readApiMessage(payload, "No se pudo actualizar el equipo."),
      );
    }

    const data: TeamOverview = payload?.data ?? payload;
    setOverview(data);
    setRoleId((current) =>
      data.roles.some((role) => String(role.roleId) === current)
        ? current
        : String(data.roles[0]?.roleId ?? ""),
    );
  }

  function beginAction(action: PendingAction) {
    setPendingAction(action);
    setError(null);
    setMessage(null);
  }

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canAddMember) return;

    beginAction("add");

    try {
      const response = await fetch("/api/admin-company/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: email.trim(),
          roleId: Number(roleId),
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          readApiMessage(payload, "No se pudo agregar el usuario."),
        );
      }

      setEmail("");
      await refresh();
      setMessage("Integrante agregado al equipo.");
    } catch (caught) {
      setError(readErrorMessage(caught));
    } finally {
      setPendingAction(null);
    }
  }

  async function updateRole(member: TeamMember, nextRoleId: number) {
    if (
      !overview.canManageTeam ||
      member.userId === overview.currentUserId ||
      nextRoleId === member.roleId ||
      pendingAction !== null
    ) {
      return;
    }

    beginAction(`role:${member.userId}`);

    try {
      const response = await fetch(
        `/api/admin-company/team/${member.userId}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roleId: nextRoleId }),
        },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          readApiMessage(payload, "No se pudo actualizar el rol."),
        );
      }

      await refresh();
      setMessage("Rol actualizado.");
    } catch (caught) {
      setError(readErrorMessage(caught));
    } finally {
      setPendingAction(null);
    }
  }

  async function setActive(member: TeamMember, active: boolean) {
    if (
      !overview.canManageTeam ||
      member.userId === overview.currentUserId ||
      pendingAction !== null ||
      (active && reachedLimit)
    ) {
      return;
    }

    if (
      !active &&
      !window.confirm(`¿Desactivar el acceso de ${member.userName}?`)
    ) {
      return;
    }

    beginAction(`active:${member.userId}`);

    try {
      const response = await fetch(
        `/api/admin-company/team/${member.userId}/active`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active }),
        },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          readApiMessage(payload, "No se pudo cambiar el estado."),
        );
      }

      await refresh();
      setMessage(active ? "Usuario reactivado." : "Usuario desactivado.");
    } catch (caught) {
      setError(readErrorMessage(caught));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-neutral-950 p-6 text-white shadow-sm dark:shadow-none">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
          Equipo
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Usuarios, roles y permisos
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Administra quién puede operar el panel empresa. Los roles de sucursal
          se asignan desde cada sucursal.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Integrantes activos"
          value={String(activeMembers.length)}
          helper="Con acceso habilitado"
        />
        <StatCard
          label="Límite del plan"
          value={limitLabel}
          helper={overview.planLabel}
        />
        <StatCard
          label="Administración"
          value={overview.canManageTeam ? "Habilitada" : "Solo lectura"}
          helper={
            overview.teamManagementEnabled
              ? "Según entitlements"
              : "Requiere un plan compatible"
          }
        />
      </div>

      {message ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        {overview.canManageTeam ? (
          <SectionCard
            title="Agregar integrante"
            description="El usuario debe existir previamente en Vasirono. Puedes buscarlo por correo."
          >
            <form className="space-y-4" onSubmit={addMember}>
              <Input
                label="Correo del usuario"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@empresa.com"
                disabled={pendingAction !== null}
                required
              />
              <Select
                label="Rol de empresa"
                value={roleId}
                onChange={(event) => setRoleId(event.target.value)}
                disabled={pendingAction !== null || overview.roles.length === 0}
                required
              >
                {overview.roles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.label}
                  </option>
                ))}
              </Select>
              {!overview.planAvailable ? (
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  No se pudo validar el plan. La administración queda bloqueada
                  por seguridad.
                </p>
              ) : !overview.teamManagementEnabled ? (
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Tu plan actual no habilita la administración de integrantes
                  adicionales.
                </p>
              ) : reachedLimit ? (
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Alcanzaste el límite de integrantes activos de tu plan.
                </p>
              ) : null}
              <Button type="submit" disabled={!canAddMember}>
                {pendingAction === "add" ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Agregar al equipo
              </Button>
            </form>
          </SectionCard>
        ) : (
          <SectionCard
            title="Acceso de solo lectura"
            description="Tu rol permite consultar el equipo, pero no modificar integrantes ni roles."
          >
            <div className="rounded-3xl border border-sky-100 bg-sky-50 p-6 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200">
              <Eye className="mb-3 h-7 w-7" />
              Los cambios de acceso deben ser realizados por un propietario de
              la empresa.
            </div>
          </SectionCard>
        )}

        <SectionCard
          title="Integrantes"
          description={
            overview.canManageTeam
              ? "Activa, desactiva o cambia roles sin tocar directamente la base de datos."
              : "Consulta los integrantes con acceso a la empresa."
          }
        >
          <div className="space-y-3">
            {overview.members.length ? (
              overview.members.map((member) => {
                const isSelf = member.userId === overview.currentUserId;
                const memberPending =
                  pendingAction?.endsWith(member.userId) ?? false;
                const cannotReactivateByPlan = !member.isActive && reachedLimit;

                return (
                  <article
                    key={member.userId}
                    className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#101821]"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-950 dark:text-slate-100">
                            {member.userName}
                          </h3>
                          <StatusBadge
                            label={member.isActive ? "Activo" : "Inactivo"}
                            tone={member.isActive ? "success" : "warning"}
                          />
                          {isSelf ? (
                            <StatusBadge label="Tu cuenta" tone="info" />
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {member.userEmail}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                          <ShieldCheck className="h-3.5 w-3.5" />{" "}
                          {humanRoleLabel(member.roleName)}
                        </p>
                      </div>
                      {overview.canManageTeam ? (
                        <div className="flex flex-col gap-2 md:min-w-64">
                          <Select
                            value={String(member.roleId)}
                            onChange={(event) =>
                              updateRole(member, Number(event.target.value))
                            }
                            disabled={
                              isSelf ||
                              pendingAction !== null ||
                              !member.isActive
                            }
                            aria-label={`Rol de ${member.userName}`}
                          >
                            {overview.roles.map((role) => (
                              <option key={role.roleId} value={role.roleId}>
                                {role.label}
                              </option>
                            ))}
                          </Select>
                          <Button
                            type="button"
                            variant={member.isActive ? "danger" : "secondary"}
                            size="sm"
                            disabled={
                              isSelf ||
                              pendingAction !== null ||
                              cannotReactivateByPlan
                            }
                            onClick={() => setActive(member, !member.isActive)}
                          >
                            {memberPending ? (
                              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {isSelf
                              ? "Tu acceso"
                              : member.isActive
                                ? "Desactivar acceso"
                                : cannotReactivateByPlan
                                  ? "Límite alcanzado"
                                  : "Reactivar acceso"}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                <UsersRound className="mx-auto mb-3 h-8 w-8 text-slate-400 dark:text-slate-500" />
                Aún no hay integrantes registrados.
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function readApiMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const error = "error" in payload ? payload.error : null;
  if (!error || typeof error !== "object") return fallback;
  const message = "message" in error ? error.message : null;
  return typeof message === "string" && message.trim() ? message : fallback;
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : "No se pudo completar la operación.";
}

function humanRoleLabel(roleName: string): string {
  const normalized = roleName.trim().toLowerCase();
  if (
    ["company_owner", "business_owner", "admin_company"].includes(normalized)
  ) {
    return "Propietario";
  }
  if (
    ["company_manager", "business_manager", "business_admin"].includes(
      normalized,
    )
  ) {
    return "Manager de empresa";
  }
  return roleName.replaceAll("_", " ");
}
