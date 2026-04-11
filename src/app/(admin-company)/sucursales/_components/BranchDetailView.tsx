"use client";

import type { ReactNode } from "react";
import type {
  BranchDetail,
  BranchContactItem,
  BranchServiceItem,
} from "@/features/admin-company/branches/types";
import {
  Building2,
  Clock3,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Star,
  TrendingUp,
  Eye,
  Wrench,
} from "lucide-react";

type Props = {
  branch: BranchDetail;
};

export function BranchDetailView({ branch }: Props) {
  const publicContacts = branch.contacts.filter(
    (item: BranchContactItem) => item.isPublic
  );
  const availableServices = branch.services.filter(
    (item: BranchServiceItem) => item.isAvailable
  );

  const finalScore = branch.finalScore ?? 0;
  const visits30d = branch.visits30d ?? 0;
  const avgRating90d = branch.avgRating90d ?? 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
                {branch.name}
              </h1>

              {branch.isMain ? (
                <span className="inline-flex items-center rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white">
                  Principal
                </span>
              ) : null}

              <span
                className={[
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                  branch.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-neutral-200 text-neutral-700",
                ].join(" ")}
              >
                {branch.isActive ? "Activa" : "Inactiva"}
              </span>
            </div>

            {branch.description ? (
              <p className="max-w-3xl text-sm leading-6 text-neutral-600">
                {branch.description}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span>
                  {branch.address} · {branch.districtName}
                </span>
              </div>

              {branch.phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-neutral-400" />
                  <span>{branch.phone}</span>
                </div>
              ) : null}

              {branch.email ? (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-neutral-400" />
                  <span>{branch.email}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Score"
          value={finalScore.toFixed(1)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="Visitas 30d"
          value={visits30d.toLocaleString()}
          icon={<Eye className="h-4 w-4" />}
        />
        <MetricCard
          label="Rating 90d"
          value={`${avgRating90d.toFixed(1)} / 5`}
          icon={<Star className="h-4 w-4" />}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <InfoCard
          title="Horarios"
          icon={<Clock3 className="h-4 w-4" />}
          emptyMessage={branch.schedules.length ? "" : "No hay horarios registrados."}
        >
          {branch.schedules.length ? (
            <div className="space-y-3">
              {branch.schedules.map((item) => (
                <div
                  key={item.scheduleId}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {item.dayName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Turno {item.shiftNumber}
                    </p>
                  </div>

                  <p className="text-sm text-neutral-600">
                    {item.opening && item.closing
                      ? `${item.opening} - ${item.closing}`
                      : "Horario no definido"}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </InfoCard>

        <InfoCard
          title="Servicios"
          icon={<Wrench className="h-4 w-4" />}
          emptyMessage={availableServices.length ? "" : "No hay servicios registrados."}
        >
          {availableServices.length ? (
            <div className="flex flex-wrap gap-2">
              {availableServices.map((item) => (
                <span
                  key={item.serviceId}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-700"
                >
                  {item.name}
                </span>
              ))}
            </div>
          ) : null}
        </InfoCard>

        <InfoCard
          title="Contactos públicos"
          icon={<Building2 className="h-4 w-4" />}
          emptyMessage={publicContacts.length ? "" : "No hay contactos públicos registrados."}
        >
          {publicContacts.length ? (
            <div className="space-y-3">
              {publicContacts.map((item) => (
                <div
                  key={item.contactId}
                  className="rounded-xl border border-neutral-200 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {item.label?.trim() || item.typeLabel}
                      </p>
                      <p className="text-sm text-neutral-600">{item.value}</p>
                    </div>

                    {item.isPrimary ? (
                      <span className="rounded-full bg-neutral-900 px-2 py-1 text-xs text-white">
                        Principal
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </InfoCard>

        <InfoCard
          title="Media"
          icon={<ImageIcon className="h-4 w-4" />}
          emptyMessage={branch.media.length ? "" : "No hay archivos media registrados."}
        >
          {branch.media.length ? (
            <div className="space-y-3">
              {branch.media.map((item) => (
                <a
                  key={item.mediaId}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-neutral-200 px-3 py-3 transition hover:bg-neutral-50"
                >
                  <p className="text-sm font-medium text-neutral-900">
                    {item.typeLabel}
                  </p>
                  <p className="truncate text-sm text-neutral-500">{item.url}</p>
                </a>
              ))}
            </div>
          ) : null}
        </InfoCard>
      </section>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
};

function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">{label}</span>
        <div className="text-neutral-400">{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
        {value}
      </div>
    </div>
  );
}

type InfoCardProps = {
  title: string;
  icon: ReactNode;
  emptyMessage: string;
  children: ReactNode;
};

function InfoCard({ title, icon, emptyMessage, children }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="text-neutral-400">{icon}</div>
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      </div>

      {children || <p className="text-sm text-neutral-500">{emptyMessage}</p>}
    </div>
  );
}