import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

import type { UserRole } from "./config";

export const authClient = createAuthClient({
  plugins: [adminClient()],
});

type AuthClientSession = typeof authClient.$Infer.Session;

export type Session = Omit<AuthClientSession, "user"> & {
  user: Omit<AuthClientSession["user"], "role"> & {
    role: UserRole;
  };
};
