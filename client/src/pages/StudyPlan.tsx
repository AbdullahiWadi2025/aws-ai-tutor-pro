import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StudyDay {
  day: number;
  date: string;
  topic: string;
  subtopics: string[];
  tasks: string[];
  practiceQuestions: number;
  estimatedHours: number;
  priority: "high" | "medium" | "review";
}

interface StudyWeek {
  weekNumber: number;
  theme: string;
  days: StudyDay[];
}

interface StudyPlanData {
  readinessScore: number;
  weakAreas: string[];
  strengths: string[];
  examDayTips: string[];
  resources: { title: string; url: string; type: string }[];
  weeks: StudyWeek[];
}

interface GenerateResult {
  success: boolean;
  plan: StudyPlanData;
  weakTopics: { topic: string; accuracy: number }[];
  strongTopics: { topic: string; accuracy: number }[];
  daysUntilExam: number;
  certMeta: {
    fullName: string;
    passingScore: number;
    questionCount: number;
    duration: number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CERTS = [
  { value: "CLF-C02", label: "CLF-C02 — Cloud Practitioner", level: "Foundational" },
  { value: "SAA-C03", label: "SAA-C03 — Solutions Architect Associate", level: "Associate" },
  { value: "SOA-C02", label: "SOA-C02 — SysOps Administrator Associate", level: "Associate" },
  { value: "DVA-C02", label: "DVA-C02 — Developer Associate", level: "Associate" },
  { value: "SAP-C02", label: "SAP-C02 — Solutions Architect Professional", level: "Professional" },
  { value: "DOP-C02", label: "DOP-C02 — DevOps Engineer Professional", level: "Professional" },
  { value: "SCS-C02", label: "SCS-C02 — Security Specialty", level: "Specialty" },
  { value: "ANS-C01", label: "ANS-C01 — Advanced Networking Specialty", level: "Specialty" },
  { value: "MLS-C01", label: "MLS-C01 — Machine Learning Specialty", level: "Specialty" },
  { value: "DAS-C01", label: "DAS-C01 — Data Analytics Specialty", level: "Specialty" },
  { value: "AIF-C01", label: "AIF-C01 — AI Practitioner", level: "Foundational" },
];

const PRIORITY_COLORS = {
  high: "border-l-red-500 bg-red-500/5",
  medium: "border-l-amber-500 bg-amber-500/5",
  review: "border-l-blue-500 bg-blue-500/5",
};

const PRIORITY_BADGE = {
  high: "bg-red-500/20 border-red-500/40 text-red-300",
  medium: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  review: "bg-blue-500/20 border-blue-500/40 text-blue-300",
};

const PRIORITY_LABELS = {
  high: "HIGH PRIORITY",
  medium: "MEDIUM",
  review: "REVIEW",
};

const RESOURCE_TYPE_COLORS: Record<string, string> = {
  Course: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Documentation: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Practice: "bg-green-500/20 text-green-300 border-green-500/30",
  Video: "bg-red-500/20 text-red-300 border-red-500/30",
  Book: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

// ─── Readiness Gauge ──────────────────────────────────────────────────────────
function ReadinessGauge({ score }: { score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "On Track" : score >= 50 ? "Needs Work" : "Start Now";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="54" fill="none" stroke="#1e293b" strokeWidth="12" />
        <circle
          cx="70" cy="70" r="54"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="70" y="65" textAnchor="middle" fill={color} fontSize="28" fontWeight="bold" fontFamily="Space Mono, monospace">{score}</text>
        <text x="70" y="85" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="Space Mono, monospace">/ 100</text>
      </svg>
      <span style={{ color }} className="text-sm font-bold tracking-widest uppercase font-mono">{label}</span>
    </div>
  );
}

// ─── Week Accordion ───────────────────────────────────────────────────────────
function WeekAccordion({ week }: { week: StudyWeek }) {
  const [open, setOpen] = useState(week.weekNumber === 1);
  const totalHours = week.days.reduce((s, d) => s + (d.estimatedHours || 0), 0);
  const totalQs = week.days.reduce((s, d) => s + (d.practiceQuestions || 0), 0);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/8 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <span className="text-amber-400 font-mono font-bold text-xs">{week.weekNumber}</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{week.theme}</div>
            <div className="text-slate-500 text-xs font-mono">{week.days.length} days · {totalHours.toFixed(1)}h · {totalQs} questions</div>
          </div>
        </div>
        <span className="text-slate-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="divide-y divide-white/5">
          {week.days.map((day) => (
            <div key={day.day} className={`p-4 border-l-4 ${PRIORITY_COLORS[day.priority]}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-slate-400 font-mono text-xs shrink-0">
                      {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded border font-mono shrink-0 ${PRIORITY_BADGE[day.priority]}`}>
                      {PRIORITY_LABELS[day.priority]}
                    </span>
                  </div>
                  <h4 className="text-white font-semibold text-sm">{day.topic}</h4>
                  {day.subtopics?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {day.subtopics.map((st, i) => (
                        <span key={i} className="text-xs bg-white/8 text-slate-300 px-2 py-0.5 rounded-full">{st}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-amber-400 font-mono font-bold text-sm">{day.estimatedHours}h</div>
                  <div className="text-slate-400 font-mono text-xs">{day.practiceQuestions} Qs</div>
                </div>
              </div>

              {day.tasks?.length > 0 && (
                <ul className="space-y-1.5 mt-2">
                  {day.tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-amber-400 mt-0.5 shrink-0 text-xs">›</span>
                      <span className="leading-relaxed">{task}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Saved Plan Card ──────────────────────────────────────────────────────────
function SavedPlanCard({
  plan,
  onLoad,
}: {
  plan: { id: number; certification: string; examDate: string; readinessScore: number | null; createdAt: number; planJson: string };
  onLoad: (data: GenerateResult) => void;
}) {
  const parsed = (() => {
    try { return JSON.parse(plan.planJson) as GenerateResult; } catch { return null; }
  })();

  const score = plan.readinessScore ?? parsed?.plan?.readinessScore ?? 0;
  const color = score >= 70 ? "text-green-400" : score >= 50 ? "text-amber-400" : "text-red-400";
  const weeks = parsed?.plan?.weeks?.length ?? 0;
  const days = parsed?.plan?.weeks?.reduce((s: number, w: StudyWeek) => s + w.days.length, 0) ?? 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-amber-500/30 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-white font-bold font-mono">{plan.certification}</div>
          <div className="text-slate-400 text-xs mt-0.5">
            Exam: {new Date(plan.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
          <div className="text-slate-500 text-xs mt-0.5">
            Generated {new Date(plan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold font-mono ${color}`}>{score}</div>
          <div className="text-slate-500 text-xs">readiness</div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mb-3">
        <span>{weeks} weeks</span>
        <span>·</span>
        <span>{days} days</span>
      </div>
      {parsed && (
        <Button
          onClick={() => onLoad(parsed)}
          size="sm"
          className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 font-mono text-xs"
          variant="outline"
        >
          LOAD THIS PLAN →
        </Button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudyPlan() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Form state
  const [cert, setCert] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("2");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  // View state
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [activeTab, setActiveTab] = useState<"plan" | "resources" | "tips">("plan");
  const [mainView, setMainView] = useState<"form" | "result" | "saved">("form");

  const generateMutation = trpc.studyPlan.generate.useMutation({
    onSuccess: (data) => {
      setResult(data as GenerateResult);
      setMainView("result");
      setActiveTab("plan");
    },
  });

  const savedPlansQuery = trpc.studyPlan.getMine.useQuery(undefined, {
    enabled: !!user,
  });

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Max date = 90 days from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const handleGenerate = () => {
    if (!cert || !examDate || !hoursPerDay) return;
    generateMutation.mutate({
      certification: cert,
      examDate,
      hoursPerDay: parseFloat(hoursPerDay),
      knowledgeLevel: level,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080d14] flex items-center justify-center">
        <div className="text-amber-400 font-mono animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080d14] flex items-center justify-center p-6">
        <Card className="bg-white/5 border-white/10 max-w-md w-full text-center p-8">
          <div className="text-5xl mb-4">🗓️</div>
          <h2 className="text-white text-xl font-bold mb-2">Sign In Required</h2>
          <p className="text-slate-400 mb-6">Sign in to generate your personalized AWS study plan.</p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold w-full"
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d14] text-white font-mono">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a1220]/90 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              ← DASHBOARD
            </button>
            <span className="text-white/20">|</span>
            <span className="text-amber-400 font-bold tracking-widest text-sm">AI STUDY PLAN</span>
          </div>
          <div className="flex items-center gap-2">
            {mainView === "result" && (
              <button
                onClick={() => setMainView("form")}
                className="text-slate-400 hover:text-amber-400 text-xs font-mono transition-colors px-3 py-1.5 border border-white/10 rounded-lg hover:border-amber-500/30"
              >
                + NEW PLAN
              </button>
            )}
            <button
              onClick={() => setMainView(mainView === "saved" ? (result ? "result" : "form") : "saved")}
              className={`text-xs font-mono transition-colors px-3 py-1.5 border rounded-lg ${
                mainView === "saved"
                  ? "text-amber-400 border-amber-500/50 bg-amber-500/10"
                  : "text-slate-400 border-white/10 hover:border-amber-500/30 hover:text-amber-400"
              }`}
            >
              📋 MY PLANS {savedPlansQuery.data && savedPlansQuery.data.length > 0 && `(${savedPlansQuery.data.length})`}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── SAVED PLANS VIEW ── */}
        {mainView === "saved" && (
          <div>
            <div className="mb-6">
              <h2 className="text-white text-xl font-bold mb-1">My Saved Plans</h2>
              <p className="text-slate-400 text-sm">Your previously generated study plans. Click any plan to reload it.</p>
            </div>
            {savedPlansQuery.isLoading ? (
              <div className="text-slate-400 font-mono animate-pulse py-8 text-center">LOADING PLANS...</div>
            ) : !savedPlansQuery.data || savedPlansQuery.data.length === 0 ? (
              <div className="text-center py-16 border border-white/10 rounded-xl bg-white/5">
                <div className="text-4xl mb-3">🗓️</div>
                <div className="text-white font-semibold mb-2">No saved plans yet</div>
                <p className="text-slate-400 text-sm mb-5">Generate your first study plan to see it here.</p>
                <Button
                  onClick={() => setMainView("form")}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                >
                  Generate a Plan →
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(savedPlansQuery.data as unknown as Array<{ id: number; certification: string; examDate: string; readinessScore: number | null; createdAt: number; planJson: string }>).map((plan) => (
                  <SavedPlanCard
                    key={plan.id}
                    plan={plan}
                    onLoad={(data) => {
                      setResult(data);
                      setMainView("result");
                      setActiveTab("plan");
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FORM VIEW ── */}
        {mainView === "form" && (
          <div className="max-w-2xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 mb-4">
                <span className="text-3xl">🗓️</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">AI Study Plan Generator</h1>
              <p className="text-slate-400 leading-relaxed max-w-lg mx-auto">
                Tell us your exam date and daily availability. The AI analyzes your practice
                performance and builds a personalized day-by-day schedule targeting your weak areas first.
              </p>
            </div>

            {/* Form card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">

              {/* Certification */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs tracking-widest font-mono">CERTIFICATION</Label>
                <Select value={cert} onValueChange={setCert}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white font-mono h-11">
                    <SelectValue placeholder="Select your target certification..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1a2e] border-white/20">
                    {["Foundational", "Associate", "Professional", "Specialty"].map((lvl) => (
                      <div key={lvl}>
                        <div className="px-2 py-1 text-xs text-slate-500 font-mono tracking-wider">{lvl.toUpperCase()}</div>
                        {CERTS.filter((c) => c.level === lvl).map((c) => (
                          <SelectItem key={c.value} value={c.value} className="text-white font-mono hover:bg-white/10">
                            {c.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Exam Date */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs tracking-widest font-mono">EXAM DATE</Label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={minDate}
                  max={maxDateStr}
                  className="bg-white/5 border-white/20 text-white font-mono h-11 [color-scheme:dark]"
                />
                <p className="text-xs text-slate-500 font-mono">Plan covers up to 90 days before your exam.</p>
              </div>

              {/* Hours per day */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300 text-xs tracking-widest font-mono">DAILY STUDY TIME</Label>
                  <span className="text-amber-400 font-mono font-bold text-sm">{hoursPerDay === "0.5" ? "30 min" : `${hoursPerDay}h`} / day</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  className="w-full accent-amber-400 h-2"
                />
                <div className="flex justify-between text-xs text-slate-500 font-mono select-none">
                  <span>30m</span>
                  <span>2h</span>
                  <span>4h</span>
                  <span>6h</span>
                  <span>8h</span>
                </div>
              </div>

              {/* Knowledge Level */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs tracking-widest font-mono">CURRENT KNOWLEDGE LEVEL</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["beginner", "intermediate", "advanced"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`py-3 rounded-xl border font-mono text-xs font-bold tracking-wider transition-all ${
                        level === l
                          ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                          : "bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personalization note */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 text-sm text-blue-300 flex items-start gap-2.5">
                <span className="text-base shrink-0">💡</span>
                <span>
                  <span className="font-bold">Personalized to you:</span> If you have completed practice sessions,
                  the AI will automatically identify your weak topics and prioritize them in your plan.
                </span>
              </div>

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={!cert || !examDate || generateMutation.isPending}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-sm py-6 tracking-widest rounded-xl"
              >
                {generateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block">⚙️</span> GENERATING YOUR PLAN...
                  </span>
                ) : (
                  "GENERATE MY STUDY PLAN →"
                )}
              </Button>

              {generateMutation.isError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center font-mono">
                  Failed to generate plan. Please try again.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RESULTS VIEW ── */}
        {mainView === "result" && result && (
          <div className="space-y-6">

            {/* Summary row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Readiness score */}
              <div className="bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center py-6">
                <div className="text-center">
                  <div className="text-xs text-slate-400 tracking-widest mb-3 font-mono">READINESS SCORE</div>
                  <ReadinessGauge score={result.plan.readinessScore ?? 50} />
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:col-span-3">
                <div className="mb-4">
                  <h2 className="text-white font-bold text-lg">{result.certMeta.fullName}</h2>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    <span className="text-slate-400 text-sm">{result.daysUntilExam} days until exam</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 text-sm">Pass: {result.certMeta.passingScore}/1000</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 text-sm">{result.certMeta.questionCount} questions</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 text-sm">{result.certMeta.duration} min</span>
                  </div>
                </div>

                {/* Stat boxes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { value: result.plan.weeks?.length ?? 0, label: "Weeks" },
                    { value: result.plan.weeks?.reduce((s, w) => s + w.days.length, 0) ?? 0, label: "Study Days" },
                    { value: result.plan.weeks?.reduce((s, w) => s + w.days.reduce((ss, d) => ss + (d.practiceQuestions || 0), 0), 0) ?? 0, label: "Practice Qs" },
                    { value: `${result.plan.weeks?.reduce((s, w) => s + w.days.reduce((ss, d) => ss + (d.estimatedHours || 0), 0), 0).toFixed(0)}h`, label: "Total Study" },
                  ].map(({ value, label }) => (
                    <div key={label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                      <div className="text-amber-400 font-bold text-xl font-mono">{value}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Weak / strong areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.plan.weakAreas?.length > 0 && (
                    <div>
                      <div className="text-xs text-red-400 tracking-widest mb-2 font-mono">⚠ FOCUS AREAS</div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.plan.weakAreas.map((a, i) => (
                          <span key={i} className="text-xs bg-red-500/15 border border-red-500/25 text-red-300 px-2.5 py-1 rounded-full">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.plan.strengths?.length > 0 && (
                    <div>
                      <div className="text-xs text-green-400 tracking-widest mb-2 font-mono">✓ STRENGTHS</div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.plan.strengths.map((s, i) => (
                          <span key={i} className="text-xs bg-green-500/15 border border-green-500/25 text-green-300 px-2.5 py-1 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/10">
              {(["plan", "resources", "tips"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 text-xs font-mono font-bold tracking-widest transition-colors ${
                    activeTab === tab
                      ? "text-amber-400 border-b-2 border-amber-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab === "plan" ? "📅 WEEK-BY-WEEK PLAN" : tab === "resources" ? "📚 RESOURCES" : "💡 EXAM DAY TIPS"}
                </button>
              ))}
            </div>

            {/* Tab: Plan */}
            {activeTab === "plan" && (
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/40 inline-block"></span> High Priority</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500/40 inline-block"></span> Medium</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500/40 inline-block"></span> Review</span>
                </div>
                {result.plan.weeks?.map((week) => (
                  <WeekAccordion key={week.weekNumber} week={week} />
                ))}
              </div>
            )}

            {/* Tab: Resources */}
            {activeTab === "resources" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.plan.resources?.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:border-amber-500/40 transition-all hover:bg-white/8 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-sm group-hover:text-amber-400 transition-colors mb-1 leading-snug">
                          {r.title}
                        </div>
                        <div className="text-slate-500 text-xs font-mono break-all leading-relaxed">
                          {r.url}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-mono shrink-0 ${RESOURCE_TYPE_COLORS[r.type] ?? "bg-white/10 text-slate-300 border-white/20"}`}>
                        {r.type}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-amber-400/70 font-mono group-hover:text-amber-400 transition-colors">
                      OPEN RESOURCE →
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Tab: Tips */}
            {activeTab === "tips" && (
              <div className="space-y-3">
                {result.plan.examDayTips?.map((tip, i) => (
                  <div key={i} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <span className="text-amber-400 font-mono font-bold text-xs">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
              <Button
                onClick={() => setMainView("form")}
                variant="outline"
                className="border-white/20 text-slate-300 hover:text-white hover:bg-white/10 font-mono text-xs"
              >
                + GENERATE NEW PLAN
              </Button>
              <Button
                onClick={() => setMainView("saved")}
                variant="outline"
                className="border-white/20 text-slate-300 hover:text-white hover:bg-white/10 font-mono text-xs"
              >
                📋 VIEW SAVED PLANS
              </Button>
              <Button
                onClick={() => navigate("/practice")}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold font-mono text-xs"
              >
                START PRACTICING →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
