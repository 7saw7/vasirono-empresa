import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginView } from "./_components/LoginView";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <LoginView />;
}