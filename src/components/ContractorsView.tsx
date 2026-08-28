import React from 'react';
import { useApp } from '../context/AppContext';
import { Award, AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert, Users } from 'lucide-react';

export const ContractorsView: React.FC = () => {
  const { contractorScores } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            РЕЙТИНГ И KPI ПОДРЯДНЫХ ОРГАНИЗАЦИЙ
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Комплексная оценка качества, соблюдения графика (SPI), устранения дефектов и сдачи ИД.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-neutral-100 text-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200">
            Методика оценки: 5 критериев
          </span>
        </div>
      </div>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contractorScores.map(score => {
          const isAtRisk = score.overallScore < 75;

          return (
            <div
              key={score.id}
              className={`rounded-xl border p-6 bg-white shadow-xs space-y-5 ${
                isAtRisk ? 'border-amber-300 ring-1 ring-amber-100' : 'border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">{score.organizationName}</h3>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Специализация: {score.workScope}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className={`text-2xl font-bold ${isAtRisk ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {score.overallScore}
                    </span>
                    <span className="text-xs text-neutral-400">/ 100</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      score.grade === 'A'
                        ? 'bg-emerald-100 text-emerald-800'
                        : score.grade === 'B'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    Класс {score.grade}
                  </span>
                </div>
              </div>

              {/* 5 Criteria Bars */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-neutral-700 mb-1">
                    <span>Качество монтажа (отсутствие брака)</span>
                    <strong className="font-mono">{score.qualityScore}%</strong>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${score.qualityScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-neutral-700 mb-1">
                    <span>Соблюдение календарного графика (SPI)</span>
                    <strong className="font-mono">{score.scheduleAdherenceScore}% (SPI: {score.spiIndex})</strong>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${score.scheduleAdherenceScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-neutral-700 mb-1">
                    <span>Своевременность сдачи ИД (АОСР)</span>
                    <strong className="font-mono">{score.docDisciplineScore}%</strong>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${score.docDisciplineScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-neutral-700 mb-1">
                    <span>Охрана труда и техника безопасности (ОТ и ТБ)</span>
                    <strong className="font-mono">{score.safetyScore}%</strong>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${score.safetyScore}%` }} />
                  </div>
                </div>
              </div>

              {/* Open Remarks Count */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Открытых предписаний:</span>
                <span className={`font-bold ${score.openDefectsCount > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                  {score.openDefectsCount} замечаний
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
