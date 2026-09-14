import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Scale,
  Ruler,
  Calendar,
  Activity,
  Target,
  Edit2,
  Check,
  Shield,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../services/api';
import { getBmiColor } from '../utils/formatters';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Loader from '../components/common/Loader';

const ProfilePage = () => {
  const { user, updateUser, refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: 25,
    gender: 'Male',
    height: 175,
    weight: 70,
    goal: 'Gain Muscle',
    activityLevel: 'Intermediate',
    dailyCalorieTarget: 2200,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || 25,
        gender: user.gender || 'Male',
        height: user.height || 175,
        weight: user.weight || 70,
        goal: user.goal || 'Gain Muscle',
        activityLevel: user.activityLevel || 'Intermediate',
        dailyCalorieTarget: user.dailyCalorieTarget || 2200,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await userAPI.updateProfile(formData);
      if (res.data.success) {
        updateUser(res.data.user);
        addToast('Profile updated successfully! ✨', 'success');
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic automatic BMI calculation
  const heightMeters = (formData.height || 175) / 100;
  const liveBmi = Number((formData.weight / (heightMeters * heightMeters)).toFixed(1));
  let liveBmiCategory = 'Normal';
  if (liveBmi < 18.5) liveBmiCategory = 'Underweight';
  else if (liveBmi < 25) liveBmiCategory = 'Normal';
  else if (liveBmi < 30) liveBmiCategory = 'Overweight';
  else liveBmiCategory = 'Obese';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Athlete Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your biometrics, automatic body mass index, and personal fitness parameters.
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'outline' : 'primary'}
          icon={isEditing ? Check : Edit2}
        >
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </Button>
      </div>

      {/* Main Profile Card */}
      <Card className="p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-4xl shadow-xl shadow-emerald-500/25 shrink-0">
            {user?.name ? user.name[0] : 'U'}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {user?.name || 'Athlete'}
              </h2>
              <Badge variant="emerald">{user?.activityLevel || 'Intermediate'}</Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
            <p className="text-xs text-emerald-500 font-semibold pt-1">
              Primary Goal: {user?.goal || 'Improve Fitness'}
            </p>
          </div>
        </div>

        {/* Automatic BMI Banner */}
        <div className="my-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Calculated Body Mass Index (BMI)
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">
                {liveBmi}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getBmiColor(
                  liveBmiCategory
                )}`}
              >
                {liveBmiCategory}
              </span>
            </div>
          </div>

          <div className="md:col-span-2 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
            <p>
              BMI is calculated automatically from your body mass ({formData.weight} kg) and height ({formData.height} cm).
            </p>
            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] font-semibold">
              <div className={`p-1.5 rounded-lg border ${liveBmiCategory === 'Underweight' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-200 dark:border-slate-800'}`}>
                &lt; 18.5 Underweight
              </div>
              <div className={`p-1.5 rounded-lg border ${liveBmiCategory === 'Normal' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-200 dark:border-slate-800'}`}>
                18.5 – 24.9 Normal
              </div>
              <div className={`p-1.5 rounded-lg border ${liveBmiCategory === 'Overweight' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-slate-200 dark:border-slate-800'}`}>
                25 – 29.9 Overweight
              </div>
              <div className={`p-1.5 rounded-lg border ${liveBmiCategory === 'Obese' ? 'border-rose-500 bg-rose-500/10 text-rose-400' : 'border-slate-200 dark:border-slate-800'}`}>
                &ge; 30 Obese
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details & Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <Input
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
                { label: 'Prefer not to say', value: 'Prefer not to say' },
              ]}
            />

            <Input
              label="Height (cm)"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <Input
              label="Weight (kg)"
              name="weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <Select
              label="Fitness Goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { label: 'Lose Weight', value: 'Lose Weight' },
                { label: 'Gain Muscle', value: 'Gain Muscle' },
                { label: 'Maintain Weight', value: 'Maintain Weight' },
                { label: 'Improve Fitness', value: 'Improve Fitness' },
                { label: 'Increase Strength', value: 'Increase Strength' },
              ]}
            />

            <Select
              label="Activity Level"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { label: 'Beginner', value: 'Beginner' },
                { label: 'Intermediate', value: 'Intermediate' },
                { label: 'Advanced', value: 'Advanced' },
              ]}
            />

            <Input
              label="Daily Calorie Budget"
              name="dailyCalorieTarget"
              type="number"
              value={formData.dailyCalorieTarget}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                Discard Changes
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={submitting}
              >
                Save Profile Changes
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
