import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal } from "drizzle-orm/mysql-core";

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