import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { diagrams } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const diagramRouter = router({
  // List all diagrams for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const rows = await db
      .select({
        id: diagrams.id,
        name: diagrams.name,
        createdAt: diagrams.createdAt,
        updatedAt: diagrams.updatedAt,
      })
      .from(diagrams)
      .where(eq(diagrams.userId, ctx.user.id))
      .orderBy(desc(diagrams.updatedAt));
    return rows;
  }),

  // Get a single diagram by ID
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [row] = await db
        .select()
        .from(diagrams)
        .where(and(eq(diagrams.id, input.id), eq(diagrams.userId, ctx.user.id)));
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Diagram not found" });
      return {
        ...row,
        nodes: JSON.parse(row.nodesJson || "[]"),
        edges: JSON.parse(row.edgesJson || "[]"),
      };
    }),

  // Save (create or update) a diagram
  save: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        name: z.string().min(1).max(255),
        nodes: z.array(z.any()),
        edges: z.array(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const nodesJson = JSON.stringify(input.nodes);
      const edgesJson = JSON.stringify(input.edges);

      if (input.id) {
        // Update existing
        const [existing] = await db
          .select({ id: diagrams.id })
          .from(diagrams)
          .where(and(eq(diagrams.id, input.id), eq(diagrams.userId, ctx.user.id)));
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Diagram not found" });
        await db
          .update(diagrams)
          .set({ name: input.name, nodesJson, edgesJson })
          .where(eq(diagrams.id, input.id));
        return { id: input.id };
      } else {
        // Create new
        const [result] = await db.insert(diagrams).values({
          userId: ctx.user.id,
          name: input.name,
          nodesJson,
          edgesJson,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return { id: (result as any).insertId as number };
      }
    }),

  // Delete a diagram
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [existing] = await db
        .select({ id: diagrams.id })
        .from(diagrams)
        .where(and(eq(diagrams.id, input.id), eq(diagrams.userId, ctx.user.id)));
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Diagram not found" });
      await db.delete(diagrams).where(eq(diagrams.id, input.id));
      return { success: true };
    }),
});
