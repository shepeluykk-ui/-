import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, MapPin, Calendar, CircleDollarSign, CheckCircle2 } from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const { projects, activeProject, setActiveProjectById, currentUser } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            РЕЕСТР СТРОИТЕЛЬНЫХ ОБЪЕКТОВ И ПЛОЩАДОК
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Управление объектами с поддержкой строгой изоляции данных (Tenant / Project Isolation).
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(p => {
          const isActive = p.id === activeProject.id;
          const isAllowed = currentUser.role === 'SUPER_ADMIN' || currentUser.allowedProjectIds.includes(p.id);

          return (
            <div
              key={p.id}
              className={`rounded-xl border p-6 bg-white shadow-xs space-y-4 transition-all ${
                isActive ? 'border-neutral-900 ring-2 ring-neutral-900' : 'border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                    {p.code}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 mt-1.5">{p.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                    <MapPin className="h-3 w-3 text-neutral-400" />
                    <span>{p.address}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2.5 py-0.5 rounded uppercase font-mono ${
                    isActive ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {isActive ? 'АКТИВНЫЙ ОБЪЕКТ' : p.status}
                </span>
              </div>

              {/* Progress & Budget */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-700">
                  <span>Физическая готовность</span>
                  <strong className="font-mono">{p.physicalProgressPercent}%</strong>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${p.physicalProgressPercent}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">Бюджет договора</span>
                  <strong className="text-neutral-900">{(((p.budgetContractRub ?? 0)) / 1000000).toFixed(1)} млн ₽</strong>
                </div>
                <div className="p-2.5 rounded bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">Сроки реализации</span>
                  <strong className="text-neutral-900 font-mono text-[11px]">{p.startDate} — {p.plannedFinishDate}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  Исполнительная документация: <strong>{p.docCompletenessPercent}%</strong>
                </span>

                {isAllowed ? (
                  <button
                    onClick={() => setActiveProjectById(p.id)}
                    disabled={isActive}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-neutral-100 text-neutral-400 cursor-default'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs'
                    }`}
                  >
                    {isActive ? 'Выбран' : 'Переключиться на объект'}
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                    НЕТ ДОСТУПА (RBAC)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
