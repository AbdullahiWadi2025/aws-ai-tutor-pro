import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ExamMode from "./pages/ExamMode";
import PracticeMode from "./pages/PracticeMode";
import ExamResults from "./pages/ExamResults";
import ExamReview from "./pages/ExamReview";
import AITutor from "./pages/AITutor";
import Progress from "./pages/Progress";
import AdminDashboard from "./pages/AdminDashboard";
import Pricing from "./pages/Pricing";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import BetaAdmin from "./pages/BetaAdmin";
import AwsGame from "./pages/AwsGame";
import LearningCenter from "./pages/LearningCenter";
import StudyPlan from "./pages/StudyPlan";
import ProjectLab from "./pages/ProjectLab";
import DiagramBuilder from "./pages/DiagramBuilder";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { FeedbackWidget } from "./components/FeedbackWidget";
import { TrialBanner } from "./components/TrialBanner";

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && <TrialBanner />}
      <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/exam" component={ExamMode} />
          <Route path="/practice" component={PracticeMode} />
          <Route path="/exam/:sessionId/results" component={ExamResults} />
          <Route path="/exam/:sessionId/review" component={ExamReview} />
          <Route path="/ai-tutor" component={AITutor} />
          <Route path="/progress" component={Progress} />
          <Route path="/subscription" component={SubscriptionManagement} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/beta" component={BetaAdmin} />
          <Route path="/game" component={AwsGame} />
          <Route path="/learn" component={LearningCenter} />
          <Route path="/study-plan" component={StudyPlan} />
          <Route path="/project-lab" component={ProjectLab} />
          <Route path="/diagram-builder" component={DiagramBuilder} />
        </>
      )}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    {isAuthenticated && <FeedbackWidget />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
