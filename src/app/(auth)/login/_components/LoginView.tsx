import { LoginForm } from "./LoginForm";

export function LoginView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-neutral-400">
            Vasirono
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
            Acceder al panel empresa
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Ingresa con tu cuenta empresarial para gestionar tu negocio.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}