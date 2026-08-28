import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, SystemModule } from '../types';
import { BrandLogo } from '../brand/BrandLogo';
import { MobileProfileModal } from './MobileProfileModal';
import {
  Building2,
  Shield,
  Bell,
  HardHat,
  ChevronDown,
  Smartphone,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  Wind,
  Layers,
  MoreHorizontal
} from 'lucide-react';

interface HeaderProps {
  activeModule?: SystemModule;
  onSelectModule?: (module: SystemModule) => void;
  onOpenMobileSite: () => void;
  onOpenExecutiveReport: () => void;
  onOpenDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule = 'dashboard',
  onSelectModule,
  onOpenMobileSite,
  onOpenExecutiveReport,
  onOpenDrawer
}) => {
  const {
    currentUser,
    switchRole,
    projects,
    activeProject,
    setActiveProjectById,
    notifications,
    markNotificationRead,
    markAllNotificationsRead
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileProfile, setShowMobileProfile] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: 'CONSTRUCTION_CONTROL', title: 'Инженер технадзора', desc: 'Строительный контроль, дефекты, Hold Points' },
    { role: 'CHIEF_ENGINEER', title: 'Главный инженер (ГИП)', desc: 'Утверждение РД, коллизии, согласование' },
    { role: 'PTO_ENGINEER', title: 'Инженер ПТО', desc: 'Сметы, объемы, исполнительная документация' },
    { role: 'OVIK_ENGINEER', title: 'Инженер ОВиК', desc: 'Спец. сети, VRF, опрессовка, ПНР' },
    { role: 'FOREMAN', title: 'Прораб / Начальник участка', desc: 'Монтаж, сдача объемов, устранение дефектов' },
    { role: 'CONTRACTOR', title: 'Генподрядчик', desc: 'Управление строительством, графики' },
    { role: 'CUSTOMER', title: 'Технический заказчик', desc: 'Финансы, приемка КС-2/КС-3, надзор' },
    { role: 'SUPER_ADMIN', title: 'Супер-администратор', desc: 'Полный системный доступ ко всем объектам' }
  ];

  // Tier 2 quick navigation items
  const quickNavItems: { id: SystemModule; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Сводка', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    { id: 'defects', label: 'Дефекты', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    { id: 'construction_control', label: 'Технадзор', icon: <HardHat className="h-3.5 w-3.5" /> },
    { id: 'ovik', label: 'ОВиК', icon: <Wind className="h-3.5 w-3.5" /> }
  ];

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-neutral-200 bg-white/95 backdrop-blur-md w-full">
      {/* =========================================================================
          TIER 1 (UPPER BAR): [ Brand: SKKit ] [ Project Selector ] [ Profile ]
          ========================================================================= */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2 min-h-[50px] w-full max-w-full">
        {/* Left: Brand SKKit & Menu toggle */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {onOpenDrawer && (
            <button
              onClick={onOpenDrawer}
              className="flex lg:hidden p-1.5 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors min-h-[38px] min-w-[38px] items-center justify-center cursor-pointer"
              aria-label="Открыть меню навигации"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* СК-КИТ Brand Logo - Minimal Height, No corporate slogan in header */}
          <div
            className="flex items-center gap-1.5 select-none"
            title="СК-КИТ — Строительный Контроль"
          >
            <BrandLogo
              variant="compact"
              brandText="СК-КИТ"
              size="sm"
              showSubtitle={false}
            />
          </div>
        </div>

        {/* Center: Compact Project Selector with Isolation */}
        <div className="relative flex-1 max-w-[200px] xs:max-w-[240px] sm:max-w-[280px] md:max-w-[320px] mx-2">
          <button
            onClick={() => {
              setShowProjectDropdown(!showProjectDropdown);
              setShowRoleDropdown(false);
              setShowNotifications(false);
            }}
            className="w-full flex items-center justify-between gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/90 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-100 transition-colors min-h-[38px] cursor-pointer"
            aria-label="Выбор объекта"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
              <div className="text-left min-w-0">
                <div className="font-semibold truncate text-[11px] sm:text-xs">
                  {activeProject.name}
                </div>
                <div className="text-[9px] text-neutral-500 truncate hidden xs:block">
                  {activeProject.code}
                </div>
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-neutral-400 shrink-0 ml-1" />
          </button>

          {/* Project Dropdown */}
          {showProjectDropdown && (
            <div className="fixed sm:absolute left-3 sm:left-0 top-[52px] sm:top-full mt-1.5 w-[calc(100vw-24px)] sm:w-80 max-w-sm rounded-xl border border-neutral-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                <span>Объекты строительства</span>
                <span className="text-[10px] text-cyan-600 font-bold font-mono">RBAC ISOLATION</span>
              </div>
              <div className="mt-1 space-y-1 max-h-72 overflow-y-auto">
                {projects.map(p => {
                  const isCurrent = p.id === activeProject.id;
                  const isAllowed = currentUser.role === 'SUPER_ADMIN' || (currentUser.allowedProjectIds && currentUser.allowedProjectIds.includes(p.id));

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProjectById(p.id);
                        setShowProjectDropdown(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start justify-between min-h-[44px] cursor-pointer ${
                        isCurrent
                          ? 'bg-neutral-900 text-white'
                          : isAllowed
                          ? 'hover:bg-neutral-100 text-neutral-800'
                          : 'opacity-50 hover:bg-red-50 text-neutral-400'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold truncate">{p.name}</div>
                        <div className={`text-[10px] truncate ${isCurrent ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {p.code} • Прогресс: {p.physicalProgressPercent}%
                        </div>
                      </div>
                      {!isAllowed && (
                        <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                          NO ACCESS
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Actions, Notifications, Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Executive Report (Desktop/Tablet) */}
          <button
            onClick={onOpenExecutiveReport}
            className="hidden md:flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-xs min-h-[38px] cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-neutral-600" />
            <span className="hidden lg:inline">Отчет ГИП</span>
          </button>

          {/* Mobile Site Mode (Desktop/Tablet) */}
          <button
            onClick={onOpenMobileSite}
            title="Режим на объекте"
            className="hidden sm:flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-200 transition-colors min-h-[38px] cursor-pointer"
          >
            <Smartphone className="h-3.5 w-3.5 text-neutral-700" />
            <span className="hidden xl:inline">Режим на объекте</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowRoleDropdown(false);
                setShowProjectDropdown(false);
              }}
              className="relative p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              aria-label="Уведомления"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed sm:absolute right-3 sm:right-0 top-[52px] sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-96 max-w-sm rounded-xl border border-neutral-200 bg-white p-3 shadow-2xl z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">УВЕДОМЛЕНИЯ</span>
                    {unreadCount > 0 && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                        {unreadCount} новых
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 cursor-pointer"
                    >
                      Прочитать все
                    </button>
                  )}
                </div>

                <div className="mt-2 max-h-80 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400">Нет новых уведомлений</div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          notif.isRead
                            ? 'border-neutral-100 bg-white text-neutral-600'
                            : notif.severity === 'CRITICAL'
                            ? 'border-red-200 bg-red-50/70 text-red-950 font-medium'
                            : 'border-amber-200 bg-amber-50/70 text-amber-950 font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="font-semibold text-[11px] flex items-center gap-1.5">
                            {notif.severity === 'CRITICAL' ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            )}
                            {notif.title}
                          </div>
                          <span className="text-[9px] text-neutral-400 whitespace-nowrap">{notif.createdAt}</span>
                        </div>
                        <div className="mt-1 text-[11px] leading-relaxed opacity-90">{notif.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Button (Mobile opens MobileProfileModal, Desktop opens Role switch dropdown) */}
          <div className="relative">
            {/* Desktop profile button */}
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowProjectDropdown(false);
                setShowNotifications(false);
              }}
              className="hidden md:flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-1 pl-2.5 hover:bg-neutral-50 transition-colors min-h-[38px] cursor-pointer"
              aria-label="Профиль и сменя роли"
            >
              <div className="text-right">
                <div className="text-xs font-semibold text-neutral-900 leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="text-[10px] font-medium text-neutral-500 flex items-center justify-end gap-1">
                  <Shield className="h-2.5 w-2.5 text-neutral-600" />
                  {currentUser.role}
                </div>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-white text-xs font-bold shrink-0">
                {currentUser.fullName.charAt(0)}
              </div>
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            </button>

            {/* Mobile profile button (Compact Avatar / Icon) */}
            <button
              onClick={() => setShowMobileProfile(true)}
              className="flex md:hidden items-center justify-center h-8 w-8 rounded-lg bg-neutral-900 text-white text-xs font-bold shadow-xs hover:bg-neutral-800 transition-transform active:scale-95 cursor-pointer"
              aria-label="Открыть мобильный профиль"
              title={currentUser.fullName}
            >
              {currentUser.fullName.charAt(0)}
            </button>

            {/* Desktop Role Switcher Dropdown */}
            {showRoleDropdown && (
              <div className="fixed sm:absolute right-3 sm:right-0 top-[52px] sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-80 max-w-sm rounded-xl border border-neutral-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in">
                <div className="p-2 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{currentUser.fullName}</div>
                    <div className="text-[10px] text-neutral-500">{currentUser.organizationName}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      setShowMobileProfile(true);
                    }}
                    className="text-[10px] text-cyan-600 hover:underline font-semibold cursor-pointer"
                  >
                    Профиль →
                  </button>
                </div>

                <div className="mt-1 max-h-72 overflow-y-auto space-y-1">
                  <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Переключение роли (RBAC)
                  </div>
                  {rolesList.map(item => {
                    const isCurrent = currentUser.role === item.role;
                    return (
                      <button
                        key={item.role}
                        onClick={() => {
                          switchRole(item.role);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start gap-2 min-h-[40px] cursor-pointer ${
                          isCurrent
                            ? 'bg-neutral-900 text-white'
                            : 'hover:bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        <HardHat className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${isCurrent ? 'text-white' : 'text-neutral-500'}`} />
                        <div>
                          <div className="font-semibold text-[11px]">{item.title}</div>
                          <div className={`text-[10px] ${isCurrent ? 'text-neutral-300' : 'text-neutral-500'}`}>
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          TIER 2 (LOWER BAR): Mobile Horizontal Navigation [ Сводка | Дефекты | Технадзор | ОВиК | Ещё ]
          ========================================================================= */}
      <div className="flex md:hidden border-t border-neutral-200/80 bg-neutral-50/95 px-2.5 py-1.5 overflow-x-auto no-scrollbar touch-pan-x w-full">
        <div className="flex items-center gap-1.5 w-max">
          {quickNavItems.map(item => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule && onSelectModule(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer min-h-[34px] ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200/70'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* "Ещё" tab to open full drawer */}
          <button
            onClick={onOpenDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200/70 transition-all cursor-pointer min-h-[34px]"
            aria-label="Все разделы системы"
          >
            <MoreHorizontal className="h-3.5 w-3.5 text-neutral-500" />
            <span>Ещё</span>
          </button>
        </div>
      </div>

      {/* Mobile Profile Modal */}
      <MobileProfileModal
        isOpen={showMobileProfile}
        onClose={() => setShowMobileProfile(false)}
        onOpenSettings={() => {
          if (onSelectModule) onSelectModule('audit_log');
        }}
      />
    </header>
  );
};
