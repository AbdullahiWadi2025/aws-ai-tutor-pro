import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAchievements,
  getUserAchievements,
  unlockAchievement,
  getStudyRecommendations,
  getWeakTopics,
  generateRecommendations,
} from "./db";

export const gamificationRouter = router({
  // Get all available achievements
  getAllAchievements: protectedProcedure.query(async () => {
    return await getAchievements();
  }),

  // Get user's unlocked achievements
  getUserAchievements: protectedProcedure.input(
    z.object({
      userId: z.number(),
    })
  ).query(async ({ input }) => {
    return await getUserAchievements(input.userId);
  }),

  // Get study recommendations for a certification
  getRecommendations: protectedProcedure.input(
    z.object({
      certification: z.enum(["SAA-C03", "CLF-C02"]),
    })
  ).query(async ({ input, ctx }) => {
    return await getStudyRecommendations(ctx.user.id, input.certification);
  }),

  // Get weak topics for a certification
  getWeakTopics: protectedProcedure.input(
    z.object({
      certification: z.enum(["SAA-C03", "CLF-C02"]),
      limit: z.number().default(5),
    })
  ).query(async ({ input, ctx }) => {
    return await getWeakTopics(ctx.user.id, input.certification, input.limit);
  }),

  // Generate/refresh recommendations based on current performance
  refreshRecommendations: protectedProcedure.input(
    z.object({
      certification: z.enum(["SAA-C03", "CLF-C02"]),
    })
  ).mutation(async ({ input, ctx }) => {
    await generateRecommendations(ctx.user.id, input.certification);
    return await getStudyRecommendations(ctx.user.id, input.certification);
  }),

  // Unlock an achievement (called from exam completion logic)
  unlockAchievement: protectedProcedure.input(
    z.object({
      achievementId: z.number(),
    })
  ).mutation(async ({ input, ctx }) => {
    await unlockAchievement(ctx.user.id, input.achievementId);
    return { success: true };
  }),
});
