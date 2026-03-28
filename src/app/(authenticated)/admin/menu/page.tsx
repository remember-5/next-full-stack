import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default async function AdminMenuPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
      <section className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Admin only
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Menu</h1>
        <p className="text-sm text-muted-foreground">
          This page is reserved for future admin menu management.
        </p>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Menu management</CardTitle>
          <CardDescription>
            The sidebar now exposes this admin page so future `/admin/*` pages
            have a consistent home in the application shell.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No menu administration tools are implemented yet.
        </CardContent>
      </Card>
    </main>
  );
}
