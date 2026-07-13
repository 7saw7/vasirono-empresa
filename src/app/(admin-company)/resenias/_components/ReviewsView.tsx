"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ReviewFilters,
  ReviewResponse,
  ReviewsPayload,
} from "@/features/admin-company/reviews/types";
import { getReviews } from "@/features/admin-company/reviews/service";
import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { ReviewList } from "./ReviewList";

export function ReviewsView({
  initialPayload,
  branchId,
}: {
  initialPayload: ReviewsPayload;
  branchId?: number;
}) {
  const [payload, setPayload] = useState(initialPayload);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<ReviewFilters>({
    branchId,
    page: initialPayload.meta.page,
    pageSize: initialPayload.meta.pageSize,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const initialRequestSkipped = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const normalized = searchInput.trim() || undefined;
      setFilters((previous) => {
        if (previous.search === normalized) return previous;
        return { ...previous, search: normalized, page: 1 };
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const requestKey = useMemo(
    () =>
      JSON.stringify({
        search: filters.search ?? "",
        rating: filters.rating ?? null,
        branchId: filters.branchId ?? null,
        responded: filters.responded ?? null,
        validated: filters.validated ?? null,
        page: filters.page ?? 1,
        pageSize: filters.pageSize ?? 10,
      }),
    [filters]
  );

  useEffect(() => {
    if (!initialRequestSkipped.current && refreshNonce === 0) {
      initialRequestSkipped.current = true;
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void getReviews(filters, true, controller.signal)
      .then((nextPayload) => {
        if (nextPayload.meta.page > nextPayload.meta.totalPages) {
          setFilters((previous) => ({
            ...previous,
            page: nextPayload.meta.totalPages,
          }));
          return;
        }

        setPayload(nextPayload);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudieron actualizar las reseñas."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filters, requestKey, refreshNonce]);

  function updateFilter(patch: Partial<ReviewFilters>) {
    setFilters((previous) => ({ ...previous, ...patch, page: 1 }));
  }

  function handleResponseSaved(reviewId: number, response: ReviewResponse) {
    setPayload((previous) => ({
      ...previous,
      reviews: previous.reviews.map((review) =>
        review.id === reviewId ? { ...review, response } : review
      ),
    }));
    setRefreshNonce((value) => value + 1);
  }

  const metrics = payload.metrics;
  const meta = payload.meta;
  const firstItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const lastItem = Math.min(meta.total, meta.page * meta.pageSize);

  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title="Reseñas"
        description={
          branchId
            ? "Reseñas filtradas para la sucursal seleccionada."
            : "Monitorea comentarios, validación y respuestas de tu negocio."
        }
      />

      {branchId ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100">
          <span>Filtro de sucursal activo: #{branchId}</span>
          <Button asChild variant="secondary" size="sm">
            <Link href="/resenias">Ver todas las sucursales</Link>
          </Button>
        </div>
      ) : null}

      {metrics ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total reseñas" value={String(metrics.totalReviews)} />
          <StatCard label="Rating promedio" value={metrics.averageRating.toFixed(2)} />
          <StatCard label="Tasa de respuesta" value={`${metrics.responseRate.toFixed(2)}%`} />
          <StatCard label="Tasa validada" value={`${metrics.validatedRate.toFixed(2)}%`} />
        </div>
      ) : null}

      <SectionCard
        title="Filtros"
        description="Los filtros consultan todo el historial, no solo la página visible."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Input
            label="Buscar"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Usuario, comentario o sucursal"
          />

          <Select
            label="Rating"
            value={typeof filters.rating === "number" ? String(filters.rating) : ""}
            onChange={(event) =>
              updateFilter({
                rating: event.target.value ? Number(event.target.value) : undefined,
              })
            }
          >
            <option value="">Todos</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </Select>

          <Select
            label="Respuesta"
            value={typeof filters.responded === "boolean" ? String(filters.responded) : ""}
            onChange={(event) =>
              updateFilter({
                responded:
                  event.target.value === ""
                    ? undefined
                    : event.target.value === "true",
              })
            }
          >
            <option value="">Todas</option>
            <option value="true">Respondidas</option>
            <option value="false">Sin responder</option>
          </Select>

          <Select
            label="Validación"
            value={typeof filters.validated === "boolean" ? String(filters.validated) : ""}
            onChange={(event) =>
              updateFilter({
                validated:
                  event.target.value === ""
                    ? undefined
                    : event.target.value === "true",
              })
            }
          >
            <option value="">Todas</option>
            <option value="true">Validadas</option>
            <option value="false">No validadas</option>
          </Select>

          <Select
            label="Por página"
            value={String(filters.pageSize ?? 10)}
            onChange={(event) => updateFilter({ pageSize: Number(event.target.value) })}
          >
            <option value="10">10 reseñas</option>
            <option value="20">20 reseñas</option>
            <option value="50">50 reseñas</option>
          </Select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            La búsqueda se ejecuta automáticamente después de una pausa breve.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput("");
              setFilters({ branchId, page: 1, pageSize: 10 });
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </SectionCard>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <ReviewList
        reviews={payload.reviews}
        loading={loading}
        onResponseSaved={handleResponseSaved}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900/70">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {meta.total === 0
            ? "Sin resultados"
            : `Mostrando ${firstItem}-${lastItem} de ${meta.total} reseñas`}
        </p>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading || !meta.hasPreviousPage}
            onClick={() =>
              setFilters((previous) => ({
                ...previous,
                page: Math.max(1, (previous.page ?? 1) - 1),
              }))
            }
          >
            Anterior
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Página {meta.page} de {meta.totalPages}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading || !meta.hasNextPage}
            onClick={() =>
              setFilters((previous) => ({
                ...previous,
                page: Math.min(meta.totalPages, (previous.page ?? 1) + 1),
              }))
            }
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
