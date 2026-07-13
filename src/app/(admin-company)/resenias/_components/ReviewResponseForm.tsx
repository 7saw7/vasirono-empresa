"use client";

import { useEffect, useState } from "react";
import type {
  ReviewItem,
  ReviewResponse,
} from "@/features/admin-company/reviews/types";
import { upsertReviewResponse } from "@/features/admin-company/reviews/service";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function ReviewResponseForm({
  review,
  onSaved,
}: {
  review: ReviewItem;
  onSaved: (response: ReviewResponse) => void;
}) {
  const [responseText, setResponseText] = useState(
    review.response?.responseText ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setResponseText(review.response?.responseText ?? "");
  }, [review.response?.responseText]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const trimmedResponse = responseText.trim();

    if (trimmedResponse.length < 3) {
      setLoading(false);
      setError("Escribe una respuesta de al menos 3 caracteres.");
      return;
    }

    if (trimmedResponse.length > 2000) {
      setLoading(false);
      setError("La respuesta no debe superar los 2000 caracteres.");
      return;
    }

    const wasResponded = Boolean(review.response);

    try {
      const saved = await upsertReviewResponse(review.id, {
        responseText: trimmedResponse,
      });
      setResponseText(saved.responseText);
      onSaved(saved);
      setMessage(
        wasResponded
          ? "Respuesta actualizada correctamente."
          : "Respuesta enviada correctamente."
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo guardar la respuesta."
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
        onChange={(event) => setResponseText(event.target.value)}
        rows={4}
        placeholder="Escribe una respuesta profesional y clara para esta reseña."
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {responseText.trim().length}/2000 caracteres
        </p>

        <div className="min-h-5">
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : message ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={loading || responseText.trim().length < 3}
        >
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
