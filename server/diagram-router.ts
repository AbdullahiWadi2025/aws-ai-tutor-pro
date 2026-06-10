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
- Use a LEFT-TO-RIGHT horizontal flow. The first node (e.g. User or Internet) starts at x=80, y=280.
- Each subsequent node in the MAIN REQUEST FLOW moves RIGHT by 200px along y=280: x=80, x=280, x=480, x=680, x=880.
- For branching from a single node to two children (e.g. ALB to two EC2 instances): place child 1 at (same_x + 200, y=150) and child 2 at (same_x + 200, y=420). Both children share the same x value.
- After a branch, if both children connect to the same next node (e.g. both EC2 connect to RDS), place that shared node to the RIGHT of the branch children at (branch_x + 200, y=280).
- NEVER place a branched child at a different x than its sibling.
- Minimum horizontal gap: 180px. Minimum vertical gap: 130px.
- Keep x between 80 and 1200, y between 50 and 580.
- If the description mentions "Users" or "clients", use serviceId "user" as the first node.
- MONITORING/SIDE SERVICES PLACEMENT: Services like cloudwatch, cloudtrail, xray, config are NOT part of the main flow. Placement rules:
  a) Find the compute node being monitored (e.g. EC2 Instance 1 at x=680, y=150).
  b) Place the monitoring node at x = compute_node_x + 150, y = compute_node_y + 180. Offset x by +150 so it does NOT block the vertical branching column.
  c) The monitoring node must NEVER share the same x position as a branching point (e.g. where ALB splits into EC2 Instance 1 and EC2 Instance 2).
  d) NEVER place monitoring nodes inline with the main flow (y=280) — they must always be offset vertically.
  e) NEVER place monitoring services at the far left of the canvas or below networking nodes.
  Example: EC2 Instance 1 at x=680, y=150 → CloudWatch at x=830, y=330.

EDGE RULES (critical — follow exactly):
- Only draw edges that represent DIRECT data flow or requests between two services.
- Maximum edges per node: 3. No node should have more than 3 connections total.
- Monitoring services (cloudwatch, cloudtrail, xray, config) must connect to AT MOST ONE node. EDGE DIRECTION: the monitoring service is the SOURCE and the compute node is the TARGET — i.e. { from: cloudwatch_index, to: ec2_index }. This means the arrow points FROM CloudWatch TO EC2, showing CloudWatch observing the compute layer. ALWAYS target a compute node (ec2, lambda, ecs, eks, fargate, batch). NEVER connect monitoring to networking nodes (cloudfront, alb, route53, apigateway, vpc, directconnect) or the user/internet node. If no compute node exists, skip the monitoring edge entirely.
- Security services (iam, waf, shield, guardduty, kms, secretsmanager) should have NO edges unless they are explicitly named in the request flow description.
- ElastiCache is a CACHING LAYER that sits BETWEEN compute and database. When ElastiCache and RDS both exist: EC2/Lambda connects to ElastiCache FIRST, then ElastiCache connects to RDS. NEVER draw RDS → ElastiCache. The correct flow is always: EC2 → ElastiCache → RDS.
- For branching: ALB connects to EC2 Instance 1 AND EC2 Instance 2. Then EACH EC2 connects to the shared database/cache. Do NOT cross-connect EC2 Instance 1 to ElastiCache and EC2 Instance 2 to RDS — both EC2 instances should connect to ElastiCache (if present), and ElastiCache connects to RDS.
- Do NOT add edge labels unless essential and unique (e.g. "HTTPS"). Never use "Monitors", "Manages", "Connects to".
- Keep total edges: aim for (nodes - 1) for linear, max (nodes + 2) for branching.
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

  // Explain the current diagram using AI
  explainDiagram: protectedProcedure
    .input(
      z.object({
        nodes: z.array(z.object({ serviceId: z.string(), label: z.string() })),
        edges: z.array(z.object({ from: z.number(), to: z.number(), label: z.string().optional() })),
      })
    )
    .mutation(async ({ input }) => {
      if (input.nodes.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No nodes to explain." });
      }

      const nodeList = input.nodes.map((n, i) => `${i}: ${n.label} (${n.serviceId})`).join("\n");
      const edgeList = input.edges.map((e) => `${input.nodes[e.from]?.label} → ${input.nodes[e.to]?.label}${e.label ? ` (${e.label})` : ""}`).join("\n");

      const systemPrompt = `You are an AWS Solutions Architect explaining an architecture diagram to someone studying for AWS certification.

Given a list of AWS services (nodes) and their connections (edges), provide a clear, educational explanation structured as follows:

1. **Architecture Summary** — 2-3 sentences describing what this architecture does and what pattern it follows (e.g. 3-tier web app, serverless API, microservices).
2. **Service Breakdown** — For each service, one bullet point: what it does in THIS architecture and why it was chosen.
3. **Data Flow** — A numbered step-by-step walkthrough of how a request flows through the system.
4. **AWS Well-Architected Notes** — 2-3 brief notes on how this architecture addresses reliability, performance, or security.

Keep the tone educational and concise. Use markdown formatting. Target audience: someone studying for SAA-C03 or CLF-C02.`;

      const userMessage = `Nodes:\n${nodeList}\n\nConnections:\n${edgeList || "(no connections yet)"}`;

      let raw: string;
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        });
        raw = (response.choices?.[0]?.message?.content as string) ?? "";
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI service unavailable" });
      }

      return { explanation: raw };
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
