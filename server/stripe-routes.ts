import express, { Express, Request, Response } from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { handleStripeWebhook } from "./stripe-webhook";

const stripe = new Stripe(ENV.stripeSecretKey || "");

/**
 * Register Stripe webhook routes
 * Must be called BEFORE express.json() middleware
 */
export function registerStripeRoutes(app: Express) {
  // Webhook endpoint - must use raw body for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }) as any,
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string;

      if (!sig) {
        console.error("[Stripe Webhook] Missing signature header");
        res.status(400).send("Missing signature");
        return;
      }

      try {
        const event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          ENV.stripeWebhookSecret || ""
        );

        // Handle the webhook event
        const result = await handleStripeWebhook(event);
        res.json(result);
      } catch (error) {
        console.error("[Stripe Webhook] Verification failed:", error);
        res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  );

  console.log("[Stripe] Webhook route registered at /api/stripe/webhook");
}

// Export for use in server setup
export default registerStripeRoutes;
