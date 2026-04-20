import { TRPCError } from "@trpc/server";
import * as db from "./db";

/**
 * Check if user has premium access
 */
export async function checkPremiumAccess(userId: number): Promise<boolean> {
  const subscription = await db.getUserSubscription(userId);
  return subscription?.status === "active";
}

/**
 * Ensure user has premium access, throw error if not
 */
export async function requirePremiumAccess(userId: number): Promise<void> {
  const hasPremium = await checkPremiumAccess(userId);
  if (!hasPremium) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This feature requires a premium subscription. Please upgrade to access.",
    });
  }
}

/**
 * Get subscription status for user
 */
export async function getSubscriptionStatus(userId: number) {
  const subscription = await db.getUserSubscription(userId);
  return {
    isPremium: subscription?.status === "active",
    status: subscription?.status || "inactive",
    planName: subscription?.planId ? "Premium" : "Free",
    expiresAt: subscription?.currentPeriodEnd,
  };
}

/**
 * Check if user can access specific feature
 */
export async function canAccessFeature(
  userId: number,
  feature: "exam" | "practice" | "ai_tutor" | "unlimited_practice"
): Promise<boolean> {
  const subscription = await db.getUserSubscription(userId);
  const isPremium = subscription?.status === "active";

  // Feature access rules
  switch (feature) {
    case "exam":
      // Exams require premium
      return isPremium;
    case "practice":
      // Practice available to all
      return true;
    case "ai_tutor":
      // AI tutor requires premium
      return isPremium;
    case "unlimited_practice":
      // Unlimited practice requires premium
      return isPremium;
    default:
      return false;
  }
}

/**
 * Get feature limits based on subscription
 */
export async function getFeatureLimits(userId: number) {
  const isPremium = await checkPremiumAccess(userId);

  return {
    practiceQuestionsPerMonth: isPremium ? Infinity : 5,
    examsPerMonth: isPremium ? Infinity : 0,
    aiTutorMessages: isPremium ? Infinity : 3,
    detailedAnalytics: isPremium,
    topicBreakdown: isPremium,
  };
}
