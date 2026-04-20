import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { getSubscriptionStatus } from "./premium-access";

// Helper: generate random code
function generateRandomCode(length: number = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid I, O, 0, 1
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const betaRouter = router({
  /**
   * Get current user's trial/subscription status
   */
  getMyStatus: protectedProcedure.query(async ({ ctx }) => {
    return await getSubscriptionStatus(ctx.user.id);
  }),

  /**
   * Redeem a beta code to activate/extend trial
   */
  redeemCode: protectedProcedure
    .input(z.object({ code: z.string().min(1).max(64) }))
    .mutation(async ({ input, ctx }) => {
      const code = input.code.trim().toUpperCase();
      const betaCode = await db.getBetaCodeByCode(code);

      if (!betaCode) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid beta code" });
      }

      if (!betaCode.isActive) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This beta code is no longer active" });
      }

      if (betaCode.expiresAt && new Date(betaCode.expiresAt) < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This beta code has expired" });
      }

      if (betaCode.usedCount >= betaCode.maxUses) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This beta code has reached maximum uses" });
      }

      const alreadyRedeemed = await db.hasUserRedeemedCode(ctx.user.id, betaCode.id);
      if (alreadyRedeemed) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You have already redeemed this code" });
      }

      // Extend trial & record redemption
      await db.extendUserTrial(ctx.user.id, betaCode.trialDays);
      await db.recordBetaCodeRedemption(ctx.user.id, betaCode.id);
      await db.incrementBetaCodeUsage(betaCode.id);

      return {
        success: true,
        trialDaysAdded: betaCode.trialDays,
        message: `${betaCode.trialDays} days of premium access added to your account!`,
      };
    }),

  // ========== Admin procedures for beta codes ==========

  adminListCodes: adminProcedure.query(async () => {
    return await db.getAllBetaCodes();
  }),

  adminCreateCode: adminProcedure
    .input(z.object({
      code: z.string().optional(),
      description: z.string().optional(),
      maxUses: z.number().int().min(1).max(10000).default(1),
      trialDays: z.number().int().min(1).max(365).default(14),
      expiresInDays: z.number().int().min(1).max(365).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const code = (input.code?.trim() || generateRandomCode(8)).toUpperCase();
      const existing = await db.getBetaCodeByCode(code);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Code already exists" });
      }

      let expiresAt: Date | undefined;
      if (input.expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
      }

      const created = await db.createBetaCode({
        code,
        description: input.description,
        maxUses: input.maxUses,
        trialDays: input.trialDays,
        expiresAt,
        createdBy: ctx.user.id,
      });

      return created;
    }),

  // ========== Feedback procedures ==========

  submitFeedback: publicProcedure
    .input(z.object({
      category: z.enum(["bug", "feature_request", "general", "praise"]),
      rating: z.number().int().min(1).max(5).optional(),
      message: z.string().min(3).max(5000),
      pageUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userAgent = (ctx.req?.headers?.["user-agent"] as string | undefined) || undefined;
      await db.createUserFeedback({
        userId: ctx.user?.id,
        category: input.category,
        rating: input.rating,
        message: input.message,
        pageUrl: input.pageUrl,
        userAgent,
      });
      return { success: true };
    }),

  adminListFeedback: adminProcedure.query(async () => {
    return await db.getAllFeedback();
  }),

  adminUpdateFeedbackStatus: adminProcedure
    .input(z.object({
      feedbackId: z.number().int(),
      status: z.enum(["new", "reviewed", "resolved", "archived"]),
    }))
    .mutation(async ({ input }) => {
      await db.updateFeedbackStatus(input.feedbackId, input.status);
      return { success: true };
    }),
});
