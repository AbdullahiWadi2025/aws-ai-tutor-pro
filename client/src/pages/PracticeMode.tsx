import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

interface PracticeQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctAnswers: string[];
  explanation: string;
  questionType: "single" | "multiple";
}

export default function PracticeMode() {
  const [, navigate] = useLocation();
  const [selectedCert, setSelectedCert] = useState<"SAA-C03" | "CLF-C02" | null>(null);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);

  const handleStartPractice = async (cert: "SAA-C03" | "CLF-C02") => {
    setSelectedCert(cert);
    setPracticeStarted(true);
    // In a real implementation, fetch questions from backend
    // For now, we'll use placeholder logic
  };

  const handleSelectAnswer = (option: string) => {
    if (showFeedback) return; // Don't allow changes after submission

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

  const handleSubmitAnswer = () => {
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setShowFeedback(false);
      setSelectedAnswers({});
    }
  };

  if (!practiceStarted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Practice Mode</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Practice at your own pace with immediate feedback and detailed explanations for every question.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">AWS Solutions Architect Associate</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Practice SAA-C03 exam questions at your own pace
              </p>
              <Button 
                className="w-full"
                onClick={() => handleStartPractice("SAA-C03")}
              >
                Start SAA-C03 Practice
              </Button>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">AWS Certified Cloud Practitioner</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Practice CLF-C02 exam questions at your own pace
              </p>
              <Button 
                className="w-full"
                onClick={() => handleStartPractice("CLF-C02")}
              >
                Start CLF-C02 Practice
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];
  const currentAnswers = selectedAnswers[currentQuestion?.id] || [];
  const isCorrect = currentQuestion && 
    JSON.stringify(currentAnswers.sort()) === JSON.stringify(currentQuestion.correctAnswers.sort());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {currentQuestion ? (
          <Card className="p-8">
            <div className="mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">Question {currentQuestionIdx + 1} of {questions.length}</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {currentQuestion.questionText}
              </h2>
            </div>

            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    showFeedback
                      ? currentQuestion.correctAnswers.includes(option)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900'
                        : currentAnswers.includes(option) && !isCorrect
                        ? 'border-red-500 bg-red-50 dark:bg-red-900'
                        : 'border-slate-200 dark:border-slate-700'
                      : currentAnswers.includes(option)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type={currentQuestion.questionType === "single" ? "radio" : "checkbox"}
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={currentAnswers.includes(option)}
                    onChange={() => handleSelectAnswer(option)}
                    disabled={showFeedback}
                    className="w-4 h-4"
                  />
                  <span className="ml-4 text-slate-900 dark:text-white">{option}</span>
                </label>
              ))}
            </div>

            {showFeedback && (
              <div className={`p-4 rounded-lg mb-8 ${isCorrect ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'}`}>
                <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                </p>
                <div className="text-slate-700 dark:text-slate-300">
                  <p className="font-semibold mb-2">Explanation:</p>
                  <Streamdown>{currentQuestion.explanation}</Streamdown>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
                disabled={currentQuestionIdx === 0}
              >
                Previous
              </Button>

              {!showFeedback ? (
                <Button onClick={handleSubmitAnswer}>
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
          </Card>
        ) : (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-600 dark:text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">Loading questions...</p>
          </div>
        )}
      </div>
    </div>
  );
}
