import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { testimonials } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const testimonialRouter = router({
  // Public: list approved testimonials for homepage display
  listApproved: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const rows = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.status, "approved"))
      .orderBy(desc(testimonials.createdAt));
    return rows;
  }),

  // Protected: submit a new testimonial (logged-in users)
  submit: protectedProcedure
    .input(
      z.object({
        quote: z.string().min(20, "Please write at least 20 characters").max(1000),
        certificationPassed: z.string().optional(),
        rating: z.number().int().min(1).max(5).default(5),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [inserted] = await db
        .insert(testimonials)
        .values({
          userId: ctx.user.id,
          name: ctx.user.name ?? "Anonymous",
          certificationPassed: input.certificationPassed ?? null,
          quote: input.quote,
          rating: input.rating,
          status: "pending",
        })
        .$returningId();

      // Notify owner
      await notifyOwner({
        title: "New Testimonial Submitted",
        content: `${ctx.user.name ?? "A user"} submitted a testimonial${input.certificationPassed ? ` for ${input.certificationPassed}` : ""}:\n\n"${input.quote.slice(0, 200)}${input.quote.length > 200 ? "..." : ""}"`,
      }).catch(() => {});

      return { id: inserted.id, success: true };
    }),

  // Admin: list all testimonials (pending + approved + rejected)
  listAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const rows = await db
      .select()
      .from(testimonials)
      .orderBy(desc(testimonials.createdAt));
    return rows;
  }),

  // Admin: approve a testimonial
  approve: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db
        .update(testimonials)
        .set({ status: "approved", reviewedAt: new Date() })
        .where(eq(testimonials.id, input.id));
      return { success: true };
    }),

  // Admin: reject a testimonial
  reject: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db
        .update(testimonials)
        .set({ status: "rejected", reviewedAt: new Date() })
        .where(eq(testimonials.id, input.id));
      return { success: true };
    }),

  // Admin: delete a testimonial
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(testimonials).where(eq(testimonials.id, input.id));
      return { success: true };
    }),
});
