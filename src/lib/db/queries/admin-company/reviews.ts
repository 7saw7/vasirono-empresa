import { getDb } from "@/lib/db/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { AppError } from "@/lib/errors/app-error";
import { mapReviewItem, mapReviewMetrics, mapReviewResponse } from "@/features/admin-company/reviews/mapper";
import type {
  ReviewFilters,
  UpsertReviewResponseInput,
} from "@/features/admin-company/reviews/types";

type ReviewRow = {
  id: number;
  branch_id: number;
  branch_name: string;
  user_name: string;
  rating: number;
  comment: string | null;
  validated: boolean;
  created_at: string;
  usefulness_score: number | null;
  likes_count: number | null;
  dislikes_count: number | null;
  media_count: number | null;
  response_id: number | null;
  response_company_id: number | null;
  responder_name: string | null;
  response_text: string | null;
  response_status_label: string | null;
  responded_at: string | null;
};

export async function listReviewsQuery(filters: ReviewFilters = {}) {
  const db = getDb();
  const { companyId } = await getCompanyContext();

  const conditions: string[] = ["cb.company_id = $1"];
  const params: Array<string | number | boolean> = [companyId];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    const index = params.length;
    conditions.push(
      `(COALESCE(r.comment, '') ILIKE $${index} OR u.name ILIKE $${index} OR cb.name ILIKE $${index})`
    );
  }

  if (filters.rating) {
    params.push(filters.rating);
    conditions.push(`r.rating = $${params.length}`);
  }

  if (filters.branchId) {
    params.push(filters.branchId);
    conditions.push(`r.branch_id = $${params.length}`);
  }

  if (typeof filters.responded === "boolean") {
    conditions.push(
      filters.responded ? "rr.id IS NOT NULL" : "rr.id IS NULL"
    );
  }

  if (typeof filters.validated === "boolean") {
    params.push(filters.validated);
    conditions.push(`r.validated = $${params.length}`);
  }

  const sql = `
    SELECT
      r.id,
      r.branch_id,
      cb.name AS branch_name,
      u.name AS user_name,
      r.rating,
      r.comment,
      r.validated,
      r.created_at::text,
      rus.final_score AS usefulness_score,
      rus.likes_count,
      rus.dislikes_count,
      rus.media_count,
      rr.id AS response_id,
      rr.company_id AS response_company_id,
      responder.name AS responder_name,
      rr.response_text,
      rrs.name AS response_status_label,
      rr.responded_at::text
    FROM reviews r
    INNER JOIN company_branches cb ON cb.branch_id = r.branch_id
    INNER JOIN users u ON u.id = r.user_id
    LEFT JOIN review_usefulness_scores rus ON rus.review_id = r.id
    LEFT JOIN review_responses rr ON rr.review_id = r.id
    LEFT JOIN users responder ON responder.id = rr.responder_user_id
    LEFT JOIN review_response_statuses rrs ON rrs.id = rr.status_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY r.created_at DESC
    LIMIT 100
  `;

  const rows = await db.query<ReviewRow>(sql, params);

  return rows.map((row) =>
    mapReviewItem({
      id: row.id,
      branch_id: row.branch_id,
      branch_name: row.branch_name,
      user_name: row.user_name,
      rating: row.rating,
      comment: row.comment,
      validated: row.validated,
      created_at: row.created_at,
      usefulness_score: row.usefulness_score,
      likes_count: row.likes_count,
      dislikes_count: row.dislikes_count,
      media_count: row.media_count,
      response: row.response_id
        ? {
            id: row.response_id,
            review_id: row.id,
            company_id: row.response_company_id ?? companyId,
            responder_name: row.responder_name ?? "Equipo empresa",
            response_text: row.response_text ?? "",
            status_label: row.response_status_label ?? "Respondida",
            responded_at: row.responded_at ?? new Date().toISOString(),
          }
        : null,
    })
  );
}

export async function getReviewMetricsQuery() {
  const db = getDb();
  const { companyId } = await getCompanyContext();

  const sql = `
    WITH base AS (
      SELECT
        r.id,
        r.rating,
        r.validated,
        rr.id AS response_id
      FROM reviews r
      INNER JOIN company_branches cb ON cb.branch_id = r.branch_id
      LEFT JOIN review_responses rr ON rr.review_id = r.id
      WHERE cb.company_id = $1
    )
    SELECT
      COUNT(*)::int AS total_reviews,
      COALESCE(AVG(rating), 0)::numeric AS average_rating,
      COALESCE(
        100.0 * SUM(CASE WHEN response_id IS NOT NULL THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
        0
      )::numeric AS response_rate,
      COALESCE(
        100.0 * SUM(CASE WHEN validated THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
        0
      )::numeric AS validated_rate
    FROM base
  `;

  const [row] = await db.query<{
    total_reviews: number;
    average_rating: number;
    response_rate: number;
    validated_rate: number;
  }>(sql, [companyId]);

  return mapReviewMetrics(
    row ?? {
      total_reviews: 0,
      average_rating: 0,
      response_rate: 0,
      validated_rate: 0,
    }
  );
}

export async function upsertReviewResponseQuery(
  reviewId: number,
  input: UpsertReviewResponseInput
) {
  const db = getDb();
  const { companyId, userId } = await getCompanyContext();

  const reviewOwnershipSql = `
    SELECT r.id
    FROM reviews r
    INNER JOIN company_branches cb ON cb.branch_id = r.branch_id
    WHERE r.id = $1 AND cb.company_id = $2
    LIMIT 1
  `;

  const ownedRows = await db.query<{ id: number }>(reviewOwnershipSql, [
    reviewId,
    companyId,
  ]);

  if (!ownedRows.length) {
    throw new AppError(
      "NOT_FOUND",
      "La reseña no existe o no pertenece a tu empresa.",
      404
    );
  }

  const upsertSql = `
    INSERT INTO review_responses (
      review_id,
      company_id,
      responder_user_id,
      status_id,
      response_text,
      responded_at
    )
    VALUES (
      $1,
      $2,
      $3,
      (
        SELECT id
        FROM review_response_statuses
        ORDER BY id ASC
        LIMIT 1
      ),
      $4,
      NOW()
    )
    ON CONFLICT (review_id)
    DO UPDATE SET
      response_text = EXCLUDED.response_text,
      responder_user_id = EXCLUDED.responder_user_id,
      responded_at = NOW(),
      updated_at = NOW()
    RETURNING
      id,
      review_id,
      company_id,
      response_text,
      responded_at::text
  `;

  const [saved] = await db.query<{
    id: number;
    review_id: number;
    company_id: number;
    response_text: string;
    responded_at: string;
  }>(upsertSql, [reviewId, companyId, userId, input.responseText]);

  return mapReviewResponse({
    id: saved.id,
    review_id: saved.review_id,
    company_id: saved.company_id,
    responder_name: "Equipo empresa",
    response_text: saved.response_text,
    status_label: "Respondida",
    responded_at: saved.responded_at,
  });
}