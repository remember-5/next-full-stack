import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { db } from "~/server/db";

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ??
    `http://localhost:${process.env.PORT ?? "3000"}/api/auth`,
  database: prismaAdapter(db, {
    provider: "postgresql", // or "sqlite" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
  },
});

export type Session = typeof auth.$Infer.Session;
