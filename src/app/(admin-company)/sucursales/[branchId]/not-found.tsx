import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function BranchNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-500">Sucursales</p>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
            No encontramos la sucursal solicitada
          </h2>
          <p className="text-sm leading-6 text-neutral-600">
            Puede que haya sido eliminada, que no pertenezca a tu empresa o que
            el enlace ya no sea válido.
          </p>
        </div>

        <div className="mt-6">
          <Button asChild>
            <Link href="/sucursales">Ir a sucursales</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}