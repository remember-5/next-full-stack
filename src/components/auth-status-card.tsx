import type { Session as AuthSession } from "~/server/better-auth/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type AuthStatusCardProps = {
  description?: string;
  session: Pick<AuthSession, "user">;
  title?: string;
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
      <dt className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function AuthStatusCard({
  description = "You are viewing a protected area of the application.",
  session,
  title = "Account status",
}: AuthStatusCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-3">
          <DetailItem label="Name" value={session.user.name ?? "Unknown user"} />
          <DetailItem label="Email" value={session.user.email ?? "No email"} />
          <DetailItem label="Role" value={session.user.role ?? "unknown"} />
        </dl>
      </CardContent>
    </Card>
  );
}
