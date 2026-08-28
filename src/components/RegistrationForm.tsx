import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../brand/BrandLogo';
import {
  User,
  Phone,
  Mail,
  Building2,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { RegistrationFormData } from '../types';

interface RegistrationFormProps {
  onBackToLogin: () => void;
  onGoToVerification: (loginOrEmail?: string, requestId?: string) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onBackToLogin,
  onGoToVerification
}) => {
  const { submitRegistration } = useApp();

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    phone: '',
    email: '',
    organization: '',
    position: '',
    login: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ message: string; requestId?: string } | null>(null);

  const handleChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const validate = (): string | null => {
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      return 'Укажите полное ФИО сотрудника (не менее 3 символов)';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return 'Укажите корректный номер телефона (не менее 10 цифр)';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      return 'Укажите корректный e-mail адрес';
    }
    if (!formData.organization.trim() || formData.organization.trim().length < 2) {
      return 'Укажите наименование вашей организации';
    }
    if (!formData.position.trim() || formData.position.trim().length < 2) {
      return 'Укажите вашу занимаемую должность';
    }
    if (!formData.login.trim() || formData.login.trim().length < 3) {
      return 'Логин должен содержать не менее 3 символов';
    }
    if (/\s/.test(formData.login.trim())) {
      return 'Логин не должен содержать пробелов';
    }
    if (!formData.password || formData.password.length < 6) {
      return 'Пароль должен быть не менее 6 символов';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Пароль и подтверждение пароля не совпадают';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await submitRegistration(formData);
      if (!result.success) {
        setErrorMessage(result.error || 'Ошибка при отправке заявки');
      } else {
        setSuccessResult({
          message: result.message || 'Заявка на регистрацию успешно подана!',
          requestId: result.requestId
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Произошла непредвиденная ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center px-3 py-6 sm:p-6 relative overflow-x-hidden w-full max-w-full selection:bg-cyan-500 selection:text-black">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-950/30 via-neutral-900 to-neutral-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg sm:max-w-xl mx-auto">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/95 p-5 sm:p-8 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-800">
            <button
              type="button"
              onClick={onBackToLogin}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-neutral-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Назад к авторизации</span>
            </button>
            <div className="flex items-center gap-2">
              <BrandLogo variant="symbol-only" size="sm" theme="dark" />
              <span className="text-xs font-bold text-neutral-300">Регистрация в СК-КИТ</span>
            </div>
          </div>

          {/* Success State */}
          {successResult ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="h-16 w-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto text-cyan-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Заявка принята в обработку
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md mx-auto">
                  {successResult.message}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-4 text-left text-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Номер заявки:</span>
                  <span className="font-mono text-cyan-400 font-bold">{successResult.requestId || 'Создана'}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Логин сотрудника:</span>
                  <span className="font-semibold text-white">{formData.login}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>E-mail для кода:</span>
                  <span className="font-semibold text-white">{formData.email}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Текущий статус:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    PENDING (На рассмотрении)
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => onGoToVerification(formData.login, successResult.requestId)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold py-3 text-sm transition-all shadow-lg shadow-cyan-900/30 cursor-pointer min-h-[46px]"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Ввести код подтверждения</span>
                </button>
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="w-full py-2.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Вернуться на экран входа
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Form Info Title */}
              <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Новый пользователь
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Заполните анкету для подключения к системе строительного контроля
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{errorMessage}</div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* ФИО */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    ФИО сотрудника <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                      placeholder="Иванов Иван Иванович"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Grid 2-col: Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Телефон <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        placeholder="+7 (999) 000-00-00"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Электронная почта <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => handleChange('email', e.target.value)}
                        placeholder="engineer@company.pro"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Grid 2-col: Organization & Position */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Организация <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.organization}
                        onChange={e => handleChange('organization', e.target.value)}
                        placeholder="ООО «СпецМонтаж»"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Должность <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.position}
                        onChange={e => handleChange('position', e.target.value)}
                        placeholder="Инженер ПТО / Технадзор"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Login */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Логин в системе <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.login}
                      onChange={e => handleChange('login', e.target.value)}
                      placeholder="i.ivanov"
                      autoComplete="username"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Grid 2-col: Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Пароль <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={e => handleChange('password', e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 pl-9 pr-9 py-2 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Подтверждение пароля <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={e => handleChange('confirmPassword', e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 pl-9 pr-9 py-2 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-white cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold py-3 text-sm transition-all shadow-lg shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[46px] mt-4"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>ОТПРАВКА ЗАЯВКИ...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>ПОДАТЬ ЗАЯВКУ НА РЕГИСТРАЦИЮ</span>
                    </>
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-5 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
                <button
                  type="button"
                  onClick={() => onGoToVerification()}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer py-1"
                >
                  <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Уже одобрена заявка? Ввести код</span>
                </button>

                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="hover:text-white transition-colors cursor-pointer py-1"
                >
                  Уже есть аккаунт? Войти
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
