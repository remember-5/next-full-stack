import { redirect } from "next/navigation";
import { getSession } from "~/server/better-auth/server";

export default async function Page() {
  const session = await getSession();

  redirect(session?.user ? "/dashboard/overview" : "/login");
}
