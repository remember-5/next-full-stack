import { AuthStatusCard } from "~/components/auth-status-card";
import type { Session as AuthSession } from "~/server/better-auth/config";
import { requireAdminSession } from "~/server/better-auth/guards";

export default async function AdminPage() {
  const session = await requireAdminSession();
  const authStatusSession: Pick<AuthSession, "user"> = {
    user: session.user as AuthSession["user"],
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
      <section className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Admin only
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="text-sm text-muted-foreground">
          This is the root of the `/admin/*` area for future management pages.
        </p>
      </section>
      <AuthStatusCard
        session={authStatusSession}
        title="Admin account"
        description="Your account passed the admin guard and can access administrator-only pages."
      />
    </main>
  );
}
