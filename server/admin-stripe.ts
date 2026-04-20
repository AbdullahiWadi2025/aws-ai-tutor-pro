import { adminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import Stripe from "stripe";
import { ENV } from "./_core/env";

const stripe = new Stripe(ENV.stripeSecretKey || "");

export const adminStripeRouter = {
  /**
   * Get subscription statistics for admin dashboard
   */
  getSubscriptionStats: adminProcedure.query(async () => {
    const plans = await db.getSubscriptionPlans();
    const payments = await db.getPaymentHistoryByUser?.(0) || [];

    // Calculate stats
    const totalRevenue = (payments as any[]).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const successfulPayments = (payments as any[]).filter((p: any) => p.status === "succeeded").length;
    const failedPayments = (payments as any[]).filter((p: any) => p.status !== "succeeded").length;

    return {
      totalRevenue: (totalRevenue / 100).toFixed(2),
      totalPayments: payments.length,
      successfulPayments,
      failedPayments,
      conversionRate: plans.length > 0 ? ((successfulPayments / payments.length) * 100).toFixed(2) : "0",
      averageOrderValue: payments.length > 0 ? ((totalRevenue / payments.length) / 100).toFixed(2) : "0",
    };
  }),

  /**
   * List all subscriptions with user details
   */
  listSubscriptions: adminProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      // This would require a query helper in db.ts
      // For now, return a placeholder structure
      return {
        subscriptions: [],
        total: 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * List all payments with filtering
   */
  listPayments: adminProcedure
    .input(z.object({
      status: z.enum(["succeeded", "failed", "pending"]).optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const payments = await db.getPaymentHistoryByUser?.(0) || [];

      let filtered = payments as any[];
      if (input.status) {
        filtered = payments.filter((p: any) => p.status === input.status);
      }

      const paginated = filtered.slice(input.offset, input.offset + input.limit);

      return {
        payments: paginated,
        total: filtered.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get detailed subscription information for a user
   */
  getUserSubscriptionDetails: adminProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ input }) => {
      const subscription = await db.getUserSubscription(input.userId);
      const payments = await db.getPaymentHistoryByUser(input.userId);

      return {
        subscription,
        payments,
        totalSpent: payments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100,
      };
    }),

  /**
   * Get revenue metrics
   */
  getRevenueMetrics: adminProcedure.query(async () => {
    const payments = await db.getPaymentHistoryByUser?.(0) || [];

    // Group by month
    const byMonth: Record<string, number> = {};
    (payments as any[]).forEach((p: any) => {
      const date = new Date(p.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      byMonth[monthKey] = (byMonth[monthKey] || 0) + (p.amount || 0);
    });

    return {
      totalRevenue: (payments as any[]).reduce((sum: number, p: any) => sum + (p.amount || 0), 0) / 100,
      revenueByMonth: Object.entries(byMonth).map(([month, amount]) => ({
        month,
        revenue: (amount / 100).toFixed(2),
      })),
      paymentMethods: {
        card: (payments as any[]).filter((p: any) => p.paymentMethod === "card").length,
        other: (payments as any[]).filter((p: any) => p.paymentMethod !== "card").length,
      },
    };
  }),

  /**
   * Get subscription plan analytics
   */
  getPlanAnalytics: adminProcedure.query(async () => {
    const plans = await db.getSubscriptionPlans();

    const planStats = plans.map((plan: any) => {
      return {
        planName: plan.name,
        activeSubscriptions: 0,
        monthlyRevenue: ((plan.amount * 0) / 100).toFixed(2),
      };
    });

    return {
      plans: planStats,
      totalActiveSubscriptions: 0,
      totalCanceledSubscriptions: 0,
    };
  }),
};
