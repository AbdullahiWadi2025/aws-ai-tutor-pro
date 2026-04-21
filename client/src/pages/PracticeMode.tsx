import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle, XCircle, BarChart2, Loader2, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { useState, useMemo } from "react";

const LETTERS = ["A", "B", "C", "D"];

// Topics per certification
const CERT_TOPICS: Record<string, string[]> = {
  "CLF-C02": [
    "Cloud Concepts",
    "AWS Services",
    "Security",
    "Billing and Pricing",
    "Shared Responsibility Model",
  ],
  "SAA-C03": [
    "Compute",
    "Storage",
    "Networking",
    "Databases",
    "Security",
    "Architecture",
    "Cost Optimization",
    "Monitoring",
  ],
};

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
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null); // null = all topics
  const [topicChosen, setTopicChosen] = useState(false); // whether topic step was completed
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // option text
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const { data: allQuestions, isLoading, error } = trpc.exam.getPracticeQuestions.useQuery(
    { certification: selectedCert! },
    { enabled: !!selectedCert && topicChosen }
  );

  // Filter by topic if one is selected
  const questions = useMemo(() => {
    if (!allQuestions) return undefined;
    if (!selectedTopic) return allQuestions;
    return allQuestions.filter(q => q.topic === selectedTopic);
  }, [allQuestions, selectedTopic]);

  const handleSelectCert = (cert: "SAA-C03" | "CLF-C02") => {
    setSelectedCert(cert);
    setSelectedTopic(null);
    setTopicChosen(false);
    setCurrentQuestionIdx(0);
    setSelectedAnswers([]);
    setShowFeedback(false);
    setResults([]);
    setShowSummary(false);
  };

  const handleSelectTopic = (topic: string | null) => {
    setSelectedTopic(topic);
    setTopicChosen(true);
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

    const correctLetters: string[] = Array.isArray(currentQuestion.correctAnswers)
      ? currentQuestion.correctAnswers.map(String)
      : [];

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
            Practice at your own pace with immediate feedback and detailed explanations for every question. Choose a certification to get started.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectCert("SAA-C03")}>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AWS Solutions Architect Associate</h3>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-3">SAA-C03</p>
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">Practice all topics or drill a specific domain</p>
              <Button className="w-full">Select SAA-C03</Button>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectCert("CLF-C02")}>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AWS Certified Cloud Practitioner</h3>
              <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-3">CLF-C02 · Beginner Friendly</p>
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">Practice all topics or drill a specific domain</p>
              <Button className="w-full">Select CLF-C02</Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── Topic selection screen ─────────────────────────────────────────────────
  if (selectedCert && !topicChosen) {
    const topics = CERT_TOPICS[selectedCert] || [];
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => setSelectedCert(null)} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Certification
          </Button>
          <div className="mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">{selectedCert}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Choose a Topic</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Practice a specific domain to target your weak areas, or practice all topics together.
          </p>

          {/* Practice all */}
          <Card
            className="p-5 mb-4 hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30"
            onClick={() => handleSelectTopic(null)}
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">All Topics</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Practice questions from all domains in random order</p>
              </div>
              <Button size="sm" className="ml-auto">Start</Button>
            </div>
          </Card>

          {/* Individual topics */}
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3 mt-6">Or pick a specific topic</p>
          <div className="grid grid-cols-1 gap-3">
            {topics.map(topic => (
              <Card
                key={topic}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
                onClick={() => handleSelectTopic(topic)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900 dark:text-white">{topic}</span>
                  <Button variant="outline" size="sm">Practice</Button>
                </div>
              </Card>
            ))}
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

  // ── Error / no questions ───────────────────────────────────────────────────
  if (error || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <p className="text-red-500 text-lg mb-4">
            {error ? "Failed to load questions. Please try again." : `No questions available for ${selectedTopic || "this certification"} yet.`}
          </p>
          <Button onClick={() => setTopicChosen(false)}>Go Back</Button>
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
            <p className="text-slate-500 dark:text-slate-400">
              {selectedCert}{selectedTopic ? ` · ${selectedTopic}` : " · All Topics"}
            </p>
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
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-red-500">{count} wrong</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSelectTopic(topic)}
                      >
                        Drill this topic
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => setTopicChosen(false)}>
              Change Topic
            </Button>
            <Button variant="outline" onClick={() => handleSelectTopic(selectedTopic)}>
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

  const correctLetters: string[] = Array.isArray(currentQuestion.correctAnswers)
    ? currentQuestion.correctAnswers.map(String)
    : [];
  const correctOptionTexts = correctLetters.map(letter => {
    const idx = LETTERS.indexOf(letter);
    return idx >= 0 && currentQuestion.options[idx] !== undefined
      ? currentQuestion.options[idx]
      : letter;
  });

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
          <Button variant="ghost" onClick={() => setTopicChosen(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Topic
          </Button>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {selectedCert}{selectedTopic ? ` · ${selectedTopic}` : ""} — Q {currentQuestionIdx + 1} of {questions.length}
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
