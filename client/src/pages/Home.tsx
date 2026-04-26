import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { BookOpen, Brain, BarChart3, Zap } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user]);

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-blue-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/logo-option3-Z8cRg8oEDzdqTunyE28t32.webp" alt="AWS AI Tutor Pro" className="w-10 h-10 rounded-lg" />
            <span className="text-xl font-bold text-white">AWS AI Tutor Pro</span>
          </div>
          <a href={getLoginUrl()}>
            <Button variant="outline" className="border-blue-400 text-blue-300 hover:bg-blue-900/50">
              Sign In
            </Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
                  Master AWS Certifications with AI
                </h1>
                <p className="text-xl text-blue-200">
                  Prepare for SAA-C03 and CLF-C02 exams with realistic practice tests, AI-powered tutoring, and comprehensive analytics.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href={getLoginUrl()}>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg px-8 py-6 h-auto rounded-lg">
                    Start Learning Now
                  </Button>
                </a>
                <Button variant="outline" className="border-blue-400 text-blue-300 hover:bg-blue-900/50 text-lg px-8 py-6 h-auto rounded-lg">
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-400">500+</div>
                  <div className="text-sm text-blue-200">Real Questions</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-400">2</div>
                  <div className="text-sm text-blue-200">Certifications</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-400">AI</div>
                  <div className="text-sm text-blue-200">Powered</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl"></div>
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/hero-aws-tech-mnHhXsjbnshtTcx3caNqoQ.webp"
                alt="AWS Certification Study Platform"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Comprehensive Study Platform</h2>
            <p className="text-xl text-blue-200">Everything you need to ace your AWS certification</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Exam Mode */}
            <div className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-blue-400/20 rounded-xl p-6 hover:border-blue-400/50 transition-all">
              <div className="mb-4">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/exam-mode-hero-YcWhHhJ7qcd9mW5iALpD3f.webp"
                  alt="Exam Mode"
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              </div>
              <Zap className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Exam Mode</h3>
              <p className="text-blue-200">Take realistic timed exams with 65 questions and instant scoring</p>
            </div>

            {/* Practice Mode */}
            <div className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-blue-400/20 rounded-xl p-6 hover:border-blue-400/50 transition-all">
              <div className="mb-4">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/practice-mode-hero-CzfCCaUsT2jSRCiaByvyKu.webp"
                  alt="Practice Mode"
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              </div>
              <BookOpen className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Practice Mode</h3>
              <p className="text-blue-200">Learn at your own pace with immediate feedback and explanations</p>
            </div>

            {/* AI Tutor */}
            <div className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-blue-400/20 rounded-xl p-6 hover:border-blue-400/50 transition-all">
              <div className="mb-4">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/ai-tutor-hero-LTd8ytWpCjguRsCnop4ySx.webp"
                  alt="AI Tutor"
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              </div>
              <Brain className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">AI Tutor</h3>
              <p className="text-blue-200">Ask questions and get expert explanations powered by AI</p>
            </div>

            {/* Progress Tracking */}
            <div className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-blue-400/20 rounded-xl p-6 hover:border-blue-400/50 transition-all">
              <div className="mb-4">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663570210779/nNerxvzoKEAhA9FPZGf5rg/progress-analytics-hero-kyapwmqxGMxo8b2eq4pxCF.webp"
                  alt="Progress Analytics"
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Progress Analytics</h3>
              <p className="text-blue-200">Track performance with detailed analytics and topic breakdowns</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Pass Your AWS Exam?</h2>
          <p className="text-xl text-blue-200 mb-8">
            Join thousands of students preparing for AWS certifications with our comprehensive study platform.
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg px-8 py-6 h-auto rounded-lg">
              Get Started Free
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-800/30 bg-slate-900/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-blue-300 space-y-3">
          <p>&copy; 2026 AWS AI Tutor Pro. All rights reserved.</p>
          <p className="text-sm text-blue-400">
            Built by Abdullahi Wadi &mdash;{" "}
            <a
              href="mailto:abdulahiyerow@gmail.com"
              className="underline hover:text-white transition-colors"
            >
              abdulahiyerow@gmail.com
            </a>
            {" "}&middot;{" "}
            <a
              href="https://www.linkedin.com/in/abdullahi-wadi"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
