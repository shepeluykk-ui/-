import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  X,
  User,
  Shield,
  Building2,
  Settings,
  LogOut,
  CheckCircle2,
  HardHat,
  Briefcase,
  Award
} from 'lucide-react';

interface MobileProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export const MobileProfileModal: React.FC<MobileProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings
}) => {
  const { currentUser, activeProject, switchRole, logout } = useApp();

  if (!isOpen) return null;

  const roleTitles: Record<UserRole, string> = {
    CONSTRUCTION_CONTROL: 'Инженер технадзора / Строительный контроль',
    CHIEF_ENGINEER: 'Главный инженер проекта (ГИП)',
    PTO_ENGINEER: 'Инженер ПТО',
    OVIK_ENGINEER: 'Инженер спец. систем ОВиК',
    FOREMAN: 'Прораб / Начальник участка',
    CONTRACTOR: 'Генеральный подрядчик',
    CUSTOMER: 'Технический заказчик / Инвестор',
    SUPER_ADMIN: 'Главный системный администратор',
    ADMIN: 'Администратор системы',
    PROJECT_DIRECTOR: 'Директор проекта',
    PROJECT_MANAGER: 'Руководитель проекта',
    ELECTRICAL_ENGINEER: 'Инженер ЭОМ',
    SUBCONTRACTOR: 'Субподрядчик',
    VIEWER: 'Аудитор / Наблюдатель'
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-cyan-600" />
            <span className="text-sm font-bold text-neutral-900 uppercase tracking-tight">
              Профиль пользователя
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Закрыть профиль"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Card Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Avatar & Name */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-lg font-bold shadow-md shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-neutral-900 text-sm leading-tight truncate">
                {currentUser.fullName}
              </h3>
              <p className="text-xs text-neutral-500 truncate mt-0.5">
                {currentUser.email}
              </p>
              {currentUser.phone && (
                <p className="text-[11px] text-neutral-400 truncate">
                  {currentUser.phone}
                </p>
              )}
            </div>
          </div>

          {/* Role & Org Info */}
          <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-200/80 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <Shield className="h-3.5 w-3.5 text-cyan-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] uppercase font-semibold text-neutral-400">
                  Роль (RBAC)
                </div>
                <div className="font-bold text-neutral-800">
                  {roleTitles[currentUser.role] || currentUser.role}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1 border-t border-neutral-200/50">
              <Briefcase className="h-3.5 w-3.5 text-neutral-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-semibold text-neutral-400">
                  Организация
                </div>
                <div className="font-medium text-neutral-800 truncate">
                  {currentUser.organizationName || 'ООО «ТехНадзор Экспертиза»'}
                </div>
              </div>
            </div>

            {currentUser.certificateNumber && (
              <div className="flex items-start gap-2 pt-1 border-t border-neutral-200/50">
                <Award className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-semibold text-neutral-400">
                    Реестр специалистов
                  </div>
                  <div className="font-medium text-neutral-800 truncate font-mono text-[11px]">
                    {currentUser.certificateNumber}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current Project */}
          <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-200/80 text-xs">
            <div className="flex items-start gap-2">
              <Building2 className="h-3.5 w-3.5 text-cyan-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-semibold text-neutral-400">
                  Текущий объект
                </div>
                <div className="font-bold text-neutral-900 truncate">
                  {activeProject.name}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                  {activeProject.code} • Прогресс: {activeProject.physicalProgressPercent}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 flex flex-col gap-2">
          {onOpenSettings && (
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer min-h-[44px]"
            >
              <Settings className="h-3.5 w-3.5 text-neutral-500" />
              <span>Настройки профиля</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 border border-red-200 transition-colors cursor-pointer min-h-[44px]"
          >
            <LogOut className="h-3.5 w-3.5 text-red-600" />
            <span>ВЫЙТИ ИЗ СИСТЕМЫ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
