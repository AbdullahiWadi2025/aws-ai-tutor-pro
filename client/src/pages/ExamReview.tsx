import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Loader2,
} from "lucide-react";

const LETTERS = ["A", "B", "C", "D"];

export default function ExamReview() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = parseInt(params.sessionId, 10);
  const [, navigate] = useLocation();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showNavigator, setShowNavigator] = useState(false);
  const [filter, setFilter] = useState<"all" | "incorrect" | "skipped">("all");

  const { data, isLoading, error } = trpc.exam.getReview.useQuery(
    { sessionId },
    { retry: 1, enabled: !isNaN(sessionId) }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Review Not Available</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            We couldn't load the review for this exam session.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const { questions, score, isPassed, correctAnswers, totalQuestions, certification } = data;

  // Filtered question list for the navigator
  const filteredQuestions = questions.filter(q => {
    if (filter === "incorrect") return !q.isCorrect && q.wasAnswered;
    if (filter === "skipped") return !q.wasAnswered;
    return true;
  });

  const currentQuestion = questions[currentIdx];
  if (!currentQuestion) return null;

  const goTo = (idx: number) => {
    setCurrentIdx(idx);
    setShowNavigator(false);
  };

  const goNext = () => setCurrentIdx(prev => Math.min(prev + 1, questions.length - 1));
  const goPrev = () => setCurrentIdx(prev => Math.max(0, prev - 1));

  const correctCount = questions.filter(q => q.isCorrect).length;
  const incorrectCount = questions.filter(q => !q.isCorrect && q.wasAnswered).length;
  const skippedCount = questions.filter(q => !q.wasAnswered).length;

  // ─── Navigator modal ─────────────────────────────────────────────────────────
  const NavigatorModal = () => (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={() => setShowNavigator(false)}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Question Navigator</h3>
          <button onClick={() => setShowNavigator(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "incorrect", "skipped"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {f === "all" ? `All (${questions.length})` : f === "incorrect" ? `Incorrect (${incorrectCount})` : `Skipped (${skippedCount})`}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-green-500 inline-block" /> Correct</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-500 inline-block" /> Incorrect</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-slate-300 inline-block" /> Skipped</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-8 gap-2">
          {(filter === "all" ? questions : filteredQuestions).map((q, idx) => {
            const realIdx = filter === "all" ? idx : questions.indexOf(q);
            const isCurrent = realIdx === currentIdx;
            return (
              <button
                key={q.id}
                onClick={() => goTo(realIdx)}
                className={`w-9 h-9 rounded text-xs font-bold transition-all border-2 ${
                  isCurrent ? "ring-2 ring-blue-500 ring-offset-1" : ""
                } ${
                  !q.wasAnswered
                    ? "bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-300"
                    : q.isCorrect
                    ? "bg-green-500 border-green-600 text-white"
                    : "bg-red-500 border-red-600 text-white"
                }`}
              >
                {realIdx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ─── Question card ────────────────────────────────────────────────────────────
  const q = currentQuestion;
  const userAnsweredLetters = q.userAnswer || [];
  const correctLetters = q.correctAnswers || [];

  const getOptionStyle = (letter: string) => {
    const isCorrect = correctLetters.includes(letter);
    const isSelected = userAnsweredLetters.includes(letter);

    if (isCorrect && isSelected) {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }
    if (isCorrect && !isSelected) {
      return "border-green-500 bg-green-50 dark:bg-green-900/20 opacity-80";
    }
    if (!isCorrect && isSelected) {
      return "border-red-500 bg-red-50 dark:bg-red-900/20";
    }
    return "border-slate-200 dark:border-slate-700 opacity-60";
  };

  const getOptionIcon = (letter: string) => {
    const isCorrect = correctLetters.includes(letter);
    const isSelected = userAnsweredLetters.includes(letter);
    if (isCorrect) return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
    if (isSelected && !isCorrect) return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
    return <span className="w-4 h-4 shrink-0" />;
  };

  const statusBadge = !q.wasAnswered
    ? <Badge variant="outline" className="text-slate-500 border-slate-400"><MinusCircle className="w-3 h-3 mr-1" />Skipped</Badge>
    : q.isCorrect
    ? <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Correct</Badge>
    : <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0"><XCircle className="w-3 h-3 mr-1" />Incorrect</Badge>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      {showNavigator && <NavigatorModal />}

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-800 border-b shadow-sm p-3 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/exam/${sessionId}/results`)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Results
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>{certification}</span>
              <span>·</span>
              <span className="text-green-600 font-medium">{correctCount} correct</span>
              <span>·</span>
              <span className="text-red-600 font-medium">{incorrectCount} incorrect</span>
              {skippedCount > 0 && <><span>·</span><span className="text-slate-500">{skippedCount} skipped</span></>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Q{currentIdx + 1}/{questions.length}
            </span>
            <Button variant="outline" size="sm" onClick={() => setShowNavigator(true)} className="gap-1 text-xs">
              <LayoutGrid className="w-3.5 h-3.5" />
              Navigator
            </Button>
          </div>
        </div>
      </div>

      {/* Score summary bar */}
      <div className="max-w-4xl mx-auto mt-20 mb-4">
        <Card className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 text-sm">
            <span>
              <span className="font-bold text-slate-900 dark:text-white">{score ?? 0}%</span>
              <span className="text-slate-500 ml-1">score</span>
            </span>
            <span>
              <span className="font-bold text-green-600">{correctAnswers ?? 0}</span>
              <span className="text-slate-500 ml-1">/ {totalQuestions} correct</span>
            </span>
            <span>
              {isPassed
                ? <Badge className="bg-green-100 text-green-700 border-0">Passed</Badge>
                : <Badge className="bg-red-100 text-red-700 border-0">Not Passed</Badge>}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const firstIncorrect = questions.findIndex(q => !q.isCorrect && q.wasAnswered);
                if (firstIncorrect >= 0) goTo(firstIncorrect);
              }}
              disabled={incorrectCount === 0}
              className="text-xs"
            >
              Jump to first incorrect
            </Button>
          </div>
        </Card>
      </div>

      {/* Question card */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          {/* Question header */}
          <div className="flex items-start justify-between mb-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Question {currentIdx + 1} of {questions.length}
              {q.topic && <span className="ml-2 text-xs text-blue-500">· {q.topic}</span>}
            </span>
            {statusBadge}
          </div>

          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 whitespace-pre-line leading-relaxed">
            {q.questionText}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {q.options.map((option, idx) => {
              const letter = LETTERS[idx];
              return (
                <div
                  key={idx}
                  className={`flex items-start p-4 border-2 rounded-lg transition-colors ${getOptionStyle(letter)}`}
                >
                  <span className="font-bold text-slate-500 dark:text-slate-400 mr-3 shrink-0 mt-0.5">{letter}.</span>
                  <span className="text-slate-900 dark:text-white flex-1">{option}</span>
                  <div className="ml-3 mt-0.5">{getOptionIcon(letter)}</div>
                </div>
              );
            })}
          </div>

          {/* Your answer summary */}
          {!q.wasAnswered ? (
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 mb-6 text-sm text-slate-600 dark:text-slate-400">
              <MinusCircle className="w-4 h-4 inline mr-2" />
              You skipped this question. The correct answer is <strong className="text-green-600">{correctLetters.join(", ")}</strong>.
            </div>
          ) : !q.isCorrect ? (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6 text-sm">
              <p className="text-red-700 dark:text-red-400">
                <XCircle className="w-4 h-4 inline mr-2" />
                You answered <strong>{userAnsweredLetters.join(", ")}</strong>. The correct answer is <strong className="text-green-600">{correctLetters.join(", ")}</strong>.
              </p>
            </div>
          ) : null}

          {/* Explanation */}
          {q.explanation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-sm uppercase tracking-wide">Explanation</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={goPrev} disabled={currentIdx === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            {currentIdx < questions.length - 1 ? (
              <Button onClick={goNext}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
