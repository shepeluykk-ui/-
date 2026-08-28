import React from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../brand/BrandLogo';
import { Printer, Download, X, AlertTriangle, CheckCircle2, Building2, Clock, ShieldCheck } from 'lucide-react';

interface ManagerReportModalProps {
  onClose: () => void;
}

export const ManagerReportModal: React.FC<ManagerReportModalProps> = ({ onClose }) => {
  const { activeProject, defects, inspections, estimateItems, executiveDocs, risks } = useApp();

  const criticalDefects = defects.filter(d => d.severity === 'CRITICAL' && d.status !== 'CLOSED');
  const blockedHoldPoints = inspections.filter(i => i.pointType === 'HOLD_POINT' && !i.isHoldPointSatisfied);
  const conflictsCount = estimateItems.filter(e => e.status === 'CONFLICT').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-4 sm:p-8 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto animate-in zoom-in-95">
        {/* Top Modal Controls */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4 print:hidden gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] sm:text-xs font-mono font-bold bg-neutral-900 text-white px-2 py-0.5 rounded truncate">
              ОТЧЕТ РУКОВОДИТЕЛЮ
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-neutral-500 hidden xs:inline truncate">
              Генерация от {new Date().toLocaleDateString('ru-RU')}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-2.5 sm:px-3.5 py-1.5 text-xs font-bold hover:bg-neutral-800 shadow-xs cursor-pointer min-h-[36px]"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Печать / Сохранить в PDF</span>
              <span className="sm:hidden">Печать</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Executive Report Content */}
        <div className="space-y-6 text-neutral-900">
          {/* Header */}
          <div className="border-b-2 border-neutral-900 pb-4">
            <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
              <BrandLogo variant="full" size="md" />
              <div className="text-left sm:text-right text-[10px] text-neutral-500 font-mono">
                <div>СТАНДАРТ СП 48.13330.2019</div>
                <div>РЕГИСТРАЦИЯ: {activeProject.code}/ОТЧ-01</div>
              </div>
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-widest">
              СЛУЖБА СТРОИТЕЛЬНОГО КОНТРОЛЯ И ТЕХНИЧЕСКОГО НАДЗОРА
            </div>
            <h1 className="text-base sm:text-xl font-bold mt-1 text-neutral-900 leading-snug">
              СВОДНЫЙ ОПЕРАТИВНЫЙ ОТЧЕТ ДИРЕКТОРУ СТРОИТЕЛЬСТВА / ГИП
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-neutral-600 font-medium gap-1">
              <div>Объект: <strong>{activeProject.name} ({activeProject.code})</strong></div>
              <div>Адрес: {activeProject.address}</div>
              <div>Дата формирования: {new Date().toLocaleDateString('ru-RU')}</div>
            </div>
          </div>

          {/* Section 1: Executive KPI Table */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              1. КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ СТРОИТЕЛЬСТВА (KPI)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                <span className="text-[10px] text-neutral-500 font-bold uppercase">Физ. готовность</span>
                <div className="text-base sm:text-lg font-bold text-neutral-900 mt-0.5">{activeProject.physicalProgressPercent}%</div>
                <div className="text-[10px] text-amber-700 font-semibold">Отставание: 4 дня</div>
              </div>

              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                <span className="text-[10px] text-neutral-500 font-bold uppercase">Освоение средств</span>
                <div className="text-base sm:text-lg font-bold text-neutral-900 mt-0.5">{(((activeProject?.acceptedRub ?? 0)) / 1000000).toFixed(1)} млн ₽</div>
                <div className="text-[10px] text-neutral-500">{activeProject?.financialProgressPercent ?? 0}% от лимита</div>
              </div>

              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                <span className="text-[10px] text-neutral-500 font-bold uppercase">Комплектность ИД</span>
                <div className="text-base sm:text-lg font-bold text-neutral-900 mt-0.5">{activeProject.docCompletenessPercent}%</div>
                <div className="text-[10px] text-amber-700 font-semibold">{executiveDocs.filter(d => d.status === 'MISSING').length} актов не сдано</div>
              </div>

              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                <span className="text-[10px] text-neutral-500 font-bold uppercase">Качество / Дефекты</span>
                <div className="text-base sm:text-lg font-bold text-red-600 mt-0.5">{criticalDefects.length} КРИТ</div>
                <div className="text-[10px] text-neutral-500">Всего открыто: {defects.filter(d => d.status !== 'CLOSED').length}</div>
              </div>
            </div>
          </div>

          {/* Section 2: Critical Blockers & Hold Points */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/70 text-xs text-red-950 space-y-2">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wide">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              2. КРИТИЧЕСКИЕ БЛОКИРОВКИ И ОСТАНОВКИ РАБОТ (HOLD POINTS)
            </div>
            <p className="leading-relaxed">
              • <strong>Система VRF-1 (Шахта Ш-3, этаж 3):</strong> Испытания на герметичность (опрессовка 41.5 бар) не пройдены. Зафиксировано падение давления манометра на 0.35 МПа из-за некачественной пайки рефнета. <strong>Технологический останов:</strong> запрещена зашивка шахт и чистовая отделка до подписания повторного акта опрессовки.
            </p>
            <p className="leading-relaxed">
              • <strong>Коллизия объемов РД и ЛС:</strong> Дефицит медной трубы Ø28×1.5 в локальной смете (учтено 150 м, по РД требуется 220 м). Блокирует подписание КС-2 за август.
            </p>
          </div>

          {/* Section 3: Prioritized Top 5 Action Matrix */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              3. ПЕРВООЧЕРЕДНЫЕ ДЕЙСТВИЯ (TOP PRIORITY ACTIONS)
            </h2>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden min-w-[540px]">
                <thead className="bg-neutral-100 text-neutral-700 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">№</th>
                    <th className="py-2.5 px-3">Мероприятие</th>
                    <th className="py-2.5 px-3">Ответственный</th>
                    <th className="py-2.5 px-3">Срок</th>
                    <th className="py-2.5 px-3 text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="py-2.5 px-3 font-bold">1</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">Устранение свища на контуре VRF-1 и повторная опрессовка 41.5 бар</td>
                    <td className="py-2.5 px-3">ООО «ВентКлиматМонтаж» (Петров)</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-red-600">25.08.2024</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-700">В работе</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">2</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">Корректировка локальной сметы ЛС-04-01/2024 (добавление 70 м трубы Ø28)</td>
                    <td className="py-2.5 px-3">Инженер ПТО Смирнова / ГИП</td>
                    <td className="py-2.5 px-3 font-mono">28.08.2024</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-700">Согласование</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">3</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">Повторная приемка огнезащиты воздуховода ДУ-1 (4 этаж)</td>
                    <td className="py-2.5 px-3">Инженер технадзора Воронов А. М.</td>
                    <td className="py-2.5 px-3 font-mono">26.08.2024</td>
                    <td className="py-2.5 px-3 text-right font-bold text-neutral-700">Назначено</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="pt-8 border-t border-neutral-300 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="font-bold text-neutral-900">Инженер строительного контроля (Технадзор):</div>
              <div className="mt-4 border-b border-neutral-400 w-48 pb-1 text-neutral-500">
                / Воронов А. М. /
              </div>
            </div>

            <div>
              <div className="font-bold text-neutral-900">Главный инженер проекта (ГИП):</div>
              <div className="mt-4 border-b border-neutral-400 w-48 pb-1 text-neutral-500">
                / _________________ /
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
