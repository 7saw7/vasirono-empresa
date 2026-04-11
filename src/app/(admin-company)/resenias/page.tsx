import { getCompanyContext } from "@/lib/auth/company-context";
import {
  getReviewMetricsQuery,
  listReviewsQuery,
} from "@/lib/db/queries/admin-company/reviews";
import { ReviewsView } from "./_components/ReviewsView";

export default async function ReviewsPage() {
  const { companyId } = await getCompanyContext("manageReviews");

  const [reviews, metrics] = await Promise.all([
    listReviewsQuery(companyId),
    getReviewMetricsQuery(companyId),
  ]);

  return <ReviewsView reviews={reviews} metrics={metrics} />;
}