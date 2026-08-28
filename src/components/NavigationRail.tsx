import React from 'react';
import { SystemModule } from '../types';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  FileText,
  FileSpreadsheet,
  Calendar,
  ClipboardCheck,
  Flame,
  Camera,
  AlertOctagon,
  FileCheck2,
  CircleDollarSign,
  Bot,
  Menu,
  Sparkles
} from 'lucide-react';

interface NavigationRailProps {
  activeModule: SystemModule;
  onSelectModule: (module: SystemModule) => void;
  onOpenDrawer: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeModule,
  onSelectModule,
  onOpenDrawer
}) => {
  const { defects, inspections, estimateItems, executiveDocs } = useApp();

  const openDefectsCount = defects.filter(d => d.status !== 'CLOSED').length;
  const criticalDefects = defects.filter(d => d.severity === 'CRITICAL' && d.status !== 'CLOSED').length;
  const blockedHoldPoints = inspections.filter(i => i.pointType === 'HOLD_POINT' && !i.isHoldPointSatisfied).length;
  const conflictEstimates = estimateItems.filter(e => e.status === 'CONFLICT').length;
  const missingExecDocs = executiveDocs.filter(e => e.status === 'MISSING').length;

  const railItems: {
    id: SystemModule;
    label: string;
    icon: React.ElementType;
    badgeCount?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Сводка', icon: LayoutDashboard },
    { id: 'projects', label: 'Объекты', icon: Building2 },
    { id: 'documents', label: 'ПД / РД', icon: FileText },
    {
      id: 'estimates',
      label: 'Сметы',
      icon: FileSpreadsheet,
      badgeCount: conflictEstimates,
      badgeColor: 'bg-amber-500'
    },
    { id: 'schedule', label: 'График', icon: Calendar },
    {
      id: 'construction_control',
      label: 'Контроль',
      icon: ClipboardCheck,
      badgeCount: blockedHoldPoints,
      badgeColor: 'bg-red-600'
    },
    {
      id: 'defects',
      label: 'Дефекты',
      icon: AlertOctagon,
      badgeCount: criticalDefects || openDefectsCount,
      badgeColor: criticalDefects > 0 ? 'bg-red-600' : 'bg-neutral-600'
    },
    { id: 'ovik', label: 'ОВиК', icon: Flame },
    { id: 'photo_control', label: 'Фото', icon: Camera },
    {
      id: 'executive_docs',
      label: 'ИД (АОСР)',
      icon: FileCheck2,
      badgeCount: missingExecDocs,
      badgeColor: 'bg-amber-500'
    },
    { id: 'finance', label: 'КС-2/КС-3', icon: CircleDollarSign },
    { id: 'ai_assistant', label: 'AI Эксперт', icon: Bot }
  ];

  return (
    <aside
      className="hidden md:flex lg:hidden w-16 shrink-0 border-r border-neutral-200 bg-white flex-col justify-between py-3 items-center select-none z-20 min-h-[calc(100vh-57px)]"
      aria-label="Навигационная панель планшета"
    >
      {/* Top Drawer Menu Button */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <button
          onClick={onOpenDrawer}
          title="Открыть полное меню"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors cursor-pointer"
          aria-label="Все разделы"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="h-px w-8 bg-neutral-200 my-1" />
      </div>

      {/* Rail Nav Items */}
      <div className="flex-1 w-full overflow-y-auto px-2 space-y-1.5 py-1">
        {railItems.map(item => {
          const isActive = activeModule === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              title={item.label}
              className={`relative flex h-11 w-11 mx-auto items-center justify-center rounded-xl transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
              {item.badgeCount && item.badgeCount > 0 ? (
                <span
                  className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-bold text-white px-1 ${
                    item.badgeColor || 'bg-red-600'
                  }`}
                >
                  {item.badgeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Bottom info indicator */}
      <div className="w-full px-2 pt-2 border-t border-neutral-100 flex flex-col items-center">
        <span className="text-[9px] font-mono font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded">
          КИТ
        </span>
      </div>
    </aside>
  );
};
