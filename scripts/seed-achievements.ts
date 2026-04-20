import { getDb } from "../server/db";
import { achievements } from "../drizzle/schema";

const defaultAchievements = [
  {
    name: "First Step",
    description: "Complete your first exam",
    icon: "🎯",
    requirement: "Complete 1 exam",
  },
  {
    name: "Exam Master",
    description: "Pass 5 exams",
    icon: "🏆",
    requirement: "Pass 5 exams",
  },
  {
    name: "Perfect Score",
    description: "Achieve 100% on an exam",
    icon: "⭐",
    requirement: "Score 100% on any exam",
  },
  {
    name: "Consistent Learner",
    description: "Maintain a 7-day study streak",
    icon: "🔥",
    requirement: "Study 7 consecutive days",
  },
  {
    name: "Topic Expert",
    description: "Achieve 90%+ accuracy on a topic",
    icon: "🎓",
    requirement: "Achieve 90%+ accuracy on any topic",
  },
  {
    name: "Speed Runner",
    description: "Complete an exam in under 30 minutes",
    icon: "⚡",
    requirement: "Complete exam in <30 minutes",
  },
  {
    name: "Practice Champion",
    description: "Answer 100 practice questions",
    icon: "💪",
    requirement: "Answer 100 practice questions",
  },
  {
    name: "Knowledge Seeker",
    description: "Ask the AI tutor 10 questions",
    icon: "🧠",
    requirement: "Ask AI tutor 10 questions",
  },
  {
    name: "SAA Specialist",
    description: "Pass the SAA-C03 exam",
    icon: "🏅",
    requirement: "Pass SAA-C03 exam",
  },
  {
    name: "Cloud Practitioner",
    description: "Pass the CLF-C02 exam",
    icon: "☁️",
    requirement: "Pass CLF-C02 exam",
  },
];

async function seedAchievements() {
  console.log("🌱 Seeding default achievements...\n");

  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ Database connection failed");
      process.exit(1);
    }

    console.log(`📚 Inserting ${defaultAchievements.length} achievements...`);
    for (const achievement of defaultAchievements) {
      await db.insert(achievements).values({
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        requirement: achievement.requirement,
      });
    }
    console.log(`✓ Inserted ${defaultAchievements.length} achievements`);

    console.log(`\n✅ Successfully seeded achievements!`);
  } catch (error) {
    console.error("Error seeding achievements:", error);
    process.exit(1);
  }
}

seedAchievements();
