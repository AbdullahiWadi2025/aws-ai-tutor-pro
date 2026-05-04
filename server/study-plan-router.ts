import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { studyPlans, topicPerformance } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// Certification metadata
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

// Day-of-week names
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Expand a week plan into individual days programmatically
// Shorten a topic string by removing parenthetical details
function shortTopic(topic: string): string {
  return topic.replace(/\s*\(.*?\)/g, "").trim();
}

function expandWeekToDays(
  weekNumber: number,
  weekTheme: string,
  weekTopics: string[],
  startDate: Date,
  daysInWeek: number,
  hoursPerDay: number,
  isLastWeek: boolean
): Array<{
  day: number;
  date: string;
  dayName: string;
  topic: string;
  subtopics: string[];
  tasks: string[];
  practiceQuestions: number;
  estimatedHours: number;
  priority: "high" | "medium" | "review";
}> {
  const days = [];
  const topicCount = weekTopics.length;

  for (let i = 0; i < daysInWeek; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = DAY_NAMES[d.getDay()];

    // Last day of each week = review day
    const isReviewDay = i === daysInWeek - 1;
    // Last week = all review
    const priority: "high" | "medium" | "review" = isLastWeek || isReviewDay
      ? "review"
      : i < Math.ceil(daysInWeek * 0.5)
      ? "high"
      : "medium";

    const topicIndex = isReviewDay ? -1 : i % Math.max(1, topicCount);
    const topic = isReviewDay
      ? "Weekly Review & Practice"
      : weekTopics[topicIndex] || weekTopics[0];

    const practiceQuestions = isReviewDay
      ? Math.round(hoursPerDay * 8)
      : Math.round(hoursPerDay * 5);

    const st = shortTopic(topic);
    const subtopics = isReviewDay
      ? ["Review all week topics", "Identify gaps", "Take practice quiz"]
      : [
          `${st} — core concepts`,
          `${st} — hands-on practice`,
          `${st} — exam scenarios`,
        ];

    const tasks = isReviewDay
      ? [
          "Re-read notes from the week (1 hour)",
          `Take a ${practiceQuestions}-question practice quiz`,
          "Flag weak areas for next week",
        ]
      : [
          `Study ${st} in AWS documentation (${Math.ceil(hoursPerDay * 0.5)} hour)`,
          `Watch ${st} video course modules`,
          `Complete ${practiceQuestions} practice questions on ${st}`,
          hoursPerDay >= 2 ? `Build a hands-on lab for ${st}` : `Review ${st} exam tips`,
        ];

    days.push({
      day: (weekNumber - 1) * 7 + i + 1,
      date: dateStr,
      dayName,
      topic,
      subtopics,
      tasks,
      practiceQuestions,
      estimatedHours: hoursPerDay,
      priority,
    });
  }

  return days;
}

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

      // Calculate days until exam (cap at 56 days = 8 weeks)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const examDay = new Date(input.examDate);
      examDay.setHours(0, 0, 0, 0);
      const rawDays = Math.ceil((examDay.getTime() - today.getTime()) / 86400000);
      const daysUntilExam = Math.max(7, Math.min(56, rawDays));
      const numWeeks = Math.ceil(daysUntilExam / 7);

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

      // Build a compact prompt — ask for week-level plan only (not day-by-day)
      const weakLine = hasPerformanceData && weakTopics.length > 0
        ? weakTopics.map((t) => t.topic).join(", ")
        : "none identified";
      const strongLine = strongTopics.length > 0
        ? strongTopics.map((t) => t.topic).join(", ")
        : "none identified";

      const systemPrompt = "You are an AWS certification coach. Return ONLY valid JSON, no markdown, no extra text.";

      const userPrompt = `Generate a ${numWeeks}-week AWS study plan. Return this exact JSON structure (no extra fields):
{
  "readinessScore": <integer 0-100>,
  "weakAreas": [<up to 6 topic strings>],
  "strengths": [<up to 4 topic strings>],
  "examDayTips": [<exactly 5 short tip strings>],
  "resources": [
    {"title": "<name>", "url": "<URL>", "type": "<Documentation|Course|Practice|Whitepaper>"}
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "<short theme string>",
      "topics": [<array of 3-5 topic strings to cover this week>],
      "totalHours": <number>,
      "totalQuestions": <integer>
    }
  ]
}

Parameters:
- Cert: ${certMeta.fullName} (${input.certification})
- Weeks: ${numWeeks}
- Hours/day: ${input.hoursPerDay}
- Level: ${input.knowledgeLevel}
- Topics: ${certMeta.topics.join(", ")}
- Weak areas: ${weakLine}
- Strong areas: ${strongLine}
- readinessScore: beginner=25-40, intermediate=45-65, advanced=70-85 (adjust for weak areas)
- Last week must be "Final Review & Practice Exams" theme
- resources: include 4-6 real AWS study resources with real URLs`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" } as any,
      });

      const content = response.choices[0].message.content as string;
      let llmData: any;
      try {
        llmData = JSON.parse(content);
      } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          llmData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response");
        }
      }

      // Expand week-level plan into day-by-day programmatically
      const expandedWeeks: any[] = [];
      let dayCounter = 0;

      for (let w = 0; w < (llmData.weeks || []).length; w++) {
        const week = llmData.weeks[w];
        const weekStartDate = new Date(today);
        weekStartDate.setDate(today.getDate() + dayCounter);

        const remainingDays = daysUntilExam - dayCounter;
        const daysInWeek = Math.min(7, remainingDays);
        if (daysInWeek <= 0) break;

        const isLastWeek = w === (llmData.weeks.length - 1);
        const expandedDays = expandWeekToDays(
          week.weekNumber || w + 1,
          week.theme || `Week ${w + 1}`,
          week.topics || certMeta.topics.slice(0, 4),
          weekStartDate,
          daysInWeek,
          input.hoursPerDay,
          isLastWeek
        );

        expandedWeeks.push({
          weekNumber: week.weekNumber || w + 1,
          theme: week.theme || `Week ${w + 1}`,
          totalHours: week.totalHours || daysInWeek * input.hoursPerDay,
          totalQuestions: week.totalQuestions || daysInWeek * Math.round(input.hoursPerDay * 5),
          days: expandedDays,
        });

        dayCounter += daysInWeek;
      }

      const planData = {
        readinessScore: llmData.readinessScore ?? 50,
        weakAreas: llmData.weakAreas ?? weakTopics.map((t) => t.topic),
        strengths: llmData.strengths ?? strongTopics.map((t) => t.topic),
        examDayTips: llmData.examDayTips ?? [
          "Arrive 30 minutes early to the testing center",
          "Flag difficult questions and return to them",
          "Read each question twice before answering",
          "Eliminate obviously wrong answers first",
          "Trust your preparation — you are ready",
        ],
        resources: llmData.resources ?? [
          { title: "AWS Documentation", url: "https://docs.aws.amazon.com", type: "Documentation" },
          { title: "AWS Skill Builder", url: "https://skillbuilder.aws", type: "Course" },
          { title: "AWS Whitepapers", url: "https://aws.amazon.com/whitepapers", type: "Whitepaper" },
        ],
        weeks: expandedWeeks,
      };

      // Save to database
      await db.insert(studyPlans).values({
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

  // Public demo — no auth, no DB save. Used on the homepage for visitors.
  generateDemo: publicProcedure
    .input(z.object({
      certification: z.string(),
      examDate: z.string(),
      hoursPerDay: z.number().min(0.5).max(8),
      knowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]),
    }))
    .mutation(async ({ input }) => {
      const certMeta = CERT_META[input.certification];
      if (!certMeta) throw new Error("Unknown certification");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const examDay = new Date(input.examDate);
      examDay.setHours(0, 0, 0, 0);
      const rawDays = Math.ceil((examDay.getTime() - today.getTime()) / 86400000);
      const daysUntilExam = Math.max(7, Math.min(56, rawDays));
      const numWeeks = Math.ceil(daysUntilExam / 7);

      const systemPrompt = "You are an AWS certification coach. Return ONLY valid JSON, no markdown, no extra text.";
      const userPrompt = `Generate a ${numWeeks}-week AWS study plan. Return this exact JSON structure (no extra fields):
{
  "readinessScore": <integer 0-100>,
  "weakAreas": [<up to 6 topic strings>],
  "strengths": [<up to 4 topic strings>],
  "examDayTips": [<exactly 5 short tip strings>],
  "resources": [
    {"title": "<name>", "url": "<URL>", "type": "<Documentation|Course|Practice|Whitepaper>"}
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "<short theme string>",
      "topics": [<array of 3-5 topic strings to cover this week>],
      "totalHours": <number>,
      "totalQuestions": <integer>
    }
  ]
}

Parameters:
- Cert: ${certMeta.fullName} (${input.certification})
- Weeks: ${numWeeks}
- Hours/day: ${input.hoursPerDay}
- Level: ${input.knowledgeLevel}
- Topics: ${certMeta.topics.join(", ")}
- Weak areas: none identified (new user)
- Strong areas: none identified (new user)
- readinessScore: beginner=25-40, intermediate=45-65, advanced=70-85
- Last week must be "Final Review & Practice Exams" theme
- resources: include 4-6 real AWS study resources with real URLs`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" } as any,
      });

      const content = response.choices[0].message.content as string;
      let llmData: any;
      try {
        llmData = JSON.parse(content);
      } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) llmData = JSON.parse(jsonMatch[0]);
        else throw new Error("Failed to parse AI response");
      }

      // Expand week-level plan into day-by-day
      const expandedWeeks: any[] = [];
      let dayCounter = 0;
      for (let w = 0; w < (llmData.weeks || []).length; w++) {
        const week = llmData.weeks[w];
        const weekStartDate = new Date(today);
        weekStartDate.setDate(today.getDate() + dayCounter);
        const remainingDays = daysUntilExam - dayCounter;
        const daysInWeek = Math.min(7, remainingDays);
        if (daysInWeek <= 0) break;
        const isLastWeek = w === (llmData.weeks.length - 1);
        const expandedDays = expandWeekToDays(
          week.weekNumber || w + 1,
          week.theme || `Week ${w + 1}`,
          week.topics || certMeta.topics.slice(0, 4),
          weekStartDate,
          daysInWeek,
          input.hoursPerDay,
          isLastWeek
        );
        expandedWeeks.push({
          weekNumber: week.weekNumber || w + 1,
          theme: week.theme || `Week ${w + 1}`,
          totalHours: week.totalHours || daysInWeek * input.hoursPerDay,
          totalQuestions: week.totalQuestions || daysInWeek * Math.round(input.hoursPerDay * 5),
          days: expandedDays,
        });
        dayCounter += daysInWeek;
      }

      return {
        success: true,
        plan: {
          readinessScore: llmData.readinessScore ?? 50,
          weakAreas: llmData.weakAreas ?? [],
          strengths: llmData.strengths ?? [],
          examDayTips: llmData.examDayTips ?? [],
          resources: llmData.resources ?? [],
          weeks: expandedWeeks,
        },
        daysUntilExam,
        certMeta: {
          fullName: certMeta.fullName,
          passingScore: certMeta.passingScore,
          questionCount: certMeta.questionCount,
          duration: certMeta.duration,
        },
      };
    }),
});
