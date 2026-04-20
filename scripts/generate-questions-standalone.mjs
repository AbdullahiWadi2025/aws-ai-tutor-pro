import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL || "https://api.manus.im";
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY || "";

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

async function invokeLLM(messages, responseFormat) {
  const response = await fetch(`${FORGE_API_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FORGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      response_format: responseFormat,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function generateQuestionsForTopic(certification, topic, count) {
  const prompt = `You are an AWS certification exam expert. Generate ${count} realistic, high-quality ${certification} exam questions about "${topic}".

For each question, provide:
1. A realistic scenario-based question (2-3 sentences)
2. Four multiple-choice options (A, B, C, D)
3. The correct answer (single letter: A, B, C, or D)
4. A detailed explanation (2-3 sentences) explaining why the correct answer is right and why others are wrong
5. Related AWS services or concepts

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Explanation here",
    "topic": "${topic}",
    "certification": "${certification}",
    "difficulty": "medium"
  }
]

Make questions realistic, varied, and aligned with the actual ${certification} exam. Include scenario-based questions that test practical AWS knowledge.`;

  try {
    const response = await invokeLLM(
      [
        {
          role: "system",
          content: "You are an AWS certification expert. Generate realistic exam questions in valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      {
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
                },
              },
            },
          },
        },
      }
    );

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
    
    // Normalize correctAnswer to index (0-3)
    return questions.map((q) => ({
      ...q,
      correctAnswer:
        typeof q.correctAnswer === "string"
          ? q.correctAnswer.charCodeAt(0) - 65 // Convert A->0, B->1, etc.
          : q.correctAnswer,
    }));
  } catch (error) {
    console.error(`Error generating questions for ${certification} - ${topic}:`, error.message);
    return [];
  }
}

async function generateAllQuestions() {
  console.log("🚀 Starting AWS exam question generation...\n");

  const allQuestions = [];

  // Generate SAA-C03 questions (20 topics × 25 questions = 500)
  console.log("📚 Generating AWS SAA-C03 questions (500 total)...");
  for (const topic of SAA_TOPICS) {
    console.log(`  Generating ${topic} questions...`);
    const questions = await generateQuestionsForTopic("SAA-C03", topic, 25);
    allQuestions.push(...questions);
    console.log(`  ✓ Generated ${questions.length} questions for ${topic}`);
    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Generate CLF-C02 questions (10 topics × 50 questions = 500)
  console.log("\n📚 Generating AWS CLF-C02 questions (500 total)...");
  for (const topic of CLF_TOPICS) {
    console.log(`  Generating ${topic} questions...`);
    const questions = await generateQuestionsForTopic("CLF-C02", topic, 50);
    allQuestions.push(...questions);
    console.log(`  ✓ Generated ${questions.length} questions for ${topic}`);
    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Total questions generated: ${allQuestions.length}`);

  // Save to file
  const outputPath = path.join(process.cwd(), "generated-questions.json");
  fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2));
  console.log(`📁 Questions saved to: ${outputPath}`);

  return allQuestions;
}

// Run generation
generateAllQuestions().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
