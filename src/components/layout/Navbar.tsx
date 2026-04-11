import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 xl:px-8">
        <Link href="/" className="text-sm font-semibold tracking-tight text-neutral-950">
          Vasirono
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm text-neutral-600 transition hover:text-neutral-950"
          >
            Inicio
          </Link>
          <Link
            href="/planes"
            className="text-sm text-neutral-600 transition hover:text-neutral-950"
          >
            Planes
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-neutral-950"
          >
            Acceder
          </Link>
        </nav>
      </div>
    </header>
  );
}