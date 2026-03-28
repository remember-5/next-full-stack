import Link from "next/link";

import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col items-start justify-center gap-4 p-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        404
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you requested does not exist in this template.
      </p>
      <Button asChild>
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
    </main>
  );
}
