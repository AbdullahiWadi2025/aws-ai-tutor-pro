import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { gameScores, users } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const gameRouter = router({
  // Submit / upsert a user's game score after completing a lesson
  submitScore: protectedProcedure
    .input(
      z.object({
        xpEarned: z.number().min(0),
        streak: z.number().min(0),
        lessonsCompleted: z.number().min(1).default(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      // Check if user already has a row
      const existing = await db
        .select()
        .from(gameScores)
        .where(eq(gameScores.userId, userId))
        .limit(1);

      if (existing.length === 0) {
        // Insert new row
        await db.insert(gameScores).values({
          userId,
          totalXp: input.xpEarned,
          lessonsCompleted: input.lessonsCompleted,
          bestStreak: input.streak,
        });
      } else {
        const current = existing[0];
        await db
          .update(gameScores)
          .set({
            totalXp: current.totalXp + input.xpEarned,
            lessonsCompleted: current.lessonsCompleted + input.lessonsCompleted,
            bestStreak: Math.max(current.bestStreak, input.streak),
          })
          .where(eq(gameScores.userId, userId));
      }

      return { success: true };
    }),

  // Get top 10 leaderboard
  getLeaderboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const rows = await db
      .select({
        userId: gameScores.userId,
        totalXp: gameScores.totalXp,
        lessonsCompleted: gameScores.lessonsCompleted,
        bestStreak: gameScores.bestStreak,
        name: users.name,
      })
      .from(gameScores)
      .innerJoin(users, eq(gameScores.userId, users.id))
      .orderBy(desc(gameScores.totalXp))
      .limit(10);

    return rows.map((row: typeof rows[number], index: number) => ({
      rank: index + 1,
      userId: row.userId,
      name: row.name || "Anonymous",
      totalXp: row.totalXp,
      lessonsCompleted: row.lessonsCompleted,
      bestStreak: row.bestStreak,
      isCurrentUser: row.userId === ctx.user.id,
    }));
  }),

  // Get current user's score
  getMyScore: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const userId = ctx.user.id;

    const rows = await db
      .select()
      .from(gameScores)
      .where(eq(gameScores.userId, userId))
      .limit(1);

    if (rows.length === 0) {
      return { totalXp: 0, lessonsCompleted: 0, bestStreak: 0 };
    }

    return {
      totalXp: rows[0].totalXp,
      lessonsCompleted: rows[0].lessonsCompleted,
      bestStreak: rows[0].bestStreak,
    };
  }),
});
