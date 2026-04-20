import * as db from "./db";

/**
 * Check and unlock achievements based on user progress
 */
export async function checkAndUnlockAchievements(userId: number, certification: "SAA-C03" | "CLF-C02") {
  const achievements = await db.getAchievements();
  
  // Get user progress
  const progress = await db.getUserProgress(userId, certification);
  if (!progress) return;

  // Get user's already unlocked achievements
  const userAchievements = await db.getUserAchievements(userId);
  const unlockedIds = new Set(userAchievements.map(a => a.achievementId));

  // Check each achievement
  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue; // Already unlocked

    let shouldUnlock = false;

    // First Step: Complete 1 exam
    if (achievement.name === "First Step" && progress.totalExams >= 1) {
      shouldUnlock = true;
    }

    // Exam Master: Pass 5 exams
    if (achievement.name === "Exam Master" && progress.passCount >= 5) {
      shouldUnlock = true;
    }

    // Perfect Score: 100% on an exam
    if (achievement.name === "Perfect Score") {
      const examHistory = await db.getExamSessionsByUser(userId, certification);
      if (examHistory && examHistory.some(e => parseFloat(e.score as any) === 100)) {
        shouldUnlock = true;
      }
    }

    // Topic Expert: 90%+ accuracy on a topic
    if (achievement.name === "Topic Expert") {
      const topicPerf = await db.getTopicPerformance(userId, certification);
      if (topicPerf && topicPerf.some(t => t.accuracy && parseFloat(t.accuracy as any) >= 90)) {
        shouldUnlock = true;
      }
    }

    // Consistent Learner: 7-day streak (check in user_progress)
    if (achievement.name === "Consistent Learner" && progress.studyStreak >= 7) {
      shouldUnlock = true;
    }

    // Practice Champion: 100 practice questions answered
    if (achievement.name === "Practice Champion") {
      const examHistory = await db.getExamSessionsByUser(userId, certification);
      const practiceCount = examHistory
        ? examHistory
            .filter(e => e.mode === "practice")
            .reduce((sum, e) => sum + (e.questionsAttempted || 0), 0)
        : 0;
      if (practiceCount >= 100) {
        shouldUnlock = true;
      }
    }

    // SAA Specialist: Pass SAA-C03 exam
    if (achievement.name === "SAA Specialist" && certification === "SAA-C03" && progress.passCount >= 1) {
      shouldUnlock = true;
    }

    // Cloud Practitioner: Pass CLF-C02 exam
    if (achievement.name === "Cloud Practitioner" && certification === "CLF-C02" && progress.passCount >= 1) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      await db.unlockAchievement(userId, achievement.id);
    }
  }
}

/**
 * Update study streak based on exam dates
 */
export async function updateStudyStreak(userId: number, certification: "SAA-C03" | "CLF-C02") {
  const progress = await db.getUserProgress(userId, certification);
  if (!progress) return;

  const examHistory = await db.getExamSessionsByUser(userId, certification);
  if (examHistory.length === 0) return;

  // Sort exams by date (newest first)
  const sortedExams = examHistory.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate streak
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const exam of sortedExams) {
    const examDate = new Date(exam.createdAt);
    examDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - examDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If exam is from today or yesterday, continue streak
    if (daysDiff === 0 || daysDiff === 1) {
      streak++;
      currentDate = new Date(examDate);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break; // Streak broken
    }
  }

  // Update progress with new streak
  if (streak !== progress.studyStreak) {
    // Note: This would require adding an updateUserProgress function
    // For now, we just calculate it on-demand
  }

  return streak;
}
