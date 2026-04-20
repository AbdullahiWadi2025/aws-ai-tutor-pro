import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

export default function ExamResults() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/exam/:sessionId/results");
  const sessionId = params?.sessionId ? parseInt(params.sessionId) : null;
  const [results, setResults] = useState<any>(null);

  const { data: examResults } = trpc.exam.getResults.useQuery(
    { sessionId: sessionId || 0 },
    { enabled: !!sessionId }
  );

  useEffect(() => {
    if (examResults) {
      setResults(examResults);
    }
  }, [examResults]);

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-300">Loading results...</p>
      </div>
    );
  }

  const passPercentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const isPassed = results.isPassed;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          {isPassed ? (
            <>
              <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-green-600 mb-2">Congratulations!</h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">You passed the exam</p>
            </>
          ) : (
            <>
              <XCircle className="w-24 h-24 text-red-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-red-600 mb-2">Exam Not Passed</h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">Keep practicing to improve your score</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">Your Score</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">{passPercentage}%</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">Correct Answers</p>
            <p className="text-4xl font-bold text-green-600">{results.correctAnswers}/{results.totalQuestions}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">Time Taken</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {Math.floor(results.timeTaken / 60)}m {results.timeTaken % 60}s
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">Pass Threshold</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">70%</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate("/exam")}>
            Take Another Exam
          </Button>
          <Button variant="outline" onClick={() => navigate("/practice")}>
            Practice More
          </Button>
        </div>
      </div>
    </div>
  );
}
