import { AuthStatusCard } from "~/components/auth-status-card";
import type { Session as AuthSession } from "~/server/better-auth/config";
import { requireSession } from "~/server/better-auth/guards";

export default async function DashboardPage() {
  const session = await requireSession();
  const authStatusSession: Pick<AuthSession, "user"> = {
    user: session.user as AuthSession["user"],
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
      <section className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Protected route
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          All authenticated users land here and share the same application shell.
        </p>
      </section>
      <AuthStatusCard
        session={authStatusSession}
        description="Your session is valid, and navigation now lives in the shared sidebar."
      />
    </main>
  );
}
