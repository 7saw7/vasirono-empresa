import { getCompanyContext } from "@/lib/auth/company-context";
import { getGalleryOverviewQuery } from "@/lib/db/queries/admin-company/media";
import { GalleryView } from "./_components/GalleryView";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const { companyId } = await getCompanyContext("manageMedia");
  const overview = await getGalleryOverviewQuery(companyId);
  return <GalleryView overview={overview} />;
}
