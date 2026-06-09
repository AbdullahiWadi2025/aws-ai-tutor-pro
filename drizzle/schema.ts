import { int, bigint, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// AWS Exam Questions Table
export const awsQuestions = mysqlTable("aws_questions", {
  id: int("id").autoincrement().primaryKey(),
  certification: mysqlEnum("certification", ["SAA-C03", "CLF-C02"]).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  questionText: text("question_text").notNull(),
  options: json("options").$type<string[]>().notNull(), // Array of option strings
  correctAnswers: json("correct_answers").$type<string[]>().notNull(), // Array of correct option indices or letters
  explanation: text("explanation").notNull(),
  questionType: mysqlEnum("question_type", ["single", "multiple"]).default("single").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AwsQuestion = typeof awsQuestions.$inferSelect;
export type InsertAwsQuestion = typeof awsQuestions.$inferInsert;

// Exam Sessions Table
export const examSessions = mysqlTable("exam_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  certification: mysqlEnum("certification", ["SAA-C03", "CLF-C02"]).notNull(),
  mode: mysqlEnum("mode", ["exam", "practice"]).default("exam").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }),
  totalQuestions: int("total_questions").default(65).notNull(),
  correctAnswers: int("correct_answers"),
  timeTaken: int("time_taken"), // in seconds
  isPassed: boolean("is_passed"),
  questionsAttempted: int("questions_attempted"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ExamSession = typeof examSessions.$inferSelect;
export type InsertExamSession = typeof examSessions.$inferInsert;

// Exam Session Questions Table — stores which question IDs were assigned to each exam session
export const examSessionQuestions = mysqlTable("exam_session_questions", {
  id: int("id").autoincrement().primaryKey(),
  examSessionId: int("exam_session_id").notNull(),
  questionId: int("question_id").notNull(),
  questionOrder: int("question_order").notNull(), // 1-indexed position in the exam
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ExamSessionQuestion = typeof examSessionQuestions.$inferSelect;
export type InsertExamSessionQuestion = typeof examSessionQuestions.$inferInsert;

// User Answers Table
export const userAnswers = mysqlTable("user_answers", {
  id: int("id").autoincrement().primaryKey(),
  examSessionId: int("exam_session_id").notNull(),
  questionId: int("question_id").notNull(),
  userAnswer: json("user_answer").$type<string[]>().notNull(), // Array of selected answers
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: int("time_spent"), // in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserAnswer = typeof userAnswers.$inferSelect;
export type InsertUserAnswer = typeof userAnswers.$inferInsert;

// User Progress Table
export const userProgress = mysqlTable("user_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  certification: mysqlEnum("certification", ["SAA-C03", "CLF-C02"]).notNull(),
  totalExams: int("total_exams").default(0).notNull(),
  averageScore: decimal("average_score", { precision: 5, scale: 2 }).default("0"),
  passCount: int("pass_count").default(0).notNull(),
  failCount: int("fail_count").default(0).notNull(),
  lastExamDate: timestamp("last_exam_date"),
  studyStreak: int("study_streak").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

// Topic Performance Table
export const topicPerformance = mysqlTable("topic_performance", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  certification: mysqlEnum("certification", ["SAA-C03", "CLF-C02"]).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  correctCount: int("correct_count").default(0).notNull(),
  totalCount: int("total_count").default(0).notNull(),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).default("0"),
  lastUpdated: timestamp("last_updated").defaultNow().onUpdateNow().notNull(),
});

export type TopicPerformance = typeof topicPerformance.$inferSelect;
export type InsertTopicPerformance = typeof topicPerformance.$inferInsert;
// Subscription Plans Table
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // "Free", "Premium Monthly", "Premium Annual"
  stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull().unique(),
  stripeProductId: varchar("stripe_product_id", { length: 255 }).notNull(),
  amount: int("amount").notNull(), // in cents (e.g., 999 = $9.99)
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  interval: mysqlEnum("interval", ["month", "year", "one_time"]).notNull(),
  features: json("features").$type<string[]>().notNull(), // Array of feature names
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

// User Subscriptions Table
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  planId: int("plan_id").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "canceled", "past_due"]).default("inactive").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

// Payment History Table
export const paymentHistory = mysqlTable("payment_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).notNull().unique(),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  status: mysqlEnum("status", ["succeeded", "processing", "requires_payment_method", "canceled"]).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = typeof paymentHistory.$inferInsert;

// Achievements/Badges Table
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // "Passed 5 Exams", "Perfect Score", "7-Day Streak"
  description: text("description").notNull(),
  icon: varchar("icon", { length: 255 }), // emoji or icon name
  requirement: varchar("requirement", { length: 255 }).notNull(), // criteria for unlocking
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

// User Achievements Table (tracks which badges user has earned)
export const userAchievements = mysqlTable("user_achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  achievementId: int("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

// Study Recommendations Table
export const studyRecommendations = mysqlTable("study_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  certification: mysqlEnum("certification", ["SAA-C03", "CLF-C02"]).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  priority: int("priority").notNull(), // 1 = highest, lower = less important
  reason: text("reason").notNull(), // why this topic is recommended
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // user's current accuracy on this topic
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type StudyRecommendation = typeof studyRecommendations.$inferSelect;
export type InsertStudyRecommendation = typeof studyRecommendations.$inferInsert;


// Beta Launch Tables

// Trial tracking - add to user-subscription relationship
export const userTrials = mysqlTable("user_trials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  trialStartedAt: timestamp("trial_started_at").defaultNow().notNull(),
  trialEndsAt: timestamp("trial_ends_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  source: varchar("source", { length: 50 }).default("signup").notNull(), // signup, beta_code, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserTrial = typeof userTrials.$inferSelect;
export type InsertUserTrial = typeof userTrials.$inferInsert;

// Beta access codes
export const betaCodes = mysqlTable("beta_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  description: text("description"),
  maxUses: int("max_uses").default(1).notNull(),
  usedCount: int("used_count").default(0).notNull(),
  trialDays: int("trial_days").default(14).notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BetaCode = typeof betaCodes.$inferSelect;
export type InsertBetaCode = typeof betaCodes.$inferInsert;

// Beta code redemptions
export const betaCodeRedemptions = mysqlTable("beta_code_redemptions", {
  id: int("id").autoincrement().primaryKey(),
  betaCodeId: int("beta_code_id").notNull(),
  userId: int("user_id").notNull(),
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
});

export type BetaCodeRedemption = typeof betaCodeRedemptions.$inferSelect;
export type InsertBetaCodeRedemption = typeof betaCodeRedemptions.$inferInsert;

// User feedback
export const userFeedback = mysqlTable("user_feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  category: mysqlEnum("category", ["bug", "feature_request", "general", "praise"]).default("general").notNull(),
  rating: int("rating"), // 1-5 stars, nullable
  message: text("message").notNull(),
  pageUrl: varchar("page_url", { length: 500 }),
  userAgent: text("user_agent"),
  status: mysqlEnum("status", ["new", "reviewed", "resolved", "archived"]).default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = typeof userFeedback.$inferInsert;

// Game Scores Table — tracks XP earned in the Duolingo-style AWS Learning Game
export const gameScores = mysqlTable("game_scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(), // one row per user, upserted on each lesson
  totalXp: int("total_xp").default(0).notNull(),
  lessonsCompleted: int("lessons_completed").default(0).notNull(),
  bestStreak: int("best_streak").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameScore = typeof gameScores.$inferInsert;

// AI Study Plans Table
export const studyPlans = mysqlTable("study_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  certification: varchar("certification", { length: 32 }).notNull(),
  examDate: varchar("exam_date", { length: 16 }).notNull(), // ISO date string YYYY-MM-DD
  hoursPerDay: decimal("hours_per_day", { precision: 3, scale: 1 }).notNull(),
  knowledgeLevel: mysqlEnum("knowledge_level", ["beginner", "intermediate", "advanced"]).notNull(),
  readinessScore: int("readiness_score"),
  planJson: json("plan_json").$type<object>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type StudyPlan = typeof studyPlans.$inferSelect;
export type InsertStudyPlan = typeof studyPlans.$inferInsert;

// Testimonials Table
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"), // nullable — allow pre-seeded testimonials without a user account
  name: varchar("name", { length: 255 }).notNull(),
  certificationPassed: varchar("certification_passed", { length: 100 }),
  quote: text("quote").notNull(),
  rating: int("rating").default(5).notNull(), // 1-5 stars
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// Project Lab Progress Table
export const projectProgress = mysqlTable("project_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  projectId: varchar("project_id", { length: 64 }).notNull(), // static project slug e.g. "s3-static-website"
  completedSteps: json("completed_steps").$type<number[]>().notNull().default([]),
  completedAt: timestamp("completed_at"), // set when all steps are done
  startedAt: timestamp("started_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type ProjectProgress = typeof projectProgress.$inferSelect;
export type InsertProjectProgress = typeof projectProgress.$inferInsert;

// AWS Diagram Builder
export const diagrams = mysqlTable("diagrams", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull().default("Untitled Diagram"),
  nodesJson: text("nodes_json").notNull().default("[]"),
  edgesJson: text("edges_json").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Diagram = typeof diagrams.$inferSelect;
export type InsertDiagram = typeof diagrams.$inferInsert;
