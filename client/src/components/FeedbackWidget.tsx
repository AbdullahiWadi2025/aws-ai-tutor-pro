import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MessageSquare, Star, Send } from "lucide-react";

type FeedbackCategory = "bug" | "feature_request" | "general" | "praise";

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: "🐛 Bug Report",
  feature_request: "✨ Feature Request",
  general: "💬 General Feedback",
  praise: "🎉 Praise",
};

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");

  const submitFeedback = trpc.beta.submitFeedback.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your feedback!", {
        description: "We review every submission and appreciate your input.",
      });
      setMessage("");
      setRating(0);
      setCategory("general");
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to submit feedback", {
        description: error.message,
      });
    },
  });

  const handleSubmit = () => {
    if (message.trim().length < 3) {
      toast.error("Please write a message of at least 3 characters");
      return;
    }
    submitFeedback.mutate({
      category,
      rating: rating > 0 ? rating : undefined,
      message: message.trim(),
      pageUrl: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="fixed bottom-6 left-6 z-50 rounded-full shadow-lg h-12 px-4 gap-2"
          aria-label="Send feedback"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve AWS AI Tutor Pro. Your feedback is invaluable during our beta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as FeedbackCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_LABELS) as FeedbackCategory[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {CATEGORY_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rating (optional)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n === rating ? 0 : n)}
                  className="p-1 transition-transform hover:scale-110"
                  aria-label={`Rate ${n} stars`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      n <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us what you think, what could be improved, or any issues you've found..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/5000
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitFeedback.isPending || message.trim().length < 3}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {submitFeedback.isPending ? "Sending..." : "Send Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
