import { invokeLLM } from "../server/_core/llm.js";
import fs from "fs";
import path from "path";

const SAA_TOPICS = [
  "EC2",
  "S3",
  "VPC",
  "RDS",
  "DynamoDB",
  "Lambda",
  "CloudFront",
  "Route53",
  "ELB",
  "Auto Scaling",
  "IAM",
  "CloudWatch",
  "SNS",
  "SQS",
  "Kinesis",
  "ElastiCache",
  "Redshift",
  "EMR",
  "CloudFormation",
  "OpsWorks",
];

const CLF_TOPICS = [
  "AWS Global Infrastructure",
  "AWS Services Overview",
  "Compute Services",
  "Storage Services",
  "Database Services",
  "Networking Services",
  "Security & Compliance",
  "Pricing & Support",
  "AWS Well-Architected Framework",
  "Sustainability",
];

async function generateQuestionsForTopic(certification, topic, count) {
  const prompt = `You are an AWS certification exam expert. Generate ${count} realistic, high-quality ${certification} exam questions about "${topic}".

For each question, provide:
1. A realistic scenario-based question (2-3 sentences)
2. Four multiple-choice options (A, B, C, D)
3. The correct answer (single letter)
4. A detailed explanation (2-3 sentences) explaining why the correct answer is right and why others are wrong
5. Related AWS services or concepts

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation here",
    "topic": "${topic}",
    "certification": "${certification}",
    "difficulty": "medium"
  }
]

Make questions realistic, varied, and aligned with the actual ${certification} exam. Include scenario-based questions that test practical AWS knowledge.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an AWS certification expert. Generate realistic exam questions in valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "aws_questions",
          strict: false,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correctAnswer: { type: "number" },
                    explanation: { type: "string" },
                    topic: { type: "string" },
                    certification: { type: "string" },
                    difficulty: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.questions || [];
  } catch (error) {
    console.error(`Error generating questions for ${certification} - ${topic}:`, error);
    return [];
  }
}

async function generateAllQuestions() {
  console.log("🚀 Starting AWS exam question generation...\n");

  const allQuestions = [];

  // Generate SAA-C03 questions
  console.log("📚 Generating AWS SAA-C03 questions...");
  for (const topic of SAA_TOPICS) {
    console.log(`  Generating ${topic} questions...`);
    const questions = await generateQuestionsForTopic("SAA-C03", topic, 25);
    allQuestions.push(...questions);
    console.log(`  ✓ Generated ${questions.length} questions for ${topic}`);
  }

  // Generate CLF-C02 questions
  console.log("\n📚 Generating AWS CLF-C02 questions...");
  for (const topic of CLF_TOPICS) {
    console.log(`  Generating ${topic} questions...`);
    const questions = await generateQuestionsForTopic("CLF-C02", topic, 25);
    allQuestions.push(...questions);
    console.log(`  ✓ Generated ${questions.length} questions for ${topic}`);
  }

  console.log(`\n✅ Total questions generated: ${allQuestions.length}`);

  // Save to file
  const outputPath = path.join(process.cwd(), "generated-questions.json");
  fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2));
  console.log(`📁 Questions saved to: ${outputPath}`);

  return allQuestions;
}

// Run generation
generateAllQuestions().catch(console.error);
