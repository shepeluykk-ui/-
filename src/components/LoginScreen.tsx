import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../brand/BrandLogo';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ShieldCheck,
  HardHat,
  ArrowRight,
  UserPlus,
  KeyRound
} from 'lucide-react';
import { INITIAL_USERS } from '../data/initialData';
import { RegistrationForm } from './RegistrationForm';
import { RegistrationConfirmation } from './RegistrationConfirmation';

export const LoginScreen: React.FC = () => {
  const { login, authLoading, sessionExpiredMessage, clearSessionExpiredMessage } = useApp();
  
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'verify'>('login');
  const [verificationLogin, setVerificationLogin] = useState('');
  const [verificationRequestId, setVerificationRequestId] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const activeError = localError || sessionExpiredMessage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearSessionExpiredMessage();

    if (!username.trim()) {
      setLocalError('Введите имя пользователя или email');
      return;
    }

    const result = await login(username.trim(), password);
    if (!result.success) {
      setLocalError(result.error || 'Неверное имя пользователя или пароль');
    }
  };

  const handleSelectQuickUser = (userEmail: string) => {
    setUsername(userEmail);
    setPassword('skkit2024');
    setLocalError(null);
    clearSessionExpiredMessage();
  };

  if (viewMode === 'register') {
    return (
      <RegistrationForm
        onBackToLogin={() => setViewMode('login')}
        onGoToVerification={(loginOrEmail, reqId) => {
          if (loginOrEmail) setVerificationLogin(loginOrEmail);
          if (reqId) setVerificationRequestId(reqId);
          setViewMode('verify');
        }}
      />
    );
  }

  if (viewMode === 'verify') {
    return (
      <RegistrationConfirmation
        initialLoginOrEmail={verificationLogin}
        initialRequestId={verificationRequestId}
        onBackToLogin={() => setViewMode('login')}
        onGoToRegister={() => setViewMode('register')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center px-3 py-6 sm:p-6 relative overflow-x-hidden w-full max-w-full selection:bg-cyan-500 selection:text-black">
      {/* Background Subtle Gradient & Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-950/30 via-neutral-900 to-neutral-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto">
        {/* Main Login Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/95 p-5 sm:p-8 backdrop-blur-xl shadow-2xl">
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3">
              <BrandLogo variant="symbol-only" size="md" theme="dark" animated />
            </div>
            
            <div className="flex items-baseline tracking-tight font-black text-2xl sm:text-3xl">
              <span className="text-white font-black tracking-tight">СК-</span>
              <span className="text-cyan-400 font-black tracking-tight">КИТ</span>
            </div>
            
            <div className="text-[11px] sm:text-xs font-bold text-neutral-400 tracking-widest uppercase mt-1">
              СТРОИТЕЛЬНЫЙ КОНТРОЛЬ
            </div>
          </div>

          {/* Alert Message */}
          {activeError && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{activeError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Login */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Имя пользователя / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (activeError) {
                      setLocalError(null);
                      clearSessionExpiredMessage();
                    }
                  }}
                  placeholder="a.voronov@stroycontrol.pro"
                  autoComplete="username"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 pl-9 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[44px]"
                  disabled={authLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (activeError) {
                      setLocalError(null);
                      clearSessionExpiredMessage();
                    }
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 pl-9 pr-10 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[44px]"
                  disabled={authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition-colors cursor-pointer min-w-[40px] justify-center"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold py-3 text-sm transition-all shadow-lg shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[46px] mt-2"
            >
              {authLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>ВХОД В СИСТЕМУ...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>ВОЙТИ</span>
                </>
              )}
            </button>
          </form>

          {/* Registration Entry Button & Verification Link */}
          <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-2">
            <button
              type="button"
              onClick={() => setViewMode('register')}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-750 text-neutral-100 font-bold py-2.5 text-xs transition-all border border-neutral-700 hover:border-cyan-500/40 cursor-pointer min-h-[44px]"
            >
              <UserPlus className="h-4 w-4 text-cyan-400" />
              <span>РЕГИСТРАЦИЯ</span>
            </button>

            <div className="flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={() => setViewMode('verify')}
                className="text-xs text-neutral-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
              >
                <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                <span>Ввести код подтверждения регистрации</span>
              </button>
            </div>
          </div>

          {/* Quick Demo User Switcher */}
          <div className="mt-5 pt-4 border-t border-neutral-800">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center justify-between">
              <span>Быстрый выбор сотрудника</span>
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {INITIAL_USERS.slice(0, 5).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectQuickUser(u.email)}
                  className="w-full text-left p-2 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/50 hover:border-neutral-600 transition-all flex items-center justify-between cursor-pointer min-h-[40px] text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-neutral-200 truncate">{u.fullName}</div>
                    <div className="text-[10px] text-cyan-400/90 truncate flex items-center gap-1">
                      <HardHat className="h-2.5 w-2.5 shrink-0" />
                      {u.role}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

