import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type {
  ReviewItem,
  ReviewResponse,
} from "@/features/admin-company/reviews/types";
import { formatDateTime } from "@/lib/utils/dates";
import { ReviewResponseForm } from "./ReviewResponseForm";

function renderStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

export function ReviewList({
  reviews,
  loading = false,
  onResponseSaved,
}: {
  reviews: ReviewItem[];
  loading?: boolean;
  onResponseSaved: (reviewId: number, response: ReviewResponse) => void;
}) {
  return (
    <SectionCard
      title="Listado de reseñas"
      description="Vista consolidada de comentarios, multimedia y respuestas del negocio."
    >
      {loading ? (
        <p className="mb-4 text-sm text-sky-600 dark:text-sky-400">
          Actualizando resultados...
        </p>
      ) : null}

      {reviews.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay reseñas para mostrar con los filtros actuales.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                      {review.userName}
                    </h3>

                    <StatusBadge label={review.branchName} tone="default" />

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

              {review.media.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {review.media.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                      aria-label="Abrir archivo multimedia de la reseña"
                    >
                      {item.mediaType.toLowerCase().includes("video") ? (
                        <video
                          src={item.url}
                          className="h-full w-full object-cover"
                          preload="metadata"
                          muted
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.altText ?? "Imagen adjunta a la reseña"}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      )}
                    </a>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Utilidad: {review.usefulnessScore ?? 0}</span>
                <span>Likes: {review.likesCount}</span>
                <span>Dislikes: {review.dislikesCount}</span>
                <span>Media: {review.mediaCount}</span>
              </div>

              {review.response ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
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

                    <StatusBadge label={review.response.statusLabel} tone="info" />
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {review.response.responseText}
                  </p>
                </div>
              ) : null}

              <div className="mt-5">
                <ReviewResponseForm
                  review={review}
                  onSaved={(response) => onResponseSaved(review.id, response)}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
