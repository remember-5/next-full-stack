import { requireAdminSession } from "~/server/better-auth/guards";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminSession();

  return children;
}
