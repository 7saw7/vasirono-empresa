import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ReviewItem } from "@/features/admin-company/reviews/types";
import { formatDateTime } from "@/lib/utils/dates";
import { ReviewResponseForm } from "./ReviewResponseForm";

function renderStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  return (
    <SectionCard
      title="Listado de reseñas"
      description="Vista consolidada de comentarios y respuestas del negocio."
    >
      {reviews.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay reseñas para mostrar con los filtros actuales.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                      {review.userName}
                    </h3>

                    <StatusBadge
                      label={review.branchName}
                      tone="default"
                    />

                    {review.validated ? (
                      <StatusBadge label="Validada" tone="success" />
                    ) : (
                      <StatusBadge label="No validada" tone="warning" />
                    )}

                    {review.response ? (
                      <StatusBadge label="Respondida" tone="info" />
                    ) : (
                      <StatusBadge label="Sin responder" tone="danger" />
                    )}
                  </div>

                  <p className="mt-2 text-sm font-medium text-amber-500">
                    {renderStars(review.rating)}
                  </p>
                </div>

                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {formatDateTime(review.createdAt)}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {review.comment || "Sin comentario."}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Utilidad: {review.usefulnessScore ?? 0}</span>
                <span>Likes: {review.likesCount}</span>
                <span>Dislikes: {review.dislikesCount}</span>
                <span>Media: {review.mediaCount}</span>
              </div>

              {review.response ? (
                <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                        Respuesta de empresa
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {review.response.responderName} ·{" "}
                        {formatDateTime(review.response.respondedAt)}
                      </p>
                    </div>

                    <StatusBadge
                      label={review.response.statusLabel}
                      tone="info"
                    />
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {review.response.responseText}
                  </p>
                </div>
              ) : null}

              <div className="mt-5">
                <ReviewResponseForm review={review} />
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}