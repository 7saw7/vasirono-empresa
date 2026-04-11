"use client";

import { useState } from "react";
import type { ReviewItem } from "@/features/admin-company/reviews/types";
import { upsertReviewResponse } from "@/features/admin-company/reviews/service";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function ReviewResponseForm({ review }: { review: ReviewItem }) {
  const [responseText, setResponseText] = useState(
    review.response?.responseText ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await upsertReviewResponse(review.id, { responseText });
      setMessage(
        review.response
          ? "Respuesta actualizada correctamente."
          : "Respuesta enviada correctamente."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la respuesta."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Textarea
        label={review.response ? "Editar respuesta" : "Responder reseña"}
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
        rows={4}
        placeholder="Escribe una respuesta profesional y clara para esta reseña."
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : message ? (
            <p className="text-sm text-emerald-600">{message}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : review.response
            ? "Actualizar respuesta"
            : "Responder"}
        </Button>
      </div>
    </form>
  );
}