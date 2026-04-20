import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";

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
  const [timeLeft, setTimeLeft] = useState(0);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [startingCert, setStartingCert] = useState<"SAA-C03" | "CLF-C02" | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track whether the timer has ever been positive (prevents auto-submit on initial render)
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
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  // Auto-submit when time runs out — only fires if the timer actually counted down
  useEffect(() => {
    if (
      timeLeft === 0 &&
      examStarted &&
      sessionId &&
      timerEverStartedRef.current &&
      !isSubmitting
    ) {
      handleSubmitExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleStartExam = async (cert: "SAA-C03" | "CLF-C02") => {
    if (startingCert !== null) return;

    setStartingCert(cert);
    timerEverStartedRef.current = false;
    try {
      const result = await startExamMutation.mutateAsync({
        certification: cert,
        mode: "exam",
      });

      setSessionId(result.sessionId);
      setQuestions(result.questions);
      setSelectedCert(cert);
      setExamStarted(true);
      setTimeLeft(result.timeLimitMinutes * 60);
      setStartTime(Date.now());
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
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

    // Fire-and-forget: save the answer but don't block navigation
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

  const handleSubmitExam = async () => {
    if (!sessionId || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Await the last question's answer so the score sees it
      const currentQuestion = questions[currentQuestionIdx];
      if (currentQuestion) {
        try {
          await submitAnswerMutation.mutateAsync({
            sessionId,
            questionId: currentQuestion.id,
            userAnswer: selectedAnswers[currentQuestion.id] || [],
          });
        } catch {
          // Non-critical — proceed even if the last answer save fails
        }
      }

      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      await submitExamMutation.mutateAsync({ sessionId, timeTaken });

      // Invalidate progress so the dashboard refreshes
      await utils.progress.invalidate();

      navigate(`/exam/${sessionId}/results`);
    } catch (error) {
      console.error("Failed to submit exam:", error);
      setIsSubmitting(false);
    }
  };

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Select Certification</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">AWS Solutions Architect Associate</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>Exam Code:</strong> SAA-C03
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>Duration:</strong> 130 minutes
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                <strong>Questions:</strong> 65
              </p>
              <Button
                className="w-full"
                disabled={startingCert !== null}
                onClick={() => handleStartExam("SAA-C03")}
              >
                {startingCert === "SAA-C03" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Start SAA-C03 Exam"
                )}
              </Button>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">AWS Certified Cloud Practitioner</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>Exam Code:</strong> CLF-C02
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>Duration:</strong> 90 minutes
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                <strong>Questions:</strong> 65
              </p>
              <Button
                className="w-full"
                disabled={startingCert !== null}
                onClick={() => handleStartExam("CLF-C02")}
              >
                {startingCert === "CLF-C02" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Start CLF-C02 Exam"
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];
  const currentAnswers = selectedAnswers[currentQuestion?.id] || [];
  const timeWarning = timeLeft < 300;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      {/* Timer Bar */}
      <div className={`fixed top-0 left-0 right-0 border-b shadow-sm p-4 z-10 ${timeWarning ? 'bg-red-50 dark:bg-red-900' : 'bg-white dark:bg-slate-800'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {selectedCert} — Question {currentQuestionIdx + 1} of {questions.length}
            </p>
          </div>
          <div className={`text-2xl font-bold ${timeWarning ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        </div>
        {timeWarning && (
          <div className="max-w-7xl mx-auto flex items-center gap-2 mt-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Less than 5 minutes remaining</span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-24">
        {currentQuestion && (
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 whitespace-pre-line leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, idx) => (
                <label
                  key={idx}
                  className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  style={{
                    borderColor: currentAnswers.includes(option) ? "#3b82f6" : "#e2e8f0",
                  }}
                >
                  <input
                    type={currentQuestion.questionType === "single" ? "radio" : "checkbox"}
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={currentAnswers.includes(option)}
                    onChange={() => handleSelectAnswer(option)}
                    className="w-4 h-4 mt-1 shrink-0"
                  />
                  <span className="ml-4 text-slate-900 dark:text-white">{option}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIdx === 0 || isSubmitting}
              >
                Previous
              </Button>

              {currentQuestionIdx === questions.length - 1 ? (
                <Button onClick={handleSubmitExam} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Exam"
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={isNavigating || isSubmitting}>
                  {isNavigating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Next"
                  )}
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
