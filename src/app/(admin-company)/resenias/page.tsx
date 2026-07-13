import { notFound } from "next/navigation";
import { getCompanyContext } from "@/lib/auth/company-context";
import {
  getReviewMetricsQuery,
  getReviewsPayloadQuery,
} from "@/lib/db/queries/admin-company/reviews";
import { ReviewsView } from "./_components/ReviewsView";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string }>;
}) {
  const { companyId } = await getCompanyContext("manageReviews");
  const raw = (await searchParams).branchId;
  const branchId = raw ? Number(raw) : undefined;

  if (raw && (!Number.isInteger(branchId) || (branchId ?? 0) <= 0)) {
    notFound();
  }

  const filters = {
    branchId,
    page: 1,
    pageSize: 10,
  };

  const [payload, metrics] = await Promise.all([
    getReviewsPayloadQuery(companyId, filters),
    getReviewMetricsQuery(companyId, filters),
  ]);

  return (
    <ReviewsView
      initialPayload={{ ...payload, metrics }}
      branchId={branchId}
    />
  );
}
