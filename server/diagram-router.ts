import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { diagrams } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

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

  // Generate diagram from plain-text description using AI
  generateFromDescription: protectedProcedure
    .input(z.object({ description: z.string().min(5).max(2000) }))
    .mutation(async ({ input }) => {
      const AWS_SERVICE_IDS = [
        "ec2","lambda","ecs","eks","beanstalk","fargate","lightsail","batch",
        "s3","ebs","efs","glacier","fsx","storagegateway",
        "rds","dynamodb","elasticache","aurora","redshift","neptune","documentdb",
        "vpc","cloudfront","route53","alb","apigateway","directconnect","transitgateway",
        "sqs","sns","kinesis","eventbridge","mq","stepfunctions",
        "iam","cognito","waf","kms","shield","secretsmanager","guardduty",
        "cloudwatch","cloudtrail","xray","config","trustedadvisor",
        "sagemaker","rekognition","bedrock","comprehend","textract","polly",
        "codepipeline","codebuild","codecommit","codedeploy","cloudformation","cdk",
      ];

      const systemPrompt = `You are an AWS architecture diagram generator. Given a plain-text description of an AWS architecture, return ONLY a valid JSON object (no markdown, no explanation) with this exact shape:
{
  "nodes": [
    { "serviceId": "<one of the allowed service IDs>", "label": "<display label>", "x": <number>, "y": <number> }
  ],
  "edges": [
    { "from": <node index 0-based>, "to": <node index 0-based>, "label": "<optional short label or empty string>" }
  ]
}

Allowed serviceId values: ${AWS_SERVICE_IDS.join(", ")}.

LAYOUT RULES (critical — follow exactly):
- Use a LEFT-TO-RIGHT horizontal flow. The first node (e.g. User or Internet) starts at x=80, y=300.
- Each subsequent node in the main flow moves RIGHT by 200px: x=80, x=280, x=480, x=680, x=880, x=1080.
- Keep all nodes on the same horizontal center line (y=300) unless branching.
- For branching (e.g. a node connects to two children), place children above and below the center: y=150 and y=450.
- NEVER stack nodes vertically with the same x value unless they are side branches.
- Minimum horizontal gap between nodes: 180px. Minimum vertical gap: 140px.
- Keep x between 80 and 1200, y between 80 and 600.
- If the description mentions "Users" or "clients", use serviceId "user" as the first node.
- Edges reference node array indices (0-based). Do not create self-loops.
- Return ONLY the raw JSON object. No markdown fences, no explanation text.`;

      let raw: string;
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.description },
          ],
        });
        raw = (response.choices?.[0]?.message?.content as string) ?? "";
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI service unavailable" });
      }

      // Strip markdown fences if present
      const cleaned = raw.replace(/^```[\w]*\n?/m, "").replace(/```$/m, "").trim();
      let parsed: { nodes: { serviceId: string; label: string; x: number; y: number }[]; edges: { from: number; to: number; label: string }[] };
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned invalid JSON. Please try rephrasing your description." });
      }

      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI response missing nodes or edges." });
      }

      return parsed;
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
