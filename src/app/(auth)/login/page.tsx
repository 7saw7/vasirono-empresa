import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginView } from "./_components/LoginView";

type LoginPageProps = {
  searchParams?: Promise<{
    email?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const email = typeof params?.email === "string" ? params.email : "";

  return <LoginView email={email} />;
}
