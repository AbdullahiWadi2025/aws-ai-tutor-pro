import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { PROJECTS } from "./projects-data";
import { sql } from "drizzle-orm";
import { getDb } from "./db";

export const projectLabRouter = router({
  // List all projects (public — visible to logged-out visitors too)
  getProjects: publicProcedure.query(() => {
    return PROJECTS.map(({ steps, ...rest }) => ({
      ...rest,
      totalSteps: steps.length,
    }));
  }),

  // Get a single project with full steps
  getProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ input }) => {
      const project = PROJECTS.find((p) => p.id === input.projectId);
      if (!project) throw new Error("Project not found");
      return project;
    }),

  // Get the authenticated user's progress for all projects
  getMyProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db.execute(
      sql`SELECT project_id, completed_steps, completed_at, started_at FROM project_progress WHERE user_id = ${ctx.user.id}`
    );
    return (rows[0] as unknown as Array<{
      project_id: string;
      completed_steps: string | number[];
      completed_at: Date | null;
      started_at: Date;
    }>).map((row) => ({
      projectId: row.project_id,
      completedSteps: typeof row.completed_steps === "string"
        ? JSON.parse(row.completed_steps)
        : row.completed_steps,
      completedAt: row.completed_at,
      startedAt: row.started_at,
    }));
  }),

  // Save progress for a specific project
  saveProgress: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        completedSteps: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const project = PROJECTS.find((p) => p.id === input.projectId);
      if (!project) throw new Error("Project not found");

      const isCompleted = input.completedSteps.length === project.steps.length;
      const completedAt = isCompleted ? new Date() : null;
      const stepsJson = JSON.stringify(input.completedSteps);

      // Upsert: insert or update on duplicate (user_id, project_id)
      await db.execute(
        sql`INSERT INTO project_progress (user_id, project_id, completed_steps, completed_at)
            VALUES (${ctx.user.id}, ${input.projectId}, ${stepsJson}, ${completedAt})
            ON DUPLICATE KEY UPDATE
              completed_steps = ${stepsJson},
              completed_at = ${completedAt},
              updated_at = CURRENT_TIMESTAMP`
      );

      return { success: true, isCompleted };
    }),
});
