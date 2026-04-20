import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { useState } from "react";

export default function PracticeMode() {
  const [, navigate] = useLocation();
  const [selectedCert, setSelectedCert] = useState<"SAA-C03" | "CLF-C02" | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const { data: questions, isLoading, error } = trpc.exam.getPracticeQuestions.useQuery(
    { certification: selectedCert! },
    { enabled: !!selectedCert }
  );

  const handleSelectCert = (cert: "SAA-C03" | "CLF-C02") => {
    setSelectedCert(cert);
    setCurrentQuestionIdx(0);
    setSelectedAnswers([]);
    setShowFeedback(false);
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

  const handleNext = () => {
    if (!questions) return;
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setShowFeedback(false);
      setSelectedAnswers([]);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
      setShowFeedback(false);
      setSelectedAnswers([]);
    }
  };

  // Cert selection screen
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
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Practice SAA-C03 exam questions at your own pace
              </p>
              <Button className="w-full">Start SAA-C03 Practice</Button>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectCert("CLF-C02")}>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">AWS Certified Cloud Practitioner</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Practice CLF-C02 exam questions at your own pace
              </p>
              <Button className="w-full">Start CLF-C02 Practice</Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
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

  // Error state
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

  const currentQuestion = questions[currentQuestionIdx];
  const correctAnswers: string[] = Array.isArray(currentQuestion.correctAnswers)
    ? currentQuestion.correctAnswers.map(String)
    : [];

  // Map index-based correct answers to option strings if needed
  const correctOptionStrings = correctAnswers.map(a => {
    const idx = parseInt(a);
    return !isNaN(idx) && currentQuestion.options[idx] !== undefined
      ? currentQuestion.options[idx]
      : a;
  });

  const isCorrect = showFeedback &&
    selectedAnswers.length === correctOptionStrings.length &&
    selectedAnswers.every(a => correctOptionStrings.includes(a));

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
              const isCorrectOption = correctOptionStrings.includes(option);
              let borderClass = "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800";

              if (showFeedback) {
                if (isCorrectOption) borderClass = "border-green-500 bg-green-50 dark:bg-green-900/30";
                else if (isSelected && !isCorrectOption) borderClass = "border-red-500 bg-red-50 dark:bg-red-900/30";
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
                  <span className="ml-3 text-slate-900 dark:text-white">{option}</span>
                </label>
              );
            })}
          </div>

          {showFeedback && (
            <div className={`p-4 rounded-lg mb-6 ${isCorrect ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700" : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700"}`}>
              <p className={`font-semibold mb-2 ${isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
              </p>
              <div className="text-slate-700 dark:text-slate-300 text-sm">
                <p className="font-semibold mb-1">Explanation:</p>
                <Streamdown>{currentQuestion.explanation || "No explanation available."}</Streamdown>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIdx === 0}>
              Previous
            </Button>

            <div className="flex gap-3">
              {!showFeedback ? (
                <Button
                  onClick={() => setShowFeedback(true)}
                  disabled={selectedAnswers.length === 0}
                >
                  Submit Answer
                </Button>
              ) : currentQuestionIdx === questions.length - 1 ? (
                <Button onClick={() => navigate("/dashboard")}>
                  Finish Practice
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next Question
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
