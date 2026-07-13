import { notFound } from "next/navigation";
import { getCompanyContext } from "@/lib/auth/company-context";
import { getReviewMetricsQuery, listReviewsQuery } from "@/lib/db/queries/admin-company/reviews";
import { ReviewsView } from "./_components/ReviewsView";

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ branchId?: string }> }) {
  const { companyId } = await getCompanyContext("manageReviews");
  const raw = (await searchParams).branchId;
  const branchId = raw ? Number(raw) : undefined;
  if (raw && (!Number.isInteger(branchId) || (branchId ?? 0) <= 0)) notFound();
  const filters = branchId ? { branchId } : {};
  const [reviews, metrics] = await Promise.all([
    listReviewsQuery(companyId, filters),
    getReviewMetricsQuery(companyId, filters),
  ]);
  return <ReviewsView reviews={reviews} metrics={metrics} branchId={branchId} />;
}
