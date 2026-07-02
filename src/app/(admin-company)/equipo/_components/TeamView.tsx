"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";
import type { TeamMember, TeamOverview } from "@/features/admin-company/team/types";

type Props = { overview: TeamOverview };

export function TeamView({ overview }: Props) {
  const [members, setMembers] = useState<TeamMember[]>(overview.members);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(String(overview.roles[0]?.roleId ?? ""));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeMembers = useMemo(() => members.filter((member) => member.isActive), [members]);
  const limitLabel = overview.teamLimit === null ? "Ilimitado" : `${activeMembers.length}/${overview.teamLimit}`;

  async function refresh() {
    const response = await fetch("/api/admin-company/team", { cache: "no-store" });
    const payload = await response.json();
    const data: TeamOverview = payload?.data ?? payload;
    setMembers(data.members ?? []);
  }

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const response = await fetch("/api/admin-company/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: email, roleId: Number(roleId) }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? "No se pudo agregar el usuario.");
      return;
    }
    setEmail("");
    setMessage("Integrante agregado al equipo.");
    await refresh();
  }

  async function updateRole(member: TeamMember, nextRoleId: number) {
    const response = await fetch(`/api/admin-company/team/${member.userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId: nextRoleId }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? "No se pudo actualizar el rol.");
      return;
    }
    setMessage("Rol actualizado.");
    await refresh();
  }

  async function setActive(member: TeamMember, active: boolean) {
    const response = await fetch(`/api/admin-company/team/${member.userId}/active`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? "No se pudo cambiar el estado.");
      return;
    }
    setMessage(active ? "Usuario reactivado." : "Usuario desactivado.");
    await refresh();
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-neutral-950 p-6 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">Equipo</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Usuarios, roles y permisos</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
          Administra quién puede operar el panel empresa. Los permisos salen del rol y del contexto de empresa activo.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Integrantes activos" value={String(activeMembers.length)} helper="Con acceso habilitado" />
        <StatCard label="Límite del plan" value={limitLabel} helper={overview.planLabel} />
        <StatCard label="Gestión avanzada" value={overview.teamManagementEnabled ? "Activa" : "Bloqueada"} helper="Según entitlements" />
      </div>

      {message ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Agregar integrante" description="El usuario debe existir previamente en Vasirono. Puedes buscarlo por correo.">
          <form className="space-y-4" onSubmit={addMember}>
            <Input label="Correo del usuario" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="correo@empresa.com" required />
            <Select label="Rol" value={roleId} onChange={(event) => setRoleId(event.target.value)} required>
              {overview.roles.map((role) => <option key={role.roleId} value={role.roleId}>{role.label}</option>)}
            </Select>
            <Button type="submit" disabled={!overview.teamManagementEnabled && activeMembers.length >= 1}>
              <UserPlus className="mr-2 h-4 w-4" /> Agregar al equipo
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Integrantes" description="Activa, desactiva o cambia roles sin tocar directamente la base de datos.">
          <div className="space-y-3">
            {members.length ? members.map((member) => (
              <article key={member.userId} className="rounded-3xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-neutral-950">{member.userName}</h3>
                      <StatusBadge label={member.isActive ? "Activo" : "Inactivo"} tone={member.isActive ? "success" : "warning"} />
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">{member.userEmail}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400"><ShieldCheck className="h-3.5 w-3.5" /> {member.roleName}</p>
                  </div>
                  <div className="flex flex-col gap-2 md:min-w-64">
                    <Select value={String(member.roleId)} onChange={(event) => updateRole(member, Number(event.target.value))}>
                      {overview.roles.map((role) => <option key={role.roleId} value={role.roleId}>{role.label}</option>)}
                    </Select>
                    <Button type="button" variant={member.isActive ? "danger" : "secondary"} size="sm" onClick={() => setActive(member, !member.isActive)}>
                      {member.isActive ? "Desactivar acceso" : "Reactivar acceso"}
                    </Button>
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
                <UsersRound className="mx-auto mb-3 h-8 w-8 text-neutral-400" />
                Aún no hay integrantes registrados.
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
