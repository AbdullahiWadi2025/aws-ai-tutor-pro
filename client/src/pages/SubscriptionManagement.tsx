import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";

export default function SubscriptionManagement() {
  const [, navigate] = useLocation();
  const { data: subscription, isLoading } = trpc.stripe.getSubscription.useQuery();
  const { data: payments } = trpc.stripe.getPaymentHistory.useQuery();
  const cancelSubscription = trpc.stripe.cancelSubscription.useMutation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription.mutateAsync();
      alert("Subscription canceled successfully");
      setShowCancelConfirm(false);
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Failed to cancel subscription. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading subscription...</p>
        </div>
      </div>
    );
  }

  const isActive = subscription?.status === "active";
  const planName = subscription?.plan?.name || "Free";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Subscription Management
          </h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Current Plan Card */}
        <Card className="mb-8 p-8 border-2 border-blue-200 dark:border-blue-900">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Current Plan: {planName}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {isActive ? "Your subscription is active" : "You are on the free plan"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isActive ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-amber-600" />
              )}
            </div>
          </div>

          {/* Subscription Details */}
          {isActive && subscription?.currentPeriodEnd && (
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your subscription renews on{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={() => navigate("/pricing")}>
              View All Plans
            </Button>
            {isActive && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </Card>

        {/* Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <Card className="mb-8 p-6 border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-4">
              Cancel Subscription?
            </h3>
            <p className="text-red-800 dark:text-red-300 mb-6">
              Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.
            </p>
            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={cancelSubscription.isPending}
              >
                {cancelSubscription.isPending ? "Canceling..." : "Yes, Cancel"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Subscription
              </Button>
            </div>
          </Card>
        )}

        {/* Payment History */}
        <Card className="p-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment History
          </h3>

          {payments && payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">
                        {payment.description || "Payment"}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">
                        ${(payment.amount / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            payment.status === "succeeded"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">
                No payment history yet
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
