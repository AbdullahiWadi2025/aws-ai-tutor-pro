import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BookOpen, Zap, Brain, BarChart3, LogOut, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { StudyRecommendations } from "@/components/StudyRecommendations";
import { AchievementsCard } from "@/components/AchievementsCard";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: examHistory } = trpc.progress.getExamHistory.useQuery({});

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Calculate stats
  const totalExams = examHistory?.length || 0;
  const passedExams = examHistory?.filter(e => e.isPassed).length || 0;
  const avgScore = examHistory?.length 
    ? Math.round(examHistory.reduce((sum, e) => sum + (parseFloat(e.score as any) || 0), 0) / examHistory.length)
    : 0;

  // Prepare chart data
  const chartData = examHistory?.slice(-10).map((exam, idx) => ({
    name: `Exam ${idx + 1}`,
    score: parseFloat(exam.score as any) || 0,
    passed: exam.isPassed ? 1 : 0,
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <nav className="border-b bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/logo-option3-Z8cRg8oEDzdqTunyE28t32.webp" alt="AWS AI Tutor Pro" className="w-9 h-9 rounded-lg" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AWS AI Tutor Pro</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 dark:text-slate-300">{user?.name || user?.email}</span>
            {user?.role === 'admin' && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Total Exams</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalExams}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Passed</p>
                <p className="text-3xl font-bold text-green-600">{passedExams}</p>
              </div>
              <Zap className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Average Score</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{avgScore}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Pass Rate</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0}%
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Score Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Score (%)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pass/Fail Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Passed", value: passedExams },
                    { name: "Failed", value: totalExams - passedExams },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Exam History */}
        {examHistory && examHistory.length > 0 && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Exams</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500 dark:text-slate-400">
                    <th className="pb-2 font-medium">Certification</th>
                    <th className="pb-2 font-medium">Score</th>
                    <th className="pb-2 font-medium">Result</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {examHistory.slice(0, 5).map((exam) => (
                    <tr key={exam.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 font-medium text-slate-900 dark:text-white">{exam.certification}</td>
                      <td className="py-3 text-slate-700 dark:text-slate-300">{parseFloat(exam.score as any) || 0}%</td>
                      <td className="py-3">
                        {exam.isPassed
                          ? <span className="text-green-600 font-medium">Passed</span>
                          : <span className="text-red-500 font-medium">Not Passed</span>}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        {new Date(exam.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/exam/${exam.id}/review`)}
                          className="text-blue-600 hover:text-blue-700 text-xs"
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/exam")}>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Take Exam</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
              Take a full-length timed exam with 65 questions
            </p>
            <Button className="w-full">Start Exam</Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/practice")}>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Practice</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
              Practice at your own pace with instant feedback
            </p>
            <Button className="w-full">Start Practicing</Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/ai-tutor")}>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Tutor</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
              Ask questions and get expert explanations
            </p>
            <Button className="w-full">Chat with AI</Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200 dark:border-orange-800" onClick={() => navigate("/game")}>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                <span className="text-2xl">☁️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AWS Training Arena</h3>
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">5 Game Modes</span>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
              Match It (31 levels), Escape Room, Troubleshoot, Scenario Quiz &amp; RPG Campaign
            </p>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Enter Arena 🎮</Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 dark:border-blue-800" onClick={() => navigate("/learn")}>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Learning Center</h3>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">11 Categories · 50+ Services</span>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
              Deep-dive reference cards for every AWS service — from Cloud Foundations to ML/AI, with exam tips.
            </p>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Open Learning Center 📖</Button>
          </Card>
        </div>

        {/* Gamification & Recommendations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <StudyRecommendations certification="SAA-C03" hasHistory={totalExams > 0} />
          </div>
          <div>
            <AchievementsCard />
          </div>
        </div>
      </main>
    </div>
  );
}
