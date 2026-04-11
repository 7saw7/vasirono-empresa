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
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div className="animate-pulse p-4">
          <div className="mb-4 h-5 w-48 rounded-xl bg-neutral-200" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 rounded-xl bg-neutral-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-center">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-neutral-950">
            {emptyTitle}
          </h3>
          <p className="text-sm leading-6 text-neutral-600">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white">
      <table className="min-w-full border-collapse text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}

        <thead className="bg-neutral-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 text-left font-medium text-neutral-600 ${column.className ?? ""}`}
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
              className="border-t border-neutral-200 align-top"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-neutral-800 ${column.className ?? ""}`}
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