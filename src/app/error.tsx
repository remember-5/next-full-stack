"use client";

import { useEffect } from "react";

import { Button } from "~/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col items-start justify-center gap-4 p-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Unexpected error
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-sm text-muted-foreground">
        Retry the action or refresh the page. If the problem persists, inspect
        the server logs.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
