import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-neutral-500 sm:px-6 md:flex-row md:items-center md:justify-between xl:px-8">
        <p>© {new Date().getFullYear()} Vasirono. Todos los derechos reservados.</p>

        <div className="flex items-center gap-4">
          <Link href="/" className="transition hover:text-neutral-950">
            Inicio
          </Link>
          <Link href="/planes" className="transition hover:text-neutral-950">
            Planes
          </Link>
          <Link href="/login" className="transition hover:text-neutral-950">
            Acceder
          </Link>
        </div>
      </div>
    </footer>
  );
}