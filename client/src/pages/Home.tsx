import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { BookOpen, Brain, BarChart3, Zap } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <nav className="border-b bg-white dark:bg-slate-900 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AWS AI Tutor Pro</h1>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button onClick={() => navigate("/progress")}>
                Progress
              </Button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Master AWS Certifications
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Prepare for SAA-C03 and CLF-C02 with AI-powered learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Exam Mode Card */}
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/exam")}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Mode</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Take a full-length timed exam with 65 questions. Get realistic exam experience with instant scoring and detailed feedback.
              </p>
              <Button className="w-full">Start Exam</Button>
            </Card>

            {/* Practice Mode Card */}
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/practice")}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Practice Mode</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Learn at your own pace. Get immediate feedback and detailed explanations for every question.
              </p>
              <Button className="w-full">Start Practicing</Button>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Tutor Card */}
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/ai-tutor")}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">AI Tutor</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Ask questions and get expert explanations. Understand AWS concepts deeply with AI-powered guidance.
              </p>
              <Button className="w-full">Chat with AI</Button>
            </Card>

            {/* Progress Card */}
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/progress")}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Your Progress</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Track your performance across topics. See your strengths and areas for improvement.
              </p>
              <Button className="w-full">View Analytics</Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-8">
          <Brain className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">AWS AI Tutor Pro</h1>
        <p className="text-xl text-blue-100 mb-8">
          Master AWS certifications with AI-powered learning, realistic exam simulations, and personalized progress tracking.
        </p>
        <div className="space-y-4">
          <p className="text-blue-100">Prepare for:</p>
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg text-white font-semibold">
              SAA-C03
            </div>
            <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg text-white font-semibold">
              CLF-C02
            </div>
          </div>
        </div>
        <Button
          size="lg"
          className="bg-white text-blue-600 hover:bg-blue-50"
          onClick={() => window.location.href = getLoginUrl()}
        >
          Sign In to Get Started
        </Button>
      </div>
    </div>
  );
}
