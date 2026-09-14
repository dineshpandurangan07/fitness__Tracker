import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  PlusCircle,
} from 'lucide-react';
import { goalAPI } from '../services/api';
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

const GoalsPage = () => {
  const { addToast } = useToast();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Create Goal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Workouts',
    targetValue: '',
    currentValue: '0',
    unit: 'workouts',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Modal State for Quick Progress Update
  const [activeGoalToUpdate, setActiveGoalToUpdate] = useState(null);
  const [updateValue, setUpdateValue] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalAPI.getAll();
      if (res.data.success) {
        setGoals(res.data.goals);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load goals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.targetValue) {
      addToast('Please fill all required goal fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await goalAPI.create({
        ...formData,
        targetValue: Number(formData.targetValue),
        currentValue: Number(formData.currentValue) || 0,
      });

      if (res.data.success) {
        addToast(`Goal "${formData.name}" established! 🎯`, 'success');
        setIsCreateModalOpen(false);
        setFormData({
          name: '',
          category: 'Workouts',
          targetValue: '',
          currentValue: '0',
          unit: 'workouts',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        fetchGoals();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create goal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgressSubmit = async (e) => {
    e.preventDefault();
    if (updateValue === '') return;

    try {
      setUpdating(true);
      const res = await goalAPI.update(activeGoalToUpdate._id, {
        currentValue: Number(updateValue),
      });

      if (res.data.success) {
        addToast('Goal progress updated!', 'success');
        setActiveGoalToUpdate(null);
        fetchGoals();
      }
    } catch (err) {
      addToast('Failed to update goal progress', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickIncrement = async (goal) => {
    try {
      const nextVal = goal.currentValue + 1;
      await goalAPI.update(goal._id, { currentValue: nextVal });
      addToast(`Progress +1 for "${goal.name}"`, 'success');
      fetchGoals();
    } catch (err) {
      addToast('Failed to update progress', 'error');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to remove this goal?')) return;
    try {
      const res = await goalAPI.delete(id);
      if (res.data.success) {
        addToast('Goal removed', 'info');
        setGoals((prev) => prev.filter((g) => g._id !== id));
      }
    } catch (err) {
      addToast('Failed to delete goal', 'error');
    }
  };

  const calculatePercentage = (current, target) => {
    if (!target || target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Fitness Goals & Targets
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set ambitious milestones, monitor completion percentages, and stay focused on continuous improvement.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="primary"
          icon={Plus}
        >
          Set New Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <Loader message="Loading your fitness goals..." />
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal) => {
            const pct = calculatePercentage(goal.currentValue, goal.targetValue);
            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-6 flex flex-col justify-between h-full group hover:border-emerald-500/40 transition-all">
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="cyan">{goal.category}</Badge>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        Target: {formatDate(goal.targetDate)}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      {goal.name}
                    </h3>

                    {/* Progress Ratio & Percentage */}
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                      <span className="font-bold text-emerald-500">{pct}% Complete</span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="mt-2 w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-sm"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions & Status Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {goal.completed || pct >= 100 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Achieved! 🎉
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">In Progress</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickIncrement(goal)}
                        className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                        title="Quick increment by 1"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => {
                          setActiveGoalToUpdate(goal);
                          setUpdateValue(goal.currentValue);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Update Current Value"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No fitness goals established"
          description="Create your targets for workouts, target weight, running mileage, or personal records."
          actionText="Create First Goal"
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Create Goal Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Establish Fitness Target"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Goal Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Complete 50 Workouts"
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { label: 'Workouts', value: 'Workouts' },
                { label: 'Weight', value: 'Weight' },
                { label: 'Running', value: 'Running' },
                { label: 'Strength', value: 'Strength' },
                { label: 'Calorie', value: 'Calorie' },
                { label: 'Other', value: 'Other' },
              ]}
            />

            <Input
              label="Unit Label"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g. workouts, kg, km"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Goal Value"
              type="number"
              step="0.1"
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
              placeholder="e.g. 50"
              required
            />
            <Input
              label="Starting / Current Value"
              type="number"
              step="0.1"
              value={formData.currentValue}
              onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
              placeholder="e.g. 0"
            />
          </div>

          <Input
            label="Target Date"
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
            >
              Save Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Progress Update Modal */}
      <Modal
        isOpen={!!activeGoalToUpdate}
        onClose={() => setActiveGoalToUpdate(null)}
        title={`Update: ${activeGoalToUpdate?.name || ''}`}
      >
        <form onSubmit={handleUpdateProgressSubmit} className="space-y-4">
          <Input
            label={`Current Progress Value (${activeGoalToUpdate?.unit || ''})`}
            type="number"
            step="0.1"
            value={updateValue}
            onChange={(e) => setUpdateValue(e.target.value)}
            required
            autoFocus
          />
          <p className="text-xs text-slate-400">
            Target benchmark is {activeGoalToUpdate?.targetValue} {activeGoalToUpdate?.unit}.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveGoalToUpdate(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updating}
            >
              Update Value
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GoalsPage;
