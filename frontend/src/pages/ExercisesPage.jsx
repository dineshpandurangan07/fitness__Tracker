import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Dumbbell,
  ChevronRight,
  Info,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import { exerciseAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

const ExercisesPage = () => {
  const { addToast } = useToast();

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');

  // Selected exercise for detailed instructions modal
  const [viewExercise, setViewExercise] = useState(null);

  // Create custom exercise modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    muscleGroup: 'Chest',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    description: '',
    instructions: '',
  });
  const [creating, setCreating] = useState(false);

  const muscleGroups = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const equipments = [
    'All',
    'Bodyweight',
    'Barbell',
    'Dumbbell',
    'Cable',
    'Machine',
  ];

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedMuscle !== 'All') params.muscleGroup = selectedMuscle;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (selectedEquipment !== 'All') params.equipment = selectedEquipment;
      if (search.trim()) params.search = search.trim();

      const res = await exerciseAPI.getAll(params);
      if (res.data.success) {
        setExercises(res.data.exercises);
      }
    } catch (err) {
      console.error('Error fetching exercises', err);
      addToast('Failed to load exercises', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [selectedMuscle, selectedDifficulty, selectedEquipment]);

  // Debounced search on enter or trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExercises();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.name.trim()) {
      addToast('Exercise name is required', 'error');
      return;
    }

    try {
      setCreating(true);
      const res = await exerciseAPI.create({
        ...createFormData,
        instructions: createFormData.instructions
          ? createFormData.instructions.split('\n').filter((s) => s.trim() !== '')
          : [],
      });
      if (res.data.success) {
        addToast(`Exercise "${res.data.exercise.name}" added to library! 🎉`, 'success');
        setIsCreateModalOpen(false);
        setCreateFormData({
          name: '',
          muscleGroup: 'Chest',
          equipment: 'Dumbbells',
          difficulty: 'Beginner',
          description: '',
          instructions: '',
        });
        fetchExercises();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create exercise', 'error');
    } finally {
      setCreating(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return <Badge variant="emerald">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="cyan">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="rose">Advanced</Badge>;
      default:
        return <Badge>{difficulty}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Exercise Library
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Browse verified movements or define custom exercises for your workout routines.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="primary"
          icon={Plus}
          className="self-start sm:self-auto"
        >
          Add Custom Exercise
        </Button>
      </div>

      {/* Muscle Group Horizontal Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {muscleGroups.map((muscle) => (
          <button
            key={muscle}
            onClick={() => setSelectedMuscle(muscle)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedMuscle === muscle
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500/40'
            }`}
          >
            {muscle}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exercises by name (e.g. Bench Press, Squat, Pull Up)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {equipments.map((eq) => (
              <option key={eq} value={eq}>
                {eq === 'All' ? 'All Equipment' : eq}
              </option>
            ))}
          </select>

          {(search || selectedMuscle !== 'All' || selectedDifficulty !== 'All' || selectedEquipment !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedMuscle('All');
                setSelectedDifficulty('All');
                setSelectedEquipment('All');
              }}
              className="text-xs text-rose-500 hover:underline shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Exercise Cards Grid */}
      {loading ? (
        <Loader message="Loading exercise catalog..." />
      ) : exercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exercises.map((exercise) => (
            <motion.div
              key={exercise._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="p-5 flex flex-col justify-between h-full group hover:border-emerald-500/50 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setViewExercise(exercise)}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                      {exercise.muscleGroup}
                    </span>
                    {getDifficultyBadge(exercise.difficulty)}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {exercise.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {exercise.description || 'Compound movement targeting primary stabilizers and core muscle groups.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate max-w-[180px]">
                    📦 {exercise.equipment || 'Bodyweight'}
                  </span>
                  <span className="font-semibold text-emerald-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    View Steps <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Dumbbell}
          title="No exercises matched your filters"
          description="Try broadening your search term or selecting another muscle category."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedMuscle('All');
            setSelectedDifficulty('All');
            setSelectedEquipment('All');
          }}
        />
      )}

      {/* Exercise Detail Modal */}
      <Modal
        isOpen={!!viewExercise}
        onClose={() => setViewExercise(null)}
        title={viewExercise?.name || 'Exercise Details'}
        maxWidth="max-w-xl"
      >
        {viewExercise && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="emerald">{viewExercise.muscleGroup}</Badge>
              {getDifficultyBadge(viewExercise.difficulty)}
              <Badge variant="default">Equipment: {viewExercise.equipment || 'None'}</Badge>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Overview
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {viewExercise.description}
              </p>
            </div>

            {viewExercise.instructions && viewExercise.instructions.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Execution Instructions
                </h4>
                <div className="space-y-2.5">
                  {viewExercise.instructions.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button onClick={() => setViewExercise(null)} variant="primary">
                Got It
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Custom Exercise Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Custom Exercise"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Exercise Name"
            value={createFormData.name}
            onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
            placeholder="e.g. Bulgarian Split Squat"
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Muscle Group"
              value={createFormData.muscleGroup}
              onChange={(e) => setCreateFormData({ ...createFormData, muscleGroup: e.target.value })}
              options={[
                { label: 'Chest', value: 'Chest' },
                { label: 'Back', value: 'Back' },
                { label: 'Shoulders', value: 'Shoulders' },
                { label: 'Arms', value: 'Arms' },
                { label: 'Legs', value: 'Legs' },
                { label: 'Core', value: 'Core' },
                { label: 'Cardio', value: 'Cardio' },
              ]}
            />

            <Select
              label="Difficulty"
              value={createFormData.difficulty}
              onChange={(e) => setCreateFormData({ ...createFormData, difficulty: e.target.value })}
              options={[
                { label: 'Beginner', value: 'Beginner' },
                { label: 'Intermediate', value: 'Intermediate' },
                { label: 'Advanced', value: 'Advanced' },
              ]}
            />
          </div>

          <Input
            label="Equipment Required"
            value={createFormData.equipment}
            onChange={(e) => setCreateFormData({ ...createFormData, equipment: e.target.value })}
            placeholder="e.g. Dumbbells, Bench"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={createFormData.description}
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              placeholder="Brief summary of muscle targets and mechanics..."
              className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800/60 p-3 text-sm text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Instructions (One per line)
            </label>
            <textarea
              rows={3}
              value={createFormData.instructions}
              onChange={(e) => setCreateFormData({ ...createFormData, instructions: e.target.value })}
              placeholder="Step 1: Set up foot position...&#10;Step 2: Lower slowly...&#10;Step 3: Drive through heel..."
              className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800/60 p-3 text-sm text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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
              isLoading={creating}
            >
              Save Exercise
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExercisesPage;
