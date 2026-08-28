import React from 'react';
import { SystemModule } from '../types';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Camera,
  Menu
} from 'lucide-react';

interface MobileBottomNavigationProps {
  activeModule: SystemModule;
  onSelectModule: (module: SystemModule) => void;
  onOpenDrawer: () => void;
  isDrawerOpen: boolean;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  activeModule,
  onSelectModule,
  onOpenDrawer,
  isDrawerOpen
}) => {
  const { defects, inspections, estimateItems } = useApp();

  const criticalDefects = defects.filter(d => d.severity === 'CRITICAL' && d.status !== 'CLOSED').length;
  const blockedHoldPoints = inspections.filter(i => i.pointType === 'HOLD_POINT' && !i.isHoldPointSatisfied).length;
  const conflictEstimates = estimateItems.filter(e => e.status === 'CONFLICT').length;

  const totalOtherAlerts = criticalDefects + conflictEstimates;

  const navItems: {
    id: SystemModule;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Главная', icon: LayoutDashboard },
    { id: 'projects', label: 'Объекты', icon: Building2 },
    {
      id: 'construction_control',
      label: 'Работы',
      icon: ClipboardCheck,
      badge: blockedHoldPoints > 0 ? blockedHoldPoints : undefined,
      badgeColor: 'bg-red-600'
    },
    { id: 'photo_control', label: 'Фото', icon: Camera }
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Нижняя панель навигации"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 md:hidden shadow-lg pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-14 items-stretch px-1">
        {navItems.map(item => {
          const isActive = activeModule === item.id && !isDrawerOpen;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1 transition-colors min-h-[44px] cursor-pointer ${
                isActive
                  ? 'text-neutral-950 font-bold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'text-neutral-950 stroke-[2.2]' : 'text-neutral-500'}`} />
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white px-0.5 ${
                      item.badgeColor || 'bg-red-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-full ${isActive ? 'font-bold text-neutral-950' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* 5th Tab: "Ещё" (Opens Drawer) */}
        <button
          onClick={onOpenDrawer}
          className={`relative flex flex-col items-center justify-center py-1 px-1 transition-colors min-h-[44px] cursor-pointer ${
            isDrawerOpen
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <div className="relative">
            <Menu className={`h-5 w-5 ${isDrawerOpen ? 'text-neutral-950 stroke-[2.2]' : 'text-neutral-500'}`} />
            {totalOtherAlerts > 0 && (
              <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white px-0.5 bg-amber-600">
                {totalOtherAlerts}
              </span>
            )}
          </div>
          <span className={`text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-full ${isDrawerOpen ? 'font-bold text-neutral-950' : 'font-medium'}`}>
            Ещё
          </span>
        </button>
      </div>
    </nav>
  );
};
