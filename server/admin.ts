import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users, examSessions, userAnswers, topicPerformance } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Admin-only procedure wrapper
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to access this resource",
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Get all users
  getAllUsers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    try {
      const allUsers = await db
        .select({
          id: users.id,
          openId: users.openId,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
        })
        .from(users)
        .orderBy(desc(users.lastSignedIn));

      return allUsers;
    } catch (error) {
      console.error("[Admin] Error fetching users:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch users" });
    }
  }),

  // Get user details with exam history
  getUserDetails: adminProcedure.input((val: unknown) => {
    if (typeof val === "object" && val !== null && "userId" in val && typeof (val as any).userId === "number") {
      return val as { userId: number };
    }
    throw new Error("Invalid input");
  }).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    try {
      const user = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);

      if (!user.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const exams = await db
        .select()
        .from(examSessions)
        .where(eq(examSessions.userId, input.userId))
        .orderBy(desc(examSessions.createdAt));

      return {
        user: user[0],
        exams,
        totalExams: exams.length,
        averageScore: exams.length > 0 
          ? Math.round(exams.reduce((sum, e) => sum + (typeof e.score === 'number' ? e.score : 0), 0) / exams.length)
          : 0,
      };
    } catch (error) {
      console.error("[Admin] Error fetching user details:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch user details" });
    }
  }),

  // Get exam statistics
  getExamStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    try {
      const allExams = await db.select().from(examSessions);

      const totalExams = allExams.length;
      const totalUsers = await db.select({ id: users.id }).from(users);
      const averageScore = totalExams > 0 
        ? Math.round(allExams.reduce((sum, e) => sum + (typeof e.score === 'number' ? e.score : 0), 0) / totalExams)
        : 0;

      const byCertification = {
        saa: allExams.filter(e => e.certification === "SAA-C03").length || 0,
        clf: allExams.filter(e => e.certification === "CLF-C02").length || 0,
      };

      const byMode = {
        exam: allExams.filter(e => e.mode === "exam").length || 0,
        practice: allExams.filter(e => e.mode === "practice").length || 0,
      };

      return {
        totalExams,
        totalUsers: totalUsers.length,
        averageScore,
        byCertification,
        byMode,
      };
    } catch (error) {
      console.error("[Admin] Error fetching exam stats:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch exam statistics" });
    }
  }),

  // Get topic analytics
  getTopicAnalytics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    try {
      const topics = await db.select().from(topicPerformance);

      const analytics = topics.reduce((acc: Record<string, any>, topic) => {
        const key = `${topic.certification}-${topic.topic}`;
        if (!acc[key]) {
          acc[key] = {
            certification: topic.certification,
            topic: topic.topic,
            totalCorrect: 0,
            totalAttempts: 0,
            accuracy: 0,
          };
        }
        acc[key].totalCorrect += (topic.correctCount || 0);
        acc[key].totalAttempts += (topic.totalCount || 0);
        acc[key].accuracy = acc[key].totalAttempts > 0 
          ? Math.round((acc[key].totalCorrect / acc[key].totalAttempts) * 100)
          : 0;
        return acc;
      }, {});

      return Object.values(analytics);
    } catch (error) {
      console.error("[Admin] Error fetching topic analytics:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch topic analytics" });
    }
  }),

  // Get recent activity
  getRecentActivity: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    try {
      const recentExams = await db
        .select({
          id: examSessions.id,
          userId: examSessions.userId,
          certification: examSessions.certification,
          score: examSessions.score,
          createdAt: examSessions.createdAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(examSessions)
        .innerJoin(users, eq(examSessions.userId, users.id))
        .orderBy(desc(examSessions.createdAt))
        .limit(20);

      return recentExams;
    } catch (error) {
      console.error("[Admin] Error fetching recent activity:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch recent activity" });
    }
  }),
});
