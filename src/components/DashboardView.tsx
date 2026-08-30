import React from 'react';
import { useApp } from '../context/AppContext';
import { SystemModule } from '../types';
import { MobileMessagesBlock } from './MobileMessagesBlock';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileCheck,
  CircleDollarSign,
  ShieldAlert,
  ArrowUpRight,
  Flame,
  Camera,
  Layers,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (module: SystemModule) => void;
  onOpenExecutiveReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenExecutiveReport }) => {
  const {
    activeProject,
    defects,
    inspections,
    estimateItems,
    executiveDocs,
    scheduleTasks,
    risks,
    can
  } = useApp();

  // Metrics
  const criticalDefects = defects.filter(d => d.severity === 'CRITICAL' && d.status !== 'CLOSED');
  const openDefects = defects.filter(d => d.status !== 'CLOSED');
  const overdueDefects = defects.filter(d => d.status !== 'CLOSED' && d.dueDate && new Date(d.dueDate) < new Date());
  const blockedHoldPoints = inspections.filter(i => i.pointType === 'HOLD_POINT' && !i.isHoldPointSatisfied);
  const conflictsCount = estimateItems.filter(e => e.status === 'CONFLICT').length;
  const missingAosrCount = executiveDocs.filter(d => d.status === 'MISSING').length;
  const criticalRisks = risks.filter(r => r.level === 'CRITICAL' || r.level === 'HIGH');
  const delayedTasks = scheduleTasks.filter(t => t.status === 'HOLD_POINT_BLOCKED' || (t.spi && t.spi < 0.9));

  // Dynamic Calculation of Top 10 Executive Actions
  const dynamicTopActions = [
    ...(blockedHoldPoints.map((hp, idx) => ({
      id: `act-hp-${hp.id}`,
      priority: 1 + idx,
      severity: 'CRITICAL' as const,
      title: `Снять блокировку Hold Point: ${hp.location} (${hp.systemName})`,
      impact: 'Остановка последующих смежных строительных процессов и зашивки конструкций',
      responsible: hp.responsibleOrgName || 'Технадзор ООО «КИТ»',
      deadline: 'СЕГОДНЯ',
      module: 'construction_control' as SystemModule,
      actionBtnText: 'Провести освидетельствование'
    }))),
    ...(criticalDefects.map((def, idx) => ({
      id: `act-def-${def.id}`,
      priority: 2 + idx,
      severity: 'CRITICAL' as const,
      title: `Устранить критическое замечание ${def.defectNumber}: ${def.title}`,
      impact: def.spStandardRef || 'Нарушение требований СП и нормативной безопасности',
      responsible: def.assignedContractorName,
      deadline: def.dueDate || 'В течение 24 ч',
      module: 'defects' as SystemModule,
      actionBtnText: 'Открыть дефект'
    }))),
    ...(conflictsCount > 0 ? [{
      id: 'act-est-conflict',
      priority: 4,
      severity: 'HIGH' as const,
      title: `Устранить коллизию объемов РД ↔ Спецификация ↔ Смета (${conflictsCount} поз.)`,
      impact: 'Финансовый перерасход и блокировка актирования КС-2',
      responsible: 'Инженер ПТО / ГИП',
      deadline: '2 дня',
      module: 'estimates' as SystemModule,
      actionBtnText: 'Сверить объемы'
    }] : []),
    ...(missingAosrCount > 0 ? [{
      id: 'act-exec-docs',
      priority: 5,
      severity: 'HIGH' as const,
      title: `Оформить и подписать ${missingAosrCount} недостающих актов АОСР и протоколов`,
      impact: 'Неполнота комплекта ИД для сдачи в Мосгосстройнадзор / Заказчику',
      responsible: 'Генподрядчик / Инженер ПТО',
      deadline: '3 дня',
      module: 'executive_docs' as SystemModule,
      actionBtnText: 'Реестр ИД'
    }] : []),
    ...(delayedTasks.map((task, idx) => ({
      id: `act-task-${task.id}`,
      priority: 6 + idx,
      severity: 'MEDIUM' as const,
      title: `Ликвидировать отставание по критическому пути: ${task.title}`,
      impact: `Отставание от директивного графика (SPI: ${task.spi || '0.78'})`,
      responsible: task.assignedContractorName || 'Генподрядчик',
      deadline: task.finishDate,
      module: 'schedule' as SystemModule,
      actionBtnText: 'График Ганта'
    }))),
    ...(criticalRisks.map((r, idx) => ({
      id: `act-risk-${r.id}`,
      priority: 8 + idx,
      severity: 'HIGH' as const,
      title: `Применить меры снижения риска: ${r.title}`,
      impact: r.mitigationPlan,
      responsible: r.ownerName,
      deadline: r.deadlineDate,
      module: 'risks' as SystemModule,
      actionBtnText: 'План митигации'
    })))
  ].slice(0, 10);

  return (
    <div className="space-y-6 pb-12" id="dashboard-view-root">
      {/* 1. TOP HEADER: "ЧТО ТРЕБУЕТ НЕМЕДЛЕННЫХ ДЕЙСТВИЙ?" */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              ЧТО ТРЕБУЕТ НЕМЕДЛЕННЫХ ДЕЙСТВИЙ?
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Оперативная обстановка по объекту «{activeProject.name}» (ООО «КИТ») на основе перекрестного аудита РД, смет, инспекций, Hold Points и ИД.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('ai_project_analysis')}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 text-white px-3.5 py-2 text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer min-h-[40px]"
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            AI-Анализ Проекта & Смета
          </button>

          <button
            onClick={() => onNavigate('construction_control')}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-3.5 py-2 text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer min-h-[40px]"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Зафиксировать проверку
          </button>

          <button
            onClick={onOpenExecutiveReport}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-800 px-3.5 py-2 text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer min-h-[40px]"
          >
            Сводный отчет Руководителю
          </button>
        </div>
      </div>

      {/* 2. CRITICAL ALERT BANNER (If Hold Point Blocked or Critical Defect) */}
      {(blockedHoldPoints.length > 0 || criticalDefects.length > 0) && (
        <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 text-red-950 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-red-950 uppercase tracking-wide">
                  КРИТИЧЕСКИЙ БЛОКЕР: HOLD POINT НЕ ПРОЙДЕН
                </h3>
                <span className="text-[11px] font-bold bg-red-200 text-red-900 px-2 py-0.5 rounded">
                  РАБОТЫ ОСТАНОВЛЕНЫ
                </span>
              </div>
              <p className="mt-1 text-xs text-red-900 leading-relaxed">
                Испытания контура VRF-1 (падение давления на 0.35 МПа при опрессовке 41.5 бар). Запрещен переход к
                зашивке инженерных шахт Ш-3 и чистовым отделочным работам до подписания повторного протокола опрессовки.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => onNavigate('defects')}
                  className="text-xs font-bold text-red-900 underline hover:text-red-950 flex items-center gap-1"
                >
                  Перейти к дефекту ЗАМ-2024-0104 <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('ovik')}
                  className="text-xs font-semibold text-red-800 hover:text-red-950 flex items-center gap-1"
                >
                  Карточка системы VRF-1 <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 4 KEY PERFORMANCE INDICATORS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Physical Progress */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Физ. Прогресс</span>
            <TrendingUp className="h-4 w-4 text-neutral-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 tracking-tight">
              {activeProject.physicalProgressPercent}%
            </span>
            <span className="text-xs font-medium text-emerald-600">+3.2% за 14 дней</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full bg-neutral-900 rounded-full transition-all"
              style={{ width: `${activeProject.physicalProgressPercent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-neutral-500">
            <span>План: 71.0%</span>
            <span className="font-semibold text-amber-700">Отставание: 4 дн.</span>
          </div>
        </div>

        {/* Financial Progress */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Финансы (КС-2)</span>
            <CircleDollarSign className="h-4 w-4 text-neutral-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 tracking-tight">
              {((activeProject?.acceptedRub ?? 0) / 1000000).toFixed(1)} млн ₽
            </span>
            <span className="text-xs font-medium text-neutral-500">
              из {((activeProject?.budgetContractRub ?? 0) / 1000000).toFixed(0)} млн
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${activeProject?.financialProgressPercent ?? 0}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-neutral-500">
            <span>Принято: {activeProject?.financialProgressPercent ?? 0}%</span>
            <span>Оплачено: {((activeProject?.paidRub ?? 0) / 1000000).toFixed(0)} млн</span>
          </div>
        </div>

        {/* Documentation Readiness */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Готовность ИД</span>
            <FileCheck className="h-4 w-4 text-neutral-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 tracking-tight">
              {activeProject.docCompletenessPercent}%
            </span>
            <span className="text-xs font-medium text-amber-700">
              {missingAosrCount} актов не сдано
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${activeProject.docCompletenessPercent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-neutral-500">
            <span>АОСР: 42/48 шт</span>
            <span>Паспорта: 100%</span>
          </div>
        </div>

        {/* Quality & Defects */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Качество & Дефекты</span>
            <ShieldAlert className="h-4 w-4 text-neutral-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 tracking-tight">
              {openDefects.length} открыто
            </span>
            {criticalDefects.length > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                {criticalDefects.length} КРИТ
              </span>
            )}
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '65%' }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-neutral-500">
            <span>Закрыто: 88%</span>
            <span>Коллизий РД: {conflictsCount}</span>
          </div>
        </div>
      </div>

      {/* 4. TOP 10 ACTIONS (PRIORITIZED OPERATIONAL ACTION MATRIX) */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
              РЕЕСТР ПЕРВООЧЕРЕДНЫХ ДЕЙСТВИЙ (TOP ACTIONS)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Сортировка по степени риска и критичности влияния на ввод объекта
            </p>
          </div>
          <button
            onClick={onOpenExecutiveReport}
            className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1"
          >
            Печать полного реестра <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-3 divide-y divide-neutral-100">
          {dynamicTopActions.map(action => (
            <div
              key={action.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 rounded-lg px-2 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold ${
                    action.severity === 'CRITICAL'
                      ? 'bg-red-600 text-white'
                      : action.severity === 'HIGH'
                      ? 'bg-amber-600 text-white'
                      : 'bg-neutral-800 text-white'
                  }`}
                >
                  #{action.priority}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">{action.title}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        action.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : action.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {action.severity}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-neutral-600">
                    <span className="font-medium text-neutral-900">Влияние: </span>
                    {action.impact}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-neutral-500">
                    <span>Ответственный: <strong className="text-neutral-700">{action.responsible}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-red-700 font-semibold">
                      <Clock className="h-3 w-3" /> Срок: {action.deadline}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate(action.module)}
                className="self-start sm:self-center shrink-0 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors shadow-xs"
              >
                Открыть модуль
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. SPLIT SECTIONS: SCHEDULE PERFORMANCE & RISK MATRIX */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Schedule & Critical Path Mini-Review */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-700" />
              Критический путь & График (SPI)
            </h3>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1"
            >
              Диаграмма Ганта <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {scheduleTasks.slice(0, 3).map(task => (
              <div key={task.id} className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{task.title}</div>
                    <div className="text-[11px] text-neutral-500">
                      WBS: {task.wbsCode} • {task.assignedContractorName}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.status === 'HOLD_POINT_BLOCKED'
                        ? 'bg-red-100 text-red-800'
                        : task.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {task.status === 'HOLD_POINT_BLOCKED' ? 'ЗАБЛОКИРОВАНО (HOLD POINT)' : `${task.progressPercent}%`}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-600">
                  <span>Сроки: {task.startDate} — {task.finishDate}</span>
                  <span className="font-mono font-semibold">SPI: {task.spi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Matrix Mini Preview */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-neutral-700" />
              Матрица проектных рисков
            </h3>
            <button
              onClick={() => onNavigate('risks')}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1"
            >
              Все риски ({risks.length}) <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {risks.map(risk => (
              <div key={risk.id} className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-neutral-900">{risk.title}</div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      risk.level === 'CRITICAL'
                        ? 'bg-red-600 text-white'
                        : risk.level === 'HIGH'
                        ? 'bg-amber-600 text-white'
                        : 'bg-neutral-200 text-neutral-800'
                    }`}
                  >
                    Score: {risk.score} ({risk.level})
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-600 leading-relaxed">{risk.description}</p>
                <div className="mt-2 text-[11px] text-neutral-500 flex items-center justify-between">
                  <span>Владелец: <strong>{risk.ownerName}</strong></span>
                  <span>Срок: {risk.deadlineDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Mobile Messages Block */}
      <div className="block md:hidden">
        <MobileMessagesBlock onNavigate={onNavigate} />
      </div>
    </div>
  );
};
