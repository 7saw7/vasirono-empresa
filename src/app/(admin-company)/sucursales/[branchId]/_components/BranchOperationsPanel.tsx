"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarPlus, Phone, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import type { BranchContactItem, BranchScheduleItem, BranchServiceItem } from "@/features/admin-company/branches/types";

type Props = {
  branchId: number;
  contacts: BranchContactItem[];
  schedules: BranchScheduleItem[];
  services: BranchServiceItem[];
};

type ServiceCatalogItem = { serviceId: number; name: string; code: string; description: string | null; isActive: boolean };
type HourException = { exceptionId: number; exceptionDate: string; isClosed: boolean; opening: string | null; closing: string | null; reason: string | null; notes: string | null };

export function BranchOperationsPanel({ branchId, contacts: initialContacts, schedules: initialSchedules, services: initialServices }: Props) {
  const [contacts, setContacts] = useState(initialContacts);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [services, setServices] = useState(initialServices);
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [exceptions, setExceptions] = useState<HourException[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [contactForm, setContactForm] = useState({ contactTypeId: "1", value: "", label: "", isPrimary: false, isPublic: true });
  const [scheduleForm, setScheduleForm] = useState({ dayId: "1", opening: "09:00", closing: "18:00", shiftNumber: "1" });
  const [serviceForm, setServiceForm] = useState({ serviceId: "", isAvailable: true });
  const [exceptionForm, setExceptionForm] = useState({ exceptionDate: "", isClosed: true, opening: "", closing: "", reason: "", notes: "" });

  const availableCatalog = useMemo(
    () => catalog.filter((item) => !services.some((service) => service.serviceId === item.serviceId)),
    [catalog, services],
  );

  useEffect(() => {
    refreshServicesCatalog();
    refreshExceptions();
  }, []);

  async function fetchJson(url: string, init?: RequestInit) {
    const response = await fetch(url, { cache: "no-store", ...init });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo completar la operación.");
    return payload?.data ?? payload;
  }

  async function refreshContacts() { setContacts(await fetchJson(`/api/admin-company/branches/${branchId}/contacts`)); }
  async function refreshSchedules() { setSchedules(await fetchJson(`/api/admin-company/branches/${branchId}/schedules`)); }
  async function refreshExceptions() { setExceptions(await fetchJson(`/api/admin-company/branches/${branchId}/hour-exceptions`).catch(() => [])); }
  async function refreshServicesCatalog() { setCatalog(await fetchJson(`/api/admin-company/branches/${branchId}/services`).catch(() => [])); }

  async function run(action: () => Promise<void>, success: string) {
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(success);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la operación.");
    }
  }

  async function createContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => {
      await fetchJson(`/api/admin-company/branches/${branchId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactTypeId: Number(contactForm.contactTypeId),
          value: contactForm.value,
          label: contactForm.label || undefined,
          isPrimary: contactForm.isPrimary,
          isPublic: contactForm.isPublic,
        }),
      });
      setContactForm({ contactTypeId: "1", value: "", label: "", isPrimary: false, isPublic: true });
      await refreshContacts();
    }, "Contacto creado.");
  }

  async function upsertSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => {
      await fetchJson(`/api/admin-company/branches/${branchId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayId: Number(scheduleForm.dayId),
          opening: scheduleForm.opening || undefined,
          closing: scheduleForm.closing || undefined,
          shiftNumber: Number(scheduleForm.shiftNumber || 1),
        }),
      });
      await refreshSchedules();
    }, "Horario guardado.");
  }

  async function attachService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => {
      await fetchJson(`/api/admin-company/branches/${branchId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: Number(serviceForm.serviceId), isAvailable: serviceForm.isAvailable }),
      });
      const selected = catalog.find((item) => item.serviceId === Number(serviceForm.serviceId));
      if (selected) setServices((current) => [...current, { serviceId: selected.serviceId, code: selected.code, name: selected.name, isAvailable: serviceForm.isAvailable }]);
      setServiceForm({ serviceId: "", isAvailable: true });
    }, "Servicio asociado.");
  }

  async function createException(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => {
      await fetchJson(`/api/admin-company/branches/${branchId}/hour-exceptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exceptionDate: exceptionForm.exceptionDate,
          isClosed: exceptionForm.isClosed,
          opening: exceptionForm.opening || undefined,
          closing: exceptionForm.closing || undefined,
          reason: exceptionForm.reason || undefined,
          notes: exceptionForm.notes || undefined,
        }),
      });
      setExceptionForm({ exceptionDate: "", isClosed: true, opening: "", closing: "", reason: "", notes: "" });
      await refreshExceptions();
    }, "Excepción registrada.");
  }

  return (
    <div className="space-y-6">
      {message ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Contactos públicos" description="WhatsApp, teléfono, correo, web o redes visibles para usuarios.">
          <form className="space-y-3" onSubmit={createContact}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Tipo ID" type="number" min="1" value={contactForm.contactTypeId} onChange={(event) => setContactForm({ ...contactForm, contactTypeId: event.target.value })} />
              <Input label="Valor" value={contactForm.value} onChange={(event) => setContactForm({ ...contactForm, value: event.target.value })} placeholder="+51999999999" required />
              <Input label="Etiqueta" value={contactForm.label} onChange={(event) => setContactForm({ ...contactForm, label: event.target.value })} placeholder="Reservas" />
              <div className="flex items-end gap-4 rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700">
                <label><input type="checkbox" checked={contactForm.isPrimary} onChange={(event) => setContactForm({ ...contactForm, isPrimary: event.target.checked })} /> Principal</label>
                <label><input type="checkbox" checked={contactForm.isPublic} onChange={(event) => setContactForm({ ...contactForm, isPublic: event.target.checked })} /> Público</label>
              </div>
            </div>
            <Button type="submit" size="sm"><Phone className="mr-2 h-4 w-4" />Agregar contacto</Button>
          </form>
          <div className="mt-4 space-y-2">
            {contacts.map((contact) => <div key={contact.contactId} className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3 text-sm"><span>{contact.typeLabel}: {contact.value}</span>{contact.isPrimary ? <StatusBadge label="Principal" tone="info" /> : null}</div>)}
          </div>
        </SectionCard>

        <SectionCard title="Horarios semanales" description="Registra turnos por día y número de turno.">
          <form className="space-y-3" onSubmit={upsertSchedule}>
            <div className="grid gap-3 md:grid-cols-4">
              <Select label="Día" value={scheduleForm.dayId} onChange={(event) => setScheduleForm({ ...scheduleForm, dayId: event.target.value })}>{["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((day, index) => <option key={day} value={index + 1}>{day}</option>)}</Select>
              <Input label="Apertura" type="time" value={scheduleForm.opening} onChange={(event) => setScheduleForm({ ...scheduleForm, opening: event.target.value })} />
              <Input label="Cierre" type="time" value={scheduleForm.closing} onChange={(event) => setScheduleForm({ ...scheduleForm, closing: event.target.value })} />
              <Input label="Turno" type="number" min="1" value={scheduleForm.shiftNumber} onChange={(event) => setScheduleForm({ ...scheduleForm, shiftNumber: event.target.value })} />
            </div>
            <Button type="submit" size="sm"><CalendarPlus className="mr-2 h-4 w-4" />Guardar horario</Button>
          </form>
          <div className="mt-4 space-y-2">{schedules.map((item) => <div key={item.scheduleId} className="rounded-2xl border border-neutral-200 p-3 text-sm">{item.dayName} · {item.opening ?? "—"} - {item.closing ?? "—"}</div>)}</div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Servicios disponibles" description="Activa servicios del catálogo para esta sede.">
          <form className="space-y-3" onSubmit={attachService}>
            <Select label="Servicio" value={serviceForm.serviceId} onChange={(event) => setServiceForm({ ...serviceForm, serviceId: event.target.value })} required>
              <option value="">Selecciona servicio</option>
              {availableCatalog.map((item) => <option key={item.serviceId} value={item.serviceId}>{item.name}</option>)}
            </Select>
            <label className="flex items-center gap-2 rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700"><input type="checkbox" checked={serviceForm.isAvailable} onChange={(event) => setServiceForm({ ...serviceForm, isAvailable: event.target.checked })} />Disponible actualmente</label>
            <Button type="submit" size="sm"><Settings2 className="mr-2 h-4 w-4" />Asociar servicio</Button>
          </form>
          <div className="mt-4 space-y-2">{services.map((service) => <div key={service.serviceId} className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3 text-sm"><span>{service.name}</span><StatusBadge label={service.isAvailable ? "Disponible" : "No disponible"} tone={service.isAvailable ? "success" : "warning"} /></div>)}</div>
        </SectionCard>

        <SectionCard title="Excepciones de horario" description="Feriados, cierres o horarios especiales por fecha.">
          <form className="space-y-3" onSubmit={createException}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Fecha" type="date" value={exceptionForm.exceptionDate} onChange={(event) => setExceptionForm({ ...exceptionForm, exceptionDate: event.target.value })} required />
              <label className="flex items-end gap-2 rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700"><input type="checkbox" checked={exceptionForm.isClosed} onChange={(event) => setExceptionForm({ ...exceptionForm, isClosed: event.target.checked })} />Cerrado todo el día</label>
              <Input label="Apertura especial" type="time" value={exceptionForm.opening} onChange={(event) => setExceptionForm({ ...exceptionForm, opening: event.target.value })} disabled={exceptionForm.isClosed} />
              <Input label="Cierre especial" type="time" value={exceptionForm.closing} onChange={(event) => setExceptionForm({ ...exceptionForm, closing: event.target.value })} disabled={exceptionForm.isClosed} />
            </div>
            <Input label="Motivo" value={exceptionForm.reason} onChange={(event) => setExceptionForm({ ...exceptionForm, reason: event.target.value })} placeholder="Feriado, inventario, evento privado..." />
            <Textarea label="Notas" rows={2} value={exceptionForm.notes} onChange={(event) => setExceptionForm({ ...exceptionForm, notes: event.target.value })} />
            <Button type="submit" size="sm">Registrar excepción</Button>
          </form>
          <div className="mt-4 space-y-2">{exceptions.map((item) => <div key={item.exceptionId} className="rounded-2xl border border-neutral-200 p-3 text-sm"><b>{item.exceptionDate}</b> · {item.isClosed ? "Cerrado" : `${item.opening ?? "—"} - ${item.closing ?? "—"}`}<p className="text-xs text-neutral-500">{item.reason ?? item.notes}</p></div>)}</div>
        </SectionCard>
      </div>
    </div>
  );
}
