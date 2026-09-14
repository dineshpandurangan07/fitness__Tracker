import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Settings,
  Sun,
  Moon,
  Lock,
  User,
  Bell,
  LogOut,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Local notification preference state
  const [preferences, setPreferences] = useState(() => {
    return {
      soundEnabled: localStorage.getItem('pref_sound') !== 'false',
      workoutReminders: localStorage.getItem('pref_reminders') !== 'false',
      vibration: true,
    };
  });

  const handleTogglePref = (key) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`pref_${key}`, next[key]);
      return next;
    });
    addToast('Preference updated', 'info');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      addToast('Please enter both current and new passwords', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    try {
      setChangingPassword(true);
      const res = await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.success) {
        addToast('Password changed successfully! 🔒', 'success');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Application Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize UI aesthetics, security credentials, and live workout sound preferences.
        </p>
      </div>

      {/* 1. Theme Configuration */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
          Display Appearance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Toggle between athletic Dark Mode and high-contrast Light Mode.
        </p>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Current Theme: <span className="capitalize text-emerald-500">{theme} Mode</span>
            </p>
            <p className="text-xs text-slate-400">
              {theme === 'dark' ? 'Sleek gym dark aesthetic with neon accents' : 'Crisp daylight contrast mode'}
            </p>
          </div>
          <Button onClick={toggleTheme} variant="outline" size="sm">
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
        </div>
      </Card>

      {/* 2. Notification & Audio Preferences */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-400" /> Workout Preferences & Sound
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Configure timers and audio feedback during training sessions.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Rest Timer Completion Chime
              </p>
              <p className="text-xs text-slate-400">
                Play sound notification when rest timer counts down to 00:00
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.soundEnabled}
              onChange={() => handleTogglePref('sound')}
              className="w-5 h-5 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Daily Workout Habit Notifications
              </p>
              <p className="text-xs text-slate-400">
                Reminders to keep your consecutive training streak active
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.workoutReminders}
              onChange={() => handleTogglePref('reminders')}
              className="w-5 h-5 accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* 3. Security & Password Change */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Lock className="w-5 h-5 text-rose-400" /> Change Security Password
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Update your login password securely using bcrypt hashing.
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <Input
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            placeholder="••••••••"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="At least 6 chars"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmNewPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
              placeholder="Repeat password"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={changingPassword}
          >
            Update Password
          </Button>
        </form>
      </Card>

      {/* 4. Account Actions & Logout */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Account Actions
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Session controls and profile navigation.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link to="/profile">
            <Button variant="outline" icon={User}>
              View Full Profile
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            variant="danger"
            icon={LogOut}
          >
            Sign Out of FitPulse
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
