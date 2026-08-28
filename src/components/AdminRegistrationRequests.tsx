import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  Briefcase,
  User,
  ShieldCheck,
  AlertTriangle,
  Send,
  Calendar,
  KeyRound
} from 'lucide-react';
import { RegistrationRequest, RegistrationStatus } from '../types';

export const AdminRegistrationRequests: React.FC = () => {
  const {
    registrationRequests,
    fetchRegistrationRequests,
    approveRegistrationRequest,
    rejectRegistrationRequest
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'ALL'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string; devOtp?: string } | null>(null);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchRegistrationRequests();
    setLoading(false);
  };

  const handleApprove = async (request: RegistrationRequest) => {
    setActionFeedback(null);
    setActionLoadingId(request.id);
    try {
      const res = await approveRegistrationRequest(request.id);
      if (res.success) {
        setActionFeedback({
          type: 'success',
          message: `Заявка ${request.fullName} (${request.login}) одобрена. Код подтверждения отправлен на ${request.email}.`,
          devOtp: res.devOtp
        });
      } else {
        setActionFeedback({
          type: 'error',
          message: res.error || 'Ошибка при одобрении заявки'
        });
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRejectModal = (request: RegistrationRequest) => {
    setSelectedRequest(request);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    setActionFeedback(null);
    setActionLoadingId(selectedRequest.id);
    try {
      const res = await rejectRegistrationRequest(selectedRequest.id, rejectReason);
      if (res.success) {
        setActionFeedback({
          type: 'success',
          message: `Заявка ${selectedRequest.fullName} отклонена.`
        });
        setShowRejectModal(false);
        setSelectedRequest(null);
      } else {
        setActionFeedback({
          type: 'error',
          message: res.error || 'Ошибка при отклонении заявки'
        });
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter requests
  const filteredRequests = registrationRequests.filter(req => {
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || (
      req.fullName.toLowerCase().includes(q) ||
      req.login.toLowerCase().includes(q) ||
      req.email.toLowerCase().includes(q) ||
      req.organization.toLowerCase().includes(q) ||
      req.position.toLowerCase().includes(q) ||
      req.phone.includes(q)
    );
    return matchesStatus && matchesQuery;
  });

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <Clock className="h-3 w-3" />
            На рассмотрении (PENDING)
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Send className="h-3 w-3" />
            Одобрено (Код отправлен)
          </span>
        );
      case 'VERIFIED':
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" />
            Активирован (ACTIVE)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="h-3 w-3" />
            Отклонено (REJECTED)
          </span>
        );
      default:
        return null;
    }
  };

  const pendingCount = registrationRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = registrationRequests.filter(r => r.status === 'APPROVED').length;
  const activeCount = registrationRequests.filter(r => r.status === 'ACTIVE' || r.status === 'VERIFIED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Заявки на регистрацию
            </h1>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-black">
                +{pendingCount}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Контролируемый процесс допуска пользователей: проверка анкеты, одобрение и генерация OTP-кодов
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 cursor-pointer transition-all disabled:opacity-50 min-h-[40px]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          className={`flex items-start justify-between gap-3 p-4 rounded-xl border text-xs animate-in fade-in ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-red-950/40 border-red-500/30 text-red-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-semibold">{actionFeedback.message}</div>
              {actionFeedback.devOtp && (
                <div className="inline-flex items-center gap-1.5 font-mono text-[11px] bg-neutral-900/80 px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-300">
                  <KeyRound className="h-3 w-3" />
                  <span>Код (OTP для теста): <strong>{actionFeedback.devOtp}</strong></span>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Всего заявок</div>
          <div className="text-xl font-black text-white mt-1">{registrationRequests.length}</div>
        </div>
        <div className="bg-neutral-900 border border-amber-500/20 bg-amber-500/[0.02] rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Ожидают проверки</div>
          <div className="text-xl font-black text-amber-400 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-neutral-900 border border-sky-500/20 bg-sky-500/[0.02] rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">Одобрено (OTP)</div>
          <div className="text-xl font-black text-sky-400 mt-1">{approvedCount}</div>
        </div>
        <div className="bg-neutral-900 border border-emerald-500/20 bg-emerald-500/[0.02] rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Активировано</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{activeCount}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по ФИО, логину, e-mail, организации или должности..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[40px]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'PENDING', 'APPROVED', 'ACTIVE', 'REJECTED'] as const).map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[40px] ${
                statusFilter === st
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {st === 'ALL' && 'Все статусы'}
              {st === 'PENDING' && `На рассмотрении (${pendingCount})`}
              {st === 'APPROVED' && 'Одобрено'}
              {st === 'ACTIVE' && 'Активированы'}
              {st === 'REJECTED' && 'Отклонены'}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 text-center">
          <UserCheck className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-300">Заявки не найдены</h3>
          <p className="text-xs text-neutral-500 mt-1">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Попробуйте изменить параметры поиска или фильтрации'
              : 'В настоящее время новые заявки на регистрацию отсутствуют'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(req => {
            const isProcessing = actionLoadingId === req.id;
            return (
              <div
                key={req.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 sm:p-5 hover:border-neutral-700 transition-all space-y-3.5"
              >
                {/* Top row: Name, Role badge, Status, Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-white">
                        {req.fullName}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="text-xs text-cyan-400 font-mono mt-0.5">
                      Логин: @{req.login}
                    </div>
                  </div>

                  {/* Actions for PENDING and APPROVED */}
                  <div className="flex items-center gap-2">
                    {req.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(req)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50 cursor-pointer min-h-[38px]"
                        >
                          {isProcessing ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5" />
                          )}
                          <span>ОДОБРИТЬ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(req)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-neutral-700 hover:border-rose-800/50 font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer min-h-[38px]"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          <span>Отклонить</span>
                        </button>
                      </>
                    )}

                    {req.status === 'APPROVED' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(req)}
                          disabled={isProcessing}
                          title="Сгенерировать и отправить новый OTP код"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/40 text-sky-400 hover:text-sky-300 border border-sky-800/40 text-xs font-semibold transition-all cursor-pointer min-h-[36px]"
                        >
                          <Send className="h-3 w-3" />
                          <span>Выслать OTP повторно</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-neutral-300 bg-neutral-800/40 p-2 rounded-lg">
                    <Building2 className="h-4 w-4 text-neutral-500 shrink-0" />
                    <span className="truncate" title={req.organization}>{req.organization}</span>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-300 bg-neutral-800/40 p-2 rounded-lg">
                    <Briefcase className="h-4 w-4 text-neutral-500 shrink-0" />
                    <span className="truncate" title={req.position}>{req.position}</span>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-300 bg-neutral-800/40 p-2 rounded-lg">
                    <Mail className="h-4 w-4 text-neutral-500 shrink-0" />
                    <span className="truncate" title={req.email}>{req.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-300 bg-neutral-800/40 p-2 rounded-lg">
                    <Phone className="h-4 w-4 text-neutral-500 shrink-0" />
                    <span className="truncate">{req.phone}</span>
                  </div>
                </div>

                {/* Meta info & Audit footprint */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-neutral-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Подано: {req.createdAt ? new Date(req.createdAt).toLocaleString('ru-RU') : '—'}
                    </span>
                    {req.reviewedBy && (
                      <span className="text-neutral-400">
                        Проверил: <strong>{req.reviewedBy}</strong>
                      </span>
                    )}
                  </div>

                  {req.rejectionReason && (
                    <div className="text-rose-400 font-medium">
                      Причина отказа: {req.rejectionReason}
                    </div>
                  )}

                  {req.otpExpiresAt && (
                    <div className="text-sky-400 font-mono">
                      OTP активен до: {new Date(req.otpExpiresAt).toLocaleTimeString('ru-RU')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserX className="h-5 w-5 text-rose-500" />
                <span>Отклонить заявку на регистрацию</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="text-neutral-500 hover:text-white cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-neutral-300">
              Вы уверены, что хотите отклонить заявку пользователя{' '}
              <strong className="text-white">{selectedRequest.fullName}</strong> ({selectedRequest.email})?
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Причина отклонения (необязательно)
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Например: Не подтверждена принадлежность к указанной подрядной организации"
                rows={3}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer min-h-[40px]"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoadingId === selectedRequest.id}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer min-h-[40px]"
              >
                {actionLoadingId === selectedRequest.id ? 'Отклонение...' : 'Подтвердить отклонение'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
