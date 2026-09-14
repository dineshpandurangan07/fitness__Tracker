import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Flame, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const PublicLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
              Fit<span className="text-emerald-500">Pulse</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="/#features" className="hover:text-emerald-500 transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="hover:text-emerald-500 transition-colors">
              How It Works
            </a>
            <Link to="/exercises" className="hover:text-emerald-500 transition-colors">
              Exercise Library
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-500" />
              )}
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm" variant="primary">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button size="sm" variant="ghost">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" variant="primary">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Public Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              Fit<span className="text-emerald-500">Pulse</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            &copy; {new Date().getFullYear()} FitPulse Tracker. Built for athletes, lifters, and everyday achievers.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/login" className="hover:text-emerald-500">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-emerald-500">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
