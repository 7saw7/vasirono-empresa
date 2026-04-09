export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Vasirono. Todos los derechos reservados.</p>
        <p>Panel y experiencia empresarial en construcción modular.</p>
      </div>
    </footer>
  );
}