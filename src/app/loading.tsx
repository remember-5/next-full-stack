import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </main>
  );
}
