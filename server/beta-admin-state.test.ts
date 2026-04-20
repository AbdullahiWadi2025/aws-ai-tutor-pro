import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./db", () => ({
  getAllBetaCodes: vi.fn(),
  getBetaCodeByCode: vi.fn(),
  hasUserRedeemedCode: vi.fn(),
  extendUserTrial: vi.fn(),
  incrementBetaCodeUsage: vi.fn(),
  recordBetaCodeRedemption: vi.fn(),
  upsertUser: vi.fn(),
  getUserSubscription: vi.fn(),
  getUserTrial: vi.fn(),
  startTrialForUser: vi.fn(),
}));

import * as db from "./db";
import { appRouter } from "./routers";

function adminCtx() {
  return {
    user: {
      id: 1,
      openId: "admin-id",
      name: "Admin",
      email: "admin@test.com",
      role: "admin",
      lastSignedIn: new Date(),
    },
    req: { headers: { origin: "http://localhost:3000" } },
  } as any;
}

function userCtx() {
  return {
    user: {
      id: 2,
      openId: "user-id",
      name: "User",
      email: "user@test.com",
      role: "user",
      lastSignedIn: new Date(),
    },
    req: { headers: { origin: "http://localhost:3000" } },
  } as any;
}

describe("Beta Admin State — small launch configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("admin sees LAUNCH2026 capped at 25 uses and BETATESTER at 10", async () => {
    vi.mocked(db.getAllBetaCodes).mockResolvedValue([
      {
        id: 1,
        code: "LAUNCH2026",
        description: "Founding members - 30 day premium trial (limited to 25)",
        maxUses: 25,
        usedCount: 0,
        trialDays: 30,
        isActive: true,
        expiresAt: null,
      },
      {
        id: 2,
        code: "BETATESTER",
        description: "VIP testers - 60 day premium trial (only 10 spots)",
        maxUses: 10,
        usedCount: 0,
        trialDays: 60,
        isActive: true,
        expiresAt: null,
      },
      {
        id: 3,
        code: "REDDIT14",
        description: "Reddit community - 14 day trial extension",
        maxUses: 500,
        usedCount: 0,
        trialDays: 14,
        isActive: false,
        expiresAt: null,
      },
      {
        id: 4,
        code: "AWSPREP",
        description: "AWS certification community - 30 day trial",
        maxUses: 200,
        usedCount: 0,
        trialDays: 30,
        isActive: false,
        expiresAt: null,
      },
    ] as any);

    const caller = appRouter.createCaller(adminCtx());
    const codes = await caller.beta.adminListCodes();

    const launch = codes.find((c) => c.code === "LAUNCH2026");
    const beta = codes.find((c) => c.code === "BETATESTER");
    const reddit = codes.find((c) => c.code === "REDDIT14");
    const awsPrep = codes.find((c) => c.code === "AWSPREP");

    expect(launch?.maxUses).toBe(25);
    expect(launch?.trialDays).toBe(30);
    expect(launch?.isActive).toBe(true);

    expect(beta?.maxUses).toBe(10);
    expect(beta?.trialDays).toBe(60);
    expect(beta?.isActive).toBe(true);

    expect(reddit?.isActive).toBe(false);
    expect(awsPrep?.isActive).toBe(false);
  });

  it("rejects redemption of deactivated REDDIT14 code", async () => {
    vi.mocked(db.getBetaCodeByCode).mockResolvedValue({
      id: 3,
      code: "REDDIT14",
      isActive: false,
      usedCount: 0,
      maxUses: 500,
      trialDays: 14,
      expiresAt: null,
    } as any);

    const caller = appRouter.createCaller(userCtx());
    await expect(
      caller.beta.redeemCode({ code: "REDDIT14" })
    ).rejects.toThrow(/no longer active|inactive|not active/i);
  });

  it("rejects redemption of deactivated AWSPREP code", async () => {
    vi.mocked(db.getBetaCodeByCode).mockResolvedValue({
      id: 4,
      code: "AWSPREP",
      isActive: false,
      usedCount: 0,
      maxUses: 200,
      trialDays: 30,
      expiresAt: null,
    } as any);

    const caller = appRouter.createCaller(userCtx());
    await expect(
      caller.beta.redeemCode({ code: "AWSPREP" })
    ).rejects.toThrow(/no longer active|inactive|not active/i);
  });

  it("accepts redemption of active LAUNCH2026 code", async () => {
    vi.mocked(db.getBetaCodeByCode).mockResolvedValue({
      id: 1,
      code: "LAUNCH2026",
      isActive: true,
      usedCount: 5,
      maxUses: 25,
      trialDays: 30,
      expiresAt: null,
    } as any);
    vi.mocked(db.hasUserRedeemedCode).mockResolvedValue(false);
    vi.mocked(db.extendUserTrial).mockResolvedValue({} as any);
    vi.mocked(db.incrementBetaCodeUsage).mockResolvedValue(undefined);
    vi.mocked(db.recordBetaCodeRedemption).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(userCtx());
    const result = await caller.beta.redeemCode({ code: "LAUNCH2026" });

    expect(result.success).toBe(true);
    expect(db.extendUserTrial).toHaveBeenCalledWith(2, 30);
  });

  it("rejects LAUNCH2026 once 25 redemptions are reached", async () => {
    vi.mocked(db.getBetaCodeByCode).mockResolvedValue({
      id: 1,
      code: "LAUNCH2026",
      isActive: true,
      usedCount: 25,
      maxUses: 25,
      trialDays: 30,
      expiresAt: null,
    } as any);

    const caller = appRouter.createCaller(userCtx());
    await expect(
      caller.beta.redeemCode({ code: "LAUNCH2026" })
    ).rejects.toThrow(/maximum uses/i);
  });
});
