import React, { useState } from 'react';
import { Mail, Lock, KeyRound, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1: Email, 2: Reset Code & New Password
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleResetState = () => {
    setStep(1);
    setEmail('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setGeneratedCode('');
  };

  const handleClose = () => {
    handleResetState();
    onClose();
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      addToast('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.success) {
      addToast('Password reset code generated! 🔑', 'success');
      if (result.resetToken) {
        setGeneratedCode(result.resetToken);
        setResetToken(result.resetToken);
      }
      setStep(2);
    } else {
      addToast(result.message, 'error');
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (!resetToken.trim()) {
      addToast('Please enter the 6-digit reset code', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    const result = await confirmPasswordReset({
      email,
      resetToken,
      newPassword,
    });
    setLoading(false);

    if (result.success) {
      addToast('Password reset successful! You can now log in.', 'success');
      handleClose();
    } else {
      addToast(result.message, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Your Password">
      {step === 1 ? (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your registered email address below. We'll generate a secure reset code to verify your identity.
          </p>

          <Input
            label="Registered Email Address"
            id="resetEmail"
            name="email"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Get Reset Code <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleConfirmReset} className="space-y-4">
          {generatedCode && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
              <span className="font-bold flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4" /> Reset Verification Code:
              </span>
              <p className="font-mono text-base font-black text-center tracking-widest my-1 bg-white dark:bg-slate-900 py-1.5 rounded-lg border border-emerald-500/30">
                {generatedCode}
              </p>
              <p className="text-[11px] opacity-80 text-center">
                Code pre-filled below for instant verification.
              </p>
            </div>
          )}

          <Input
            label="6-Digit Reset Code"
            id="resetToken"
            name="resetToken"
            type="text"
            icon={KeyRound}
            placeholder="e.g. 849201"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            required
          />

          <Input
            label="New Password"
            id="newPassword"
            name="newPassword"
            type="password"
            icon={Lock}
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            icon={Lock}
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              ← Back to Email
            </button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Set New Password <CheckCircle2 className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;
