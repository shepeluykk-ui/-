import React, { useEffect } from 'react';
import { SystemModule } from '../types';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../brand/BrandLogo';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  FileSpreadsheet,
  Calendar,
  Layers,
  ClipboardCheck,
  Flame,
  Camera,
  AlertOctagon,
  FileCheck2,
  Award,
  CircleDollarSign,
  ShieldAlert,
  Bot,
  BrainCircuit,
  History,
  ShieldCheck,
  Database,
  UserCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  activeModule: SystemModule;
  onSelectModule: (module: SystemModule) => void;
  isDrawer?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isDrawer = false,
  onClose
}) => {
  const { defects, inspections, estimateItems, executiveDocs, pendingRegistrationsCount, currentUser } = useApp();

  // Close drawer on Escape key press
  useEffect(() => {
    if (!isDrawer || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawer, onClose]);

  // Badges
  const openDefectsCount = defects.filter(d => d.status !== 'CLOSED').length;
  const criticalDefects = defects.filter(d => d.severity === 'CRITICAL' && d.status !== 'CLOSED').length;
  const blockedHoldPoints = inspections.filter(i => i.pointType === 'HOLD_POINT' && !i.isHoldPointSatisfied).length;
  const conflictEstimates = estimateItems.filter(e => e.status === 'CONFLICT').length;
  const missingExecDocs = executiveDocs.filter(e => e.status === 'MISSING').length;

  const sections: {
    title: string;
    items: {
      id: SystemModule;
      label: string;
      icon: React.ElementType;
      badge?: number | string;
      badgeColor?: string;
    }[];
  }[] = [
    {
      title: 'УПРАВЛЕНИЕ',
      items: [
        { id: 'dashboard', label: 'Сводка / Что делать?', icon: LayoutDashboard },
        { id: 'projects', label: 'Объекты & Площадки', icon: Building2 },
        { id: 'organizations', label: 'Участники строительства', icon: Users }
      ]
    },
    {
      title: 'ДОКУМЕНТЫ И СМЕТЫ',
      items: [
        { id: 'documents', label: 'Архив ПД / РД', icon: FileText },
        {
          id: 'estimates',
          label: 'Сметы & Спецификации',
          icon: FileSpreadsheet,
          badge: conflictEstimates > 0 ? `${conflictEstimates} коллизий` : undefined,
          badgeColor: 'bg-amber-100 text-amber-900'
        },
        { id: 'volume_control', label: 'Контроль объемов', icon: Layers }
      ]
    },
    {
      title: 'ПЛАНИРОВАНИЕ',
      items: [
        { id: 'schedule', label: 'График & WBS (Гант)', icon: Calendar }
      ]
    },
    {
      title: 'СТРОИТЕЛЬНЫЙ КОНТРОЛЬ',
      items: [
        {
          id: 'construction_control',
          label: 'Проверки & Hold Points',
          icon: ClipboardCheck,
          badge: blockedHoldPoints > 0 ? `${blockedHoldPoints} BLOCK` : undefined,
          badgeColor: 'bg-red-100 text-red-800 font-bold'
        },
        {
          id: 'unified_control',
          label: 'Единая модель контроля',
          icon: Layers,
          badge: 'NEW',
          badgeColor: 'bg-emerald-100 text-emerald-800 font-bold'
        },
        {
          id: 'work_types',
          label: 'Виды работ (WORK_TYPE)',
          icon: Building2
        },
        {
          id: 'defects',
          label: 'Дефекты & Замечания',
          icon: AlertOctagon,
          badge: criticalDefects > 0 ? `${criticalDefects} КРИТ!` : openDefectsCount > 0 ? openDefectsCount : undefined,
          badgeColor: criticalDefects > 0 ? 'bg-red-600 text-white font-bold' : 'bg-neutral-200 text-neutral-800'
        },
        { id: 'ovik', label: 'Инженерия ОВиК & VRF', icon: Flame },
        { id: 'photo_control', label: 'Фотофиксация & Оси', icon: Camera }
      ]
    },
    {
      title: 'СДАЧА И ФИНАНСЫ',
      items: [
        {
          id: 'executive_docs',
          label: 'Исполнительная (АОСР)',
          icon: FileCheck2,
          badge: missingExecDocs > 0 ? `${missingExecDocs} нет` : undefined,
          badgeColor: 'bg-amber-100 text-amber-800'
        },
        { id: 'contractors', label: 'Рейтинг подрядчиков', icon: Award },
        { id: 'finance', label: 'Финансы (КС-2 / КС-3)', icon: CircleDollarSign },
        { id: 'risks', label: 'Матрица рисков', icon: ShieldAlert }
      ]
    },
    {
      title: 'AI & АНАЛИТИКА',
      items: [
        { id: 'ai_project_analysis', label: 'AI-Анализ Проекта & Смета', icon: BrainCircuit, badge: 'MULTI-AGENT', badgeColor: 'bg-emerald-600 text-white font-bold' },
        { id: 'ai_assistant', label: 'AI Эксперт & Чат с РД', icon: Bot, badge: 'RAG', badgeColor: 'bg-neutral-900 text-white font-bold' }
      ]
    },
    {
      title: 'БЕЗОПАСНОСТЬ & АУДИТ',
      items: [
        {
          id: 'registration_requests',
          label: 'Заявки на регистрацию',
          icon: UserCheck,
          badge: pendingRegistrationsCount > 0 ? `+${pendingRegistrationsCount}` : undefined,
          badgeColor: 'bg-amber-500 text-black font-black'
        },
        { id: 'audit_log', label: 'Журнал аудита (Log)', icon: History },
        { id: 'security_redteam', label: 'Red Team / Security', icon: ShieldCheck, badge: 'VERIFIED', badgeColor: 'bg-emerald-100 text-emerald-800' },
        { id: 'backup_restore', label: 'Backup & Restore', icon: Database }
      ]
    }
  ];

  const handleItemClick = (id: SystemModule) => {
    onSelectModule(id);
    if (isDrawer && onClose) {
      onClose();
    }
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-5">
        {sections.map(sec => (
          <div key={sec.title}>
            <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {sec.title}
            </div>
            <nav className="space-y-0.5">
              {sec.items.map(item => {
                const isActive = activeModule === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 sm:py-1.5 text-xs font-medium transition-colors cursor-pointer min-h-[44px] sm:min-h-0 ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`ml-1.5 px-1.5 py-0.5 text-[9px] rounded-md tracking-tight shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-neutral-100 pt-3 px-2 text-[10px] text-neutral-500 flex flex-col gap-1 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-800">ООО «КИТ»</span>
          <span className="font-mono text-[9px] bg-cyan-50 text-cyan-800 px-1.5 py-0.5 rounded font-bold">v1.0-RC1</span>
        </div>
        <div className="flex items-center justify-between text-[9px] text-neutral-400">
          <span>СП 48.13330.2019</span>
          <span>СП 73.13330</span>
        </div>
      </div>
    </div>
  );

  // If rendering as Mobile/Tablet Drawer
  if (isDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex lg:hidden" aria-modal="true" role="dialog">
        {/* Backdrop overlay */}
        <div
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onClose}
        />

        {/* Slide-over Drawer Panel */}
        <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-in slide-in-from-left duration-200">
          <div className="flex items-center justify-between p-4 border-b border-neutral-100 sticky top-0 bg-white/95 backdrop-blur-xs z-20">
            <BrandLogo variant="horizontal" size="sm" />
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Закрыть меню"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-3 flex-1 overflow-y-auto">
            {navContent}
          </div>
        </div>
      </div>
    );
  }

  // Standard Desktop Sidebar (>= 1024px)
  return (
    <aside className="hidden lg:flex w-64 shrink-0 border-r border-neutral-200 bg-white min-h-[calc(100vh-57px)] flex-col justify-between p-3 select-none">
      {navContent}
    </aside>
  );
};

