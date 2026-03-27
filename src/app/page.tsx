import { redirect } from "next/navigation";

import { getHomeRedirect } from "~/lib/auth/routing";
import { getSession } from "~/server/better-auth/server";

export default async function Home() {
  const session = await getSession();
  redirect(getHomeRedirect(session));
}
