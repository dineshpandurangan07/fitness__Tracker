import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Scale,
  Calendar,
  Flame,
  Clock,
  Zap,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { statsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatDuration } from '../utils/formatters';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';

const ProgressPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await statsAPI.getProgress();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load progress analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading && !data) {
    return <Loader message="Generating progress graphs and trajectory analytics..." />;
  }

  const statCards = [
    {
      title: 'Total Workouts',
      value: `${data?.totalWorkouts || 0} Sessions`,
      icon: Calendar,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
    },
    {
      title: 'Total Calories Burned',
      value: `${(data?.totalCaloriesBurned || 0).toLocaleString()} kcal`,
      icon: Flame,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400',
    },
    {
      title: 'Total Workout Time',
      value: formatDuration(data?.totalWorkoutMinutes || 0),
      icon: Clock,
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-400',
    },
    {
      title: 'Current Streak',
      value: `${data?.currentStreak || 0} Days`,
      icon: Zap,
      color: 'from-rose-500/20 to-pink-500/10 text-rose-400',
    },
    {
      title: 'Best Streak',
      value: `${data?.bestStreak || 0} Days`,
      icon: Award,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Performance & Progress Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visualize your bodily transformations, volume spikes, and consistency trends across time.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} border border-slate-200 dark:border-slate-800 flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {card.value}
                </h3>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Chart Grid: 4 Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Weight Progress Line Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-400" /> Body Weight Progression
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log trend over time in kg
              </p>
            </div>
            <Badge variant="purple">Line Chart</Badge>
          </div>

          <div className="h-64 w-full">
            {data?.weightChartData && data.weightChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.weightChartData}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${val} kg`, 'Weight']}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', r: 4 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No weight logs recorded yet. Visit the Weight page to enter records.
              </div>
            )}
          </div>
        </Card>

        {/* 2. Workout Frequency Bar Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" /> Workout Frequency (8 Weeks)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total completed workouts per weekly cycle
              </p>
            </div>
            <Badge variant="emerald">Bar Chart</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.weeklyFrequency || []}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${val} sessions`, 'Workouts']}
                />
                <Bar dataKey="workouts" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 3. Calories Burned Area/Bar Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" /> Weekly Energy Expenditure
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estimated active calories torched each week
              </p>
            </div>
            <Badge variant="amber">Area Chart</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.weeklyFrequency || []}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="calColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${val} kcal`, 'Calories']}
                />
                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#calColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 4. Workout Duration Trend Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" /> Training Volume (Minutes)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Weekly accumulated active exercise minutes
              </p>
            </div>
            <Badge variant="cyan">Bar Chart</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.weeklyFrequency || []}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${val} mins`, 'Duration']}
                />
                <Bar dataKey="duration" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;
