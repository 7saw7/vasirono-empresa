export default function AdminCompanyLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-56 rounded-xl bg-neutral-200" />
        <div className="h-4 w-80 max-w-full rounded-xl bg-neutral-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-3xl border border-neutral-200 bg-white"
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-80 rounded-3xl border border-neutral-200 bg-white" />
        <div className="h-80 rounded-3xl border border-neutral-200 bg-white" />
      </div>
    </div>
  );
}