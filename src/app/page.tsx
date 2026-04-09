import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatCard } from "@/components/ui/StatCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Vasirono
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-950 md:text-6xl">
              Plataforma de descubrimiento y control empresarial.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
              Administra cómo aparece tu negocio, revisa sucursales, responde
              reseñas y entiende tu rendimiento desde un panel profesional.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login">
                <Button size="lg">Entrar al panel</Button>
              </Link>
              <Button variant="secondary" size="lg">
                Ver más
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <StatCard
              label="Empresas activas"
              value="120+"
              helper="Referencia visual temporal"
            />
            <StatCard
              label="Sucursales gestionadas"
              value="480+"
              helper="Preparado para múltiples sedes"
            />
            <StatCard
              label="Reseñas procesadas"
              value="9.2k"
              helper="Base para reputación y analytics"
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20">
          <SectionCard
            title="Base modular lista para crecer"
            description="Esta primera base del proyecto prepara navegación, shell y componentes reutilizables para las vistas del panel."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 p-4">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Admin company
                </h3>
                <p className="mt-2 text-sm text-neutral-500">
                  Dashboard, sucursales, perfil del negocio, reseñas,
                  analytics, verificaciones y configuración.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 p-4">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Escalable por dominios
                </h3>
                <p className="mt-2 text-sm text-neutral-500">
                  Servicios, tipos, schemas, mappers y queries separados por
                  módulo para mantener orden y mantenibilidad.
                </p>
              </div>
            </div>
          </SectionCard>
        </section>
      </main>

      <Footer />
    </div>
  );
}