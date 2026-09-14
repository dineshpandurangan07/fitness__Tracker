import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Apple,
  Plus,
  Trash2,
  Calendar,
  Flame,
  PieChart,
  TrendingUp,
  Utensils,
  ChevronLeft,
  ChevronRight,
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
import { calorieAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

const CaloriesPage = () => {
  const { addToast } = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalCaloriesToday: 0,
    dailyTarget: 2200,
    remainingCalories: 2200,
    mealBreakdown: { Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 },
    logs: [],
    pastWeekChart: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    foodName: '',
    mealType: 'Breakfast',
    calories: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchCalories = async () => {
    try {
      setLoading(true);
      const res = await calorieAPI.getAll(selectedDate);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load calorie records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalories();
  }, [selectedDate]);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!formData.foodName.trim() || !formData.calories) {
      addToast('Food name and calorie count are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await calorieAPI.add({
        ...formData,
        calories: Number(formData.calories),
      });

      if (res.data.success) {
        addToast(`Logged "${formData.foodName}" (${formData.calories} kcal)! 🥗`, 'success');
        setIsModalOpen(false);
        setFormData({
          foodName: '',
          mealType: 'Lunch',
          calories: '',
          date: selectedDate,
        });
        fetchCalories();
      }
    } catch (err) {
      addToast('Failed to log meal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      const res = await calorieAPI.delete(id);
      if (res.data.success) {
        addToast('Meal removed from log', 'info');
        fetchCalories();
      }
    } catch (err) {
      addToast('Failed to remove meal', 'error');
    }
  };

  if (loading && (!data.logs || data.logs.length === 0)) {
    return <Loader message="Analyzing nutritional intake and meal distribution..." />;
  }

  const caloriePercentage = Math.min(100, Math.round((data.totalCaloriesToday / (data.dailyTarget || 2200)) * 100));

  const mealTypePills = [
    { type: 'Breakfast', icon: '🍳', color: 'text-amber-400 bg-amber-500/10' },
    { type: 'Lunch', icon: '🥗', color: 'text-emerald-400 bg-emerald-500/10' },
    { type: 'Dinner', icon: '🥩', color: 'text-rose-400 bg-rose-500/10' },
    { type: 'Snack', icon: '🍎', color: 'text-cyan-400 bg-cyan-500/10' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Nutrition & Calorie Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log meals, manage macros, and monitor energy balance against your daily metabolic budget.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={Plus}>
            Log Meal
          </Button>
        </div>
      </div>

      {/* 3 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Today's Consumed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
            {data.totalCaloriesToday.toLocaleString()} <span className="text-sm font-normal text-slate-400">kcal</span>
          </h3>
          {/* Progress bar */}
          <div className="mt-3 w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                caloriePercentage >= 100 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${caloriePercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{caloriePercentage}% of daily allowance</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Daily Target
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Apple className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
            {data.dailyTarget.toLocaleString()} <span className="text-sm font-normal text-slate-400">kcal</span>
          </h3>
          <p className="text-xs text-slate-400 mt-4">Adjustable in Profile settings</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Remaining Budget
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-emerald-500">
            {data.remainingCalories.toLocaleString()} <span className="text-sm font-normal text-slate-400">kcal</span>
          </h3>
          <p className="text-xs text-slate-400 mt-4">
            {data.remainingCalories === 0 ? 'Budget reached for today' : 'Available for remaining meals'}
          </p>
        </Card>
      </div>

      {/* Middle Section: Meal Breakdown & 7-Day Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Meal Categories Grid */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Meal Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {mealTypePills.map((m) => (
              <Card key={m.type} className="p-4">
                <span className="text-lg">{m.icon}</span>
                <p className="text-xs font-semibold text-slate-400 mt-1">{m.type}</p>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {data.mealBreakdown[m.type] || 0} kcal
                </h4>
              </Card>
            ))}
          </div>
        </div>

        {/* 7-Day Calorie History Chart */}
        <div className="lg:col-span-8">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  7-Day Calorie History
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily intake compared against target threshold
                </p>
              </div>
              <Badge variant="cyan">Daily Intake</Badge>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.pastWeekChart || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
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
                  <Bar dataKey="calories" radius={[6, 6, 0, 0]} fill="#10b981">
                    {(data.pastWeekChart || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.calories > entry.target ? '#f59e0b' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Food Log Table */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Logged Foods ({formatDate(selectedDate)})
        </h3>

        {data.logs && data.logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Food Item</th>
                  <th className="py-3 px-4">Meal Category</th>
                  <th className="py-3 px-4">Calories</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {log.foodName}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="cyan" size="sm">
                        {log.mealType}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-500">
                      {log.calories} kcal
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteMeal(log._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete meal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Apple}
            title="No meals logged for this date"
            description="Record breakfast, lunch, dinner, or snacks to track nutritional intake."
            actionText="Log Food Now"
            onAction={() => setIsModalOpen(true)}
          />
        )}
      </Card>

      {/* Log Meal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Food & Nutrition"
      >
        <form onSubmit={handleAddMeal} className="space-y-4">
          <Input
            label="Food Name / Description"
            value={formData.foodName}
            onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
            placeholder="e.g. Oatmeal with blueberries & whey"
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Meal Type"
              value={formData.mealType}
              onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
              options={[
                { label: 'Breakfast', value: 'Breakfast' },
                { label: 'Lunch', value: 'Lunch' },
                { label: 'Dinner', value: 'Dinner' },
                { label: 'Snack', value: 'Snack' },
              ]}
            />

            <Input
              label="Calories (kcal)"
              type="number"
              min="1"
              max="5000"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              placeholder="e.g. 450"
              required
            />
          </div>

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
            >
              Log Meal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CaloriesPage;
