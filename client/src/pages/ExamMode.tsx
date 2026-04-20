import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, AlertCircle, Flag, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";

interface ExamQuestion {
  id: number;
  questionText: string;
  options: string[];
  questionType: "single" | "multiple";
  correctAnswers?: string[];
}

export default function ExamMode() {
  const [, navigate] = useLocation();
  const [selectedCert, setSelectedCert] = useState<"SAA-C03" | "CLF-C02" | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [startingCert, setStartingCert] = useState<"SAA-C03" | "CLF-C02" | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const timerEverStartedRef = useRef(false);

  const utils = trpc.useUtils();
  const startExamMutation = trpc.exam.startExam.useMutation();
  const submitAnswerMutation = trpc.exam.submitAnswer.useMutation();
  const submitExamMutation = trpc.exam.submitExam.useMutation();

  // Timer effect
  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;
    timerEverStartedRef.current = true;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && examStarted && sessionId && timerEverStartedRef.current && !isSubmitting) {
      handleSubmitExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleStartExam = async (cert: "SAA-C03" | "CLF-C02") => {
    if (startingCert !== null) return;
    setStartingCert(cert);
    timerEverStartedRef.current = false;
    try {
      const result = await startExamMutation.mutateAsync({ certification: cert, mode: "exam" });
      setSessionId(result.sessionId);
      setQuestions(result.questions);
      setSelectedCert(cert);
      setExamStarted(true);
      setTimeLeft(result.timeLimitMinutes * 60);
      setStartTime(Date.now());
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setFlaggedQuestions(new Set());
      setIsSubmitting(false);
    } catch (error) {
      console.error("Failed to start exam:", error);
    } finally {
      setStartingCert(null);
    }
  };

  const handleSelectAnswer = (option: string) => {
    const currentQuestion = questions[currentQuestionIdx];
    if (!currentQuestion) return;
    setSelectedAnswers(prev => {
      const current = prev[currentQuestion.id] || [];
      if (currentQuestion.questionType === "single") {
        return { ...prev, [currentQuestion.id]: [option] };
      } else {
        if (current.includes(option)) {
          return { ...prev, [currentQuestion.id]: current.filter(a => a !== option) };
        } else {
          return { ...prev, [currentQuestion.id]: [...current, option] };
        }
      }
    });
  };

  const handleNext = async () => {
    const currentQuestion = questions[currentQuestionIdx];
    if (!currentQuestion || !sessionId || isNavigating) return;
    setIsNavigating(true);
    submitAnswerMutation.mutate({
      sessionId,
      questionId: currentQuestion.id,
      userAnswer: selectedAnswers[currentQuestion.id] || [],
    });
    setCurrentQuestionIdx(prev => Math.min(prev + 1, questions.length - 1));
    setIsNavigating(false);
  };

  const handlePrevious = () => {
    setCurrentQuestionIdx(prev => Math.max(0, prev - 1));
  };

  const handleJumpTo = (idx: number) => {
    // Save current answer before jumping
    const currentQuestion = questions[currentQuestionIdx];
    if (currentQuestion && sessionId) {
      submitAnswerMutation.mutate({
        sessionId,
        questionId: currentQuestion.id,
        userAnswer: selectedAnswers[currentQuestion.id] || [],
      });
    }
    setCurrentQuestionIdx(idx);
    setShowNavigator(false);
  };

  const handleToggleFlag = () => {
    const currentQuestion = questions[currentQuestionIdx];
    if (!currentQuestion) return;
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  };

  const handleSubmitExam = async () => {
    if (!sessionId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const currentQuestion = questions[currentQuestionIdx];
      if (currentQuestion) {
        try {
          await submitAnswerMutation.mutateAsync({
            sessionId,
            questionId: currentQuestion.id,
            userAnswer: selectedAnswers[currentQuestion.id] || [],
          });
        } catch { /* non-critical */ }
      }
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      await submitExamMutation.mutateAsync({ sessionId, timeTaken });
      await utils.progress.invalidate();
      navigate(`/exam/${sessionId}/results`);
    } catch (error) {
      console.error("Failed to submit exam:", error);
      setIsSubmitting(false);
    }
  };

  // ─── Cert selection screen ───────────────────────────────────────────────────
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Select Certification</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { cert: "SAA-C03" as const, name: "AWS Solutions Architect Associate", duration: "130 minutes" },
              { cert: "CLF-C02" as const, name: "AWS Certified Cloud Practitioner", duration: "90 minutes" },
            ].map(({ cert, name, duration }) => (
              <Card key={cert} className="p-8 hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{name}</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4"><strong>Exam Code:</strong> {cert}</p>
                <p className="text-slate-600 dark:text-slate-300 mb-4"><strong>Duration:</strong> {duration}</p>
                <p className="text-slate-600 dark:text-slate-300 mb-6"><strong>Questions:</strong> 65</p>
                <Button className="w-full" disabled={startingCert !== null} onClick={() => handleStartExam(cert)}>
                  {startingCert === cert ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting...</>
                  ) : (`Start ${cert} Exam`)}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Derived state ───────────────────────────────────────────────────────────
  const currentQuestion = questions[currentQuestionIdx];
  const currentAnswers = selectedAnswers[currentQuestion?.id] || [];
  const timeWarning = timeLeft < 300;
  const answeredCount = Object.keys(selectedAnswers).filter(k => (selectedAnswers[Number(k)] || []).length > 0).length;
  const skippedCount = questions.length - answeredCount;
  const isFlagged = currentQuestion ? flaggedQuestions.has(currentQuestion.id) : false;

  // ─── Question navigator panel ────────────────────────────────────────────────
  const NavigatorPanel = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNavigator(false)}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Question Navigator</h3>
          <button onClick={() => setShowNavigator(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-blue-500 inline-block" /> Answered</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-amber-400 inline-block" /> Flagged</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border-2 border-slate-300 inline-block" /> Unanswered</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-8 gap-2 mb-6">
          {questions.map((q, idx) => {
            const answered = (selectedAnswers[q.id] || []).length > 0;
            const flagged = flaggedQuestions.has(q.id);
            const isCurrent = idx === currentQuestionIdx;
            return (
              <button
                key={q.id}
                onClick={() => handleJumpTo(idx)}
                className={`w-9 h-9 rounded text-xs font-bold transition-all border-2 ${
                  isCurrent ? "ring-2 ring-blue-500 ring-offset-1" : ""
                } ${
                  flagged ? "bg-amber-400 border-amber-500 text-white" :
                  answered ? "bg-blue-500 border-blue-600 text-white" :
                  "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Skipped section */}
        {skippedCount > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Unanswered Questions ({skippedCount})
            </p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const answered = (selectedAnswers[q.id] || []).length > 0;
                if (answered) return null;
                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpTo(idx)}
                    className="px-3 py-1 text-xs rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 hover:bg-red-100 transition-colors"
                  >
                    Q{idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {answeredCount}/{questions.length} answered
          </p>
          <Button onClick={handleSubmitExam} disabled={isSubmitting} size="sm">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Exam"}
          </Button>
        </div>
      </div>
    </div>
  );

  // ─── Exam screen ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      {showNavigator && <NavigatorPanel />}

      {/* Timer Bar */}
      <div className={`fixed top-0 left-0 right-0 border-b shadow-sm p-3 z-10 ${timeWarning ? "bg-red-50 dark:bg-red-900" : "bg-white dark:bg-slate-800"}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {selectedCert} — Q{currentQuestionIdx + 1}/{questions.length}
            </p>
            {skippedCount > 0 && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">
                {skippedCount} unanswered
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowNavigator(true)} className="gap-1 text-xs">
              <LayoutGrid className="w-3.5 h-3.5" />
              Navigator
            </Button>
            <div className={`text-2xl font-bold ${timeWarning ? "text-red-600" : "text-slate-900 dark:text-white"}`}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </div>
          </div>
        </div>
        {timeWarning && (
          <div className="max-w-7xl mx-auto flex items-center gap-2 mt-1 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Less than 5 minutes remaining</span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-24">
        {currentQuestion && (
          <Card className="p-8">
            {/* Question header */}
            <div className="flex items-start justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Question {currentQuestionIdx + 1} of {questions.length}
              </span>
              <button
                onClick={handleToggleFlag}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                  isFlagged
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    : "text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {isFlagged ? "Flagged" : "Flag for review"}
              </button>
            </div>

            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 whitespace-pre-line leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => {
                const letter = ["A", "B", "C", "D"][idx];
                const isSelected = currentAnswers.includes(option);
                return (
                  <label
                    key={idx}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type={currentQuestion.questionType === "single" ? "radio" : "checkbox"}
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(option)}
                      className="w-4 h-4 mt-1 shrink-0"
                    />
                    <span className={`ml-3 font-semibold mr-2 shrink-0 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
                      {letter}.
                    </span>
                    <span className="text-slate-900 dark:text-white">{option}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIdx === 0 || isSubmitting}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIdx === questions.length - 1 ? (
                  <Button onClick={handleSubmitExam} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                    ) : (
                      `Submit Exam${skippedCount > 0 ? ` (${skippedCount} unanswered)` : ""}`
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleNext} disabled={isNavigating || isSubmitting}>
                    {isNavigating ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Next <ChevronRight className="w-4 h-4 ml-1" /></>}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
