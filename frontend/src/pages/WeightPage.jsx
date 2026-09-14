import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Target,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { weightAPI, goalAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const WeightPage = () => {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    startingWeight: 0,
    currentWeight: 0,
    weightChange: 0,
    goalWeight: null,
    weights: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchWeights = async () => {
    try {
      setLoading(true);
      const res = await weightAPI.getAll();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load weight metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeights();
  }, []);

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!formData.weight || Number(formData.weight) <= 0) {
      addToast('Please provide a valid weight in kg', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await weightAPI.add({
        weight: Number(formData.weight),
        date: formData.date,
        notes: formData.notes,
      });

      if (res.data.success) {
        addToast(`Weight entry of ${formData.weight} kg logged! ⚖️`, 'success');
        setIsModalOpen(false);
        setFormData({
          weight: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        fetchWeights();
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to log weight', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this weight entry?')) return;
    try {
      const res = await weightAPI.delete(id);
      if (res.data.success) {
        addToast('Weight entry removed', 'info');
        fetchWeights();
      }
    } catch (err) {
      addToast('Failed to delete entry', 'error');
    }
  };

  if (loading && (!data.weights || data.weights.length === 0)) {
    return <Loader message="Loading weight logs and trends..." />;
  }

  // Format chart items
  const chartData = data.weights.map((w) => ({
    date: formatDate(w.date),
    weight: w.weight,
    rawDate: w.date,
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Body Weight Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log your daily or weekly weight weigh-ins to track fat loss and lean mass development.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={Plus}>
          Log Weight Entry
        </Button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Starting Weight
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {data.startingWeight || '--'} kg
          </h3>
          <p className="text-xs text-slate-400 mt-1">Initial baseline recorded</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Weight
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {data.currentWeight || '--'} kg
          </h3>
          <p className="text-xs text-emerald-500 font-semibold mt-1">Latest weigh-in</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Weight Change
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              {data.weightChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {data.weightChange > 0 ? `+${data.weightChange}` : data.weightChange} kg
          </h3>
          <p className="text-xs text-slate-400 mt-1">Delta from starting point</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Goal Weight
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {data.goalWeight ? `${data.goalWeight} kg` : 'Not Set'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {data.goalWeight ? `${Math.abs(data.currentWeight - data.goalWeight).toFixed(1)} kg remaining` : 'Set in Goals page'}
          </p>
        </Card>
      </div>

      {/* Line Chart Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Weight Fluctuation & Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Progress curve towards target goal
            </p>
          </div>
          <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
            <span>Starting: {data.startingWeight} kg</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="text-emerald-500">Current: {data.currentWeight} kg</span>
            {data.goalWeight && (
              <>
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="text-purple-400">Goal: {data.goalWeight} kg</span>
              </>
            )}
          </div>
        </div>

        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
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
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No weigh-in logs available yet. Click "Log Weight Entry" above.
            </div>
          )}
        </div>
      </Card>

      {/* Weight History Table */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Recorded Weigh-in Ledger
        </h3>

        {data.weights && data.weights.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...data.weights].reverse().map((entry) => (
                  <tr key={entry._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      {formatDate(entry.date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-500">
                      {entry.weight} kg
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {entry.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete log"
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
            icon={Scale}
            title="No weight entries recorded"
            description="Log your first weight to begin building your progress curve."
            actionText="Log Weight"
            onAction={() => setIsModalOpen(true)}
          />
        )}
      </Card>

      {/* Log Weight Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Weigh-In"
      >
        <form onSubmit={handleAddWeight} className="space-y-4">
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            min="20"
            max="300"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            placeholder="e.g. 72.5"
            required
            autoFocus
          />

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Input
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Morning weigh-in fasted"
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
              Save Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WeightPage;
