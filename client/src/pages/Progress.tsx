import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, Target, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Progress() {
  const [, navigate] = useLocation();

  const { data: saaHistory } = trpc.progress.getExamHistory.useQuery({ certification: "SAA-C03" });
  const { data: clfHistory } = trpc.progress.getExamHistory.useQuery({ certification: "CLF-C02" });

  const calculateStats = (history: any[] | undefined) => {
    if (!history || history.length === 0) {
      return { total: 0, passed: 0, avgScore: 0, passRate: 0 };
    }

    const passed = history.filter(e => e.isPassed).length;
    const avgScore = Math.round(
      history.reduce((sum, e) => sum + (parseFloat(e.score as any) || 0), 0) / history.length
    );

    return {
      total: history.length,
      passed,
      avgScore,
      passRate: Math.round((passed / history.length) * 100),
    };
  };

  const saaStats = calculateStats(saaHistory);
  const clfStats = calculateStats(clfHistory);

  const saaChartData = saaHistory?.slice(-10).map((exam, idx) => ({
    name: `Exam ${idx + 1}`,
    score: parseFloat(exam.score as any) || 0,
  })) || [];

  const clfChartData = clfHistory?.slice(-10).map((exam, idx) => ({
    name: `Exam ${idx + 1}`,
    score: parseFloat(exam.score as any) || 0,
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b shadow-sm p-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Progress</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-8">
        {/* SAA-C03 Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">SAA-C03 Progress</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Total Exams</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{saaStats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Passed</p>
                  <p className="text-3xl font-bold text-green-600">{saaStats.passed}</p>
                </div>
                <Target className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Average Score</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{saaStats.avgScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600 opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Pass Rate</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{saaStats.passRate}%</p>
                </div>
                <div className="w-8 h-8 text-purple-600 opacity-50 flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
              </div>
            </Card>
          </div>

          {saaChartData.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Score Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={saaChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Score (%)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* CLF-C02 Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">CLF-C02 Progress</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Total Exams</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{clfStats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Passed</p>
                  <p className="text-3xl font-bold text-green-600">{clfStats.passed}</p>
                </div>
                <Target className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Average Score</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{clfStats.avgScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600 opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Pass Rate</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{clfStats.passRate}%</p>
                </div>
                <div className="w-8 h-8 text-purple-600 opacity-50 flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
              </div>
            </Card>
          </div>

          {clfChartData.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Score Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={clfChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#10b981" name="Score (%)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
