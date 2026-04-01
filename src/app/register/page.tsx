import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";
import { redirect } from "next/navigation";
import { getSession } from "~/server/better-auth/server";

export const metadata = {
  title: "Register",
};

type RegisterPageProps = {
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

export default async function RegisterPage(props: RegisterPageProps) {
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
      <RegisterForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
