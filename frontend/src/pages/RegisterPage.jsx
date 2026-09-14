import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Flame, ArrowRight, Activity, Ruler, Scale } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import GoogleAuthModal from '../components/common/GoogleAuthModal';

const RegisterPage = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '25',
    gender: 'Male',
    height: '175',
    weight: '70',
    goal: 'Gain Muscle',
    activityLevel: 'Intermediate',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.height || Number(formData.height) <= 0) {
      newErrors.height = 'Valid height (cm) required';
    }
    if (!formData.weight || Number(formData.weight) <= 0) {
      newErrors.weight = 'Valid weight (kg) required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await register({
      ...formData,
      age: Number(formData.age),
      height: Number(formData.height),
      weight: Number(formData.weight),
    });
    setLoading(false);

    if (result.success) {
      addToast(result.message || 'Account created successfully! Please log in with your credentials.', 'success');
      navigate('/login', { state: { email: formData.email } });
    } else {
      if (result.message && /email/i.test(result.message)) {
        setErrors((prev) => ({ ...prev, email: result.message }));
      }
      addToast(result.message || 'Registration failed. Please check your inputs.', 'error');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full space-y-8"
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/25 mb-4">
            <Flame className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Start Your Fitness Journey
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create your personalized athlete account to unlock real-time tracking.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Continue with Google */}
          <button
            type="button"
            onClick={() => setGoogleModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all text-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Register with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold">
                Or Register with Email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Credentials */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 pb-1 border-b border-slate-100 dark:border-slate-800">
                1. Account Credentials
              </h3>
              <Input
                label="Full Name"
                id="name"
                name="name"
                icon={User}
                placeholder="e.g. Alex Hunter"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
              <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                icon={Mail}
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  icon={Lock}
                  placeholder="At least 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />
                <Input
                  label="Confirm Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  icon={Lock}
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                />
              </div>
            </div>

            {/* Physical Metrics */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 pb-1 border-b border-slate-100 dark:border-slate-800">
                2. Physical Metrics & Demographics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Input
                  label="Age"
                  id="age"
                  name="age"
                  type="number"
                  min="10"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Gender"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' },
                    { label: 'Other', value: 'Other' },
                    { label: 'Prefer not to say', value: 'Prefer not to say' },
                  ]}
                />
                <Input
                  label="Height (cm)"
                  id="height"
                  name="height"
                  type="number"
                  min="50"
                  max="250"
                  value={formData.height}
                  onChange={handleChange}
                  error={errors.height}
                  required
                />
                <Input
                  label="Weight (kg)"
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  value={formData.weight}
                  onChange={handleChange}
                  error={errors.weight}
                  required
                />
              </div>
            </div>

            {/* Goals & Activity */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 pb-1 border-b border-slate-100 dark:border-slate-800">
                3. Fitness Goal & Activity Level
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Primary Fitness Goal"
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  options={[
                    { label: 'Gain Muscle', value: 'Gain Muscle' },
                    { label: 'Lose Weight', value: 'Lose Weight' },
                    { label: 'Maintain Weight', value: 'Maintain Weight' },
                    { label: 'Improve Fitness', value: 'Improve Fitness' },
                    { label: 'Increase Strength', value: 'Increase Strength' },
                  ]}
                />
                <Select
                  label="Activity Level"
                  id="activityLevel"
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  options={[
                    { label: 'Beginner (1-2 days/week)', value: 'Beginner' },
                    { label: 'Intermediate (3-4 days/week)', value: 'Intermediate' },
                    { label: 'Advanced (5+ days/week)', value: 'Advanced' },
                  ]}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-4"
            >
              Create Account & Launch Dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-emerald-500 hover:text-emerald-600 hover:underline"
          >
            Log in here
          </Link>
        </p>

        <GoogleAuthModal
          isOpen={googleModalOpen}
          onClose={() => setGoogleModalOpen(false)}
          onSuccess={() => navigate('/dashboard')}
        />
      </motion.div>
    </div>
  );
};

export default RegisterPage;
