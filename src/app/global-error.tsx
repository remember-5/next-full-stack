"use client";

import { Button } from "~/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col items-start justify-center gap-4 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Fatal error
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            The application shell failed to render
          </h1>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={reset}>Retry render</Button>
        </main>
      </body>
    </html>
  );
}
