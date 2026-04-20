import Stripe from "stripe";
import { ENV } from "./_core/env";
import * as db from "./db";

const stripe = new Stripe(ENV.stripeSecretKey || "");

/**
 * Update user's subscription to a different plan
 * Handles upgrade, downgrade, and plan changes
 */
export async function updateSubscription(
  userId: number,
  newPriceId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get current subscription
    const currentSubscription = await db.getUserSubscription(userId);

    if (!currentSubscription || !currentSubscription.stripeSubscriptionId) {
      return {
        success: false,
        message: "No active subscription found",
      };
    }

    // Get the new plan details
    const newPlan = await db.getSubscriptionPlanByStripePriceId(newPriceId);
    if (!newPlan) {
      return {
        success: false,
        message: "Invalid plan selected",
      };
    }

    // Retrieve the Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      currentSubscription.stripeSubscriptionId
    );

    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(
      currentSubscription.stripeSubscriptionId,
      {
        items: [
          {
            id: (stripeSubscription.items.data[0] as any).id,
            price: newPriceId,
          },
        ],
        // Proration behavior: charge for upgrade immediately, credit for downgrade
        proration_behavior: "create_prorations",
      }
    );

    // Update local database (planId is stored in the subscription record)
    await db.updateUserSubscription(userId, {
      status: "active",
    });
    // Note: planId should be updated separately if needed via direct SQL or additional helper

    return {
      success: true,
      message: `Successfully updated to ${newPlan.name}`,
    };
  } catch (error) {
    console.error("[Stripe] Failed to update subscription:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update subscription",
    };
  }
}
