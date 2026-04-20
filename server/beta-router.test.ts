import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB helpers
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
  upsertUser: vi.fn(),
}));

import * as db from "./db";
import { appRouter } from "./routers";

function makeCtx(role: "admin" | "user" = "user") {
  return {
    user: {
      id: 1,
      openId: "test-open-id",
      name: "Test User",
      email: "test@example.com",
      role,
      lastSignedIn: new Date(),
    },
    req: { headers: { origin: "http://localhost:3000" } },
  } as any;
}

describe("Beta Router Procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("beta.getMyStatus", () => {
    it("returns free status for non-premium user without trial", async () => {
      vi.mocked(db.getUserSubscription).mockResolvedValue(undefined);
      vi.mocked(db.getUserTrial).mockResolvedValue(undefined);

      const caller = appRouter.createCaller(makeCtx());
      const status = await caller.beta.getMyStatus();

      expect(status.isPremium).toBe(false);
      expect(status.accessType).toBe("free");
      expect(status.trialDaysRemaining).toBe(0);
    });

    it("returns trial status with days remaining", async () => {
      const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      vi.mocked(db.getUserSubscription).mockResolvedValue(undefined);
      vi.mocked(db.getUserTrial).mockResolvedValue({
        userId: 1,
        isActive: true,
        trialEndsAt: trialEnd,
      } as any);

      const caller = appRouter.createCaller(makeCtx());
      const status = await caller.beta.getMyStatus();

      expect(status.isPremium).toBe(true);
      expect(status.accessType).toBe("trial");
      expect(status.trialDaysRemaining).toBeGreaterThanOrEqual(6);
      expect(status.trialDaysRemaining).toBeLessThanOrEqual(7);
    });
  });

  describe("beta.redeemCode", () => {
    it("rejects invalid code", async () => {
      vi.mocked(db.getBetaCodeByCode).mockResolvedValue(undefined);

      const caller = appRouter.createCaller(makeCtx());
      await expect(
        caller.beta.redeemCode({ code: "INVALID" })
      ).rejects.toThrow(/Invalid beta code/);
    });

    it("rejects expired code", async () => {
      vi.mocked(db.getBetaCodeByCode).mockResolvedValue({
        id: 1,
        code: "EXPIRED",
        isActive: true,
        usedCount: 0,
        maxUses: 10,
        trialDays: 14,
        expiresAt: new Date(Date.now() - 86400000),
      } as any);

      const caller = appRouter.createCaller(makeCtx());
      await expect(
        caller.beta.redeemCode({ code: "EXPIRED" })
      ).rejects.toThrow(/expired/i);
    });

    it("rejects code at max uses", async () => {
      vi.mocked(db.getBetaCodeByCode).mockResolvedValue({
        id: 1,
        code: "FULL",
        isActive: true,
        usedCount: 10,
        maxUses: 10,
        trialDays: 14,
        expiresAt: null,
      } as any);

      const caller = appRouter.createCaller(makeCtx());
      await expect(
        caller.beta.redeemCode({ code: "FULL" })
      ).rejects.toThrow(/maximum uses/i);
    });

    it("rejects code already redeemed by same user", async () => {
      vi.mocked(db.getBetaCodeByCode).mockResolvedValue({
        id: 1,
        code: "USED",
        isActive: true,
        usedCount: 1,
        maxUses: 100,
        trialDays: 14,
        expiresAt: null,
      } as any);
      vi.mocked(db.hasUserRedeemedCode).mockResolvedValue(true);

      const caller = appRouter.createCaller(makeCtx());
      await expect(
        caller.beta.redeemCode({ code: "USED" })
      ).rejects.toThrow(/already redeemed/i);
    });

    it("successfully redeems valid code", async () => {
      vi.mocked(db.getBetaCodeByCode).mockResolvedValue({
        id: 1,
        code: "VALID",
        isActive: true,
        usedCount: 0,
        maxUses: 10,
        trialDays: 14,
        expiresAt: null,
      } as any);
      vi.mocked(db.hasUserRedeemedCode).mockResolvedValue(false);
      vi.mocked(db.extendUserTrial).mockResolvedValue({} as any);
      vi.mocked(db.incrementBetaCodeUsage).mockResolvedValue(undefined);
      vi.mocked(db.recordBetaCodeRedemption).mockResolvedValue(undefined);

      const caller = appRouter.createCaller(makeCtx());
      const result = await caller.beta.redeemCode({ code: "VALID" });

      expect(result.success).toBe(true);
      expect(db.extendUserTrial).toHaveBeenCalledWith(1, 14);
      expect(db.incrementBetaCodeUsage).toHaveBeenCalledWith(1);
      expect(db.recordBetaCodeRedemption).toHaveBeenCalled();
    });
  });

  describe("beta.submitFeedback", () => {
    it("creates feedback entry for authenticated user", async () => {
      vi.mocked(db.createUserFeedback).mockResolvedValue({ id: 5 } as any);

      const caller = appRouter.createCaller(makeCtx());
      const result = await caller.beta.submitFeedback({
        category: "bug",
        message: "Found a bug on the exam page",
        rating: 3,
        pageUrl: "/exam",
      });

      expect(result.success).toBe(true);
      expect(db.createUserFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          category: "bug",
          message: "Found a bug on the exam page",
          rating: 3,
        })
      );
    });
  });

  describe("admin-only procedures", () => {
    it("rejects non-admin from listing codes", async () => {
      const caller = appRouter.createCaller(makeCtx("user"));
      await expect(caller.beta.adminListCodes()).rejects.toThrow(/FORBIDDEN|admin/i);
    });

    it("allows admin to list codes", async () => {
      vi.mocked(db.getAllBetaCodes).mockResolvedValue([
        {
          id: 1,
          code: "TEST",
          description: "Test code",
          maxUses: 10,
          usedCount: 0,
          trialDays: 14,
          isActive: true,
          expiresAt: null,
        } as any,
      ]);

      const caller = appRouter.createCaller(makeCtx("admin"));
      const codes = await caller.beta.adminListCodes();
      expect(codes).toHaveLength(1);
      expect(codes[0].code).toBe("TEST");
    });

    it("allows admin to create a code", async () => {
      vi.mocked(db.getBetaCodeByCode).mockResolvedValue(undefined);
      vi.mocked(db.createBetaCode).mockResolvedValue({
        id: 99,
        code: "NEW-CODE",
      } as any);

      const caller = appRouter.createCaller(makeCtx("admin"));
      const result = await caller.beta.adminCreateCode({
        code: "NEW-CODE",
        description: "Test",
        maxUses: 5,
        trialDays: 7,
      });

      expect(result).toBeDefined();
      expect(db.createBetaCode).toHaveBeenCalled();
    });

    it("rejects non-admin from viewing feedback", async () => {
      const caller = appRouter.createCaller(makeCtx("user"));
      await expect(caller.beta.adminListFeedback()).rejects.toThrow(/FORBIDDEN|admin/i);
    });

    it("allows admin to list feedback", async () => {
      vi.mocked(db.getAllFeedback).mockResolvedValue([
        {
          id: 1,
          userId: 2,
          category: "bug",
          message: "Test",
          status: "new",
          rating: null,
          pageUrl: "/",
          createdAt: new Date(),
        } as any,
      ]);

      const caller = appRouter.createCaller(makeCtx("admin"));
      const feedback = await caller.beta.adminListFeedback();
      expect(feedback).toHaveLength(1);
    });
  });
});
