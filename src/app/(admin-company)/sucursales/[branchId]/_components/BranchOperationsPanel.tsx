"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarPlus, Check, Pencil, Phone, RefreshCcw, Settings2, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import type { BranchContactItem, BranchDetail, BranchScheduleItem, BranchServiceItem } from "@/features/admin-company/branches/types";

type Props = {
  branchId: number;
  contacts: BranchContactItem[];
  schedules: BranchScheduleItem[];
  services: BranchServiceItem[];
};

type ServiceCatalogItem = { serviceId: number; name: string; code: string; description: string | null; isActive: boolean };
type HourException = { exceptionId: number; exceptionDate: string; isClosed: boolean; opening: string | null; closing: string | null; reason: string | null; notes: string | null };

type ContactForm = { contactId?: number; contactTypeId: string; value: string; label: string; isPrimary: boolean; isPublic: boolean };
type ScheduleForm = { scheduleId?: number; dayId: string; opening: string; closing: string; shiftNumber: string };
type ExceptionForm = { exceptionId?: number; exceptionDate: string; isClosed: boolean; opening: string; closing: string; reason: string; notes: string };

const emptyContact: ContactForm = { contactTypeId: "1", value: "", label: "", isPrimary: false, isPublic: true };
const emptySchedule: ScheduleForm = { dayId: "1", opening: "09:00", closing: "18:00", shiftNumber: "1" };
const emptyException: ExceptionForm = { exceptionDate: "", isClosed: true, opening: "", closing: "", reason: "", notes: "" };

export function BranchOperationsPanel({ branchId, contacts: initialContacts, schedules: initialSchedules, services: initialServices }: Props) {
  const [contacts, setContacts] = useState(initialContacts);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [services, setServices] = useState(initialServices);
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [exceptions, setExceptions] = useState<HourException[]>([]);
  const [contactForm, setContactForm] = useState<ContactForm>(emptyContact);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>(emptySchedule);
  const [serviceForm, setServiceForm] = useState({ serviceId: "", isAvailable: true });
  const [exceptionForm, setExceptionForm] = useState<ExceptionForm>(emptyException);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableCatalog = useMemo(
    () => catalog.filter((item) => item.isActive && !services.some((service) => service.serviceId === item.serviceId)),
    [catalog, services],
  );

  useEffect(() => {
    void loadSupportingData();
  }, [branchId]);

  async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, { cache: "no-store", ...init });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error?.message ?? "No se pudo completar la operación.");
    }
    return (payload?.data ?? payload) as T;
  }

  async function loadSupportingData() {
    setError(null);
    try {
      const [catalogRows, exceptionRows] = await Promise.all([
        fetchJson<ServiceCatalogItem[]>(`/api/admin-company/branches/${branchId}/services`),
        fetchJson<HourException[]>(`/api/admin-company/branches/${branchId}/hour-exceptions`),
      ]);
      setCatalog(catalogRows);
      setExceptions(exceptionRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las operaciones de la sucursal.");
    }
  }

  async function refreshAll() {
    const [detail, exceptionRows, catalogRows] = await Promise.all([
      fetchJson<BranchDetail>(`/api/admin-company/branches/${branchId}`),
      fetchJson<HourException[]>(`/api/admin-company/branches/${branchId}/hour-exceptions`),
      fetchJson<ServiceCatalogItem[]>(`/api/admin-company/branches/${branchId}/services`),
    ]);
    setContacts(detail.contacts);
    setSchedules(detail.schedules);
    setServices(detail.services);
    setExceptions(exceptionRows);
    setCatalog(catalogRows);
  }

  async function run(key: string, action: () => Promise<void>, success: string) {
    setBusy(key);
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(success);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la operación.");
    } finally {
      setBusy(null);
    }
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const contactId = contactForm.contactId;
    await run("contact", async () => {
      await fetchJson(contactId ? `/api/admin-company/branches/${branchId}/contacts/${contactId}` : `/api/admin-company/branches/${branchId}/contacts`, {
        method: contactId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactTypeId: Number(contactForm.contactTypeId),
          value: contactForm.value,
          label: contactForm.label || undefined,
          isPrimary: contactForm.isPrimary,
          isPublic: contactForm.isPublic,
        }),
      });
      setContactForm(emptyContact);
      await refreshAll();
    }, contactId ? "Contacto actualizado." : "Contacto creado.");
  }

  function editContact(contact: BranchContactItem) {
    setContactForm({
      ...emptyContact,
      contactTypeId: String(contact.contactTypeId),
      value: contact.value,
      label: contact.label ?? "",
      isPrimary: contact.isPrimary,
      isPublic: contact.isPublic,
      contactId: contact.contactId,
    });
  }

  async function removeContact(contactId: number) {
    if (!confirm("¿Eliminar este contacto?")) return;
    await run(`contact-${contactId}`, async () => {
      await fetchJson(`/api/admin-company/branches/${branchId}/contacts/${contactId}`, { method: "DELETE" });
      await refreshAll();
    }, "Contacto eliminado.");
  }

  async function markPrimary(contactId: number) {
    await run(`contact-${contactId}`, async () => {
      await fetchJson(`/api/admin-company/branches/${branchId}/contacts/${contactId}/primary`, { method: "PATCH" });
      await refreshAll();
    }, "Contacto principal actualizado.");
  }

  async function submitSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run("schedule", async () => {
      await fetchJson(`/api/admin-company/branches/${branchId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: scheduleForm.scheduleId,
          dayId: Number(scheduleForm.dayId),
          opening: scheduleForm.opening || undefined,
          closing: scheduleForm.closing || undefined,
          shiftNumber: Number(scheduleForm.shiftNumber),
        }),
      });
      setScheduleForm(emptySchedule);
      await refreshAll();
    }, scheduleForm.scheduleId ? "Horario actualizado." : "Horario creado.");
  }

  function editSchedule(item: BranchScheduleItem) {
    setScheduleForm({ scheduleId: item.scheduleId, dayId: String(item.dayId), opening: item.opening ?? "", closing: item.closing ?? "", shiftNumber: String(item.shiftNumber) });
  }

  async function removeSchedule(scheduleId: number) {
    if (!confirm("¿Eliminar este horario?")) return;
    await run(`schedule-${scheduleId}`, async () => {
      await fetchJson(`/api/admin-company/branches/${branchId}/schedules/${scheduleId}`, { method: "DELETE" });
      await refreshAll();
    }, "Horario eliminado.");
  }

  async function attachService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run("service", async () => {
      await fetchJson(`/api/admin-company/branches/${branchId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: Number(serviceForm.serviceId), isAvailable: serviceForm.isAvailable }),
      });
      setServiceForm({ serviceId: "", isAvailable: true });
      await refreshAll();
    }, "Servicio asociado.");
  }

  async function toggleService(service: BranchServiceItem) {
    await run(`service-${service.serviceId}`, async () => {
      await fetchJson(`/api/admin-company/branches/${branchId}/services/${service.serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !service.isAvailable }),
      });
      await refreshAll();
    }, "Disponibilidad actualizada.");
  }

  async function removeService(serviceId: number) {
    if (!confirm("¿Quitar este servicio de la sucursal?")) return;
    await run(`service-${serviceId}`, async () => {
      await fetchJson(`/api/admin-company/branches/${branchId}/services/${serviceId}`, { method: "DELETE" });
      await refreshAll();
    }, "Servicio retirado.");
  }

  async function submitException(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run("exception", async () => {
      const url = exceptionForm.exceptionId
        ? `/api/admin-company/branches/${branchId}/hour-exceptions/${exceptionForm.exceptionId}`
        : `/api/admin-company/branches/${branchId}/hour-exceptions`;
      await fetchJson(url, {
        method: exceptionForm.exceptionId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exceptionDate: exceptionForm.exceptionDate,
          isClosed: exceptionForm.isClosed,
          opening: exceptionForm.isClosed ? undefined : exceptionForm.opening || undefined,
          closing: exceptionForm.isClosed ? undefined : exceptionForm.closing || undefined,
          reason: exceptionForm.reason || undefined,
          notes: exceptionForm.notes || undefined,
        }),
      });
      setExceptionForm(emptyException);
      await refreshAll();
    }, exceptionForm.exceptionId ? "Excepción actualizada." : "Excepción registrada.");
  }

  function editException(item: HourException) {
    setExceptionForm({
      exceptionId: item.exceptionId,
      exceptionDate: item.exceptionDate.slice(0, 10),
      isClosed: item.isClosed,
      opening: item.opening ?? "",
      closing: item.closing ?? "",
      reason: item.reason ?? "",
      notes: item.notes ?? "",
    });
  }

  async function removeException(exceptionId: number) {
    if (!confirm("¿Eliminar esta excepción horaria?")) return;
    await run(`exception-${exceptionId}`, async () => {
      await fetchJson(`/api/admin-company/branches/${branchId}/hour-exceptions/${exceptionId}`, { method: "DELETE" });
      await refreshAll();
    }, "Excepción eliminada.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {message ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</p> : null}
          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p> : null}
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => run("refresh", refreshAll, "Datos actualizados.")} disabled={busy !== null}>
          <RefreshCcw className="mr-2 h-4 w-4" />Actualizar
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Contactos públicos" description="Crea, edita, elimina y define el canal principal de la sede.">
          <form className="space-y-3" onSubmit={submitContact}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Tipo ID" type="number" min="1" value={contactForm.contactTypeId} onChange={(event) => setContactForm({ ...contactForm, contactTypeId: event.target.value })} required />
              <Input label="Valor" value={contactForm.value} maxLength={200} onChange={(event) => setContactForm({ ...contactForm, value: event.target.value })} required />
              <Input label="Etiqueta" value={contactForm.label} maxLength={120} onChange={(event) => setContactForm({ ...contactForm, label: event.target.value })} />
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3 text-sm dark:bg-slate-900/50">
                <label><input type="checkbox" checked={contactForm.isPrimary} onChange={(event) => setContactForm({ ...contactForm, isPrimary: event.target.checked })} /> Principal</label>
                <label><input type="checkbox" checked={contactForm.isPublic} onChange={(event) => setContactForm({ ...contactForm, isPublic: event.target.checked })} /> Público</label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={busy !== null}><Phone className="mr-2 h-4 w-4" />{contactForm.contactId ? "Guardar contacto" : "Agregar contacto"}</Button>
              {contactForm.contactId ? <Button type="button" size="sm" variant="secondary" onClick={() => setContactForm(emptyContact)}><X className="mr-1 h-4 w-4" />Cancelar</Button> : null}
            </div>
          </form>
          <div className="mt-4 space-y-2">
            {contacts.map((contact) => (
              <div key={contact.contactId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                <div><p className="font-medium">{contact.typeLabel}: {contact.value}</p><p className="text-xs text-slate-500">{contact.label ?? `Tipo ${contact.contactTypeId}`}</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  {contact.isPrimary ? <StatusBadge label="Principal" tone="info" /> : <Button type="button" size="sm" variant="ghost" onClick={() => markPrimary(contact.contactId)} disabled={busy !== null}><Star className="h-4 w-4" /></Button>}
                  <Button type="button" size="sm" variant="secondary" onClick={() => editContact(contact)} disabled={busy !== null}><Pencil className="h-4 w-4" /></Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => removeContact(contact.contactId)} disabled={busy !== null}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Horarios semanales" description="Crea y modifica turnos por día.">
          <form className="space-y-3" onSubmit={submitSchedule}>
            <div className="grid gap-3 md:grid-cols-4">
              <Select label="Día" value={scheduleForm.dayId} onChange={(event) => setScheduleForm({ ...scheduleForm, dayId: event.target.value })}>{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, index) => <option key={day} value={index + 1}>{day}</option>)}</Select>
              <Input label="Apertura" type="time" value={scheduleForm.opening} onChange={(event) => setScheduleForm({ ...scheduleForm, opening: event.target.value })} required />
              <Input label="Cierre" type="time" value={scheduleForm.closing} onChange={(event) => setScheduleForm({ ...scheduleForm, closing: event.target.value })} required />
              <Input label="Turno" type="number" min="1" max="10" value={scheduleForm.shiftNumber} onChange={(event) => setScheduleForm({ ...scheduleForm, shiftNumber: event.target.value })} required />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={busy !== null}><CalendarPlus className="mr-2 h-4 w-4" />{scheduleForm.scheduleId ? "Guardar horario" : "Agregar horario"}</Button>
              {scheduleForm.scheduleId ? <Button type="button" size="sm" variant="secondary" onClick={() => setScheduleForm(emptySchedule)}><X className="mr-1 h-4 w-4" />Cancelar</Button> : null}
            </div>
          </form>
          <div className="mt-4 space-y-2">
            {schedules.map((item) => (
              <div key={item.scheduleId} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                <span>{item.dayName} · turno {item.shiftNumber} · {item.opening ?? "—"} - {item.closing ?? "—"}</span>
                <div className="flex gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => editSchedule(item)} disabled={busy !== null}><Pencil className="h-4 w-4" /></Button><Button type="button" size="sm" variant="danger" onClick={() => removeSchedule(item.scheduleId)} disabled={busy !== null}><Trash2 className="h-4 w-4" /></Button></div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Servicios disponibles" description="Asocia, activa, desactiva o retira servicios del catálogo.">
          <form className="space-y-3" onSubmit={attachService}>
            <Select label="Servicio" value={serviceForm.serviceId} onChange={(event) => setServiceForm({ ...serviceForm, serviceId: event.target.value })} required>
              <option value="">Selecciona servicio</option>
              {availableCatalog.map((item) => <option key={item.serviceId} value={item.serviceId}>{item.name}</option>)}
            </Select>
            <label className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm dark:bg-slate-900/50"><input type="checkbox" checked={serviceForm.isAvailable} onChange={(event) => setServiceForm({ ...serviceForm, isAvailable: event.target.checked })} />Disponible actualmente</label>
            <Button type="submit" size="sm" disabled={busy !== null || !serviceForm.serviceId}><Settings2 className="mr-2 h-4 w-4" />Asociar servicio</Button>
          </form>
          <div className="mt-4 space-y-2">
            {services.map((service) => (
              <div key={service.serviceId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                <div><p className="font-medium">{service.name}</p><p className="text-xs text-slate-500">{service.code}</p></div>
                <div className="flex items-center gap-2"><StatusBadge label={service.isAvailable ? "Disponible" : "No disponible"} tone={service.isAvailable ? "success" : "warning"} /><Button type="button" size="sm" variant="secondary" onClick={() => toggleService(service)} disabled={busy !== null}>{service.isAvailable ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}</Button><Button type="button" size="sm" variant="danger" onClick={() => removeService(service.serviceId)} disabled={busy !== null}><Trash2 className="h-4 w-4" /></Button></div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Excepciones de horario" description="Feriados, cierres o horarios especiales por fecha.">
          <form className="space-y-3" onSubmit={submitException}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Fecha" type="date" value={exceptionForm.exceptionDate} onChange={(event) => setExceptionForm({ ...exceptionForm, exceptionDate: event.target.value })} required />
              <label className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm dark:bg-slate-900/50"><input type="checkbox" checked={exceptionForm.isClosed} onChange={(event) => setExceptionForm({ ...exceptionForm, isClosed: event.target.checked, opening: event.target.checked ? "" : exceptionForm.opening, closing: event.target.checked ? "" : exceptionForm.closing })} />Cerrado todo el día</label>
              <Input label="Apertura especial" type="time" value={exceptionForm.opening} onChange={(event) => setExceptionForm({ ...exceptionForm, opening: event.target.value })} disabled={exceptionForm.isClosed} required={!exceptionForm.isClosed} />
              <Input label="Cierre especial" type="time" value={exceptionForm.closing} onChange={(event) => setExceptionForm({ ...exceptionForm, closing: event.target.value })} disabled={exceptionForm.isClosed} required={!exceptionForm.isClosed} />
            </div>
            <Input label="Motivo" value={exceptionForm.reason} maxLength={150} onChange={(event) => setExceptionForm({ ...exceptionForm, reason: event.target.value })} />
            <Textarea label="Notas" rows={2} value={exceptionForm.notes} maxLength={500} onChange={(event) => setExceptionForm({ ...exceptionForm, notes: event.target.value })} />
            <div className="flex gap-2"><Button type="submit" size="sm" disabled={busy !== null}>{exceptionForm.exceptionId ? "Guardar excepción" : "Registrar excepción"}</Button>{exceptionForm.exceptionId ? <Button type="button" size="sm" variant="secondary" onClick={() => setExceptionForm(emptyException)}><X className="mr-1 h-4 w-4" />Cancelar</Button> : null}</div>
          </form>
          <div className="mt-4 space-y-2">
            {exceptions.map((item) => (
              <div key={item.exceptionId} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                <div><b>{item.exceptionDate.slice(0, 10)}</b> · {item.isClosed ? "Cerrado" : `${item.opening ?? "—"} - ${item.closing ?? "—"}`}<p className="text-xs text-slate-500">{item.reason ?? item.notes ?? "Sin motivo"}</p></div>
                <div className="flex gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => editException(item)} disabled={busy !== null}><Pencil className="h-4 w-4" /></Button><Button type="button" size="sm" variant="danger" onClick={() => removeException(item.exceptionId)} disabled={busy !== null}><Trash2 className="h-4 w-4" /></Button></div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
