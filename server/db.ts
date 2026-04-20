import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, awsQuestions, examSessions, userProgress, topicPerformance, userAnswers, achievements, userAchievements, studyRecommendations } from "../drizzle/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// AWS Questions queries
function parseQuestionFields<T extends { options: unknown; correctAnswers: unknown }>(q: T): T {
  return {
    ...q,
    options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
    correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : JSON.parse(q.correctAnswers as string),
  };
}

export async function getQuestionsByCertification(certification: "SAA-C03" | "CLF-C02", limit: number = 65) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(awsQuestions)
    .where(eq(awsQuestions.certification, certification))
    .limit(limit);
  
  return result.map(parseQuestionFields);
}

export async function getQuestionsByTopic(certification: "SAA-C03" | "CLF-C02", topic: string) {
  const db = await getDb();
  if (!db) return [];
  
  const { and } = await import("drizzle-orm");
  const result = await db
    .select()
    .from(awsQuestions)
    .where(and(
      eq(awsQuestions.certification, certification),
      eq(awsQuestions.topic, topic)
    ));
  
  return result.map(parseQuestionFields);
}

// Exam Session queries
export async function createExamSession(data: {
  userId: number;
  certification: "SAA-C03" | "CLF-C02";
  mode: "exam" | "practice";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(examSessions).values(data);
  
  return result;
}

export async function updateExamSession(sessionId: number, data: Partial<{
  score: string | number | null;
  correctAnswers: number | null;
  timeTaken: number | null;
  isPassed: boolean | null;
  questionsAttempted: number | null;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, any> = {};
  
  if (data.score !== undefined) updateData.score = data.score;
  if (data.correctAnswers !== undefined) updateData.correctAnswers = data.correctAnswers;
  if (data.timeTaken !== undefined) updateData.timeTaken = data.timeTaken;
  if (data.isPassed !== undefined) updateData.isPassed = data.isPassed;
  if (data.questionsAttempted !== undefined) updateData.questionsAttempted = data.questionsAttempted;
  
  const result = await db
    .update(examSessions)
    .set(updateData)
    .where(eq(examSessions.id, sessionId));
  
  return result;
}

export async function getExamSessionById(sessionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(examSessions)
    .where(eq(examSessions.id, sessionId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getExamSessionsByUser(userId: number, certification?: "SAA-C03" | "CLF-C02") {
  const db = await getDb();
  if (!db) return [];
  
  const { and } = await import("drizzle-orm");
  
  if (certification) {
    return db
      .select()
      .from(examSessions)
      .where(and(
        eq(examSessions.userId, userId),
        eq(examSessions.certification, certification)
      ));
  }
  
  return db.select().from(examSessions).where(eq(examSessions.userId, userId));
}

// User Progress queries
export async function getUserProgress(userId: number, certification: "SAA-C03" | "CLF-C02") {
  const db = await getDb();
  if (!db) return undefined;
  
  const { and } = await import("drizzle-orm");
  const result = await db
    .select()
    .from(userProgress)
    .where(and(
      eq(userProgress.userId, userId),
      eq(userProgress.certification, certification)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getTopicPerformance(userId: number, certification: "SAA-C03" | "CLF-C02") {
  const db = await getDb();
  if (!db) return [];
  
  const { and } = await import("drizzle-orm");
  const result = await db
    .select()
    .from(topicPerformance)
    .where(and(
      eq(topicPerformance.userId, userId),
      eq(topicPerformance.certification, certification)
    ));
  
  return result;
}

export async function getUserAnswersBySession(examSessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(userAnswers)
    .where(eq(userAnswers.examSessionId, examSessionId));
  
  return result;
}

export async function createUserAnswer(data: {
  examSessionId: number;
  questionId: number;
  userAnswer: string[];
  isCorrect: boolean;
  timeSpent?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Use the shared Drizzle connection pool with a raw sql template tag
  // ON DUPLICATE KEY UPDATE ensures only the latest answer is stored per (session, question)
  await db.execute(
    sql`INSERT INTO user_answers (exam_session_id, question_id, user_answer, is_correct, time_spent)
        VALUES (${data.examSessionId}, ${data.questionId}, ${JSON.stringify(data.userAnswer)}, ${data.isCorrect ? 1 : 0}, ${data.timeSpent ?? null})
        ON DUPLICATE KEY UPDATE
          user_answer = VALUES(user_answer),
          is_correct = VALUES(is_correct),
          time_spent = VALUES(time_spent)`
  );

  return { success: true };
}

// Import subscription tables
import { subscriptionPlans, userSubscriptions, paymentHistory } from "../drizzle/schema";

// Subscription Plans queries
export async function getSubscriptionPlans() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(subscriptionPlans);
  return result;
}

export async function getSubscriptionPlanByStripePriceId(stripePriceId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.stripePriceId, stripePriceId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// User Subscriptions queries
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserSubscription(data: {
  userId: number;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  planId: number;
  status: "active" | "inactive" | "canceled" | "past_due";
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(userSubscriptions).values(data);
  return result;
}

export async function updateUserSubscription(userId: number, data: Partial<{
  stripeSubscriptionId: string;
  status: "active" | "inactive" | "canceled" | "past_due";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt: Date;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(userSubscriptions)
    .set(data)
    .where(eq(userSubscriptions.userId, userId));
  
  return result;
}

export async function getUserSubscriptionByStripeCustomerId(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// Payment History queries
export async function createPaymentHistory(data: {
  userId: number;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: "succeeded" | "processing" | "requires_payment_method" | "canceled";
  description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(paymentHistory).values(data);
  return result;
}

export async function getPaymentHistoryByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(paymentHistory)
    .where(eq(paymentHistory.userId, userId));
  
  return result;
}


// Gamification & Achievements

export async function getAchievements() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(achievements);
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
}

export async function unlockAchievement(userId: number, achievementId: number) {
  const db = await getDb();
  if (!db) return;
  
  // Check if already unlocked
  const existing = await db
    .select()
    .from(userAchievements)
    .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)));
  
  if (existing.length > 0) return; // Already unlocked
  
  await db.insert(userAchievements).values({
    userId,
    achievementId,
  });
}

// Study Recommendations

export async function getStudyRecommendations(userId: number, certification: "SAA-C03" | "CLF-C02") {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(studyRecommendations)
    .where(and(eq(studyRecommendations.userId, userId), eq(studyRecommendations.certification, certification)))
    .orderBy(asc(studyRecommendations.priority));
}

export async function getWeakTopics(userId: number, certification: "SAA-C03" | "CLF-C02", limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  // Get topics with lowest accuracy
  return db
    .select()
    .from(topicPerformance)
    .where(and(eq(topicPerformance.userId, userId), eq(topicPerformance.certification, certification)))
    .orderBy(asc(topicPerformance.accuracy))
    .limit(limit);
}

export async function createStudyRecommendation(data: {
  userId: number;
  certification: "SAA-C03" | "CLF-C02";
  topic: string;
  priority: number;
  reason: string;
  accuracy?: string;
}) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(studyRecommendations).values({
    userId: data.userId,
    certification: data.certification,
    topic: data.topic,
    priority: data.priority,
    reason: data.reason,
    accuracy: data.accuracy || undefined,
  });
}

export async function generateRecommendations(userId: number, certification: "SAA-C03" | "CLF-C02") {
  // Get weak topics
  const weakTopics = await getWeakTopics(userId, certification, 10);
  
  // Clear existing recommendations
  const db = await getDb();
  if (!db) return;
  
  await db
    .delete(studyRecommendations)
    .where(and(eq(studyRecommendations.userId, userId), eq(studyRecommendations.certification, certification)));
  
  // Create new recommendations
  weakTopics.forEach((topic, index) => {
    const accuracy = topic.accuracy ? parseFloat(topic.accuracy.toString()) : 0;
    const reason = accuracy < 50 
      ? `You're struggling with ${topic.topic}. Focus here to improve your score.`
      : `You could improve your ${topic.topic} knowledge. Practice more questions in this area.`;
    
    createStudyRecommendation({
      userId,
      certification,
      topic: topic.topic,
      priority: index + 1,
      reason,
      accuracy: accuracy.toString(),
    });
  });
}


// ========== Beta Launch Helpers ==========

import { userTrials, betaCodes, betaCodeRedemptions, userFeedback } from "../drizzle/schema";

const TRIAL_DAYS_DEFAULT = 14;

/**
 * Get user trial status
 */
export async function getUserTrial(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(userTrials)
    .where(eq(userTrials.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Check if user has an active trial
 */
export async function hasActiveTrial(userId: number): Promise<boolean> {
  const trial = await getUserTrial(userId);
  if (!trial) return false;
  
  const now = new Date();
  return trial.isActive && new Date(trial.trialEndsAt) > now;
}

/**
 * Start a trial for a user (idempotent - returns existing if already started)
 */
export async function startTrialForUser(
  userId: number,
  days: number = TRIAL_DAYS_DEFAULT,
  source: string = "signup"
) {
  const db = await getDb();
  if (!db) return undefined;
  
  const existing = await getUserTrial(userId);
  if (existing) return existing;
  
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + days);
  
  await db.insert(userTrials).values({
    userId,
    trialEndsAt,
    isActive: true,
    source,
  });
  
  return await getUserTrial(userId);
}

/**
 * Extend a user's trial by N days (used when redeeming beta code)
 */
export async function extendUserTrial(userId: number, additionalDays: number) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getUserTrial(userId);
  if (!existing) {
    await startTrialForUser(userId, additionalDays, "beta_code");
    return;
  }
  
  const newEndDate = new Date(existing.trialEndsAt);
  newEndDate.setDate(newEndDate.getDate() + additionalDays);
  
  await db
    .update(userTrials)
    .set({ trialEndsAt: newEndDate, isActive: true })
    .where(eq(userTrials.userId, userId));
}

// ========== Beta Codes ==========

export async function getBetaCodeByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(betaCodes)
    .where(eq(betaCodes.code, code))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllBetaCodes() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(betaCodes);
}

export async function createBetaCode(data: {
  code: string;
  description?: string;
  maxUses?: number;
  trialDays?: number;
  expiresAt?: Date;
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.insert(betaCodes).values({
    code: data.code,
    description: data.description,
    maxUses: data.maxUses ?? 1,
    trialDays: data.trialDays ?? TRIAL_DAYS_DEFAULT,
    expiresAt: data.expiresAt,
    createdBy: data.createdBy,
  });
  
  return await getBetaCodeByCode(data.code);
}

export async function incrementBetaCodeUsage(codeId: number) {
  const db = await getDb();
  if (!db) return;
  
  const result = await db
    .select()
    .from(betaCodes)
    .where(eq(betaCodes.id, codeId))
    .limit(1);
  
  if (result.length === 0) return;
  
  const current = result[0];
  await db
    .update(betaCodes)
    .set({ usedCount: current.usedCount + 1 })
    .where(eq(betaCodes.id, codeId));
}

export async function hasUserRedeemedCode(userId: number, betaCodeId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(betaCodeRedemptions)
    .where(and(
      eq(betaCodeRedemptions.userId, userId),
      eq(betaCodeRedemptions.betaCodeId, betaCodeId)
    ))
    .limit(1);
  
  return result.length > 0;
}

export async function recordBetaCodeRedemption(userId: number, betaCodeId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(betaCodeRedemptions).values({
    userId,
    betaCodeId,
  });
}

// ========== User Feedback ==========

export async function createUserFeedback(data: {
  userId?: number;
  category: "bug" | "feature_request" | "general" | "praise";
  rating?: number;
  message: string;
  pageUrl?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(userFeedback).values({
    userId: data.userId,
    category: data.category,
    rating: data.rating,
    message: data.message,
    pageUrl: data.pageUrl,
    userAgent: data.userAgent,
  });
}

export async function getAllFeedback() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(userFeedback);
}

export async function updateFeedbackStatus(
  feedbackId: number,
  status: "new" | "reviewed" | "resolved" | "archived"
) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(userFeedback)
    .set({ status })
    .where(eq(userFeedback.id, feedbackId));
}
