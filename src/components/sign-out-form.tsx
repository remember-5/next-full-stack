import { parseSetCookieHeader } from "better-auth/cookies";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { LogOutIcon } from "lucide-react";

import { auth } from "~/server/better-auth";
import { Button } from "~/components/ui/button";

async function signOutAction() {
  "use server";

  const response = await auth.api.signOut({
    asResponse: true,
    headers: await headers(),
  });
  const cookieStore = await cookies();
  const setCookieHeader = response.headers.get("set-cookie");

  if (setCookieHeader) {
    const responseCookies = parseSetCookieHeader(setCookieHeader);

    responseCookies.forEach((cookie, name) => {
      cookieStore.set(name, cookie.value, {
        domain: cookie.domain,
        expires: cookie.expires,
        httpOnly: cookie.httponly,
        maxAge: cookie["max-age"],
        path: cookie.path,
        sameSite: cookie.samesite,
        secure: cookie.secure,
      });
    });
  }

  redirect("/login");
}

export function SignOutForm({
  variant = "button",
}: {
  variant?: "button" | "menu";
}) {
  return (
    <form action={signOutAction}>
      {variant === "menu" ? (
        <button
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground"
          type="submit"
        >
          <LogOutIcon className="size-4" />
          Log out
        </button>
      ) : (
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      )}
    </form>
  );
}
