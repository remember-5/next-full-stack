import { hashPassword } from "better-auth/crypto";
import { z } from "zod";

import { env } from "../src/env.js";
import { auth } from "../src/server/better-auth/config";
import { db } from "../src/server/db";

const ADMIN_ROLE = "admin";
const CREDENTIAL_PROVIDER_ID = "credential";
const adminEnvSchema = z.object({
  ADMIN_EMAIL: z.string().email(),
  ADMIN_NAME: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(8),
});

async function ensureCredentialAccount(userId: string, password: string) {
  const passwordHash = await hashPassword(password);
  const account = await db.account.findFirst({
    where: {
      providerId: CREDENTIAL_PROVIDER_ID,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (account) {
    await db.account.update({
      where: {
        id: account.id,
      },
      data: {
        password: passwordHash,
      },
    });
    return;
  }

  await db.account.create({
    data: {
      accountId: userId,
      id: crypto.randomUUID(),
      password: passwordHash,
      providerId: CREDENTIAL_PROVIDER_ID,
      userId,
    },
  });
}

async function initAdmin() {
  const adminEnv = adminEnvSchema.parse({
    ADMIN_EMAIL: env.ADMIN_EMAIL,
    ADMIN_NAME: env.ADMIN_NAME,
    ADMIN_PASSWORD: env.ADMIN_PASSWORD,
  });
  const email = adminEnv.ADMIN_EMAIL.toLowerCase();
  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (!existingUser) {
    await auth.api.createUser({
      body: {
        email,
        name: adminEnv.ADMIN_NAME,
        password: adminEnv.ADMIN_PASSWORD,
        role: ADMIN_ROLE,
      },
    });

    console.log(`Created admin user ${email}`);
    return;
  }

  await db.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      banExpires: null,
      banReason: null,
      banned: false,
      name: adminEnv.ADMIN_NAME,
      role: ADMIN_ROLE,
    },
  });

  await ensureCredentialAccount(existingUser.id, adminEnv.ADMIN_PASSWORD);

  console.log(`Updated admin user ${email}`);
}

try {
  await initAdmin();
} finally {
  await db.$disconnect();
}
