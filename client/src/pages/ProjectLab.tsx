import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  FlaskConical,
  Clock,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Lock,
  BookOpen,
  Zap,
  Trophy,
  Filter,
  X,
} from "lucide-react";

type Difficulty = "beginner" | "intermediate" | "advanced";

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  beginner: {
    label: "Beginner",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: <BookOpen className="w-3.5 h-3.5" />,
  },
  intermediate: {
    label: "Intermediate",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  advanced: {
    label: "Advanced",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    icon: <Trophy className="w-3.5 h-3.5" />,
  },
};

const SERVICE_COLORS: Record<string, string> = {
  S3: "bg-green-500/15 text-green-400",
  EC2: "bg-orange-500/15 text-orange-400",
  Lambda: "bg-yellow-500/15 text-yellow-400",
  RDS: "bg-blue-500/15 text-blue-400",
  VPC: "bg-purple-500/15 text-purple-400",
  IAM: "bg-red-500/15 text-red-400",
  CloudFront: "bg-cyan-500/15 text-cyan-400",
  DynamoDB: "bg-indigo-500/15 text-indigo-400",
  SNS: "bg-pink-500/15 text-pink-400",
  SQS: "bg-teal-500/15 text-teal-400",
  ALB: "bg-sky-500/15 text-sky-400",
  WAF: "bg-rose-500/15 text-rose-400",
  EventBridge: "bg-violet-500/15 text-violet-400",
  CodePipeline: "bg-emerald-500/15 text-emerald-400",
  "Auto Scaling": "bg-amber-500/15 text-amber-400",
};

function getServiceColor(service: string) {
  return SERVICE_COLORS[service] ?? "bg-muted text-muted-foreground";
}

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    estimatedTime: string;
    estimatedCost: string;
    certTags: string[];
    domainTags: string[];
    services: string[];
    totalSteps: number;
  };
  progress?: { completedSteps: number[]; completedAt: Date | null };
  onOpen: () => void;
}

function ProjectCard({ project, progress, onOpen }: ProjectCardProps) {
  const diff = DIFFICULTY_CONFIG[project.difficulty];
  const completedCount = progress?.completedSteps.length ?? 0;
  const pct = Math.round((completedCount / project.totalSteps) * 100);
  const isCompleted = completedCount === project.totalSteps;

  return (
    <Card
      className="group relative flex flex-col cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 overflow-hidden"
      onClick={onOpen}
    >
      {isCompleted && (
        <div className="absolute top-3 right-3 z-10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
      )}

      <CardHeader className="pb-3">
        {/* Difficulty + cert tags row */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${diff.bg} ${diff.color}`}
          >
            {diff.icon}
            {diff.label}
          </span>
          {project.certTags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">
          {project.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {project.estimatedTime}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            {project.estimatedCost}
          </span>
          <span className="flex items-center gap-1">
            <FlaskConical className="w-3.5 h-3.5" />
            {project.totalSteps} steps
          </span>
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-1">
          {project.services.slice(0, 5).map((svc) => (
            <span
              key={svc}
              className={`text-xs px-1.5 py-0.5 rounded font-mono ${getServiceColor(svc)}`}
            >
              {svc}
            </span>
          ))}
          {project.services.length > 5 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              +{project.services.length - 5}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-auto space-y-1.5">
          {completedCount > 0 ? (
            <>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{isCompleted ? "Completed!" : "In progress"}</span>
                <span>
                  {completedCount}/{project.totalSteps} steps
                </span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-xs text-muted-foreground hover:text-primary"
            >
              Start project
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StepModalProps {
  project: {
    id: string;
    title: string;
    difficulty: Difficulty;
    estimatedTime: string;
    estimatedCost: string;
    certTags: string[];
    services: string[];
    steps: { id: number; title: string; description: string }[];
  } | null;
  progress: number[];
  onClose: () => void;
  onToggleStep: (stepId: number) => void;
  isSaving: boolean;
  isAuthenticated: boolean;
}

function StepModal({
  project,
  progress,
  onClose,
  onToggleStep,
  isSaving,
  isAuthenticated,
}: StepModalProps) {
  if (!project) return null;

  const diff = DIFFICULTY_CONFIG[project.difficulty];
  const completedCount = progress.length;
  const totalSteps = project.steps.length;
  const pct = Math.round((completedCount / totalSteps) * 100);
  const isCompleted = completedCount === totalSteps;

  return (
    <Dialog open={!!project} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${diff.bg} ${diff.color}`}
            >
              {diff.icon}
              {diff.label}
            </span>
            {project.certTags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <DialogTitle className="text-xl leading-snug">
            {project.title}
          </DialogTitle>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {project.estimatedTime}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {project.estimatedCost}
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {isCompleted
                  ? "🎉 Project completed!"
                  : `${completedCount} of ${totalSteps} steps done`}
              </span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        </DialogHeader>

        {/* Services */}
        <div className="flex flex-wrap gap-1.5 py-2 border-b">
          {project.services.map((svc) => (
            <span
              key={svc}
              className={`text-xs px-2 py-0.5 rounded font-mono ${getServiceColor(svc)}`}
            >
              {svc}
            </span>
          ))}
        </div>

        {/* Auth gate */}
        {!isAuthenticated && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              <a
                href={getLoginUrl()}
                className="underline font-medium hover:text-amber-300"
              >
                Sign in
              </a>{" "}
              to track your progress and save completed steps.
            </span>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {project.steps.map((step, idx) => {
            const isDone = progress.includes(step.id);
            return (
              <div
                key={step.id}
                className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                  isDone
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-muted/30 border-border"
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-muted-foreground w-5 text-right">
                      {idx + 1}.
                    </span>
                    {isAuthenticated ? (
                      <Checkbox
                        checked={isDone}
                        onCheckedChange={() => onToggleStep(step.id)}
                        disabled={isSaving}
                        className="mt-0"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded border border-border bg-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isCompleted && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            Congratulations! You completed this project. This architecture pattern is tested on the {project.certTags.join(" and ")} exam.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectLab() {
  const { isAuthenticated } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");
  const [selectedCert, setSelectedCert] = useState<string>("all");
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  const { data: projects = [] } = trpc.projectLab.getProjects.useQuery();
  const { data: myProgress = [] } = trpc.projectLab.getMyProgress.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: openProjectFull } = trpc.projectLab.getProject.useQuery(
    { projectId: openProjectId! },
    { enabled: !!openProjectId }
  );

  const saveProgressMutation = trpc.projectLab.saveProgress.useMutation({
    onSuccess: (result) => {
      if (result.isCompleted) {
        toast.success("🎉 Project completed! Great work!");
      }
    },
    onError: () => toast.error("Failed to save progress"),
  });

  const utils = trpc.useUtils();

  const progressMap = useMemo(() => {
    const map: Record<string, { completedSteps: number[]; completedAt: Date | null }> = {};
    for (const p of myProgress) {
      map[p.projectId] = {
        completedSteps: p.completedSteps as number[],
        completedAt: p.completedAt,
      };
    }
    return map;
  }, [myProgress]);

  const openProgress = openProjectId ? (progressMap[openProjectId]?.completedSteps ?? []) : [];

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (selectedDifficulty !== "all" && p.difficulty !== selectedDifficulty) return false;
      if (selectedCert !== "all" && !p.certTags.includes(selectedCert)) return false;
      return true;
    });
  }, [projects, selectedDifficulty, selectedCert]);

  const stats = useMemo(() => {
    const started = myProgress.length;
    const completed = myProgress.filter((p) => p.completedAt).length;
    const totalStepsCompleted = myProgress.reduce(
      (acc, p) => acc + (p.completedSteps as number[]).length,
      0
    );
    return { started, completed, totalStepsCompleted };
  }, [myProgress]);

  function handleToggleStep(stepId: number) {
    if (!openProjectId || !openProjectFull) return;
    const current = progressMap[openProjectId]?.completedSteps ?? [];
    const next = current.includes(stepId)
      ? current.filter((s) => s !== stepId)
      : [...current, stepId];

    // Optimistic update
    utils.projectLab.getMyProgress.setData(undefined, (old) => {
      if (!old) return old;
      const existing = old.find((p) => p.projectId === openProjectId);
      if (existing) {
        return old.map((p) =>
          p.projectId === openProjectId ? { ...p, completedSteps: next } : p
        );
      }
      return [
        ...old,
        {
          projectId: openProjectId,
          completedSteps: next,
          completedAt: null,
          startedAt: new Date(),
        },
      ];
    });

    saveProgressMutation.mutate(
      { projectId: openProjectId, completedSteps: next },
      {
        onError: () => {
          // Rollback
          utils.projectLab.getMyProgress.invalidate();
        },
      }
    );
  }

  const certOptions = useMemo(() => {
    const certs = new Set<string>();
    for (const p of projects) p.certTags.forEach((c) => certs.add(c));
    return Array.from(certs).sort();
  }, [projects]);

  const completedCount = filtered.filter(
    (p) => (progressMap[p.id]?.completedSteps.length ?? 0) === p.totalSteps
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-primary" />
            Hands-On Project Lab
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build real AWS projects with step-by-step guidance. Reinforce exam concepts with practical experience.
          </p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-4 text-center shrink-0">
            <div className="px-4 py-2 rounded-lg bg-muted/50 border">
              <div className="text-xl font-bold text-primary">{stats.started}</div>
              <div className="text-xs text-muted-foreground">Started</div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-muted/50 border">
              <div className="text-xl font-bold text-emerald-400">{stats.completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-muted/50 border">
              <div className="text-xl font-bold text-amber-400">{stats.totalStepsCompleted}</div>
              <div className="text-xs text-muted-foreground">Steps Done</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground mr-1">Filter:</span>

        {(["all", "beginner", "intermediate", "advanced"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDifficulty(d)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              selectedDifficulty === d
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {d === "all" ? "All Levels" : DIFFICULTY_CONFIG[d].label}
          </button>
        ))}

        <div className="w-px h-4 bg-border mx-1" />

        <button
          onClick={() => setSelectedCert("all")}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            selectedCert === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          All Certs
        </button>
        {certOptions.map((cert) => (
          <button
            key={cert}
            onClick={() => setSelectedCert(cert)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              selectedCert === cert
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {cert}
          </button>
        ))}

        {(selectedDifficulty !== "all" || selectedCert !== "all") && (
          <button
            onClick={() => {
              setSelectedDifficulty("all");
              setSelectedCert("all");
            }}
            className="text-xs px-2 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          {completedCount > 0 && ` · ${completedCount} completed`}
        </span>
      </div>

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No projects match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              progress={progressMap[project.id]}
              onOpen={() => setOpenProjectId(project.id)}
            />
          ))}
        </div>
      )}

      {/* Step checklist modal */}
      <StepModal
        project={openProjectFull ?? null}
        progress={openProgress}
        onClose={() => setOpenProjectId(null)}
        onToggleStep={handleToggleStep}
        isSaving={saveProgressMutation.isPending}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
