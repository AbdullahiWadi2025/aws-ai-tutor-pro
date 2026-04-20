import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, awsQuestions, examSessions, userProgress, topicPerformance, userAnswers } from "../drizzle/schema";
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
export async function getQuestionsByCertification(certification: "SAA-C03" | "CLF-C02", limit: number = 65) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(awsQuestions)
    .where(eq(awsQuestions.certification, certification))
    .limit(limit);
  
  return result;
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
  
  return result;
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
  
  const result = await db.insert(userAnswers).values(data);
  
  return result;
}
