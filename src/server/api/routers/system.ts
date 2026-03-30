import { siteConfig } from "~/config/site";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const systemRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({
    app: siteConfig.name,
    status: "ok" as const,
  })),
  viewer: protectedProcedure.query(({ ctx }) => ({
    email: ctx.session.user.email,
    id: ctx.session.user.id,
    role: ctx.session.user.role,
  })),
});
