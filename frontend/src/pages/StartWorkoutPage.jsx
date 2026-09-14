import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Flame,
  Clock,
  Dumbbell,
  Award,
  ArrowRight,
  Sparkles,
  Timer,
  Check,
} from 'lucide-react';
import { workoutAPI, exerciseAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { sound } from '../utils/sound';
import { formatTimer, formatDuration } from '../utils/formatters';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';

const StartWorkoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeWorkout, setActiveWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active workout execution state
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSessionPaused, setIsSessionPaused] = useState(false);

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(45);
  const [restRunning, setRestRunning] = useState(false);
  const [initialRestSetting, setInitialRestSetting] = useState(45);

  // Completion State
  const [isCompleted, setIsCompleted] = useState(false);
  const [savingCompletion, setSavingCompletion] = useState(false);
  const [completedSummary, setCompletedSummary] = useState(null);

  // Fallback workout if none passed in state
  useEffect(() => {
    const initializeWorkout = async () => {
      if (location.state?.workout) {
        setActiveWorkout(JSON.parse(JSON.stringify(location.state.workout)));
        setLoading(false);
      } else {
        // Fetch most recent or default workout
        try {
          const res = await workoutAPI.getAll();
          if (res.data.success && res.data.workouts.length > 0) {
            setActiveWorkout(JSON.parse(JSON.stringify(res.data.workouts[0])));
          } else {
            // Create a default session if user has none
            setActiveWorkout({
              name: 'Upper Body Blast',
              type: 'Strength',
              duration: 40,
              caloriesBurned: 350,
              exercises: [
                {
                  name: 'Push Ups',
                  muscleGroup: 'Chest',
                  sets: [
                    { setNumber: 1, reps: 12, weight: 0, completed: false },
                    { setNumber: 2, reps: 10, weight: 0, completed: false },
                    { setNumber: 3, reps: 8, weight: 0, completed: false },
                  ],
                },
                {
                  name: 'Pull Ups',
                  muscleGroup: 'Back',
                  sets: [
                    { setNumber: 1, reps: 8, weight: 0, completed: false },
                    { setNumber: 2, reps: 6, weight: 0, completed: false },
                    { setNumber: 3, reps: 6, weight: 0, completed: false },
                  ],
                },
              ],
            });
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeWorkout();
  }, [location.state]);

  // Workout Session Elapsed Stopwatch
  useEffect(() => {
    if (loading || isCompleted || isSessionPaused) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, isCompleted, isSessionPaused]);

  // Rest Countdown Timer
  useEffect(() => {
    if (!restRunning) return;
    const interval = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRestRunning(false);
          sound.playTimerDone();
          addToast('Rest timer finished! Next set ready ⚡', 'info');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restRunning]);

  const startRestTimer = (seconds = initialRestSetting) => {
    setRestSeconds(seconds);
    setInitialRestSetting(seconds);
    setRestRunning(true);
  };

  const toggleRestTimer = () => {
    setRestRunning((prev) => !prev);
  };

  const resetRestTimer = (seconds = initialRestSetting) => {
    setRestRunning(false);
    setRestSeconds(seconds);
  };

  // Toggle set completion
  const handleToggleSet = (setIdx) => {
    if (!activeWorkout) return;
    const updated = { ...activeWorkout };
    const currentEx = updated.exercises[currentExIndex];
    const targetSet = currentEx.sets[setIdx];
    
    targetSet.completed = !targetSet.completed;
    setActiveWorkout(updated);

    // If set was just marked completed, auto-trigger rest timer and chime
    if (targetSet.completed) {
      sound.playBeep(440, 0.1);
      startRestTimer(45);
    }
  };

  // Finish and save workout
  const handleFinishWorkout = async () => {
    if (!activeWorkout) return;
    setSavingCompletion(true);

    const minutesSpent = Math.max(1, Math.round(elapsedSeconds / 60));
    // Estimate calories burned: approx 7-9 calories per minute of active strength workout
    const calculatedCalories = Math.round(minutesSpent * 8.5);

    let completedSetsCount = 0;
    let totalSetsCount = 0;
    let completedExCount = 0;

    activeWorkout.exercises?.forEach((ex) => {
      let allSetsDone = true;
      ex.sets?.forEach((s) => {
        totalSetsCount++;
        if (s.completed) completedSetsCount++;
        else allSetsDone = false;
      });
      if (allSetsDone && ex.sets?.length > 0) completedExCount++;
    });

    try {
      if (activeWorkout._id) {
        await workoutAPI.complete(activeWorkout._id, {
          duration: minutesSpent,
          caloriesBurned: calculatedCalories,
          exercises: activeWorkout.exercises,
        });
      } else {
        await workoutAPI.create({
          ...activeWorkout,
          duration: minutesSpent,
          caloriesBurned: calculatedCalories,
          completed: true,
        });
      }

      setCompletedSummary({
        duration: formatDuration(minutesSpent),
        calories: calculatedCalories,
        exercisesCompleted: `${completedExCount} / ${activeWorkout.exercises?.length || 0}`,
        setsCompleted: `${completedSetsCount} / ${totalSetsCount}`,
      });

      setIsCompleted(true);
      sound.playVictory();

      // Launch Confetti Celebration
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#22d3ee', '#f59e0b', '#ec4899'],
        });
      } catch (e) {
        // ignore if canvas confetti unavailable
      }

      addToast('Workout Completed! 🔥 Saved to database.', 'success');
    } catch (err) {
      console.error('Failed to complete workout', err);
      addToast('Failed to sync workout with database', 'error');
    } finally {
      setSavingCompletion(false);
    }
  };

  if (loading) {
    return <Loader message="Setting up live workout session..." />;
  }

  const currentExercise = activeWorkout?.exercises?.[currentExIndex];
  const isFirstExercise = currentExIndex === 0;
  const isLastExercise = currentExIndex === (activeWorkout?.exercises?.length || 1) - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* 1. Header & Stopwatch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
              LIVE WORKOUT
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {activeWorkout?.name || 'Active Session'}
            </h1>
          </div>
        </div>

        {/* Stopwatch & Pause */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 font-mono text-xl sm:text-2xl font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700">
            <Clock className="w-5 h-5 text-emerald-500 animate-pulse" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSessionPaused(!isSessionPaused)}
            title={isSessionPaused ? 'Resume Session' : 'Pause Session'}
          >
            {isSessionPaused ? <Play className="w-4 h-4 text-emerald-500" /> : <Pause className="w-4 h-4" />}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleFinishWorkout}
            isLoading={savingCompletion}
          >
            Finish Workout
          </Button>
        </div>
      </div>

      {/* 2. Main Workout Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Current Exercise & Sets Tracker */}
        <div className="md:col-span-7 space-y-4">
          <Card className="p-6">
            {/* Exercise Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Exercise {currentExIndex + 1} of {activeWorkout?.exercises?.length || 1}
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {currentExercise?.name || 'Push Ups'}
                </h2>
                <span className="text-xs font-medium text-emerald-500">
                  Target: {currentExercise?.muscleGroup || 'Chest'}
                </span>
              </div>

              {/* Prev / Next Exercise Switcher */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentExIndex((prev) => Math.max(0, prev - 1))}
                  disabled={isFirstExercise}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentExIndex((prev) =>
                      Math.min((activeWorkout?.exercises?.length || 1) - 1, prev + 1)
                    )
                  }
                  disabled={isLastExercise}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sets Checklist Table */}
            <div className="py-4 space-y-2.5">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
                <span className="col-span-2">Set</span>
                <span className="col-span-4">Weight</span>
                <span className="col-span-3">Reps</span>
                <span className="col-span-3 text-right">Status</span>
              </div>

              {currentExercise?.sets?.map((set, sIdx) => (
                <div
                  key={sIdx}
                  onClick={() => handleToggleSet(sIdx)}
                  className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl border transition-all cursor-pointer ${
                    set.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-emerald-500/30'
                  }`}
                >
                  <span className="col-span-2 font-mono font-bold text-sm">
                    #{set.setNumber}
                  </span>
                  <span className="col-span-4 text-sm font-semibold">
                    {set.weight > 0 ? `${set.weight} kg` : 'Bodyweight'}
                  </span>
                  <span className="col-span-3 text-sm font-semibold font-mono">
                    {set.reps} reps
                  </span>
                  <div className="col-span-3 flex justify-end">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        set.completed
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : 'border-2 border-slate-300 dark:border-slate-600 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next / Complete action bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentEx = activeWorkout.exercises[currentExIndex];
                  const firstUnfinishedIndex = currentEx.sets?.findIndex((s) => !s.completed);
                  if (firstUnfinishedIndex !== -1) {
                    handleToggleSet(firstUnfinishedIndex);
                  }
                }}
                icon={CheckCircle2}
              >
                Complete Set
              </Button>

              {!isLastExercise ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentExIndex((prev) => prev + 1)}
                  icon={ChevronRight}
                >
                  Next Exercise
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleFinishWorkout}
                  isLoading={savingCompletion}
                >
                  Complete Workout 🎉
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Live Rest Timer Card */}
        <div className="md:col-span-5 space-y-4">
          <Card className="p-6 text-center relative overflow-hidden flex flex-col justify-between h-full">
            {/* Glow accent */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">
                <Timer className="w-4 h-4" /> Interactive Rest Timer
              </div>

              {/* Huge Timer Clock Display */}
              <div className="my-6 relative flex items-center justify-center">
                <div
                  className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center transition-colors ${
                    restRunning
                      ? 'border-cyan-400 shadow-xl shadow-cyan-500/20 bg-cyan-950/20 animate-pulse'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="text-xs uppercase font-bold text-slate-400">REST</span>
                  <span className="text-4xl sm:text-5xl font-mono font-black text-slate-900 dark:text-white mt-1">
                    {formatTimer(restSeconds)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {restRunning ? 'COUNTING DOWN' : 'PAUSED'}
                  </span>
                </div>
              </div>

              {/* Rest Preset Quick Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[30, 45, 60, 90].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => startRestTimer(sec)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      initialRestSetting === sec
                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-cyan-500/40 border border-transparent'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Rest Timer Controls */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant={restRunning ? 'secondary' : 'primary'}
                size="md"
                onClick={toggleRestTimer}
                icon={restRunning ? Pause : Play}
                className="w-32"
              >
                {restRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => resetRestTimer(initialRestSetting)}
                icon={RotateCcw}
                title="Reset timer"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Workout Completion Celebration Overlay */}
      <AnimatePresence>
        {isCompleted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/50 p-8 text-center shadow-2xl shadow-emerald-500/20 relative overflow-hidden"
            >
              {/* Radial glow background */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 mb-6">
                <Flame className="w-10 h-10 fill-current" />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
                Session Accomplished
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1 mb-2">
                Workout Completed! 🔥
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Awesome work! All sets and stats have been synchronized to your persistent database.
              </p>

              {/* Performance Metrics Breakdown */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Duration</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {completedSummary?.duration}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Calories Burned</span>
                  <p className="text-lg font-black text-amber-400 mt-0.5">
                    {completedSummary?.calories} kcal
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Exercises Done</span>
                  <p className="text-lg font-black text-emerald-400 mt-0.5">
                    {completedSummary?.exercisesCompleted}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Sets Completed</span>
                  <p className="text-lg font-black text-cyan-400 mt-0.5">
                    {completedSummary?.setsCompleted}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Return to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  onClick={() => navigate('/history')}
                  variant="outline"
                  size="md"
                  className="w-full"
                >
                  View in History
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StartWorkoutPage;
