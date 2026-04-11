"use client";

import { useMemo, useState } from "react";
import type {
  ReviewFilters,
  ReviewItem,
  ReviewMetrics,
} from "@/features/admin-company/reviews/types";
import { AdminCompanyHeader } from "@/components/layout/AdminCompanyHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { ReviewList } from "./ReviewList";

export function ReviewsView({
  reviews,
  metrics,
}: {
  reviews: ReviewItem[];
  metrics: ReviewMetrics | null;
}) {
  const [filters, setFilters] = useState<ReviewFilters>({
    search: "",
    rating: undefined,
    responded: undefined,
    validated: undefined,
  });

  const filtered = useMemo(() => {
    return reviews.filter((review) => {
      const search = (filters.search ?? "").trim().toLowerCase();

      const matchesSearch =
        !search ||
        review.comment.toLowerCase().includes(search) ||
        review.userName.toLowerCase().includes(search) ||
        review.branchName.toLowerCase().includes(search);

      const matchesRating =
        typeof filters.rating !== "number" || review.rating === filters.rating;

      const matchesResponded =
        typeof filters.responded !== "boolean" ||
        (filters.responded ? !!review.response : !review.response);

      const matchesValidated =
        typeof filters.validated !== "boolean" ||
        review.validated === filters.validated;

      return (
        matchesSearch &&
        matchesRating &&
        matchesResponded &&
        matchesValidated
      );
    });
  }, [reviews, filters]);

  return (
    <div className="space-y-6">
      <AdminCompanyHeader
        title="Reseñas"
        description="Monitorea comentarios, validación y respuestas de tu negocio."
      />

      {metrics ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total reseñas"
            value={String(metrics.totalReviews)}
          />
          <StatCard
            label="Rating promedio"
            value={metrics.averageRating.toFixed(2)}
          />
          <StatCard
            label="Tasa de respuesta"
            value={`${metrics.responseRate.toFixed(2)}%`}
          />
          <StatCard
            label="Tasa validada"
            value={`${metrics.validatedRate.toFixed(2)}%`}
          />
        </div>
      ) : null}

      <SectionCard
        title="Filtros"
        description="Refina la lista de reseñas según tu necesidad."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Buscar"
            value={filters.search ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="Usuario, comentario o sucursal"
          />

          <Select
            label="Rating"
            value={
              typeof filters.rating === "number" ? String(filters.rating) : ""
            }
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                rating: e.target.value ? Number(e.target.value) : undefined,
              }))
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
            value={
              typeof filters.responded === "boolean"
                ? String(filters.responded)
                : ""
            }
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                responded:
                  e.target.value === ""
                    ? undefined
                    : e.target.value === "true",
              }))
            }
          >
            <option value="">Todas</option>
            <option value="true">Respondidas</option>
            <option value="false">Sin responder</option>
          </Select>

          <Select
            label="Validación"
            value={
              typeof filters.validated === "boolean"
                ? String(filters.validated)
                : ""
            }
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                validated:
                  e.target.value === ""
                    ? undefined
                    : e.target.value === "true",
              }))
            }
          >
            <option value="">Todas</option>
            <option value="true">Validadas</option>
            <option value="false">No validadas</option>
          </Select>
        </div>
      </SectionCard>

      <ReviewList reviews={filtered} />
    </div>
  );
}