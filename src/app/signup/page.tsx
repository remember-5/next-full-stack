import { GalleryVerticalEndIcon } from "lucide-react";

import { SignupForm } from "~/components/signup-form";
import { getSafeRedirectTarget } from "~/lib/auth/routing";
import { redirectAuthenticatedUser } from "~/server/better-auth/guards";

type SignupPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const nextPath = getSafeRedirectTarget(
    Array.isArray(resolvedSearchParams?.next)
      ? resolvedSearchParams.next[0]
      : resolvedSearchParams?.next,
  );

  await redirectAuthenticatedUser(nextPath);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          Acme Inc.
        </a>
        <SignupForm nextPath={nextPath} />
      </div>
    </div>
  );
}
