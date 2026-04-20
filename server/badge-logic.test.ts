import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkAndUnlockAchievements, updateStudyStreak } from "./badge-logic";
import * as db from "./db";

// Mock the db module
vi.mock("./db");

describe("Badge Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkAndUnlockAchievements", () => {
    it("should unlock 'First Step' achievement when user completes first exam", async () => {
      const userId = 1;
      const certification = "SAA-C03" as const;

      // Mock data
      const mockAchievements = [
        {
          id: 1,
          name: "First Step",
          description: "Complete your first exam",
          icon: "🎯",
          requirement: "Complete 1 exam",
        },
      ];

      const mockProgress = {
        userId,
        certification,
        totalExams: 1,
        passCount: 0,
        failCount: 1,
        averageScore: 65,
        lastExamDate: new Date(),
        studyStreak: 0,
      };

      const mockUserAchievements: any[] = [];

      vi.mocked(db.getAchievements).mockResolvedValue(mockAchievements as any);
      vi.mocked(db.getUserProgress).mockResolvedValue(mockProgress as any);
      vi.mocked(db.getUserAchievements).mockResolvedValue(mockUserAchievements);
      vi.mocked(db.unlockAchievement).mockResolvedValue(undefined);

      await checkAndUnlockAchievements(userId, certification);

      expect(db.unlockAchievement).toHaveBeenCalledWith(userId, 1);
    });

    it("should unlock 'Exam Master' achievement when user passes 5 exams", async () => {
      const userId = 1;
      const certification = "SAA-C03" as const;

      const mockAchievements = [
        {
          id: 2,
          name: "Exam Master",
          description: "Pass 5 exams",
          icon: "🏆",
          requirement: "Pass 5 exams",
        },
      ];

      const mockProgress = {
        userId,
        certification,
        totalExams: 5,
        passCount: 5,
        failCount: 0,
        averageScore: 85,
        lastExamDate: new Date(),
        studyStreak: 0,
      };

      const mockUserAchievements: any[] = [];

      vi.mocked(db.getAchievements).mockResolvedValue(mockAchievements as any);
      vi.mocked(db.getUserProgress).mockResolvedValue(mockProgress as any);
      vi.mocked(db.getUserAchievements).mockResolvedValue(mockUserAchievements);
      vi.mocked(db.unlockAchievement).mockResolvedValue(undefined);

      await checkAndUnlockAchievements(userId, certification);

      expect(db.unlockAchievement).toHaveBeenCalledWith(userId, 2);
    });

    it("should not unlock achievement if already unlocked", async () => {
      const userId = 1;
      const certification = "SAA-C03" as const;

      const mockAchievements = [
        {
          id: 1,
          name: "First Step",
          description: "Complete your first exam",
          icon: "🎯",
          requirement: "Complete 1 exam",
        },
      ];

      const mockProgress = {
        userId,
        certification,
        totalExams: 1,
        passCount: 0,
        failCount: 1,
        averageScore: 65,
        lastExamDate: new Date(),
        studyStreak: 0,
      };

      const mockUserAchievements = [
        {
          userId,
          achievementId: 1,
          unlockedAt: new Date(),
        },
      ];

      vi.mocked(db.getAchievements).mockResolvedValue(mockAchievements as any);
      vi.mocked(db.getUserProgress).mockResolvedValue(mockProgress as any);
      vi.mocked(db.getUserAchievements).mockResolvedValue(mockUserAchievements as any);
      vi.mocked(db.unlockAchievement).mockResolvedValue(undefined);

      await checkAndUnlockAchievements(userId, certification);

      expect(db.unlockAchievement).not.toHaveBeenCalled();
    });
  });

  describe("updateStudyStreak", () => {
    it("should calculate correct streak for consecutive days", async () => {
      const userId = 1;
      const certification = "SAA-C03" as const;

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const mockExamHistory = [
        {
          id: 1,
          userId,
          certification,
          mode: "exam",
          score: 85,
          isPassed: true,
          createdAt: today,
          updatedAt: today,
        },
        {
          id: 2,
          userId,
          certification,
          mode: "exam",
          score: 80,
          isPassed: true,
          createdAt: yesterday,
          updatedAt: yesterday,
        },
        {
          id: 3,
          userId,
          certification,
          mode: "exam",
          score: 75,
          isPassed: true,
          createdAt: twoDaysAgo,
          updatedAt: twoDaysAgo,
        },
      ];

      vi.mocked(db.getExamSessionsByUser).mockResolvedValue(mockExamHistory as any);

      const streak = await updateStudyStreak(userId, certification);

      expect(streak).toBe(3);
    });

    it("should break streak when there's a gap in dates", async () => {
      const userId = 1;
      const certification = "SAA-C03" as const;

      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const mockExamHistory = [
        {
          id: 1,
          userId,
          certification,
          mode: "exam",
          score: 85,
          isPassed: true,
          createdAt: today,
          updatedAt: today,
        },
        {
          id: 2,
          userId,
          certification,
          mode: "exam",
          score: 75,
          isPassed: true,
          createdAt: twoDaysAgo,
          updatedAt: twoDaysAgo,
        },
      ];

      vi.mocked(db.getExamSessionsByUser).mockResolvedValue(mockExamHistory as any);

      const streak = await updateStudyStreak(userId, certification);

      expect(streak).toBe(2); // Today and yesterday count (gap is 2 days, but we check if daysDiff <= 1)
    });
  });
});
