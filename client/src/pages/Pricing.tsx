import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Pricing() {
  const [, navigate] = useLocation();
  const { data: plans, isLoading } = trpc.stripe.getPlans.useQuery();
  const { data: currentSubscription } = trpc.stripe.getSubscription.useQuery();
  const createCheckout = trpc.stripe.createCheckoutSession.useMutation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleUpgrade = async (priceId: string) => {
    setSelectedPlan(priceId);
    try {
      const result = await createCheckout.mutateAsync({
        priceId,
        successUrl: `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/pricing?payment=canceled`,
      });

      if (result.url) {
        window.open(result.url, "_blank");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to create checkout session. Please try again.");
    } finally {
      setSelectedPlan(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pricing Plans</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Intro */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Start with our free tier to explore the platform, then upgrade to Premium for unlimited access to all exams and AI tutoring features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans?.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan?.stripePriceId === plan.stripePriceId;
            const isFree = plan.amount === 0;

            return (
              <Card
                key={plan.stripePriceId}
                className={`relative overflow-hidden transition-all ${
                  isCurrentPlan
                    ? "ring-2 ring-blue-600 shadow-lg"
                    : "hover:shadow-lg"
                }`}
              >
                {/* Badge for current plan */}
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Current Plan
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    {isFree ? (
                      <div>
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">
                          Free
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">
                          ${(plan.amount / 100).toFixed(2)}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 ml-2">
                          / {plan.interval}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : isFree ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/dashboard")}
                    >
                      Get Started
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.stripePriceId)}
                      disabled={selectedPlan === plan.stripePriceId}
                    >
                      {selectedPlan === plan.stripePriceId ? "Processing..." : "Upgrade Now"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Can I upgrade or downgrade anytime?
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                We accept all major credit and debit cards through Stripe. Your payment information is secure and encrypted.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Is there a free trial?
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Yes! Our Free tier allows you to try the platform with limited access. Upgrade to Premium anytime to unlock all features.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Absolutely! You can cancel your subscription at any time. You'll retain access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
