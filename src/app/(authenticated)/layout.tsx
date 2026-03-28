import { AppBreadcrumbs } from "~/components/app-breadcrumbs";
import { AppSidebar } from "~/components/app-sidebar";
import { SignOutForm } from "~/components/sign-out-form";
import { Separator } from "~/components/ui/separator";
import { normalizeUserRole } from "~/lib/auth/roles";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { requireSession } from "~/server/better-auth/guards";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();
  const userRole = normalizeUserRole(session.user.role);

  return (
    <SidebarProvider>
      <AppSidebar
        signOutSlot={<SignOutForm variant="menu" />}
        user={{
          avatar: session.user.image,
          email: session.user.email,
          name: session.user.name,
          role: userRole,
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <AppBreadcrumbs role={userRole} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
