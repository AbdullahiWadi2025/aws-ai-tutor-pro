import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ExamResults() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/exam/:sessionId/results");
  const sessionId = params?.sessionId ? parseInt(params.sessionId) : null;

  const { data: results, isLoading, error } = trpc.exam.getResults.useQuery(
    { sessionId: sessionId || 0 },
    { enabled: !!sessionId, retry: 1 }
  );

  if (!match || !sessionId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Invalid Session</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">No exam session was specified.</p>
          <Button onClick={() => navigate("/exam")}>Take an Exam</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-300">Loading results...</p>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Results Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            We couldn't load the results for this exam session. It may have been deleted or the submission did not complete.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => navigate("/exam")}>Take Another Exam</Button>
          </div>
        </div>
      </div>
    );
  }

  const passPercentage = Math.round(((results.correctAnswers ?? 0) / Math.max(results.totalQuestions ?? 1, 1)) * 100);
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
              {Math.floor((results.timeTaken ?? 0) / 60)}m {(results.timeTaken ?? 0) % 60}s
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
