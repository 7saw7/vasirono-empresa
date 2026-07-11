import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  className?: string;
  render: (item: T) => ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (item: T, index: number) => string;
  caption?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
};

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  caption,
  emptyTitle = "Sin datos",
  emptyDescription = "No hay registros para mostrar en este momento.",
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#101821]">
        <div className="animate-pulse p-4">
          <div className="mb-4 h-5 w-48 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-950 dark:text-slate-100">
            {emptyTitle}
          </h3>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#101821]">
      <table className="min-w-full border-collapse text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}

        <thead className="bg-slate-50 dark:bg-slate-900/70">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr
              key={getRowKey(item, index)}
              className="border-t border-slate-200 align-top transition-colors hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/35"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3.5 text-slate-700 dark:text-slate-300 ${column.className ?? ""}`}
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
