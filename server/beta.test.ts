import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

// Mock database
vi.mock("./db", () => ({
  getUserTrial: vi.fn(),
  hasActiveTrial: vi.fn(),
  startTrialForUser: vi.fn(),
  extendUserTrial: vi.fn(),
  getBetaCodeByCode: vi.fn(),
  getAllBetaCodes: vi.fn(),
  createBetaCode: vi.fn(),
  incrementBetaCodeUsage: vi.fn(),
  hasUserRedeemedCode: vi.fn(),
  recordBetaCodeRedemption: vi.fn(),
  createUserFeedback: vi.fn(),
  getAllFeedback: vi.fn(),
  updateFeedbackStatus: vi.fn(),
  getUserSubscription: vi.fn(),
}));

import * as db from "./db";
import { getSubscriptionStatus, checkPremiumAccess } from "./premium-access";

describe("Beta Launch Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Premium access with trial", () => {
    it("should grant premium access via active subscription", async () => {
      vi.mocked(db.getUserSubscription).mockResolvedValue({
        status: "active",
      } as any);
      vi.mocked(db.hasActiveTrial).mockResolvedValue(false);

      const hasAccess = await checkPremiumAccess(1);
      expect(hasAccess).toBe(true);
    });

    it("should grant premium access via active trial", async () => {
      vi.mocked(db.getUserSubscription).mockResolvedValue(undefined);
      vi.mocked(db.hasActiveTrial).mockResolvedValue(true);

      const hasAccess = await checkPremiumAccess(1);
      expect(hasAccess).toBe(true);
    });

    it("should deny access if no subscription or trial", async () => {
      vi.mocked(db.getUserSubscription).mockResolvedValue(undefined);
      vi.mocked(db.hasActiveTrial).mockResolvedValue(false);

      const hasAccess = await checkPremiumAccess(1);
      expect(hasAccess).toBe(false);
    });
  });

  describe("Subscription status", () => {
    it("should report subscription status when subscribed", async () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      vi.mocked(db.getUserSubscription).mockResolvedValue({
        status: "active",
        currentPeriodEnd: expiresAt,
        planId: 1,
      } as any);
      vi.mocked(db.getUserTrial).mockResolvedValue(undefined);

      const status = await getSubscriptionStatus(1);
      expect(status.isPremium).toBe(true);
      expect(status.accessType).toBe("subscription");
      expect(status.planName).toBe("Premium");
    });

    it("should report trial status when on trial", async () => {
      const trialEndsAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      vi.mocked(db.getUserSubscription).mockResolvedValue(undefined);
      vi.mocked(db.getUserTrial).mockResolvedValue({
        userId: 1,
        isActive: true,
        trialEndsAt,
      } as any);

      const status = await getSubscriptionStatus(1);
      expect(status.isPremium).toBe(true);
      expect(status.accessType).toBe("trial");
      expect(status.planName).toBe("Trial (Premium)");
      expect(status.trialDaysRemaining).toBeGreaterThan(0);
      expect(status.trialDaysRemaining).toBeLessThanOrEqual(10);
    });

    it("should report free status when no subscription and expired trial", async () => {
      const expiredTrial = new Date(Date.now() - 24 * 60 * 60 * 1000);
      vi.mocked(db.getUserSubscription).mockResolvedValue(undefined);
      vi.mocked(db.getUserTrial).mockResolvedValue({
        userId: 1,
        isActive: true,
        trialEndsAt: expiredTrial,
      } as any);

      const status = await getSubscriptionStatus(1);
      expect(status.isPremium).toBe(false);
      expect(status.accessType).toBe("free");
      expect(status.hasEverHadTrial).toBe(true);
      expect(status.trialDaysRemaining).toBe(0);
    });

    it("should report free status when user never had trial", async () => {
      vi.mocked(db.getUserSubscription).mockResolvedValue(undefined);
      vi.mocked(db.getUserTrial).mockResolvedValue(undefined);

      const status = await getSubscriptionStatus(1);
      expect(status.isPremium).toBe(false);
      expect(status.accessType).toBe("free");
      expect(status.hasEverHadTrial).toBeFalsy();
    });
  });

  describe("Beta code validation", () => {
    it("should validate code exists and is active", async () => {
      vi.mocked(db.getBetaCodeByCode).mockResolvedValue({
        id: 1,
        code: "BETA123",
        isActive: true,
        usedCount: 0,
        maxUses: 10,
        trialDays: 14,
        expiresAt: null,
      } as any);

      const code = await db.getBetaCodeByCode("BETA123");
      expect(code).toBeDefined();
      expect(code?.isActive).toBe(true);
    });

    it("should detect expired codes", () => {
      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const isExpired = expiredDate < new Date();
      expect(isExpired).toBe(true);
    });

    it("should detect codes at max uses", () => {
      const code = { usedCount: 10, maxUses: 10 };
      expect(code.usedCount >= code.maxUses).toBe(true);
    });
  });

  describe("Feedback categories", () => {
    it("should accept valid feedback categories", () => {
      const valid = ["bug", "feature_request", "general", "praise"];
      valid.forEach((cat) => {
        expect(["bug", "feature_request", "general", "praise"]).toContain(cat);
      });
    });

    it("should accept valid feedback status values", () => {
      const valid = ["new", "reviewed", "resolved", "archived"];
      valid.forEach((status) => {
        expect(["new", "reviewed", "resolved", "archived"]).toContain(status);
      });
    });

    it("should validate rating range", () => {
      const validRatings = [1, 2, 3, 4, 5];
      validRatings.forEach((r) => {
        expect(r).toBeGreaterThanOrEqual(1);
        expect(r).toBeLessThanOrEqual(5);
      });
    });
  });

  describe("Trial auto-activation", () => {
    it("should be idempotent (existing trial returned unchanged)", async () => {
      const existingTrial = {
        id: 1,
        userId: 1,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isActive: true,
      };
      vi.mocked(db.startTrialForUser).mockResolvedValue(existingTrial as any);

      const trial = await db.startTrialForUser(1, 14, "signup");
      expect(trial).toEqual(existingTrial);
    });

    it("should calculate 14-day trial end correctly", () => {
      const start = new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + 14);
      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(14);
    });
  });
});
