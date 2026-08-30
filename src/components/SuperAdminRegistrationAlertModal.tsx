import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RegistrationRequest } from '../types';
import {
  ShieldAlert,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building2,
  Briefcase,
  User,
  Clock,
  ExternalLink,
  X,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface SuperAdminRegistrationAlertModalProps {
  request: RegistrationRequest;
  onClose: () => void;
  onNavigateToRequests: () => void;
}

export const SuperAdminRegistrationAlertModal: React.FC<SuperAdminRegistrationAlertModalProps> = ({
  request,
  onClose,
  onNavigateToRequests
}) => {
  const { approveRegistrationRequest, rejectRegistrationRequest } = useApp();

  const [loading, setLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [actionSuccess, setActionSuccess] = useState<{
    type: 'approved' | 'rejected';
    message: string;
    devOtp?: string;
  } | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setRejectError('');
    try {
      const res = await approveRegistrationRequest(request.id);
      if (res.success) {
        setActionSuccess({
          type: 'approved',
          message: `Заявка пользователя ${request.fullName} (${request.login}) успешно одобрена.`,
          devOtp: res.devOtp
        });
      } else {
        setRejectError(res.error || 'Ошибка при одобрении заявки');
      }
    } catch (err: any) {
      setRejectError(err.message || 'Сетевая ошибка при одобрении заявки');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Укажите обязательную причину отклонения заявки');
      return;
    }
    setLoading(true);
    setRejectError('');
    try {
      const res = await rejectRegistrationRequest(request.id, rejectReason.trim());
      if (res.success) {
        setActionSuccess({
          type: 'rejected',
          message: `Заявка пользователя ${request.fullName} отклонена. Причина: ${rejectReason.trim()}`
        });
      } else {
        setRejectError(res.error || 'Ошибка при отклонении заявки');
      }
    } catch (err: any) {
      setRejectError(err.message || 'Сетевая ошибка при отклонении заявки');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Только что';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      id="super-admin-registration-alert-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-amber-300 overflow-hidden my-6 flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* Top Emergency Indicator Strip */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 bg-amber-50/80 border-b border-amber-200">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0 ring-4 ring-amber-100">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 border border-amber-300">
                  <Radio className="h-3 w-3 text-amber-700 animate-pulse" />
                  Уведомление супер-администратора
                </span>
                <span className="text-xs text-neutral-500">
                  {formatDateTime(request.createdAt)}
                </span>
              </div>
              <h2 id="alert-modal-title" className="text-lg font-black text-neutral-950 mt-1 uppercase tracking-tight">
                Новая заявка на регистрацию
              </h2>
            </div>
          </div>

          <button
            id="btn-close-alert-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-amber-100/60 transition-colors cursor-pointer"
            title="Закрыть уведомление"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Success State */}
        {actionSuccess ? (
          <div className="p-8 text-center space-y-5 bg-white">
            <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center shadow-sm ${
              actionSuccess.type === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {actionSuccess.type === 'approved' ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : (
                <UserX className="h-8 w-8" />
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-neutral-950">
                {actionSuccess.type === 'approved' ? 'Заявка успешно одобрена' : 'Заявка отклонена'}
              </h3>
              <p className="text-xs text-neutral-600 mt-1.5 max-w-md mx-auto leading-relaxed">
                {actionSuccess.message}
              </p>
            </div>

            {/* OTP Dev Notification info */}
            {actionSuccess.devOtp && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 max-w-md mx-auto text-left">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <KeyRound className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>Код подтверждения (Режим разработки / DEV MODE):</span>
                </div>
                <div className="mt-2 flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-amber-300">
                  <span className="font-mono text-lg font-black tracking-widest text-neutral-900">
                    {actionSuccess.devOtp}
                  </span>
                  <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                    TTL: 10 минут
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1.5 leading-tight">
                  Внешний почтовый/SMS-шлюз не настроен (Real Code Dispatch = BLOCKED). Код сгенерирован локально для завершения верификации.
                </p>
              </div>
            )}

            <div className="pt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
              >
                Понятно, закрыть
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToRequests();
                }}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-800 font-bold text-xs hover:bg-neutral-50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Реестр всех заявок</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Main Request Review Content */
          <div className="p-6 bg-white space-y-6 flex-1 overflow-y-auto">
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Login */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                  <User className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="font-medium">Логин в системе:</span>
                </div>
                <div className="font-mono font-bold text-sm text-neutral-900 pl-5.5">
                  {request.login}
                </div>
              </div>

              {/* Full Name */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="font-medium">ФИО пользователя:</span>
                </div>
                <div className="font-bold text-sm text-neutral-900 pl-5.5">
                  {request.fullName}
                </div>
              </div>

              {/* Email */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                  <Mail className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="font-medium">Электронная почта (Email):</span>
                </div>
                <div className="font-medium text-xs text-neutral-900 pl-5.5 break-all">
                  {request.email}
                </div>
              </div>

              {/* Phone */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                  <Phone className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="font-medium">Номер телефона:</span>
                </div>
                <div className="font-mono font-medium text-xs text-neutral-900 pl-5.5">
                  {request.phone || 'Не указан'}
                </div>
              </div>

              {/* Organization */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                  <Building2 className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="font-medium">Организация / Компания:</span>
                </div>
                <div className="font-semibold text-xs text-neutral-900 pl-5.5">
                  {request.organization}
                </div>
              </div>

              {/* Position & Role */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                  <Briefcase className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="font-medium">Должность и роль:</span>
                </div>
                <div className="font-medium text-xs text-neutral-900 pl-5.5 flex items-center gap-1.5 flex-wrap">
                  <span>{request.position}</span>
                  <span className="text-[10px] font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded">
                    {request.role || 'По умолчанию'}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message Callout */}
            {rejectError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{rejectError}</span>
              </div>
            )}

            {/* Reject Form Mode */}
            {rejectMode ? (
              <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="reject-reason-input" className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                    <UserX className="h-4 w-4 text-red-700" />
                    <span>Укажите обязательную причину отклонения заявки:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectMode(false);
                      setRejectReason('');
                      setRejectError('');
                    }}
                    className="text-xs text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
                  >
                    Отмена
                  </button>
                </div>
                <textarea
                  id="reject-reason-input"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Например: Не подтверждено членство в организации / Некорректные данные"
                  rows={2}
                  className="w-full text-xs p-3 rounded-lg border border-red-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={loading}
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectMode(false);
                      setRejectReason('');
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    Назад
                  </button>
                  <button
                    id="btn-confirm-reject-alert"
                    type="button"
                    onClick={handleConfirmReject}
                    disabled={loading || !rejectReason.trim()}
                    className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    {loading ? 'Обработка...' : 'Подтвердить отклонение'}
                  </button>
                </div>
              </div>
            ) : (
              /* Modal Footer Action Buttons */
              <div className="border-t border-neutral-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    id="btn-open-requests-registry"
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToRequests();
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Открыть реестр заявок</span>
                    <ExternalLink className="h-3.5 w-3.5 text-neutral-500" />
                  </button>

                  <button
                    id="btn-dismiss-alert"
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Отложить
                  </button>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    id="btn-reject-alert"
                    type="button"
                    onClick={() => setRejectMode(true)}
                    disabled={loading}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    <span>Отклонить</span>
                  </button>

                  <button
                    id="btn-approve-alert"
                    type="button"
                    onClick={handleApprove}
                    disabled={loading}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>{loading ? 'Одобрение...' : 'Одобрить заявку'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
