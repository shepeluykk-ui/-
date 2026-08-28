import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProjectRisk } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  Layers,
  Search,
  Filter
} from 'lucide-react';

export const RisksView: React.FC = () => {
  const { risks } = useApp();
  const [selectedRisk, setSelectedRisk] = useState<ProjectRisk>(risks[0] || null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            МАТРИЦА И РЕЕСТР ПРОЕКТНЫХ РИСКОВ (5&times;5)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Количественная оценка рисков (Вероятность &times; Влияние) и мониторинг компенсационных мероприятий.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-neutral-900 text-white px-3 py-1.5 rounded-lg shadow-xs">
            Активных рисков: {risks.length}
          </span>
        </div>
      </div>

      {/* 5x5 Visual Risk Matrix Grid */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
          Карта позиционирования рисков (5&times;5)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Matrix Graphic */}
          <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/50">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 mb-2">
              <span>Вероятность (1 - 5) &uarr;</span>
              <span>Влияние на срок / бюджет (1 - 5) &rarr;</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center text-xs font-mono font-bold">
              {/* Row 5 */}
              <div className="p-2.5 rounded bg-amber-200 text-amber-900">5</div>
              <div className="p-2.5 rounded bg-amber-300 text-amber-950">10</div>
              <div className="p-2.5 rounded bg-red-400 text-white">15</div>
              <div className="p-2.5 rounded bg-red-500 text-white">20</div>
              <div className="p-2.5 rounded bg-red-700 text-white ring-2 ring-red-900">25 (R-1)</div>

              {/* Row 4 */}
              <div className="p-2.5 rounded bg-emerald-200 text-emerald-900">4</div>
              <div className="p-2.5 rounded bg-amber-200 text-amber-900">8</div>
              <div className="p-2.5 rounded bg-amber-300 text-amber-950">12 (R-2)</div>
              <div className="p-2.5 rounded bg-red-400 text-white">16</div>
              <div className="p-2.5 rounded bg-red-600 text-white">20</div>

              {/* Row 3 */}
              <div className="p-2.5 rounded bg-emerald-100 text-emerald-900">3</div>
              <div className="p-2.5 rounded bg-emerald-200 text-emerald-900">6</div>
              <div className="p-2.5 rounded bg-amber-200 text-amber-900">9</div>
              <div className="p-2.5 rounded bg-amber-300 text-amber-950">12</div>
              <div className="p-2.5 rounded bg-red-500 text-white">15</div>

              {/* Row 2 */}
              <div className="p-2.5 rounded bg-emerald-50 text-emerald-900">2</div>
              <div className="p-2.5 rounded bg-emerald-100 text-emerald-900">4</div>
              <div className="p-2.5 rounded bg-emerald-200 text-emerald-900">6</div>
              <div className="p-2.5 rounded bg-amber-200 text-amber-900">8</div>
              <div className="p-2.5 rounded bg-amber-300 text-amber-950">10</div>

              {/* Row 1 */}
              <div className="p-2.5 rounded bg-emerald-50 text-emerald-900">1</div>
              <div className="p-2.5 rounded bg-emerald-50 text-emerald-900">2</div>
              <div className="p-2.5 rounded bg-emerald-100 text-emerald-900">3</div>
              <div className="p-2.5 rounded bg-emerald-200 text-emerald-900">4</div>
              <div className="p-2.5 rounded bg-amber-200 text-amber-900">5</div>
            </div>
          </div>

          {/* Matrix Legend */}
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-950">
              <strong className="block font-bold">Критическая зона (15 - 25):</strong>
              Требует немедленного вмешательства Руководства проекта и приостановки рискованных работ.
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-950">
              <strong className="block font-bold">Зона повышенного внимания (8 - 14):</strong>
              Усиленный контроль инженерами технадзора и ПТО.
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
              <strong className="block font-bold">Приемлемый уровень (1 - 6):</strong>
              Стандартный операционный мониторинг.
            </div>
          </div>
        </div>
      </div>

      {/* Risks Registry */}
      <div className="space-y-3">
        {risks.map(risk => {
          const isCritical = risk.level === 'CRITICAL';

          return (
            <div
              key={risk.id}
              className={`p-5 rounded-xl border bg-white shadow-xs space-y-3 ${
                isCritical ? 'border-red-300' : 'border-neutral-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      isCritical ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    Score: {risk.score} ({risk.level})
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900">{risk.title}</h4>
                </div>

                <span className="text-[10px] font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-mono uppercase">
                  Стратегия: {risk.strategy}
                </span>
              </div>

              <p className="text-xs text-neutral-700 leading-relaxed">{risk.description}</p>

              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100 text-xs">
                <span className="font-bold text-neutral-900">Компенсационные мероприятия: </span>
                <span className="text-neutral-800">{risk.mitigationPlan}</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                <span>Владелец риска: <strong>{risk.ownerName}</strong> ({risk.ownerRole})</span>
                <span className="flex items-center gap-1 text-red-700 font-semibold">
                  <Clock className="h-3 w-3" /> Срок реализации мер: {risk.deadlineDate}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
