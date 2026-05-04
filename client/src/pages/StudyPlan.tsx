import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  high: "bg-red-500/20 border-red-500/40 text-red-300",
  medium: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  review: "bg-blue-500/20 border-blue-500/40 text-blue-300",
};

const PRIORITY_LABELS = {
  high: "HIGH PRIORITY",
  medium: "MEDIUM",
  review: "REVIEW",
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
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/10 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-mono font-bold text-sm">WEEK {week.weekNumber}</span>
          <span className="text-white font-medium">{week.theme}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span>{week.days.length} days</span>
          <span>{totalHours.toFixed(1)}h total</span>
          <span>{totalQs} questions</span>
          <span className="text-lg">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="divide-y divide-white/5">
          {week.days.map((day) => (
            <div key={day.day} className={`p-4 border-l-4 ${
              day.priority === "high" ? "border-l-red-500" :
              day.priority === "review" ? "border-l-blue-500" : "border-l-amber-500"
            }`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-400 font-mono text-xs">
                      {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded border font-mono ${PRIORITY_COLORS[day.priority]}`}>
                      {PRIORITY_LABELS[day.priority]}
                    </span>
                  </div>
                  <h4 className="text-white font-semibold">{day.topic}</h4>
                  {day.subtopics?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {day.subtopics.map((st, i) => (
                        <span key={i} className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded">{st}</span>
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
                <ul className="space-y-1">
                  {day.tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-amber-400 mt-0.5 shrink-0">›</span>
                      {task}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudyPlan() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Form state
  const [cert, setCert] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("2");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  // Result state
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [activeTab, setActiveTab] = useState<"plan" | "resources" | "tips">("plan");

  const generateMutation = trpc.studyPlan.generate.useMutation({
    onSuccess: (data) => setResult(data as GenerateResult),
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
          <div className="text-4xl mb-4">🗓️</div>
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
      <div className="border-b border-white/10 bg-[#0a1220]/80 sticky top-0 z-10 backdrop-blur">
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
          {result && (
            <button
              onClick={() => setResult(null)}
              className="text-slate-400 hover:text-amber-400 text-sm transition-colors"
            >
              ← NEW PLAN
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!result ? (
          /* ── FORM ── */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-5xl mb-4">🗓️</div>
              <h1 className="text-3xl font-bold text-white mb-2">AI Study Plan Generator</h1>
              <p className="text-slate-400 leading-relaxed">
                Tell us your exam date and daily availability. The AI will analyze your practice
                performance and build a day-by-day study schedule that targets your weak areas first.
              </p>
            </div>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-6">
                {/* Certification */}
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm tracking-wider">CERTIFICATION</Label>
                  <Select value={cert} onValueChange={setCert}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white font-mono">
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
                  <Label className="text-slate-300 text-sm tracking-wider">EXAM DATE</Label>
                  <Input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={minDate}
                    max={maxDateStr}
                    className="bg-white/5 border-white/20 text-white font-mono [color-scheme:dark]"
                  />
                  <p className="text-xs text-slate-500">Plan covers up to 90 days before your exam.</p>
                </div>

                {/* Hours per day */}
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm tracking-wider">
                    DAILY STUDY TIME — <span className="text-amber-400">{hoursPerDay} hours/day</span>
                  </Label>
                  <input
                    type="range"
                    min="0.5"
                    max="8"
                    step="0.5"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(e.target.value)}
                    className="w-full accent-amber-400"
                  />
                  <div className="flex justify-between text-xs text-slate-500 pointer-events-none">
                    <span>30 min</span>
                    <span>2h</span>
                    <span>4h</span>
                    <span>6h</span>
                    <span>8h</span>
                  </div>
                </div>

                {/* Knowledge Level */}
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm tracking-wider">CURRENT KNOWLEDGE LEVEL</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["beginner", "intermediate", "advanced"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLevel(l)}
                        className={`py-3 rounded-lg border font-mono text-sm font-bold tracking-wider transition-all ${
                          level === l
                            ? "bg-amber-500/20 border-amber-500 text-amber-400"
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/30"
                        }`}
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Performance note */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-300">
                  <span className="font-bold">💡 Personalized:</span> If you have completed practice sessions,
                  the AI will automatically identify your weak topics and prioritize them in your plan.
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!cert || !examDate || generateMutation.isPending}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold text-base py-6 tracking-widest"
                >
                  {generateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⚙️</span> GENERATING YOUR PLAN...
                    </span>
                  ) : (
                    "GENERATE MY STUDY PLAN →"
                  )}
                </Button>

                {generateMutation.isError && (
                  <p className="text-red-400 text-sm text-center">
                    Failed to generate plan. Please try again.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* ── RESULTS ── */
          <div className="space-y-6">
            {/* Summary row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Readiness score */}
              <Card className="bg-white/5 border-white/10 flex items-center justify-center py-6">
                <div className="text-center">
                  <div className="text-xs text-slate-400 tracking-widest mb-3">READINESS SCORE</div>
                  <ReadinessGauge score={result.plan.readinessScore ?? 50} />
                </div>
              </Card>

              {/* Stats */}
              <Card className="bg-white/5 border-white/10 p-5 md:col-span-3">
                <div className="mb-3">
                  <h2 className="text-white font-bold text-lg">{result.certMeta.fullName}</h2>
                  <p className="text-slate-400 text-sm">
                    {result.daysUntilExam} days until exam &nbsp;·&nbsp;
                    Passing score: {result.certMeta.passingScore}/1000 &nbsp;·&nbsp;
                    {result.certMeta.questionCount} questions &nbsp;·&nbsp;
                    {result.certMeta.duration} min
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-amber-400 font-bold text-xl">{result.plan.weeks?.length ?? 0}</div>
                    <div className="text-slate-400 text-xs">Weeks</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-amber-400 font-bold text-xl">
                      {result.plan.weeks?.reduce((s, w) => s + w.days.length, 0) ?? 0}
                    </div>
                    <div className="text-slate-400 text-xs">Study Days</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-amber-400 font-bold text-xl">
                      {result.plan.weeks?.reduce((s, w) => s + w.days.reduce((ss, d) => ss + (d.practiceQuestions || 0), 0), 0) ?? 0}
                    </div>
                    <div className="text-slate-400 text-xs">Practice Qs</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-amber-400 font-bold text-xl">
                      {result.plan.weeks?.reduce((s, w) => s + w.days.reduce((ss, d) => ss + (d.estimatedHours || 0), 0), 0).toFixed(0) ?? 0}h
                    </div>
                    <div className="text-slate-400 text-xs">Total Study</div>
                  </div>
                </div>

                {/* Weak / strong areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.plan.weakAreas?.length > 0 && (
                    <div>
                      <div className="text-xs text-red-400 tracking-widest mb-2">⚠ FOCUS AREAS</div>
                      <div className="flex flex-wrap gap-1">
                        {result.plan.weakAreas.map((a, i) => (
                          <span key={i} className="text-xs bg-red-500/20 border border-red-500/30 text-red-300 px-2 py-0.5 rounded">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.plan.strengths?.length > 0 && (
                    <div>
                      <div className="text-xs text-green-400 tracking-widest mb-2">✓ STRENGTHS</div>
                      <div className="flex flex-wrap gap-1">
                        {result.plan.strengths.map((s, i) => (
                          <span key={i} className="text-xs bg-green-500/20 border border-green-500/30 text-green-300 px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/10">
              {(["plan", "resources", "tips"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 text-sm font-mono font-bold tracking-widest transition-colors ${
                    activeTab === tab
                      ? "text-amber-400 border-b-2 border-amber-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab === "plan" ? "📅 WEEK-BY-WEEK PLAN" : tab === "resources" ? "📚 RESOURCES" : "💡 EXAM DAY TIPS"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "plan" && (
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/40 inline-block"></span> High Priority</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/40 inline-block"></span> Medium</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500/40 inline-block"></span> Review</span>
                </div>
                {result.plan.weeks?.map((week) => (
                  <WeekAccordion key={week.weekNumber} week={week} />
                ))}
              </div>
            )}

            {activeTab === "resources" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.plan.resources?.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white/5 border border-white/10 rounded-lg p-4 hover:border-amber-500/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-white font-medium group-hover:text-amber-400 transition-colors">{r.title}</div>
                        <div className="text-slate-400 text-xs mt-1 truncate">{r.url}</div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0 border-white/20 text-slate-400">{r.type}</Badge>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {activeTab === "tips" && (
              <div className="space-y-3">
                {result.plan.examDayTips?.map((tip, i) => (
                  <div key={i} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-lg p-4">
                    <span className="text-amber-400 font-mono font-bold text-lg shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-slate-300 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <Button
                onClick={() => setResult(null)}
                variant="outline"
                className="border-white/20 text-slate-300 hover:text-white hover:bg-white/10"
              >
                Generate New Plan
              </Button>
              <Button
                onClick={() => navigate("/practice")}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
              >
                Start Practicing →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
