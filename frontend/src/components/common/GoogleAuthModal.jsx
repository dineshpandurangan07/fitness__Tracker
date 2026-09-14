import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from './Modal';
import Button from './Button';

const GoogleAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { googleLogin } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleConfigured = Boolean(
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '853179439869-ajf7rk0r8ddj4f56uplu1j2jc2imk782.apps.googleusercontent.com'
  );

  // Real Google OAuth — triggers the native Google account picker popup
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        // Fetch real user profile using the access token
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

        if (result.success) {
          addToast(`Welcome, ${result.user.name}! Signed in with Google 🚀`, 'success');
          onClose();
          if (onSuccess) onSuccess();
        } else {
          setError(result.message || 'Google Sign-In failed. Please try again.');
        }
      } catch (err) {
        setError('Failed to fetch Google profile. Please try again.');
      }
      setLoading(false);
    },
    onError: (err) => {
      console.error('Google OAuth error:', err);
      setError('Google Sign-In was cancelled or failed. Please try again.');
      setLoading(false);
    },
    flow: 'implicit',
  });

  const handleGoogleClick = () => {
    if (!googleConfigured) return;
    setError('');
    setLoading(true);
    // The popup opens and loading will be cleared by onSuccess/onError
    triggerGoogleLogin();
    // Reset loading in case popup is closed without completing
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Continue with Google">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 border border-blue-500/20 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Secure Google Authentication
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            A Google account picker will open. Select your real Google account to sign in or create an account instantly.
          </p>
        </div>

        {/* Real Google Sign-In Button */}
        <motion.button
          type="button"
          onClick={handleGoogleClick}
          disabled={!googleConfigured || loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 py-4 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-blue-400/60 text-slate-800 dark:text-white font-bold shadow-md hover:shadow-xl transition-all text-sm group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 shrink-0 animate-spin text-blue-500" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>{loading ? 'Opening Google...' : 'Sign in with Google'}</span>
          {!loading && (
            <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          )}
        </motion.button>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Your real Google accounts will appear in the popup. No password needed.</span>
        </div>

        {/* Cancel Button */}
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GoogleAuthModal;
