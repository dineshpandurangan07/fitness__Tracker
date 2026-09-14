import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Search,
  Calendar,
  Clock,
  Flame,
  Dumbbell,
  CheckCircle2,
  Eye,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { workoutAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatDate, formatDuration } from '../utils/formatters';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

const HistoryPage = () => {
  const { addToast } = useToast();

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Completed' | 'Pending'

  // Detailed modal
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter !== 'All') params.type = typeFilter;
      if (statusFilter !== 'All') params.completed = statusFilter === 'Completed';
      if (search.trim()) params.search = search.trim();

      const res = await workoutAPI.getAll(params);
      if (res.data.success) {
        setWorkouts(res.data.workouts);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load workout history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Workout History
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complete training ledger of your past workouts, volume, and personal records.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search past workouts by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Types</option>
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
            <option value="HIIT">HIIT</option>
            <option value="Flexibility">Flexibility</option>
            <option value="Full Body">Full Body</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          {(search || typeFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('All');
                setStatusFilter('All');
              }}
              className="text-xs text-rose-500 hover:underline shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* History Ledger List */}
      {loading ? (
        <Loader message="Loading workout history logs..." />
      ) : workouts.length > 0 ? (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <motion.div
              key={workout._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/40 transition-all cursor-pointer group"
                onClick={() => setSelectedWorkout(workout)}
              >
                {/* Left info */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-500 transition-colors">
                        {workout.name}
                      </h3>
                      <Badge variant={workout.completed ? 'emerald' : 'amber'} size="sm">
                        {workout.completed ? 'Completed' : 'Pending'}
                      </Badge>
                      <Badge variant="cyan" size="sm">
                        {workout.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(workout.date)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {workout.duration} min
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-500 font-medium">
                        <Flame className="w-3.5 h-3.5" />
                        {workout.caloriesBurned} kcal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right stats & action */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left md:text-right text-xs">
                    <span className="text-slate-400 block font-medium">Exercises</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {workout.exercises?.length || 0} movements
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWorkout(workout);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="No past workout records found"
          description="Complete active workout sessions to log duration, calories burned, and exercise sets."
          actionText="Search Again"
          onAction={() => {
            setSearch('');
            setTypeFilter('All');
            setStatusFilter('All');
          }}
        />
      )}

      {/* Workout Detail Modal */}
      <Modal
        isOpen={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        title={selectedWorkout?.name || 'Workout Session Details'}
        maxWidth="max-w-xl"
      >
        {selectedWorkout && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant={selectedWorkout.completed ? 'emerald' : 'amber'}>
                {selectedWorkout.completed ? 'Completed' : 'Pending'}
              </Badge>
              <Badge variant="cyan">{selectedWorkout.type}</Badge>
              <Badge variant="default">{formatDate(selectedWorkout.date)}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Duration</span>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedWorkout.duration} min
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Calories</span>
                <p className="text-base font-bold text-amber-500">
                  {selectedWorkout.caloriesBurned} kcal
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Exercises</span>
                <p className="text-base font-bold text-emerald-500">
                  {selectedWorkout.exercises?.length || 0}
                </p>
              </div>
            </div>

            {selectedWorkout.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-300 italic p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                "{selectedWorkout.notes}"
              </p>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Completed Exercise Sets
              </h4>
              <div className="space-y-3">
                {selectedWorkout.exercises?.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {idx + 1}. {ex.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {ex.muscleGroup}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center text-xs">
                      {ex.sets?.map((s, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        >
                          <span className="text-slate-400 block text-[10px]">Set {s.setNumber}</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {s.weight > 0 ? `${s.weight}kg × ` : ''}{s.reps} reps
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button onClick={() => setSelectedWorkout(null)} variant="primary">
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HistoryPage;
