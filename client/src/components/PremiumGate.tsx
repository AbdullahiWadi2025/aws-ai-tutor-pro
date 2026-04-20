import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface PremiumGateProps {
  children: ReactNode;
  feature?: string;
  fallback?: ReactNode;
}

/**
 * Component that gates premium features
 * Shows content if user has premium, otherwise shows upgrade prompt
 */
export function PremiumGate({
  children,
  feature = "feature",
  fallback,
}: PremiumGateProps) {
  const [, navigate] = useLocation();
  const { data: isPremium, isLoading } = trpc.stripe.isPremium.useQuery();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    fallback || (
      <Card className="p-8 text-center border-2 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20">
        <Lock className="w-12 h-12 text-amber-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-2">
          Premium Feature
        </h3>
        <p className="text-amber-800 dark:text-amber-300 mb-6">
          This {feature} is only available with a premium subscription.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/pricing")}>
            Upgrade to Premium
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    )
  );
}

/**
 * Hook to check if user has premium access
 */
export function usePremiumAccess() {
  const { data: isPremium, isLoading } = trpc.stripe.isPremium.useQuery();
  return { isPremium: isPremium || false, isLoading };
}
