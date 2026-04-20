import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Sparkles, Gift, Clock } from "lucide-react";
import { Link } from "wouter";

export function TrialBanner() {
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [code, setCode] = useState("");

  const { data: status, refetch } = trpc.beta.getMyStatus.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const redeemMutation = trpc.beta.redeemCode.useMutation({
    onSuccess: (data) => {
      toast.success("🎉 Code redeemed!", {
        description: data.message,
      });
      setCode("");
      setCodeDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Unable to redeem code", {
        description: error.message,
      });
    },
  });

  if (!status) return null;

  const handleRedeem = () => {
    if (code.trim().length === 0) {
      toast.error("Please enter a code");
      return;
    }
    redeemMutation.mutate({ code: code.trim() });
  };

  // Active subscription — don't show trial banner
  if (status.accessType === "subscription") {
    return null;
  }

  // Active trial — show days remaining
  if (status.accessType === "trial" && status.trialDaysRemaining > 0) {
    return (
      <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-blue-200 dark:border-blue-900">
        <div className="container flex items-center justify-between gap-4 py-2.5 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">
              Free Trial Active — {status.trialDaysRemaining} day{status.trialDaysRemaining !== 1 ? "s" : ""} remaining
            </span>
            <span className="hidden sm:inline text-muted-foreground">
              · Full premium access to exams, AI tutor, and analytics
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 bg-white dark:bg-background">
                  <Gift className="w-3.5 h-3.5" />
                  Redeem Code
                </Button>
              </DialogTrigger>
              <RedeemDialogContent
                code={code}
                setCode={setCode}
                onRedeem={handleRedeem}
                isPending={redeemMutation.isPending}
              />
            </Dialog>
            <Link href="/pricing">
              <Button size="sm" className="gap-1.5">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Expired trial or never had trial — show upgrade/code CTA
  return (
    <div className="w-full bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-b border-orange-200 dark:border-orange-900">
      <div className="container flex items-center justify-between gap-4 py-2.5 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span className="font-medium">
            {status.hasEverHadTrial ? "Your trial has ended" : "You're on the Free plan"}
          </span>
          <span className="hidden sm:inline text-muted-foreground">
            · Upgrade or enter a beta code to unlock premium features
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 bg-white dark:bg-background">
                <Gift className="w-3.5 h-3.5" />
                Redeem Code
              </Button>
            </DialogTrigger>
            <RedeemDialogContent
              code={code}
              setCode={setCode}
              onRedeem={handleRedeem}
              isPending={redeemMutation.isPending}
            />
          </Dialog>
          <Link href="/pricing">
            <Button size="sm" className="gap-1.5">
              See Plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function RedeemDialogContent({
  code,
  setCode,
  onRedeem,
  isPending,
}: {
  code: string;
  setCode: (v: string) => void;
  onRedeem: () => void;
  isPending: boolean;
}) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Redeem Beta Code</DialogTitle>
        <DialogDescription>
          Enter your beta access code to extend your premium trial. Codes are case-insensitive.
        </DialogDescription>
      </DialogHeader>
      <div className="py-2">
        <Input
          autoFocus
          placeholder="e.g. BETA-XYZ123"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="text-lg tracking-wider font-mono"
          maxLength={64}
        />
      </div>
      <DialogFooter>
        <Button
          onClick={onRedeem}
          disabled={isPending || code.trim().length === 0}
          className="w-full sm:w-auto"
        >
          {isPending ? "Redeeming..." : "Redeem Code"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
