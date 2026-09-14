import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, ArrowRight, Zap, X, Flame, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from './Button';
import Input from './Input';

const QuickAuthGateModal = ({ isOpen, onClose, onSuccess }) => {
  const { googleLogin, fastMailLogin } = useAuth();
  const { addToast } = useToast();

  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const googleConfigured = Boolean(
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '853179439869-ajf7rk0r8ddj4f56uplu1j2jc2imk782.apps.googleusercontent.com'
  );
  const displayError = error.includes('Configure a valid MONGO_URI')
    ? 'Fast login is temporarily unavailable. Please configure MongoDB in Vercel.'
    : error;

  // Real Google OAuth — opens native Google account picker popup
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      try {
        // Fetch the real user profile from Google
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await profileRes.json();

        const result = await googleLogin({
          email: profile.email,
          name: profile.name,
          googleId: profile.sub,
          profileImage: profile.picture,
          accessToken: tokenResponse.access_token,
        });

        setGoogleLoading(false);

        if (result.success) {
          addToast(`Welcome, ${result.user.name}! Signed in with Google 🚀`, 'success');
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        } else {
          setError(result.message || 'Google Sign-In failed. Please try again.');
        }
      } catch (err) {
        setGoogleLoading(false);
        setError('Failed to get Google profile. Please try again.');
      }
    },
    onError: () => {
      setGoogleLoading(false);
      setError('Google Sign-In was cancelled or failed. Please try again.');
    },
    flow: 'implicit',
  });

  const handleGoogleClick = () => {
    if (!googleConfigured) return;
    setError('');
    setGoogleLoading(true);
    triggerGoogleLogin();
    // Reset loading if popup closes without action
    setTimeout(() => setGoogleLoading(false), 5000);
  };

  const handleFastMailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!emailInput.trim() || !/\S+@\S+\.\S+/.test(emailInput)) {
      setError('Please enter a valid email address (e.g., user@gmail.com)');
      return;
    }

    setLoading(true);
    const result = await fastMailLogin(emailInput);
    setLoading(false);

    if (result.success) {
      addToast(`Logged in instantly as ${result.user.name}! ⚡`, 'success');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else {
      const message = result.message || 'Login failed. Please try again.';
      setError(message);
      addToast(message, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
        >
          {/* Decorative Top Gradient Bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="p-6 sm:p-8 space-y-5">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <Flame className="w-6 h-6 fill-current" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome to FitPulse
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Sign in with your real Google account or enter your Mail ID for instant access.
              </p>
            </div>

            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-sm text-amber-600 dark:text-amber-400"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{displayError}</span>
              </motion.div>
            )}

            {/* PRIMARY: Real Continue with Google Button */}
            <div className="space-y-3">
              <motion.button
                type="button"
                onClick={handleGoogleClick}
                disabled={!googleConfigured || googleLoading || loading}
                whileHover={{ scale: googleLoading ? 1 : 1.01 }}
                whileTap={{ scale: googleLoading ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-blue-400/60 text-slate-800 dark:text-white font-bold shadow-md hover:shadow-xl transition-all text-sm group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 shrink-0 animate-spin text-blue-500" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>{googleLoading ? 'Opening Google...' : 'Continue with Google'}</span>
                {!googleLoading && (
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                )}
              </motion.button>

              {/* Security note */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Your real Google accounts appear in the popup — no password needed</span>
              </div>
            </div>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white dark:bg-[#0f172a] px-3 text-slate-400 font-bold tracking-wider">
                  Or Fast Login with Mail ID
                </span>
              </div>
            </div>

            {/* FAST MAIL ID FORM */}
            <form onSubmit={handleFastMailSubmit} className="space-y-3">
              <Input
                label="Your Mail ID"
                id="quickEmailInput"
                type="email"
                icon={Mail}
                placeholder="enter.your.mail@gmail.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (error) setError('');
                }}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                disabled={loading || googleLoading}
                className="w-full shadow-lg shadow-emerald-500/20"
              >
                Fast Login with Mail ID <Zap className="w-4 h-4 ml-1 fill-current" />
              </Button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline transition-colors"
              >
                Continue browsing without logging in
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickAuthGateModal;
