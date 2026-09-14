import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  Plus,
  PlayCircle,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Flame,
  CheckCircle,
  Eye,
  PlusCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { workoutAPI, exerciseAPI } from '../services/api';
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

const WorkoutsPage = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [availableExercises, setAvailableExercises] = useState([]);

  // Workout Modal (Create & Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Strength',
    date: new Date().toISOString().split('T')[0],
    duration: 45,
    caloriesBurned: 320,
    notes: '',
    exercises: [
      {
        name: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        sets: [
          { setNumber: 1, reps: 10, weight: 60, completed: false },
          { setNumber: 2, reps: 8, weight: 70, completed: false },
          { setNumber: 3, reps: 6, weight: 80, completed: false },
        ],
      },
    ],
  });

  // View Details Modal
  const [viewWorkout, setViewWorkout] = useState(null);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const res = await workoutAPI.getAll({ type: typeFilter });
      if (res.data.success) {
        setWorkouts(res.data.workouts);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load workouts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseCatalog = async () => {
    try {
      const res = await exerciseAPI.getAll({});
      if (res.data.success) {
        setAvailableExercises(res.data.exercises);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [typeFilter]);

  useEffect(() => {
    fetchExerciseCatalog();
  }, []);

  const openCreateModal = () => {
    setEditingWorkoutId(null);
    setFormData({
      name: '',
      type: 'Strength',
      date: new Date().toISOString().split('T')[0],
      duration: 45,
      caloriesBurned: 300,
      notes: '',
      exercises: [
        {
          name: availableExercises[0]?.name || 'Push Ups',
          muscleGroup: availableExercises[0]?.muscleGroup || 'Chest',
          sets: [
            { setNumber: 1, reps: 10, weight: 0, completed: false },
            { setNumber: 2, reps: 10, weight: 0, completed: false },
            { setNumber: 3, reps: 10, weight: 0, completed: false },
          ],
        },
      ],
    });
    setModalOpen(true);
  };

  const openEditModal = (workout) => {
    setEditingWorkoutId(workout._id);
    setFormData({
      name: workout.name,
      type: workout.type,
      date: new Date(workout.date).toISOString().split('T')[0],
      duration: workout.duration,
      caloriesBurned: workout.caloriesBurned,
      notes: workout.notes || '',
      exercises: workout.exercises && workout.exercises.length > 0 ? workout.exercises : [
        {
          name: 'Push Ups',
          muscleGroup: 'Chest',
          sets: [{ setNumber: 1, reps: 10, weight: 0, completed: false }],
        },
      ],
    });
    setModalOpen(true);
  };

  const handleDeleteWorkout = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await workoutAPI.delete(id);
      if (res.data.success) {
        addToast('Workout deleted successfully', 'info');
        setWorkouts((prev) => prev.filter((w) => w._id !== id));
      }
    } catch (err) {
      addToast('Failed to delete workout', 'error');
    }
  };

  // Dynamic exercise addition inside workout form
  const handleAddExerciseToForm = () => {
    const defaultEx = availableExercises[0] || { name: 'Barbell Squat', muscleGroup: 'Legs' };
    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          name: defaultEx.name,
          muscleGroup: defaultEx.muscleGroup,
          sets: [
            { setNumber: 1, reps: 10, weight: 20, completed: false },
            { setNumber: 2, reps: 10, weight: 20, completed: false },
            { setNumber: 3, reps: 10, weight: 20, completed: false },
          ],
        },
      ],
    }));
  };

  const handleRemoveExerciseFromForm = (index) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...formData.exercises];
    updated[index][field] = value;
    if (field === 'name') {
      const matched = availableExercises.find((e) => e.name === value);
      if (matched) {
        updated[index].muscleGroup = matched.muscleGroup;
      }
    }
    setFormData({ ...formData, exercises: updated });
  };

  // Add/remove set from specific exercise
  const handleAddSet = (exIndex) => {
    const updated = [...formData.exercises];
    const sets = updated[exIndex].sets || [];
    const lastSet = sets[sets.length - 1] || { reps: 10, weight: 0 };
    sets.push({
      setNumber: sets.length + 1,
      reps: lastSet.reps,
      weight: lastSet.weight,
      completed: false,
    });
    updated[exIndex].sets = sets;
    setFormData({ ...formData, exercises: updated });
  };

  const handleRemoveSet = (exIndex, setIndex) => {
    const updated = [...formData.exercises];
    updated[exIndex].sets = updated[exIndex].sets.filter((_, i) => i !== setIndex);
    // re-number remaining sets
    updated[exIndex].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    setFormData({ ...formData, exercises: updated });
  };

  const handleSetChange = (exIndex, setIndex, field, value) => {
    const updated = [...formData.exercises];
    updated[exIndex].sets[setIndex][field] = Number(value);
    setFormData({ ...formData, exercises: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Workout name is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingWorkoutId) {
        const res = await workoutAPI.update(editingWorkoutId, formData);
        if (res.data.success) {
          addToast('Workout updated successfully! ✨', 'success');
          setModalOpen(false);
          fetchWorkouts();
        }
      } else {
        const res = await workoutAPI.create(formData);
        if (res.data.success) {
          addToast('New workout routine created! 🏋️', 'success');
          setModalOpen(false);
          fetchWorkouts();
        }
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to save workout', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Workout Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Design structured routines, configure sets and reps, or launch active sessions.
          </p>
        </div>
        <Button onClick={openCreateModal} variant="primary" icon={Plus}>
          Create New Workout
        </Button>
      </div>

      {/* Workout Type Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['All', 'Strength', 'Cardio', 'HIIT', 'Flexibility', 'Full Body'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              typeFilter === t
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500/40'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Workouts Grid */}
      {loading ? (
        <Loader message="Loading your workout routines..." />
      ) : workouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workouts.map((workout) => (
            <motion.div
              key={workout._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-5 flex flex-col justify-between h-full group hover:border-emerald-500/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={workout.completed ? 'emerald' : 'cyan'}>
                      {workout.type}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(workout.date)}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {workout.name}
                  </h3>

                  {workout.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-1">
                      "{workout.notes}"
                    </p>
                  )}

                  {/* Exercises list summary */}
                  <div className="mt-4 space-y-1.5">
                    {workout.exercises?.slice(0, 3).map((ex, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                          {ex.name}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {ex.sets?.length || 3} sets
                        </span>
                      </div>
                    ))}
                    {(workout.exercises?.length || 0) > 3 && (
                      <p className="text-[11px] text-slate-400 pl-1">
                        + {workout.exercises.length - 3} more exercises
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer: KPIs & Action Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {workout.duration} min
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                      <Flame className="w-3.5 h-3.5" />
                      {workout.caloriesBurned} kcal
                    </span>
                    {workout.completed && (
                      <span className="flex items-center gap-1 text-emerald-500 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Done
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => navigate('/start-workout', { state: { workout } })}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      icon={PlayCircle}
                    >
                      Start
                    </Button>
                    <Button
                      onClick={() => setViewWorkout(workout)}
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      title="View Details"
                    />
                    <Button
                      onClick={() => openEditModal(workout)}
                      variant="outline"
                      size="sm"
                      icon={Edit2}
                      title="Edit Workout"
                    />
                    <Button
                      onClick={() => handleDeleteWorkout(workout._id, workout.name)}
                      variant="ghost"
                      size="sm"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      icon={Trash2}
                      title="Delete Workout"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Dumbbell}
          title="No workouts found"
          description="Create your personalized workout routines to start tracking exercises, reps, and weights."
          actionText="Create First Workout"
          onAction={openCreateModal}
        />
      )}

      {/* View Workout Details Modal */}
      <Modal
        isOpen={!!viewWorkout}
        onClose={() => setViewWorkout(null)}
        title={viewWorkout?.name || 'Workout Overview'}
        maxWidth="max-w-xl"
      >
        {viewWorkout && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="emerald">{viewWorkout.type}</Badge>
              <Badge variant="default">Duration: {viewWorkout.duration} mins</Badge>
              <Badge variant="amber">Est. Burn: {viewWorkout.caloriesBurned} kcal</Badge>
              {viewWorkout.completed && <Badge variant="emerald">Completed</Badge>}
            </div>

            {viewWorkout.notes && (
              <p className="text-sm text-slate-600 dark:text-slate-300 italic p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                "{viewWorkout.notes}"
              </p>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Target Exercises ({viewWorkout.exercises?.length || 0})
              </h4>
              <div className="space-y-3">
                {viewWorkout.exercises?.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
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

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setViewWorkout(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                icon={PlayCircle}
                onClick={() => {
                  const target = viewWorkout;
                  setViewWorkout(null);
                  navigate('/start-workout', { state: { workout: target } });
                }}
              >
                Start Active Workout
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Workout Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingWorkoutId ? 'Edit Workout Routine' : 'Create Workout Routine'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Workout Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Chest & Tricep Power"
              required
              autoFocus
            />

            <Select
              label="Workout Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { label: 'Strength', value: 'Strength' },
                { label: 'Cardio', value: 'Cardio' },
                { label: 'HIIT', value: 'HIIT' },
                { label: 'Flexibility', value: 'Flexibility' },
                { label: 'Full Body', value: 'Full Body' },
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Scheduled Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label="Duration (min)"
              type="number"
              min="5"
              max="300"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              required
            />
            <Input
              label="Est. Calories"
              type="number"
              min="10"
              max="3000"
              value={formData.caloriesBurned}
              onChange={(e) => setFormData({ ...formData, caloriesBurned: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Notes / Coaching Tips"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Focus on progressive overload and slow eccentrics..."
          />

          {/* Dynamic Exercises Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                Exercises & Sets Structure
              </h4>
              <button
                type="button"
                onClick={handleAddExerciseToForm}
                className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" /> Add Exercise
              </button>
            </div>

            {formData.exercises.map((ex, exIdx) => (
              <div
                key={exIdx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <select
                      value={ex.name}
                      onChange={(e) => handleExerciseChange(exIdx, 'name', e.target.value)}
                      className="w-full text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    >
                      {availableExercises.map((e) => (
                        <option key={e._id} value={e.name}>
                          {e.name} ({e.muscleGroup})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExerciseFromForm(exIdx)}
                    disabled={formData.exercises.length <= 1}
                    className="p-2 text-slate-400 hover:text-rose-500 disabled:opacity-30"
                    title="Remove Exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sets Rows */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    <span className="col-span-2">Set</span>
                    <span className="col-span-5">Weight (kg)</span>
                    <span className="col-span-4">Reps</span>
                    <span className="col-span-1"></span>
                  </div>

                  {ex.sets?.map((set, setIdx) => (
                    <div key={setIdx} className="grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-2 text-xs font-mono font-bold text-slate-500 pl-1">
                        #{set.setNumber}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight}
                        onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                        className="col-span-5 text-xs px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        placeholder="kg"
                      />
                      <input
                        type="number"
                        min="1"
                        value={set.reps}
                        onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                        className="col-span-4 text-xs px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        placeholder="reps"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(exIdx, setIdx)}
                        disabled={ex.sets.length <= 1}
                        className="col-span-1 text-slate-400 hover:text-rose-500 disabled:opacity-30"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddSet(exIdx)}
                    className="text-[11px] font-semibold text-emerald-500 hover:text-emerald-600 pt-1 flex items-center gap-1"
                  >
                    + Add Set
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
            >
              {editingWorkoutId ? 'Update Workout' : 'Save Workout'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkoutsPage;
