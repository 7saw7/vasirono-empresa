import { Button } from "@/components/ui/Button";

export function AdminCompanyHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {action}
        <Button variant="secondary" size="sm">
          Ayuda
        </Button>
      </div>
    </div>
  );
}