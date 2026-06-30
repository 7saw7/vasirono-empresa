import { ActivateAccountView } from "./_components/ActivateAccountView";

export const dynamic = "force-dynamic";

type ActivateAccountPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function ActivateAccountPage({
  searchParams,
}: ActivateAccountPageProps) {
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";

  return <ActivateAccountView token={token} />;
}
