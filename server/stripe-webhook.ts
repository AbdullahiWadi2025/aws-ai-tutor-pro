import Stripe from "stripe";
import { ENV } from "./_core/env";
import {
  getUserSubscriptionByStripeCustomerId,
  createUserSubscription,
  updateUserSubscription,
  createPaymentHistory,
  getSubscriptionPlanByStripePriceId,
  getUserByOpenId,
} from "./db";

const stripe = new Stripe(ENV.stripeSecretKey || "");

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`);

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return { verified: true };
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        return await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);

      case "customer.subscription.updated":
        return await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);

      case "customer.subscription.deleted":
        return await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);

      case "invoice.paid":
        return await handleInvoicePaid(event.data.object as Stripe.Invoice);

      case "invoice.payment_failed":
        return await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        return { acknowledged: true };
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Error processing event ${event.id}:`, error);
    throw error;
  }
}

/**
 * Handle checkout.session.completed event
 * This fires when a customer completes checkout
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Stripe] Checkout session completed: ${session.id}`);

  const userId = session.metadata?.user_id ? parseInt(session.metadata.user_id) : null;
  const customerId = session.customer as string;

  if (!userId || !customerId) {
    console.error("[Stripe] Missing user_id or customer_id in checkout session metadata");
    return { error: "Missing metadata" };
  }

  // Get the subscription if this was a subscription checkout
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as Stripe.Subscription;
    const priceId = (subscription.items.data[0]?.price?.id) as string;

    // Get the subscription plan
    const plan = await getSubscriptionPlanByStripePriceId(priceId);
    if (!plan) {
      console.error(`[Stripe] Unknown price ID: ${priceId}`);
      return { error: "Unknown price ID" };
    }

    // Check if user already has a subscription
    const existingSubscription = await getUserSubscriptionByStripeCustomerId(customerId);

    if (existingSubscription) {
      // Update existing subscription
      await updateUserSubscription(userId, {
        stripeSubscriptionId: subscription.id,
        status: "active",
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      });
    } else {
      // Create new subscription
      await createUserSubscription({
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        planId: plan.id,
        status: "active",
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      });
    }

    console.log(`[Stripe] Subscription created/updated for user ${userId}: ${subscription.id}`);
  }

  // Record payment if this was a one-time payment
  if (session.payment_intent) {
    const paymentIntentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent.id;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === "succeeded") {
      await createPaymentHistory({
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: "succeeded",
        description: `Checkout session: ${session.id}`,
      });
    }
  }

  return { acknowledged: true };
}

/**
 * Handle customer.subscription.updated event
 * This fires when subscription details change
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Stripe] Subscription updated: ${subscription.id}`);

  const customerId = subscription.customer as string;
  const existingSubscription = await getUserSubscriptionByStripeCustomerId(customerId);

  if (!existingSubscription) {
    console.warn(`[Stripe] Subscription update for unknown customer: ${customerId}`);
    return { acknowledged: true };
  }

  // Map Stripe subscription status to our status enum
  let status: "active" | "inactive" | "canceled" | "past_due" = "inactive";
  if (subscription.status === "active") status = "active";
  else if (subscription.status === "past_due") status = "past_due";
  else if (subscription.status === "canceled") status = "canceled";

  await updateUserSubscription(existingSubscription.userId, {
    status,
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
  });

  console.log(`[Stripe] Subscription ${subscription.id} status updated to: ${status}`);
  return { acknowledged: true };
}

/**
 * Handle customer.subscription.deleted event
 * This fires when a subscription is canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Stripe] Subscription deleted: ${subscription.id}`);

  const customerId = subscription.customer as string;
  const existingSubscription = await getUserSubscriptionByStripeCustomerId(customerId);

  if (!existingSubscription) {
    console.warn(`[Stripe] Subscription deletion for unknown customer: ${customerId}`);
    return { acknowledged: true };
  }

  await updateUserSubscription(existingSubscription.userId, {
    status: "canceled",
    canceledAt: new Date(),
  });

  console.log(`[Stripe] Subscription ${subscription.id} marked as canceled`);
  return { acknowledged: true };
}

/**
 * Handle invoice.paid event
 * This fires when an invoice is successfully paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Stripe] Invoice paid: ${invoice.id}`);

  const customerId = invoice.customer as string;
  const existingSubscription = await getUserSubscriptionByStripeCustomerId(customerId);

  if (!existingSubscription) {
    console.warn(`[Stripe] Invoice paid for unknown customer: ${customerId}`);
    return { acknowledged: true };
  }

  // Record the payment
  const paymentIntentId = (invoice as any).payment_intent;
  if (paymentIntentId) {
    const id = typeof paymentIntentId === "string" 
      ? paymentIntentId 
      : paymentIntentId.id;

    await createPaymentHistory({
      userId: existingSubscription.userId,
      stripePaymentIntentId: id,
      amount: invoice.total || 0,
      currency: invoice.currency,
      status: "succeeded",
      description: `Invoice: ${invoice.number}`,
    });
  }

  return { acknowledged: true };
}

/**
 * Handle invoice.payment_failed event
 * This fires when an invoice payment fails
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Stripe] Invoice payment failed: ${invoice.id}`);

  const customerId = invoice.customer as string;
  const existingSubscription = await getUserSubscriptionByStripeCustomerId(customerId);

  if (!existingSubscription) {
    console.warn(`[Stripe] Invoice payment failed for unknown customer: ${customerId}`);
    return { acknowledged: true };
  }

  // Update subscription status to past_due
  await updateUserSubscription(existingSubscription.userId, {
    status: "past_due",
  });

  console.log(`[Stripe] Subscription ${existingSubscription.stripeSubscriptionId} marked as past_due`);
  return { acknowledged: true };
}
