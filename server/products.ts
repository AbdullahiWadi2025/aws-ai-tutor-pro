/**
 * Stripe subscription products and prices configuration
 * These are the subscription tiers available on the platform
 */

export const SUBSCRIPTION_PRODUCTS = {
  FREE: {
    name: "Free",
    stripePriceId: process.env.STRIPE_FREE_PRICE_ID || "price_free",
    stripeProductId: process.env.STRIPE_FREE_PRODUCT_ID || "prod_free",
    amount: 0,
    currency: "usd",
    interval: "month" as const,
    features: [
      "5 practice questions per month",
      "Basic progress tracking",
      "Limited AI tutor access",
    ],
  },
  PREMIUM_MONTHLY: {
    name: "Premium Monthly",
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "price_premium_monthly",
    stripeProductId: process.env.STRIPE_PREMIUM_PRODUCT_ID || "prod_premium",
    amount: 999, // $9.99 in cents
    currency: "usd",
    interval: "month" as const,
    features: [
      "Unlimited practice questions",
      "Full exam mode access (SAA-C03 & CLF-C02)",
      "Unlimited AI tutor access",
      "Advanced analytics & progress tracking",
      "Detailed explanations for all questions",
      "Study streak tracking",
      "Performance insights by topic",
    ],
  },
  PREMIUM_ANNUAL: {
    name: "Premium Annual",
    stripePriceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || "price_premium_annual",
    stripeProductId: process.env.STRIPE_PREMIUM_PRODUCT_ID || "prod_premium",
    amount: 9999, // $99.99 in cents (2 months free)
    currency: "usd",
    interval: "year" as const,
    features: [
      "Unlimited practice questions",
      "Full exam mode access (SAA-C03 & CLF-C02)",
      "Unlimited AI tutor access",
      "Advanced analytics & progress tracking",
      "Detailed explanations for all questions",
      "Study streak tracking",
      "Performance insights by topic",
      "Priority support",
    ],
  },
};

/**
 * Get subscription product by plan name
 */
export function getProductByName(name: string) {
  const product = Object.values(SUBSCRIPTION_PRODUCTS).find(p => p.name === name);
  return product;
}

/**
 * Get subscription product by Stripe price ID
 */
export function getProductByStripePriceId(stripePriceId: string) {
  const product = Object.values(SUBSCRIPTION_PRODUCTS).find(p => p.stripePriceId === stripePriceId);
  return product;
}

/**
 * Check if a user has access to premium features
 */
export function isPremiumSubscription(subscriptionStatus: string | null | undefined): boolean {
  return subscriptionStatus === "active";
}

/**
 * Get all available subscription products
 */
export function getAllProducts() {
  return Object.values(SUBSCRIPTION_PRODUCTS);
}
