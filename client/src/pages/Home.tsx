import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { BookOpen, Brain, BarChart3, Zap, Library, Gamepad2, ChevronDown, ChevronUp, Lock, Sparkles, Calendar, Clock, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StudyDay {
  day: number;
  date: string;
  dayName: string;
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
  totalHours: number;
  totalQuestions: number;
  days: StudyDay[];
}

interface DemoPlan {
  readinessScore: number;
  weakAreas: string[];
  strengths: string[];
  weeks: StudyWeek[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CERTS = [
  { value: "CLF-C02", label: "CLF-C02 — Cloud Practitioner" },
  { value: "SAA-C03", label: "SAA-C03 — Solutions Architect Associate" },
  { value: "DVA-C02", label: "DVA-C02 — Developer Associate" },
  { value: "SOA-C02", label: "SOA-C02 — SysOps Administrator" },
  { value: "SAP-C02", label: "SAP-C02 — Solutions Architect Professional" },
  { value: "AIF-C01", label: "AIF-C01 — AI Practitioner" },
  { value: "MLS-C01", label: "MLS-C01 — Machine Learning Specialty" },
];

// ─── Readiness Gauge ──────────────────────────────────────────────────────────
function ReadinessGauge({ score }: { score: number }) {
  const color = score >= 70 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";
  const label = score >= 70 ? "ON TRACK" : score >= 50 ? "NEEDS WORK" : "EARLY STAGE";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono" style={{ color }}>{score}</span>
          <span className="text-xs text-slate-400 font-mono">/100</span>
        </div>
      </div>
      <span className="text-xs font-mono font-bold tracking-widest" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Week Accordion ───────────────────────────────────────────────────────────
function WeekAccordion({ week, isLocked }: { week: StudyWeek; isLocked: boolean }) {
  const [open, setOpen] = useState(week.weekNumber === 1);
  const priorityColor = (p: string) =>
    p === "high" ? "border-red-500/40 bg-red-500/5" :
    p === "medium" ? "border-amber-500/40 bg-amber-500/5" :
    "border-blue-500/40 bg-blue-500/5";
  const priorityBadge = (p: string) =>
    p === "high" ? "bg-red-500/20 text-red-400" :
    p === "medium" ? "bg-amber-500/20 text-amber-400" :
    "bg-blue-500/20 text-blue-400";

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${isLocked ? "border-white/5 opacity-60" : "border-white/10"}`}>
      <button
        onClick={() => !isLocked && setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isLocked ? "cursor-not-allowed" : "hover:bg-white/5 cursor-pointer"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono font-bold text-sm">
            {week.weekNumber}
          </div>
          <div>
            <div className="text-white font-mono font-semibold text-sm">{week.theme}</div>
            <div className="text-slate-400 text-xs font-mono mt-0.5">
              {week.days?.length ?? 0} days · {week.totalHours}h · {week.totalQuestions} questions
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLocked && <Lock className="w-4 h-4 text-slate-500" />}
          {!isLocked && (open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />)}
        </div>
      </button>

      {open && !isLocked && (
        <div className="border-t border-white/5 p-4 space-y-3">
          {week.days?.slice(0, 3).map((day) => (
            <div key={day.day} className={`border rounded-lg p-3 ${priorityColor(day.priority)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">{day.dayName}, {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${priorityBadge(day.priority)}`}>
                    {day.priority.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{day.estimatedHours}h · {day.practiceQuestions} Qs</span>
              </div>
              <div className="text-white text-sm font-semibold font-mono">{day.topic}</div>
              <ul className="mt-2 space-y-1">
                {day.tasks.slice(0, 2).map((task, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">›</span> {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {(week.days?.length ?? 0) > 3 && (
            <div className="text-xs text-slate-500 font-mono text-center">
              +{(week.days?.length ?? 0) - 3} more days — sign up to see full schedule
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Study Plan Preview Section ───────────────────────────────────────────────
function StudyPlanPreview() {
  const [cert, setCert] = useState("SAA-C03");
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [result, setResult] = useState<{ plan: DemoPlan; daysUntilExam: number } | null>(null);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const generateDemo = trpc.studyPlan.generateDemo.useMutation({
    onSuccess: (data) => {
      setResult(data as any);
      setShowSignUpModal(true);
    },
  });

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateStr = minDate.toISOString().split("T")[0];

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #080d14 0%, #0d1520 100%)" }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-mono font-semibold tracking-wider">AI-POWERED</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>
            Try Your Free Study Plan
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Tell us your exam date and goals. Our AI builds a personalized week-by-week schedule — right here, no account needed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-white font-mono font-bold text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              Configure Your Plan
            </h3>

            {/* Certification */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 tracking-widest uppercase">Target Certification</label>
              <select
                value={cert}
                onChange={(e) => setCert(e.target.value)}
                className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
              >
                {CERTS.map((c) => (
                  <option key={c.value} value={c.value} className="bg-slate-900">{c.label}</option>
                ))}
              </select>
            </div>

            {/* Exam Date */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 tracking-widest uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                min={minDateStr}
                max={maxDateStr}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            {/* Hours per day */}
            <div className="space-y-3">
              <label className="text-xs font-mono text-slate-400 tracking-widest uppercase flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Daily Study Time</span>
                <span className="text-amber-400 font-bold">{hoursPerDay}h / day</span>
              </label>
              <input
                type="range"
                min={0.5} max={8} step={0.5}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>30m</span><span>2h</span><span>4h</span><span>6h</span><span>8h</span>
              </div>
            </div>

            {/* Knowledge level */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 tracking-widest uppercase">Current Knowledge Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(["beginner", "intermediate", "advanced"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all border ${
                      level === l
                        ? "bg-amber-500/20 border-amber-500/60 text-amber-400"
                        : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => generateDemo.mutate({ certification: cert, examDate, hoursPerDay, knowledgeLevel: level })}
              disabled={generateDemo.isPending}
              className="w-full py-3.5 rounded-xl font-mono font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: generateDemo.isPending ? "rgba(245,158,11,0.3)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#000",
                boxShadow: generateDemo.isPending ? "none" : "0 0 20px rgba(245,158,11,0.3)",
              }}
            >
              {generateDemo.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  GENERATING YOUR PLAN...
                </span>
              ) : (
                "GENERATE MY FREE STUDY PLAN →"
              )}
            </button>

            {generateDemo.isError && (
              <p className="text-red-400 text-xs font-mono text-center">
                Failed to generate plan. Please try again.
              </p>
            )}
          </div>

          {/* Result Preview */}
          <div className="space-y-4">
            {!result ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-400/50" />
                </div>
                <div>
                  <p className="text-white font-mono font-semibold mb-2">Your plan will appear here</p>
                  <p className="text-slate-500 text-sm">Fill in the form and click Generate to see your personalized week-by-week AWS study schedule.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                  {["Readiness Score", "Week-by-Week Plan", "Focus Areas", "Study Resources"].map((item) => (
                    <div key={item} className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <div className="h-2 bg-white/10 rounded mb-2 animate-pulse" />
                      <div className="text-xs text-slate-500 font-mono">{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Score + stats */}
                <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-6">
                    <ReadinessGauge score={result.plan.readinessScore} />
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold font-mono text-amber-400">{result.plan.weeks.length}</div>
                          <div className="text-xs text-slate-400 font-mono">Weeks</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold font-mono text-amber-400">{result.daysUntilExam}</div>
                          <div className="text-xs text-slate-400 font-mono">Days Left</div>
                        </div>
                      </div>
                      {result.plan.weakAreas.length > 0 && (
                        <div>
                          <div className="text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Focus Areas</div>
                          <div className="flex flex-wrap gap-1.5">
                            {result.plan.weakAreas.slice(0, 3).map((area, i) => (
                              <span key={i} className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-full px-2 py-0.5 font-mono">{area}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Week accordion — first 2 unlocked, rest locked */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Week-by-Week Plan</div>
                  {result.plan.weeks.map((week, i) => (
                    <WeekAccordion key={week.weekNumber} week={week} isLocked={i >= 2} />
                  ))}
                </div>

                {/* Locked overlay CTA */}
                {result.plan.weeks.length > 2 && (
                  <div className="relative">
                    <div className="bg-gradient-to-b from-transparent via-slate-900/80 to-slate-900 absolute inset-0 rounded-xl pointer-events-none" />
                    <div className="bg-white/5 border border-amber-500/30 rounded-xl p-6 text-center space-y-3">
                      <Lock className="w-8 h-8 text-amber-400 mx-auto" />
                      <div className="text-white font-mono font-bold">
                        {result.plan.weeks.length - 2} more weeks locked
                      </div>
                      <p className="text-slate-400 text-sm">Sign up free to unlock your full plan, save it, and track your progress.</p>
                      <a href={getLoginUrl()}>
                        <button
                          className="w-full py-3 rounded-xl font-mono font-bold text-sm tracking-widest uppercase mt-2"
                          style={{
                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                            color: "#000",
                            boxShadow: "0 0 20px rgba(245,158,11,0.3)",
                          }}
                        >
                          SIGN UP FREE TO UNLOCK →
                        </button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign-up modal overlay */}
      {showSignUpModal && result && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl shadow-amber-500/10">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white font-mono mb-2">Your Plan is Ready!</h3>
              <p className="text-slate-400">
                Your <span className="text-amber-400 font-semibold">{cert}</span> study plan has been generated —{" "}
                <span className="text-amber-400 font-semibold">{result.plan.weeks.length} weeks</span> of personalized daily schedules.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between text-sm font-mono">
                <span className="text-slate-400">Readiness Score</span>
                <span className={`font-bold ${result.plan.readinessScore >= 70 ? "text-green-400" : result.plan.readinessScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
                  {result.plan.readinessScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-mono mt-2">
                <span className="text-slate-400">Weeks until exam</span>
                <span className="text-white font-bold">{result.plan.weeks.length}</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              Create a free account to <strong className="text-white">save this plan</strong>, unlock all weeks, and track your daily progress.
            </p>
            <div className="space-y-3">
              <a href={getLoginUrl()} className="block">
                <button
                  className="w-full py-3.5 rounded-xl font-mono font-bold text-sm tracking-widest uppercase"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "#000",
                    boxShadow: "0 0 20px rgba(245,158,11,0.3)",
                  }}
                >
                  SIGN UP FREE & SAVE MY PLAN →
                </button>
              </a>
              <button
                onClick={() => setShowSignUpModal(false)}
                className="w-full py-2.5 rounded-xl font-mono text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
              >
                Continue previewing
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Main Home Page ───────────────────────────────────────────────────────────
export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user]);

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-blue-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/logo-option3-Z8cRg8oEDzdqTunyE28t32.webp" alt="AWS AI Tutor Pro" className="w-10 h-10 rounded-lg" />
            <span className="text-xl font-bold text-white">AWS AI Tutor Pro</span>
          </div>
          <a href={getLoginUrl()}>
            <Button variant="outline" className="border-blue-400 text-blue-300 hover:bg-blue-900/50">
              Sign In
            </Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
                  Master AWS Certifications with AI
                </h1>
                <p className="text-xl text-blue-200">
                  Prepare for SAA-C03, CLF-C02 and more with realistic practice tests, AI-powered tutoring, and personalized study plans.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={getLoginUrl()}>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg px-8 py-6 h-auto rounded-lg">
                    Start Learning Now
                  </Button>
                </a>
                <a href="#study-plan-preview">
                  <Button variant="outline" className="border-amber-400 text-amber-300 hover:bg-amber-900/20 text-lg px-8 py-6 h-auto rounded-lg">
                    Try Free Study Plan
                  </Button>
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-400">500+</div>
                  <div className="text-sm text-blue-200">Real Questions</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-400">7+</div>
                  <div className="text-sm text-blue-200">Certifications</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-400">AI</div>
                  <div className="text-sm text-blue-200">Powered</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl"></div>
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/hero-aws-tech-mnHhXsjbnshtTcx3caNqoQ.webp"
                alt="AWS Certification Study Platform"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Study Plan Preview */}
      <div id="study-plan-preview">
        <StudyPlanPreview />
      </div>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Comprehensive Study Platform</h2>
            <p className="text-xl text-blue-200">Everything you need to ace your AWS certification</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-blue-400/20 rounded-xl p-6 hover:border-blue-400/50 transition-all">
              <div className="mb-4">
                <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/exam-mode-hero-YcWhHhJ7qcd9mW5iALpD3f.webp" alt="Exam Mode" className="w-full h-40 object-cover rounded-lg mb-4" />
              </div>
              <Zap className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Exam Mode</h3>
              <p className="text-blue-200">Take realistic timed exams with 65 questions and instant scoring</p>
            </div>
            <div className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-blue-400/20 rounded-xl p-6 hover:border-blue-400/50 transition-all">
              <div className="mb-4">
                <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/practice-mode-hero-CzfCCaUsT2jSRCiaByvyKu.webp" alt="Practice Mode" className="w-full h-40 object-cover rounded-lg mb-4" />
              </div>
              <BookOpen className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Practice Mode</h3>
              <p className="text-blue-200">Learn at your own pace with immediate feedback and explanations</p>
            </div>
            <div className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-blue-400/20 rounded-xl p-6 hover:border-blue-400/50 transition-all">
              <div className="mb-4">
                <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/ai-tutor-hero-LTd8ytWpCjguRsCnop4ySx.webp" alt="AI Tutor" className="w-full h-40 object-cover rounded-lg mb-4" />
              </div>
              <Brain className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">AI Tutor</h3>
              <p className="text-blue-200">Ask questions and get expert explanations powered by AI</p>
            </div>
            <div className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-blue-400/20 rounded-xl p-6 hover:border-blue-400/50 transition-all">
              <div className="mb-4">
                <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/progress-analytics-hero-kyapwmqxGMxo8b2eq4pxCF.webp" alt="Progress Analytics" className="w-full h-40 object-cover rounded-lg mb-4" />
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Progress Analytics</h3>
              <p className="text-blue-200">Track performance with detailed analytics and topic breakdowns</p>
            </div>
            <div className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-amber-400/20 rounded-xl p-6 hover:border-amber-400/50 transition-all">
              <div className="mb-4 h-40 rounded-lg bg-gradient-to-br from-amber-900/40 to-slate-800/60 flex items-center justify-center">
                <span className="text-6xl">📚</span>
              </div>
              <Library className="w-8 h-8 text-amber-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Learning Center</h3>
              <p className="text-blue-200">Deep-dive reference cards for 48 AWS services across 11 categories — from zero to certified</p>
            </div>
            <div className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-orange-400/20 rounded-xl p-6 hover:border-orange-400/50 transition-all">
              <div className="mb-4 h-40 rounded-lg bg-gradient-to-br from-orange-900/40 to-slate-800/60 flex items-center justify-center">
                <span className="text-6xl">☁️</span>
              </div>
              <Gamepad2 className="w-8 h-8 text-orange-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Training Arena</h3>
              <p className="text-blue-200">5 game modes: Match It (31 levels), Escape Room, Troubleshoot, Scenario Quiz &amp; RPG Campaign</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Real Results from Real Students</h2>
            <p className="text-blue-300">Hear from those who passed their AWS certification using this platform</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/40 to-slate-800/60 border border-blue-500/30 rounded-2xl p-8 relative">
            {/* Quote mark */}
            <div className="absolute -top-4 left-8 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">&ldquo;</div>
            <p className="text-lg text-slate-200 leading-relaxed mb-6 italic">
              &ldquo;Shoutout to AWS AI Tutor Pro! I recently used the app to prepare for the AWS Certified Cloud Practitioner exam and passed. The platform provides the perfect momentum and clarity needed to tackle the material efficiently. A fantastic resource for anyone getting certified.&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                M
              </div>
              <div>
                <p className="font-semibold text-white">Micaiah Hill-Shuva</p>
                <p className="text-sm text-blue-300">AWS Certified Cloud Practitioner (CLF-C02) &mdash; Passed ✓</p>
              </div>
              <div className="ml-auto flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Pass Your AWS Exam?</h2>
          <p className="text-xl text-blue-200 mb-8">
            Join students preparing for AWS certifications with our comprehensive study platform.
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg px-8 py-6 h-auto rounded-lg">
              Get Started Free
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-800/30 bg-slate-900/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-blue-300 space-y-3">
          <p>&copy; 2026 AWS AI Tutor Pro. All rights reserved.</p>
          <p className="text-sm text-blue-400">
            Built by Abdullahi Wadi &mdash;{" "}
            <a href="mailto:abdulahiyerow@gmail.com" className="underline hover:text-white transition-colors">
              abdulahiyerow@gmail.com
            </a>
            {" "}&middot;{" "}
            <a href="https://www.linkedin.com/in/abdullahi-wadi" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">
              LinkedIn
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
