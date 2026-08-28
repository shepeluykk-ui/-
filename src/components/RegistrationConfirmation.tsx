import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../brand/BrandLogo';
import {
  KeyRound,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  Clock,
  LogIn
} from 'lucide-react';

interface RegistrationConfirmationProps {
  initialLoginOrEmail?: string;
  initialRequestId?: string;
  onBackToLogin: () => void;
  onGoToRegister: () => void;
}

export const RegistrationConfirmation: React.FC<RegistrationConfirmationProps> = ({
  initialLoginOrEmail = '',
  initialRequestId = '',
  onBackToLogin,
  onGoToRegister
}) => {
  const { verifyRegistrationCode, resendRegistrationCode } = useApp();

  const [loginOrEmail, setLoginOrEmail] = useState(initialLoginOrEmail);
  const [code, setCode] = useState('');
  const [requestId, setRequestId] = useState(initialRequestId);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Rate limiting countdown for resend (60 seconds)
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginOrEmail.trim()) {
      setErrorMessage('Укажите ваш логин или e-mail');
      return;
    }

    const cleanCode = code.replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setErrorMessage('Код подтверждения должен состоять ровно из 6 цифр');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyRegistrationCode({
        requestId: requestId || undefined,
        loginOrEmail: loginOrEmail.trim(),
        code: cleanCode
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Неверный код подтверждения');
        if (typeof res.remainingAttempts === 'number') {
          setRemainingAttempts(res.remainingAttempts);
        }
      } else {
        setIsVerified(true);
        setSuccessMessage(res.message || 'Регистрация успешно подтверждена! Аккаунт активирован.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка при подтверждении');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || resendLoading) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginOrEmail.trim()) {
      setErrorMessage('Укажите ваш логин или e-mail для повторной отправки кода');
      return;
    }

    setResendLoading(true);
    try {
      const res = await resendRegistrationCode({
        requestId: requestId || undefined,
        loginOrEmail: loginOrEmail.trim()
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Не удалось повторно отправить код');
        if (res.retryAfter) {
          setResendCountdown(res.retryAfter);
        }
      } else {
        setSuccessMessage(res.message || 'Новый код подтверждения успешно отправлен на e-mail');
        setResendCountdown(60);
        setRemainingAttempts(5);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка отправки');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center px-3 py-6 sm:p-6 relative overflow-x-hidden w-full max-w-full selection:bg-cyan-500 selection:text-black">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-950/30 via-neutral-900 to-neutral-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/95 p-5 sm:p-8 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-800">
            <button
              type="button"
              onClick={onBackToLogin}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-neutral-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Назад ко входу</span>
            </button>
            <BrandLogo variant="symbol-only" size="sm" theme="dark" />
          </div>

          {/* Success State (ACTIVE) */}
          {isVerified ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">
                  Аккаунт успешно активирован
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {successMessage}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-3.5 text-left text-xs space-y-1.5">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Статус учетной записи:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    ACTIVE (Активен)
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Логин:</span>
                  <span className="font-semibold text-white">{loginOrEmail}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold py-3 text-sm transition-all shadow-lg shadow-cyan-900/30 cursor-pointer min-h-[46px] mt-3"
              >
                <LogIn className="h-4 w-4" />
                <span>ВОЙТИ В СИСТЕМУ</span>
              </button>
            </div>
          ) : (
            <>
              {/* Info Title */}
              <div className="mb-5">
                <div className="h-10 w-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400 mb-3">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Код подтверждения
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Введите 6-значный одноразовый код, отправленный на ваш e-mail после одобрения заявки администратором (срок действия: 10 мин.)
                </p>
              </div>

              {/* Success Alert */}
              {successMessage && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{successMessage}</div>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">
                    {errorMessage}
                    {remainingAttempts !== null && remainingAttempts > 0 && (
                      <div className="mt-1 text-[11px] text-red-300">
                        Осталось попыток: {remainingAttempts}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleVerify} className="space-y-4">
                {/* Login or Email */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Логин или E-mail сотрудника
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginOrEmail}
                      onChange={e => setLoginOrEmail(e.target.value)}
                      placeholder="m.grigoryev / mail@company.pro"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 pl-9 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                {/* 6-Digit OTP Code */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      6-значный код из письма
                    </label>
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      10 минут
                    </span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="1 2 3 4 5 6"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] text-cyan-400 placeholder-neutral-600 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[52px]"
                  />
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold py-3 text-sm transition-all shadow-lg shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[46px]"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>ПРОВЕРКА КОДА...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>ПОДТВЕРДИТЬ И АКТИВИРОВАТЬ</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resend Code Section */}
              <div className="mt-5 pt-4 border-t border-neutral-800 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCountdown > 0 || resendLoading}
                  className="text-xs text-cyan-400 hover:text-cyan-300 disabled:text-neutral-500 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed py-1"
                >
                  <RotateCcw className={`h-3.5 w-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                  {resendCountdown > 0 ? (
                    <span>Повторный код через {resendCountdown} сек.</span>
                  ) : (
                    <span>Отправить код повторно</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onGoToRegister}
                  className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer py-1"
                >
                  Еще не подавали заявку? Зарегистрироваться
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
