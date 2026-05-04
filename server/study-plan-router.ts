import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { studyPlans, topicPerformance } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// Certification metadata for the AI prompt
const CERT_META: Record<string, {
  fullName: string;
  passingScore: number;
  duration: number;
  questionCount: number;
  topics: string[];
}> = {
  "CLF-C02": {
    fullName: "AWS Certified Cloud Practitioner",
    passingScore: 700,
    duration: 90,
    questionCount: 65,
    topics: [
      "Cloud Concepts", "AWS Global Infrastructure", "IAM & Security",
      "Core AWS Services (EC2, S3, RDS, Lambda)", "Billing & Pricing",
      "Cloud Architecture & Design Principles", "Support Plans",
    ],
  },
  "SAA-C03": {
    fullName: "AWS Certified Solutions Architect – Associate",
    passingScore: 720,
    duration: 130,
    questionCount: 65,
    topics: [
      "IAM & Security", "EC2 & Compute", "S3 & Storage",
      "VPC & Networking", "RDS & Databases", "High Availability & Fault Tolerance",
      "Serverless (Lambda, API Gateway, SQS, SNS)", "CloudFront & CDN",
      "Auto Scaling & Load Balancing", "Cost Optimization", "Migration & Transfer",
    ],
  },
  "SOA-C02": {
    fullName: "AWS Certified SysOps Administrator – Associate",
    passingScore: 720,
    duration: 130,
    questionCount: 65,
    topics: [
      "Monitoring & Reporting (CloudWatch, CloudTrail)", "High Availability",
      "Deployment & Provisioning (CloudFormation, Elastic Beanstalk)",
      "Storage & Data Management", "Security & Compliance",
      "Networking (VPC, Route 53, ELB)", "Automation & Optimization",
    ],
  },
  "DVA-C02": {
    fullName: "AWS Certified Developer – Associate",
    passingScore: 720,
    duration: 130,
    questionCount: 65,
    topics: [
      "AWS SDK & CLI", "IAM & Security", "Lambda & Serverless",
      "API Gateway", "DynamoDB", "S3 & Storage", "SQS, SNS & EventBridge",
      "CodePipeline, CodeBuild, CodeDeploy", "CloudFormation & SAM",
      "X-Ray & Debugging", "Elastic Beanstalk",
    ],
  },
  "SAP-C02": {
    fullName: "AWS Certified Solutions Architect – Professional",
    passingScore: 750,
    duration: 180,
    questionCount: 75,
    topics: [
      "Organizational Complexity & Multi-Account", "New Solutions Design",
      "Migration Planning", "Cost Control", "Continuous Improvement",
      "Advanced Networking", "Security & Compliance at Scale",
      "Disaster Recovery", "Hybrid Architectures",
    ],
  },
  "DOP-C02": {
    fullName: "AWS Certified DevOps Engineer – Professional",
    passingScore: 750,
    duration: 180,
    questionCount: 75,
    topics: [
      "SDLC Automation (CodePipeline, CodeBuild, CodeDeploy)",
      "Configuration Management (CloudFormation, OpsWorks, SSM)",
      "Monitoring & Logging (CloudWatch, X-Ray, CloudTrail)",
      "Policies & Standards Automation", "Incident & Event Response",
      "High Availability & Fault Tolerance",
    ],
  },
  "SCS-C02": {
    fullName: "AWS Certified Security – Specialty",
    passingScore: 750,
    duration: 170,
    questionCount: 65,
    topics: [
      "Threat Detection & Incident Response (GuardDuty, Security Hub)",
      "Security Logging & Monitoring", "Infrastructure Security (VPC, WAF, Shield)",
      "Identity & Access Management (IAM, STS, Cognito)",
      "Data Protection (KMS, ACM, Secrets Manager)",
      "Compliance & Governance",
    ],
  },
  "ANS-C01": {
    fullName: "AWS Certified Advanced Networking – Specialty",
    passingScore: 750,
    duration: 170,
    questionCount: 65,
    topics: [
      "VPC Design & Implementation", "Hybrid Connectivity (VPN, Direct Connect)",
      "Network Security", "Route 53 & DNS", "CloudFront & Global Accelerator",
      "Load Balancing & Traffic Management", "Network Automation",
    ],
  },
  "MLS-C01": {
    fullName: "AWS Certified Machine Learning – Specialty",
    passingScore: 750,
    duration: 170,
    questionCount: 65,
    topics: [
      "Data Engineering (S3, Glue, Kinesis)", "Exploratory Data Analysis",
      "Modeling (SageMaker, algorithms)", "ML Implementation & Operations",
      "Evaluation & Optimization",
    ],
  },
  "DAS-C01": {
    fullName: "AWS Certified Data Analytics – Specialty",
    passingScore: 750,
    duration: 180,
    questionCount: 65,
    topics: [
      "Collection (Kinesis, DMS, Snow Family)", "Storage (S3, DynamoDB, Redshift)",
      "Processing (EMR, Glue, Lambda)", "Analysis (Athena, QuickSight, OpenSearch)",
      "Visualization", "Data Security",
    ],
  },
  "AIF-C01": {
    fullName: "AWS Certified AI Practitioner",
    passingScore: 700,
    duration: 90,
    questionCount: 65,
    topics: [
      "AI & ML Fundamentals", "Generative AI Concepts",
      "AWS AI/ML Services (SageMaker, Bedrock, Rekognition, Comprehend, Transcribe)",
      "Responsible AI", "Security & Compliance for AI",
    ],
  },
};

export const studyPlanRouter = router({
  generate: protectedProcedure
    .input(z.object({
      certification: z.string(),
      examDate: z.string(),
      hoursPerDay: z.number().min(0.5).max(8),
      knowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const certMeta = CERT_META[input.certification];
      if (!certMeta) throw new Error("Unknown certification");

      // Calculate days until exam
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const examDay = new Date(input.examDate);
      examDay.setHours(0, 0, 0, 0);
      const daysUntilExam = Math.max(1, Math.min(90, Math.ceil((examDay.getTime() - today.getTime()) / 86400000)));

      // Pull weak topics from topicPerformance table
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const topicRows = await db
        .select()
        .from(topicPerformance)
        .where(
          and(
            eq(topicPerformance.userId, userId),
            eq(topicPerformance.certification, input.certification as any)
          )
        );

      const weakTopics = topicRows
        .filter((t) => Number(t.accuracy) < 70 && t.totalCount > 0)
        .sort((a, b) => Number(a.accuracy) - Number(b.accuracy))
        .slice(0, 5)
        .map((t) => ({ topic: t.topic, accuracy: Number(t.accuracy) }));

      const strongTopics = topicRows
        .filter((t) => Number(t.accuracy) >= 80 && t.totalCount > 0)
        .sort((a, b) => Number(b.accuracy) - Number(a.accuracy))
        .slice(0, 3)
        .map((t) => ({ topic: t.topic, accuracy: Number(t.accuracy) }));

      const hasPerformanceData = topicRows.length > 0;

      const weakAreasLine = hasPerformanceData
        ? "- Weak areas (from practice data): " + (weakTopics.length > 0
            ? weakTopics.map((t) => t.topic + " (" + t.accuracy.toFixed(0) + "% accuracy)").join(", ")
            : "none identified yet")
        : "- No practice data yet — distribute topics evenly";

      const strongAreasLine = strongTopics.length > 0
        ? "- Strong areas: " + strongTopics.map((t) => t.topic + " (" + t.accuracy.toFixed(0) + "%)").join(", ")
        : "";

      const systemPrompt = "You are an expert AWS certification coach. Generate a detailed, personalized study plan in JSON format. Return ONLY valid JSON, no markdown, no explanation.";

      const userPrompt = [
        "Generate a complete AWS study plan with this exact JSON structure:",
        '{',
        '  "readinessScore": <0-100 integer>,',
        '  "weakAreas": [<array of topic strings>],',
        '  "strengths": [<array of topic strings>],',
        '  "examDayTips": [<array of 4-5 practical tip strings>],',
        '  "resources": [',
        '    {"title": "<resource name>", "url": "<URL>", "type": "<Documentation|Whitepaper|Course|Practice>"}',
        '  ],',
        '  "weeks": [',
        '    {',
        '      "weekNumber": 1,',
        '      "theme": "<week theme string>",',
        '      "days": [',
        '        {',
        '          "day": 1,',
        '          "date": "<YYYY-MM-DD>",',
        '          "topic": "<specific topic>",',
        '          "subtopics": [<array of 2-3 subtopic strings>],',
        '          "tasks": [<array of 2-4 concrete actionable task strings>],',
        '          "practiceQuestions": <integer 5-20>,',
        '          "estimatedHours": <number>,',
        '          "priority": "<high|medium|review>"',
        '        }',
        '      ]',
        '    }',
        '  ]',
        '}',
        '',
        "Input parameters:",
        "- Certification: " + certMeta.fullName + " (" + input.certification + ")",
        "- Passing score: " + certMeta.passingScore + "/1000",
        "- Exam duration: " + certMeta.duration + " minutes, " + certMeta.questionCount + " questions",
        "- Days until exam: " + daysUntilExam + " days",
        "- Daily study budget: " + input.hoursPerDay + " hours/day",
        "- Knowledge level: " + input.knowledgeLevel,
        "- Official topics: " + certMeta.topics.join(", "),
        weakAreasLine,
        strongAreasLine,
        "",
        "Rules:",
        "1. Cap the plan at " + daysUntilExam + " days total (max 90)",
        "2. Prioritize weak areas — schedule them in the first 60% of the plan",
        "3. Last 20% of days should be review and practice exams",
        "4. estimatedHours per day must not exceed " + input.hoursPerDay,
        "5. practiceQuestions should scale with hoursPerDay (more hours = more questions)",
        "6. Start dates from today: " + today.toISOString().split("T")[0],
        "7. readinessScore should reflect: knowledge level (beginner=30, intermediate=55, advanced=75) adjusted by time available and weak areas",
        "8. Return ONLY the JSON object, nothing else",
      ].join("\n");

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" } as any,
      });

      const content = response.choices[0].message.content as string;
      let planData: any;
      try {
        planData = JSON.parse(content);
      } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          planData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response");
        }
      }

      // Save to database (db is guaranteed non-null from the check above)
      await db!.insert(studyPlans).values({
        userId,
        certification: input.certification,
        examDate: input.examDate,
        hoursPerDay: String(input.hoursPerDay) as any,
        knowledgeLevel: input.knowledgeLevel,
        readinessScore: planData.readinessScore ?? null,
        planJson: planData,
      });

      return {
        success: true,
        plan: planData,
        weakTopics,
        strongTopics,
        daysUntilExam,
        certMeta: {
          fullName: certMeta.fullName,
          passingScore: certMeta.passingScore,
          questionCount: certMeta.questionCount,
          duration: certMeta.duration,
        },
      };
    }),

  getMine: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const plans = await db
      .select()
      .from(studyPlans)
      .where(eq(studyPlans.userId, ctx.user.id))
      .orderBy(desc(studyPlans.createdAt))
      .limit(5);
    return plans;
  }),
});
