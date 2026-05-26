import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const CERTS = [
  "AWS Certified Cloud Practitioner (CLF-C02)",
  "AWS Certified Solutions Architect – Associate (SAA-C03)",
  "AWS Certified Developer – Associate (DVA-C02)",
  "AWS Certified SysOps Administrator – Associate (SOA-C02)",
  "AWS Certified Solutions Architect – Professional (SAP-C02)",
  "AWS Certified Machine Learning – Specialty (MLS-C01)",
  "AWS Certified AI Practitioner (AIF-C01)",
  "Other / Not yet certified",
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TestimonialSubmitModal({ open, onClose }: Props) {
  const [quote, setQuote] = useState("");
  const [cert, setCert] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const submitMutation = trpc.testimonial.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you! Your testimonial has been submitted for review.");
      setQuote("");
      setCert("");
      setRating(5);
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit testimonial. Please try again.");
    },
  });

  const handleSubmit = () => {
    if (quote.trim().length < 20) {
      toast.error("Please write at least 20 characters.");
      return;
    }
    submitMutation.mutate({
      quote: quote.trim(),
      certificationPassed: cert || undefined,
      rating,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-slate-900 border border-blue-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Share Your Success Story</DialogTitle>
          <DialogDescription className="text-blue-300">
            Help other students by sharing your experience. Your testimonial will appear on the homepage after review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Star rating */}
          <div className="space-y-2">
            <Label className="text-slate-300">Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Certification */}
          <div className="space-y-2">
            <Label className="text-slate-300">Certification (optional)</Label>
            <Select value={cert} onValueChange={setCert}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select a certification..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {CERTS.map((c) => (
                  <SelectItem key={c} value={c} className="text-white hover:bg-slate-700">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quote */}
          <div className="space-y-2">
            <Label className="text-slate-300">Your testimonial <span className="text-red-400">*</span></Label>
            <Textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Share how AWS AI Tutor Pro helped you prepare and pass your exam..."
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[120px] resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-slate-500 text-right">{quote.length}/1000</p>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || quote.trim().length < 20}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Testimonial"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
