import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle, XCircle, BarChart2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { useState } from "react";

const LETTERS = ["A", "B", "C", "D"];

interface PracticeResult {
  questionId: number;
  questionText: string;
  options: string[];
  correctAnswers: string[]; // letters e.g. ["C"]
  userAnswers: string[];    // letters e.g. ["A"]
  isCorrect: boolean;
  explanation: string;
  topic: string;
}

export default function PracticeMode() {
  const [, navigate] = useLocation();
  const [selectedCert, setSelectedCert] = useState<"SAA-C03" | "CLF-C02" | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // option text
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const { data: questions, isLoading, error } = trpc.exam.getPracticeQuestions.useQuery(
    { certification: selectedCert! },
    { enabled: !!selectedCert }
  );

  const handleSelectCert = (cert: "SAA-C03" | "CLF-C02") => {
    setSelectedCert(cert);
    setCurrentQuestionIdx(0);
    setSelectedAnswers([]);
    setShowFeedback(false);
    setResults([]);
    setShowSummary(false);
  };

  const handleSelectAnswer = (option: string) => {
    if (showFeedback) return;
    const currentQuestion = questions?.[currentQuestionIdx];
    if (!currentQuestion) return;

    if (currentQuestion.questionType === "single") {
      setSelectedAnswers([option]);
    } else {
      setSelectedAnswers(prev =>
        prev.includes(option) ? prev.filter(a => a !== option) : [...prev, option]
      );
    }
  };

  const handleSubmitAnswer = () => {
    if (!questions) return;
    const currentQuestion = questions[currentQuestionIdx];

    // correctAnswers are letters like ["C"]; convert to option text for comparison
    const correctLetters: string[] = Array.isArray(currentQuestion.correctAnswers)
      ? currentQuestion.correctAnswers.map(String)
      : [];

    // Convert selected option text to letters
    const userLetters = selectedAnswers.map(ans => {
      const idx = currentQuestion.options.findIndex(opt => opt === ans);
      return idx >= 0 ? LETTERS[idx] : ans;
    });

    const isCorrect =
      userLetters.length === correctLetters.length &&
      userLetters.every(l => correctLetters.includes(l));

    setResults(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        questionText: currentQuestion.questionText,
        options: currentQuestion.options,
        correctAnswers: correctLetters,
        userAnswers: userLetters,
        isCorrect,
        explanation: currentQuestion.explanation || "",
        topic: currentQuestion.topic || "",
      },
    ]);

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (!questions) return;
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setShowFeedback(false);
      setSelectedAnswers([]);
    } else {
      setShowSummary(true);
    }
  };

  // ── Cert selection screen ──────────────────────────────────────────────────
  if (!selectedCert) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Practice Mode</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Practice at your own pace with immediate feedback and detailed explanations for every question.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectCert("SAA-C03")}>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">AWS Solutions Architect Associate</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">Practice SAA-C03 exam questions at your own pace</p>
              <Button className="w-full">Start SAA-C03 Practice</Button>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectCert("CLF-C02")}>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">AWS Certified Cloud Practitioner</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">Practice CLF-C02 exam questions at your own pace</p>
              <Button className="w-full">Start CLF-C02 Practice</Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <p className="text-red-500 text-lg mb-4">
            {error ? "Failed to load questions. Please try again." : "No questions available for this certification yet."}
          </p>
          <Button onClick={() => setSelectedCert(null)}>Go Back</Button>
        </div>
      </div>
    );
  }

  // ── Summary screen ─────────────────────────────────────────────────────────
  if (showSummary) {
    const correctCount = results.filter(r => r.isCorrect).length;
    const total = results.length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = pct >= 70;

    // Group wrong answers by topic
    const wrongByTopic: Record<string, number> = {};
    results.filter(r => !r.isCorrect).forEach(r => {
      wrongByTopic[r.topic] = (wrongByTopic[r.topic] || 0) + 1;
    });
    const weakTopics = Object.entries(wrongByTopic).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${passed ? "bg-green-100 dark:bg-green-900/40" : "bg-red-100 dark:bg-red-900/40"}`}>
              {passed
                ? <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                : <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Practice Session Complete
            </h1>
            <p className="text-slate-500 dark:text-slate-400">{selectedCert}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="p-6 text-center">
              <p className="text-4xl font-bold text-slate-900 dark:text-white">{pct}%</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Score</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">{correctCount}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Correct</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-4xl font-bold text-red-500 dark:text-red-400">{total - correctCount}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Incorrect</p>
            </Card>
          </div>

          {weakTopics.length > 0 && (
            <Card className="p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Topics to Review</h2>
              </div>
              <div className="space-y-2">
                {weakTopics.map(([topic, count]) => (
                  <div key={topic} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-slate-700 dark:text-slate-300">{topic}</span>
                    <span className="text-sm font-medium text-red-500">{count} wrong</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => handleSelectCert(selectedCert)}>
              Practice Again
            </Button>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Question screen ────────────────────────────────────────────────────────
  const currentQuestion = questions[currentQuestionIdx];

  // correctAnswers are letters like ["C"] — map to option text for display
  const correctLetters: string[] = Array.isArray(currentQuestion.correctAnswers)
    ? currentQuestion.correctAnswers.map(String)
    : [];
  const correctOptionTexts = correctLetters.map(letter => {
    const idx = LETTERS.indexOf(letter);
    return idx >= 0 && currentQuestion.options[idx] !== undefined
      ? currentQuestion.options[idx]
      : letter;
  });

  // Determine if the current selection is correct (for feedback banner)
  const userLetters = selectedAnswers.map(ans => {
    const idx = currentQuestion.options.findIndex(opt => opt === ans);
    return idx >= 0 ? LETTERS[idx] : ans;
  });
  const isCurrentCorrect = showFeedback &&
    userLetters.length === correctLetters.length &&
    userLetters.every(l => correctLetters.includes(l));

  const isLastQuestion = currentQuestionIdx === questions.length - 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setSelectedCert(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Certification
          </Button>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {selectedCert} — Question {currentQuestionIdx + 1} of {questions.length}
          </span>
        </div>

        <Card className="p-8">
          <div className="mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">{currentQuestion.topic}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            {currentQuestion.questionText}
          </h2>

          {currentQuestion.questionType === "multiple" && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-4 font-medium">
              Select all that apply
            </p>
          )}

          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswers.includes(option);
              const isCorrectOption = correctOptionTexts.includes(option);
              let borderClass = "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800";

              if (showFeedback) {
                if (isCorrectOption) {
                  borderClass = "border-green-500 bg-green-50 dark:bg-green-900/30";
                } else if (isSelected && !isCorrectOption) {
                  borderClass = "border-red-500 bg-red-50 dark:bg-red-900/30";
                }
              } else if (isSelected) {
                borderClass = "border-blue-500 bg-blue-50 dark:bg-blue-900/30";
              }

              return (
                <label
                  key={idx}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${borderClass}`}
                >
                  <input
                    type={currentQuestion.questionType === "single" ? "radio" : "checkbox"}
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleSelectAnswer(option)}
                    disabled={showFeedback}
                    className="w-4 h-4 mt-0.5 shrink-0"
                  />
                  <span className="ml-3 text-slate-900 dark:text-white">
                    <span className="font-semibold mr-2">{LETTERS[idx]}.</span>
                    {option}
                  </span>
                </label>
              );
            })}
          </div>

          {showFeedback && (
            <div className={`p-4 rounded-lg mb-6 ${isCurrentCorrect
              ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700"
              : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700"
            }`}>
              <p className={`font-semibold mb-2 ${isCurrentCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                {isCurrentCorrect ? "✓ Correct!" : `✗ Incorrect — Correct answer: ${correctLetters.join(", ")}`}
              </p>
              <div className="text-slate-700 dark:text-slate-300 text-sm">
                <p className="font-semibold mb-1">Explanation:</p>
                <Streamdown>{currentQuestion.explanation || "No explanation available."}</Streamdown>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentQuestionIdx(prev => prev - 1);
                setShowFeedback(false);
                setSelectedAnswers([]);
              }}
              disabled={currentQuestionIdx === 0}
            >
              Previous
            </Button>

            <div className="flex gap-3">
              {!showFeedback ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswers.length === 0}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {isLastQuestion ? "View Results" : "Next Question"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
