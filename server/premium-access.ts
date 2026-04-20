import { TRPCError } from "@trpc/server";
import * as db from "./db";

/**
 * Check if user has premium access (via subscription or active trial)
 */
export async function checkPremiumAccess(userId: number): Promise<boolean> {
  // Check paid subscription first
  const subscription = await db.getUserSubscription(userId);
  if (subscription?.status === "active") return true;

  // Check active trial
  const hasTrial = await db.hasActiveTrial(userId);
  return hasTrial;
}

/**
 * Ensure user has premium access, throw error if not
 */
export async function requirePremiumAccess(userId: number): Promise<void> {
  const hasPremium = await checkPremiumAccess(userId);
  if (!hasPremium) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This feature requires a premium subscription or active trial. Please upgrade or start your free trial.",
    });
  }
}

/**
 * Get detailed subscription and trial status for user
 */
export async function getSubscriptionStatus(userId: number) {
  const subscription = await db.getUserSubscription(userId);
  const trial = await db.getUserTrial(userId);
  const now = new Date();
  
  const hasActiveSubscription = subscription?.status === "active";
  const hasActiveTrial = Boolean(trial?.isActive && new Date(trial.trialEndsAt) > now);
  
  let accessType: "subscription" | "trial" | "free" = "free";
  let expiresAt: Date | null = null;
  let planName = "Free";
  
  if (hasActiveSubscription) {
    accessType = "subscription";
    expiresAt = subscription.currentPeriodEnd;
    planName = "Premium";
  } else if (hasActiveTrial && trial) {
    accessType = "trial";
    expiresAt = trial.trialEndsAt;
    planName = "Trial (Premium)";
  }
  
  const trialDaysRemaining = hasActiveTrial && trial
    ? Math.ceil((new Date(trial.trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  return {
    isPremium: Boolean(hasActiveSubscription || hasActiveTrial),
    accessType,
    status: subscription?.status || (hasActiveTrial ? "trial" : "inactive"),
    planName,
    expiresAt,
    trialDaysRemaining,
    hasEverHadTrial: !!trial,
  };
}

/**
 * Check if user can access specific feature
 */
export async function canAccessFeature(
  userId: number,
  feature: "exam" | "practice" | "ai_tutor" | "unlimited_practice"
): Promise<boolean> {
  const hasPremium = await checkPremiumAccess(userId);

  // Feature access rules
  switch (feature) {
    case "exam":
      return hasPremium;
    case "practice":
      return true; // Practice available to all
    case "ai_tutor":
      return hasPremium;
    case "unlimited_practice":
      return hasPremium;
    default:
      return false;
  }
}

/**
 * Get feature limits based on subscription/trial
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
