import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, Gift, MessageSquare, Plus, Star } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  bug: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  feature_request: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  general: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  praise: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  archived: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function BetaAdmin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading || !user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Beta Launch Admin</h1>
        <p className="text-muted-foreground mt-1">
          Manage beta access codes and review user feedback
        </p>
      </div>

      <Tabs defaultValue="codes">
        <TabsList>
          <TabsTrigger value="codes" className="gap-2">
            <Gift className="w-4 h-4" />
            Beta Codes
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="space-y-6 mt-4">
          <CreateCodeCard />
          <CodesListCard />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6 mt-4">
          <FeedbackListCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateCodeCard() {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [trialDays, setTrialDays] = useState(14);
  const [expiresInDays, setExpiresInDays] = useState<number | "">("");

  const utils = trpc.useUtils();
  const createMutation = trpc.beta.adminCreateCode.useMutation({
    onSuccess: (data) => {
      toast.success("Beta code created", {
        description: `Code: ${data?.code}`,
      });
      setCode("");
      setDescription("");
      setMaxUses(1);
      setTrialDays(14);
      setExpiresInDays("");
      utils.beta.adminListCodes.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Beta Code
        </CardTitle>
        <CardDescription>
          Leave the code blank to auto-generate a random one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code (optional)</Label>
            <Input
              id="code"
              placeholder="Auto-generated if blank"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono tracking-wider"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Reddit launch, Beta tester batch #1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxUses">Max Uses</Label>
            <Input
              id="maxUses"
              type="number"
              min={1}
              max={10000}
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trialDays">Trial Days</Label>
            <Input
              id="trialDays"
              type="number"
              min={1}
              max={365}
              value={trialDays}
              onChange={(e) => setTrialDays(parseInt(e.target.value) || 14)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="expiresInDays">Expires In (days) — Optional</Label>
            <Input
              id="expiresInDays"
              type="number"
              min={1}
              max={365}
              placeholder="Never expires if blank"
              value={expiresInDays}
              onChange={(e) =>
                setExpiresInDays(e.target.value === "" ? "" : parseInt(e.target.value) || "")
              }
            />
          </div>
        </div>
        <Button
          onClick={() =>
            createMutation.mutate({
              code: code || undefined,
              description: description || undefined,
              maxUses,
              trialDays,
              expiresInDays: expiresInDays === "" ? undefined : expiresInDays,
            })
          }
          disabled={createMutation.isPending}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {createMutation.isPending ? "Creating..." : "Create Code"}
        </Button>
      </CardContent>
    </Card>
  );
}

function CodesListCard() {
  const { data: codes, isLoading } = trpc.beta.adminListCodes.useQuery();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Beta Codes</CardTitle>
        <CardDescription>
          {codes?.length ?? 0} total code{(codes?.length ?? 0) !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : !codes || codes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No beta codes yet. Create your first one above.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Trial Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {c.description || "—"}
                  </TableCell>
                  <TableCell>
                    {c.usedCount} / {c.maxUses}
                  </TableCell>
                  <TableCell>{c.trialDays} days</TableCell>
                  <TableCell>
                    {c.isActive && c.usedCount < c.maxUses ? (
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCode(c.code)}
                      className="gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function FeedbackListCard() {
  const { data: feedback, isLoading } = trpc.beta.adminListFeedback.useQuery();
  const utils = trpc.useUtils();

  const updateStatus = trpc.beta.adminUpdateFeedbackStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      utils.beta.adminListFeedback.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const sorted = [...(feedback || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Feedback</CardTitle>
        <CardDescription>
          {sorted.length} total submission{sorted.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : sorted.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No feedback yet. Users can submit feedback via the floating widget.
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.map((f) => (
              <Card key={f.id} className="bg-muted/30">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={CATEGORY_COLORS[f.category] || ""}>
                      {f.category.replace("_", " ")}
                    </Badge>
                    <Badge className={STATUS_COLORS[f.status] || ""}>{f.status}</Badge>
                    {f.rating && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: f.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(f.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{f.message}</p>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    {f.pageUrl && <span>Page: {f.pageUrl}</span>}
                    {f.userId && <span>User ID: {f.userId}</span>}
                  </div>
                  <div className="pt-2">
                    <Select
                      value={f.status}
                      onValueChange={(v) =>
                        updateStatus.mutate({
                          feedbackId: f.id,
                          status: v as "new" | "reviewed" | "resolved" | "archived",
                        })
                      }
                    >
                      <SelectTrigger className="w-40 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
