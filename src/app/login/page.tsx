import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { redirect } from "next/navigation";
import { getSession } from "~/server/better-auth/server";

export const metadata = {
  title: "Login",
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

function getRedirectTarget(nextParam?: string | string[]) {
  const value = Array.isArray(nextParam) ? nextParam[0] : nextParam;

  if (value?.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/dashboard/overview";
}

export default async function LoginPage(props: LoginPageProps) {
  const [{ next }, session] = await Promise.all([
    props.searchParams,
    getSession(),
  ]);
  const redirectTo = getRedirectTarget(next);

  if (session?.user) {
    redirect(redirectTo);
  }

  return (
    <AuthShell>
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
