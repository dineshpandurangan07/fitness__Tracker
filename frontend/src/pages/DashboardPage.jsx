import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  Flame,
  Scale,
  Calendar,
  Zap,
  PlayCircle,
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Target,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { statsAPI, weightAPI } from '../services/api';
import { getGreeting, formatDateWithDay, formatDate, formatDuration } from '../utils/formatters';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const DashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Quick action modal for weight
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [quickWeight, setQuickWeight] = useState(user?.weight || '');
  const [submittingWeight, setSubmittingWeight] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await statsAPI.getDashboard();
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error loading dashboard stats', err);
      addToast('Could not fetch real-time dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickWeightSubmit = async (e) => {
    e.preventDefault();
    if (!quickWeight || Number(quickWeight) <= 0) {
      addToast('Please enter a valid weight in kg', 'error');
      return;
    }

    try {
      setSubmittingWeight(true);
      const res = await weightAPI.add({
        weight: Number(quickWeight),
        date: new Date(),
        notes: 'Dashboard quick update',
      });
      if (res.data.success) {
        addToast(`Weight logged: ${quickWeight} kg! ⚖️`, 'success');
        setWeightModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      addToast('Failed to update weight', 'error');
    } finally {
      setSubmittingWeight(false);
    }
  };

  if (loading && !stats) {
    return <Loader message="Analyzing your workout data..." />;
  }

  const greeting = getGreeting();
  const todayFormatted = formatDateWithDay(new Date());

  // Stat cards configuration
  const statCards = [
    {
      title: "Today's Workout",
      value: stats?.todayWorkout ? stats.todayWorkout.name : 'Rest / Planned',
      sub: stats?.todayWorkout
        ? `${stats.todayWorkout.exercises?.length || 0} exercises • ${stats.todayWorkout.completed ? 'Completed' : 'Pending'}`
        : 'No session logged yet',
      icon: Dumbbell,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20',
      badge: stats?.todayWorkout?.completed ? 'Done' : 'Today',
      action: () => stats?.todayWorkout ? navigate('/start-workout', { state: { workout: stats.todayWorkout } }) : navigate('/workouts'),
    },
    {
      title: 'Weekly Workouts',
      value: `${stats?.weeklyWorkoutsCount || 0} Sessions`,
      sub: `${stats?.monthlyWorkoutsCount || 0} completed this month`,
      icon: Calendar,
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/20',
      badge: 'Weekly',
    },
    {
      title: 'Calories Burned',
      value: `${(stats?.weeklyCaloriesBurned || 0).toLocaleString()} kcal`,
      sub: `${(stats?.totalCaloriesBurned || 0).toLocaleString()} kcal all-time`,
      icon: Flame,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/20',
      badge: 'This Week',
    },
    {
      title: 'Current Weight',
      value: `${stats?.currentWeight || user?.weight || 70} kg`,
      sub: `${stats?.weightChange > 0 ? '+' : ''}${stats?.weightChange || 0} kg total change`,
      icon: Scale,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/20',
      badge: user?.bmiCategory || 'Normal',
      action: () => setWeightModalOpen(true),
    },
    {
      title: 'Workout Streak',
      value: `${stats?.currentStreak || 0} Days`,
      sub: `Best: ${stats?.bestStreak || 0} consecutive days`,
      icon: Zap,
      color: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/20',
      badge: stats?.currentStreak > 0 ? '🔥 On Fire' : 'Start streak',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {greeting}, {user?.name?.split(' ')[0] || 'Athlete'} 👋
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
            <Calendar className="w-4 h-4 text-emerald-500" /> {todayFormatted}
          </p>
        </div>

        {/* Quick Action Top Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/start-workout">
            <Button variant="primary" size="md" icon={PlayCircle}>
              Start Workout
            </Button>
          </Link>
          <Link to="/workouts">
            <Button variant="outline" size="md" icon={PlusCircle}>
              Add Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card
                className="p-5 flex flex-col justify-between h-full group"
                hoverEffect={!!card.action}
                onClick={card.action}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} border flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {card.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {card.title}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {card.value}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  {card.sub}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Middle Section: Weekly Workout Chart & Today's Workout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Weekly Workout Volume Chart */}
        <div className="lg:col-span-8">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" /> Weekly Workout Activity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Workout sessions completed across this week (Monday – Sunday)
                </p>
              </div>
              <Badge variant="emerald">Live MongoDB Data</Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.weeklyChartData || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val, name) => [
                      name === 'workouts' ? `${val} sessions` : `${val} kcal`,
                      name === 'workouts' ? 'Workouts' : 'Calories',
                    ]}
                  />
                  <Bar
                    dataKey="workouts"
                    name="workouts"
                    radius={[6, 6, 0, 0]}
                    fill="#10b981"
                  >
                    {(stats?.weeklyChartData || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.workouts > 0 ? '#10b981' : '#334155'}
                        opacity={entry.workouts > 0 ? 1 : 0.4}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Goal: 4+ workouts / week</span>
              <span className="font-semibold text-emerald-500">
                {stats?.weeklyWorkoutsCount || 0} completed so far
              </span>
            </div>
          </Card>
        </div>

        {/* Today's Workout Focus Card */}
        <div className="lg:col-span-4">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-emerald-500" /> Today's Workout
                </h3>
                {stats?.todayWorkout?.completed ? (
                  <Badge variant="emerald">Completed</Badge>
                ) : (
                  <Badge variant="cyan">Planned</Badge>
                )}
              </div>

              {stats?.todayWorkout ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                      {stats.todayWorkout.name}
                    </h4>
                    <p className="text-xs text-emerald-500 font-semibold mt-0.5">
                      {stats.todayWorkout.type} • {stats.todayWorkout.duration || 30} min
                    </p>
                  </div>

                  {/* Planned Exercises List */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Planned Exercises ({stats.todayWorkout.exercises?.length || 0})
                    </h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {stats.todayWorkout.exercises?.map((ex, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {ex.name}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {ex.sets?.length || 3} sets
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    No workout recorded today
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Ready to train? Pick from your routines or start an active session now.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {stats?.todayWorkout ? (
                <Button
                  onClick={() => navigate('/start-workout', { state: { workout: stats.todayWorkout } })}
                  variant="primary"
                  className="w-full"
                  icon={PlayCircle}
                >
                  {stats.todayWorkout.completed ? 'Replay Workout' : 'Start Session Now'}
                </Button>
              ) : (
                <Link to="/workouts" className="block w-full">
                  <Button variant="primary" className="w-full" icon={PlusCircle}>
                    Plan Today's Workout
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Quick Actions Bar */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Button
            onClick={() => navigate('/start-workout')}
            variant="outline"
            className="justify-start py-3 bg-white dark:bg-slate-900"
            icon={PlayCircle}
          >
            Start Workout
          </Button>
          <Button
            onClick={() => navigate('/workouts')}
            variant="outline"
            className="justify-start py-3 bg-white dark:bg-slate-900"
            icon={PlusCircle}
          >
            Add Workout
          </Button>
          <Button
            onClick={() => navigate('/exercises')}
            variant="outline"
            className="justify-start py-3 bg-white dark:bg-slate-900"
            icon={Dumbbell}
          >
            Add Exercise
          </Button>
          <Button
            onClick={() => setWeightModalOpen(true)}
            variant="outline"
            className="justify-start py-3 bg-white dark:bg-slate-900"
            icon={Scale}
          >
            Update Weight
          </Button>
          <Button
            onClick={() => navigate('/progress')}
            variant="outline"
            className="justify-start py-3 bg-white dark:bg-slate-900"
            icon={TrendingUp}
          >
            View Progress
          </Button>
        </div>
      </div>

      {/* 5. Recent Workouts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Workouts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your latest completed and saved training sessions
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
          >
            View All History <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {stats?.recentWorkouts && stats.recentWorkouts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentWorkouts.map((workout) => (
              <Card
                key={workout._id}
                className="p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all cursor-pointer group"
                onClick={() => navigate(`/workouts`)}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={workout.completed ? 'emerald' : 'amber'}>
                      {workout.type || 'Strength'}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {formatDate(workout.date)}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-500 transition-colors">
                    {workout.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {workout.exercises?.map((e) => e.name).join(', ') || 'No exercises listed'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {workout.duration} min
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <Flame className="w-3.5 h-3.5" />
                    {workout.caloriesBurned} kcal
                  </span>
                  <span className="text-slate-400 font-medium">
                    {workout.exercises?.length || 0} exercises
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Dumbbell}
            title="No workout records found"
            description="You haven't logged any workouts yet. Create your first routine to track your sets, reps and progress."
            actionText="Create Workout"
            onAction={() => navigate('/workouts')}
          />
        )}
      </div>

      {/* Quick Weight Update Modal */}
      <Modal
        isOpen={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        title="Quick Log Weight"
      >
        <form onSubmit={handleQuickWeightSubmit} className="space-y-4">
          <Input
            label="Current Weight (kg)"
            id="quickWeight"
            type="number"
            step="0.1"
            value={quickWeight}
            onChange={(e) => setQuickWeight(e.target.value)}
            placeholder="e.g. 74.5"
            required
            autoFocus
          />
          <p className="text-xs text-slate-400">
            This will save a new time-stamped weight log and update your current baseline BMI.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setWeightModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submittingWeight}
            >
              Save Weight
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
