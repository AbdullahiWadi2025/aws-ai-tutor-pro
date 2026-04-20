import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import * as db from "./db";
import { SUBSCRIPTION_PRODUCTS } from "./products";
import { updateSubscription as updateStripeSubscription } from "./stripe-update";

const stripe = new Stripe(ENV.stripeSecretKey || "");

export const stripeRouter = router({
  /**
   * Get all available subscription plans
   */
  getPlans: protectedProcedure.query(async () => {
    const plans = await db.getSubscriptionPlans();
    
    // If no plans in DB, return default plans
    if (plans.length === 0) {
      return Object.values(SUBSCRIPTION_PRODUCTS).map(product => ({
        id: 0,
        name: product.name,
        stripePriceId: product.stripePriceId,
        stripeProductId: product.stripeProductId,
        amount: product.amount,
        currency: product.currency,
        interval: product.interval,
        features: product.features,
      }));
    }
    
    return plans;
  }),

  /**
   * Get current user's subscription status
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);
    
    if (!subscription) {
      return {
        status: "inactive",
        plan: null,
        currentPeriodEnd: null,
      };
    }

    // Get the plan details
    const plan = await db.getSubscriptionPlans();
    const userPlan = plan.find(p => p.id === subscription.planId);

    return {
      status: subscription.status,
      plan: userPlan || null,
      currentPeriodEnd: subscription.currentPeriodEnd,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    };
  }),

  /**
   * Create a checkout session for subscription
   */
  createCheckoutSession: protectedProcedure
    .input(z.object({
      priceId: z.string(),
      successUrl: z.string(),
      cancelUrl: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Get or create Stripe customer
        let customerId: string;
        const existingSubscription = await db.getUserSubscription(ctx.user.id);

        if (existingSubscription) {
          customerId = existingSubscription.stripeCustomerId;
        } else {
          // Create new Stripe customer
          const customer = await stripe.customers.create({
            email: ctx.user.email || undefined,
            name: ctx.user.name || undefined,
            metadata: {
              user_id: ctx.user.id.toString(),
            },
          });
          customerId = customer.id;
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price: input.priceId,
              quantity: 1,
            },
          ],
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          allow_promotion_codes: true,
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("[Stripe] Failed to create checkout session:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  /**
   * Cancel user's subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const subscription = await db.getUserSubscription(ctx.user.id);

      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new Error("No active subscription found");
      }

      // Cancel the Stripe subscription
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

      // Update local subscription status
      await db.updateUserSubscription(ctx.user.id, {
        status: "canceled",
        canceledAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error("[Stripe] Failed to cancel subscription:", error);
      throw new Error("Failed to cancel subscription");
    }
  }),

  /**
   * Get payment history for user
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const payments = await db.getPaymentHistoryByUser(ctx.user.id);
    return payments;
  }),

  /**
   * Check if user has premium access
   */
  isPremium: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);
    return subscription?.status === "active";
  }),

  /**
   * Update subscription to a different plan (upgrade/downgrade)
   */
  updateSubscription: protectedProcedure
    .input(z.object({
      priceId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await updateStripeSubscription(ctx.user.id, input.priceId);
    }),
});

export type StripeRouter = typeof stripeRouter;
