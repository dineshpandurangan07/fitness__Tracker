import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  BookOpen,
  LineChart,
  Apple,
  Target,
  History,
  ArrowRight,
  CheckCircle,
  Zap,
  TrendingUp,
  Shield,
  Award,
  PlayCircle,
  Users,
  Sparkles,
  Mail,
} from 'lucide-react';
import Button from '../components/common/Button';
import QuickAuthGateModal from '../components/common/QuickAuthGateModal';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [gateModalOpen, setGateModalOpen] = useState(false);

  // Automatically prompt auth gate modal on arrival if user is not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setGateModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  const features = [
    {
      title: 'Workout Tracking',
      description: 'Log strength sets, reps, weight, and cardio sessions with real-time timers and instant feedback.',
      icon: Dumbbell,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
    },
    {
      title: 'Exercise Library',
      description: 'Explore over 20+ master movements with step-by-step instructions across Chest, Back, Legs, Core and more.',
      icon: BookOpen,
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-400',
    },
    {
      title: 'Progress Monitoring',
      description: 'Visualize your weekly volume, workout frequency, duration, and calories burned with Recharts.',
      icon: LineChart,
      color: 'from-purple-500/20 to-pink-500/10 text-purple-400',
    },
    {
      title: 'Calorie Tracking',
      description: 'Monitor daily nutritional intake, meal distribution, and remaining energy against custom calorie budgets.',
      icon: Apple,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400',
    },
    {
      title: 'Personal Goals',
      description: 'Set milestones for target body weight, workout milestones, and strength lifts with live progress bars.',
      icon: Target,
      color: 'from-rose-500/20 to-red-500/10 text-rose-400',
    },
    {
      title: 'Workout History',
      description: 'Review your complete training ledger, past personal records, and date-filtered activity summaries.',
      icon: History,
      color: 'from-cyan-500/20 to-emerald-500/10 text-cyan-400',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Your Profile',
      description: 'Input your height, weight, and fitness ambition. We automatically compute your baseline BMI and recommended targets.',
    },
    {
      step: '02',
      title: 'Set Your Fitness Goals',
      description: 'Define target weight benchmarks, weekly workout frequency, or strength milestones to keep yourself accountable.',
    },
    {
      step: '03',
      title: 'Track Your Workouts',
      description: 'Launch the live interactive workout screen with built-in rest timers, set logs, and automatic volume calculations.',
    },
    {
      step: '04',
      title: 'Monitor Your Progress',
      description: 'Watch your streaks rise, body weight shift, and caloric balance align through real-time charts powered by MongoDB.',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none blur-3xl -z-10" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 text-center lg:text-left space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" /> Next-Gen Fitness Architecture
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Track Your Workouts.{' '}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Build Your Stronger Self.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Plan workouts, monitor your progress, track calories and achieve your fitness goals with our seamless full-stack training companion.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => setGateModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all text-sm group"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGateModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all text-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Fast Login with Mail ID</span>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* Highlights badge row */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">24+</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Library Exercises</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-500">100%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Real-Time Data</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-cyan-500">Live</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Interactive Timer</div>
                </div>
              </div>
            </motion.div>

            {/* Right Fitness Dashboard Illustration / Preview Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative border glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 opacity-30 blur-xl" />

                <div className="relative rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
                  {/* Mock Card Top Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        FP
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Daily Workout Engine</h4>
                        <p className="text-xs text-slate-400">Push Day • Upper Body</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      IN PROGRESS
                    </span>
                  </div>

                  {/* Mock Active Sets */}
                  <div className="py-4 space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-sm font-semibold text-white">Bench Press</p>
                          <p className="text-xs text-slate-400">Set 1: 80 kg × 8 reps</p>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold">Done</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-emerald-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-400 flex items-center justify-center animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Incline Dumbbell Press</p>
                          <p className="text-xs text-slate-400">Set 2: 30 kg × 10 reps</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                        REST 00:45
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 opacity-60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                        <div>
                          <p className="text-sm font-semibold text-slate-300">Tricep Pushdowns</p>
                          <p className="text-xs text-slate-500">4 sets remaining</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">Pending</span>
                    </div>
                  </div>

                  {/* Mock Summary Metrics Footer */}
                  <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-800/50 p-2 rounded-xl">
                      <p className="text-xs text-slate-400">Calories</p>
                      <p className="text-sm font-bold text-white">410 kcal</p>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded-xl">
                      <p className="text-xs text-slate-400">Duration</p>
                      <p className="text-sm font-bold text-emerald-400">42m 15s</p>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded-xl">
                      <p className="text-xs text-slate-400">Streak</p>
                      <p className="text-sm font-bold text-amber-400">🔥 7 Days</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="py-20 bg-white dark:bg-[#0f172a]/60 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500">
              Complete Feature Suite
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Everything You Need To Shatter Plateaus
            </p>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Designed specifically for fitness enthusiasts, weightlifters, and runners looking for clean, distraction-free performance tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500">
              Simple 4-Step Process
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              How FitPulse Fuels Your Results
            </p>
            <p className="text-base text-slate-600 dark:text-slate-400">
              No complicated spreadsheets or clunky notebooks. Start hitting PRs in four streamlined steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col"
              >
                <span className="text-3xl font-black text-emerald-500/40 mb-4 font-mono">
                  {item.step}
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-700 p-8 sm:p-14 text-white text-center shadow-2xl shadow-emerald-500/20">
            {/* Ambient Background Graphic */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Ready to Start Your Fitness Journey?
              </h2>
              <p className="text-emerald-100 text-base sm:text-lg leading-relaxed">
                Join thousands of athletes building discipline, logging workouts, and crushing personal records every single day.
              </p>
              <div className="pt-2">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-white text-emerald-700 hover:bg-slate-100 font-bold shadow-xl"
                  >
                    Start Tracking <ArrowRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Website Quick Google & Mail ID Auth Gate Modal */}
      <QuickAuthGateModal
        isOpen={gateModalOpen}
        onClose={() => setGateModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LandingPage;
