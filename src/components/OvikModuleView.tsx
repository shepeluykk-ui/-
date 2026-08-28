import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VrfSystemUnit } from '../types';
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Calculator,
  Snowflake,
  Layers,
  Thermometer,
  FileCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const OvikModuleView: React.FC = () => {
  const { vrfSystems, can } = useApp();
  const [selectedVrf, setSelectedVrf] = useState<VrfSystemUnit>(vrfSystems[0] || null);

  // Refrigerant calculator interactive state
  const [pipe635, setPipe635] = useState(45);  // 0.022 kg/m
  const [pipe952, setPipe952] = useState(120); // 0.057 kg/m
  const [pipe127, setPipe127] = useState(60);  // 0.110 kg/m
  const [pipe1588, setPipe1588] = useState(30); // 0.170 kg/m
  const [baseCharge] = useState(11.8); // kg factory charge

  const calculatedAdditional = Math.round((pipe635 * 0.022 + pipe952 * 0.057 + pipe127 * 0.110 + pipe1588 * 0.170) * 100) / 100;
  const totalCalculatedCharge = Math.round((baseCharge + calculatedAdditional) * 100) / 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            СПЕЦИАЛИЗИРОВАННЫЙ МОДУЛЬ ОВиК (СИСТЕМЫ VRF / КОНДИЦИОНИРОВАНИЕ)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Контроль фреоновых трасс, ступенчатой опрессовки азотом 41.5 бар, вакуумирования и расчета дозаправки R410A.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-neutral-100 text-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200">
            СП 73.13330 / СП 60.13330
          </span>
        </div>
      </div>

      {/* Systems Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vrfSystems.map(system => {
          const isSelected = selectedVrf?.id === system.id;
          const isFailed = system.pressureTestStatus === 'FAILED';

          return (
            <div
              key={system.id}
              onClick={() => setSelectedVrf(system)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-neutral-900 bg-white ring-2 ring-neutral-900 shadow-md'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
                      {system.systemTag}
                    </span>
                    <span className="text-xs font-bold text-neutral-900">{system.name}</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Наружный блок: {system.outdoorUnitModel} ({system.coolingCapacityKw} кВт)
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    isFailed
                      ? 'bg-red-600 text-white animate-pulse'
                      : system.commissioningStatus === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {isFailed ? 'УТЕЧКА В ТРАССЕ!' : system.pressureTestStatus}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">Внутр. блоков</span>
                  <strong className="text-neutral-800">{system.indoorUnitsCount} шт</strong>
                </div>
                <div className="p-2 rounded bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">Длина трасс</span>
                  <strong className="text-neutral-800">{system.totalPipingLengthMeters} м</strong>
                </div>
                <div className="p-2 rounded bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">Хладагент</span>
                  <strong className="text-neutral-800">{system.refrigerantType}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Engineering Panel */}
      {selectedVrf && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h3 className="text-base font-bold text-neutral-900">
              Технологическая карта испытаний: {selectedVrf.name} ({selectedVrf.systemTag})
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Контроль этапов: Опрессовка азотом (41.5 бар, 24ч) → Вакуумирование (750 микрон) → Дозаправка R410A → ПНР.
            </p>
          </div>

          {/* 3 Step Protocol Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Nitrogen 41.5 bar */}
            <div className={`p-4 rounded-xl border ${selectedVrf.pressureTestStatus === 'FAILED' ? 'border-red-300 bg-red-50/50' : 'border-emerald-200 bg-emerald-50/40'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-neutral-700" />
                  1. Опрессовка (N2)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedVrf.pressureTestStatus === 'FAILED' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                  {selectedVrf.pressureTestStatus}
                </span>
              </div>
              <div className="mt-2 text-xs text-neutral-700 space-y-1">
                <div>Норматив: <strong>4.15 МПа (41.5 бар) / 24ч</strong></div>
                <div>Факт: <strong>{selectedVrf.pressureTestStatus === 'FAILED' ? '3.80 МПа (Падение на 0.35 МПа)' : '4.15 МПа (Стабильно)'}</strong></div>
                {selectedVrf.pressureTestStatus === 'FAILED' && (
                  <div className="text-[11px] font-bold text-red-800 mt-2 bg-red-100 p-1.5 rounded">
                    Утечка на пайке тройника рефнета этаж 3 (ось 5/В)
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Vacuuming 750 microns */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Snowflake className="h-4 w-4 text-neutral-700" />
                  2. Вакуумирование
                </span>
                <span className="text-[10px] font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded">
                  {selectedVrf.vacuumTestStatus}
                </span>
              </div>
              <div className="mt-2 text-xs text-neutral-700 space-y-1">
                <div>Норматив: <strong>&le; 750 микрон / 2 часа</strong></div>
                <div>Факт: <strong>{selectedVrf.vacuumTestStatus === 'PASSED' ? '680 микрон' : 'Ожидает завершения опрессовки'}</strong></div>
              </div>
            </div>

            {/* Step 3: Commissioning / PNR */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-neutral-700" />
                  3. Пусконаладка (ПНР)
                </span>
                <span className="text-[10px] font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded">
                  {selectedVrf.commissioningStatus}
                </span>
              </div>
              <div className="mt-2 text-xs text-neutral-700 space-y-1">
                <div>Режим охлаждения: <strong>{selectedVrf.commissioningStatus === 'COMPLETED' ? '+21.5°C' : 'Не запущен'}</strong></div>
                <div>Акт 72-часовых испытаний: <strong>В процессе</strong></div>
              </div>
            </div>
          </div>

          {/* Interactive Refrigerant Charge Formula Calculator */}
          <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white">
                  Калькулятор расчетной дозаправки фреоном R410A (СП 73.13330)
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                R_add = &Sigma; (L_i &times; k_i)
              </span>
            </div>

            <p className="text-xs text-neutral-300">
              Введите фактические длины жидкостных медных труб для автоматического расчета необходимой дозаправки хладагента:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 font-mono text-[11px]">Ø6.35 мм (k=0.022)</label>
                <div className="mt-1 flex items-center gap-1">
                  <input
                    type="number"
                    value={pipe635}
                    onChange={e => setPipe635(Number(e.target.value))}
                    className="w-full rounded bg-neutral-800 border border-neutral-700 p-1.5 text-white font-mono"
                  />
                  <span className="text-neutral-400">м</span>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono text-[11px]">Ø9.52 мм (k=0.057)</label>
                <div className="mt-1 flex items-center gap-1">
                  <input
                    type="number"
                    value={pipe952}
                    onChange={e => setPipe952(Number(e.target.value))}
                    className="w-full rounded bg-neutral-800 border border-neutral-700 p-1.5 text-white font-mono"
                  />
                  <span className="text-neutral-400">м</span>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono text-[11px]">Ø12.7 мм (k=0.110)</label>
                <div className="mt-1 flex items-center gap-1">
                  <input
                    type="number"
                    value={pipe127}
                    onChange={e => setPipe127(Number(e.target.value))}
                    className="w-full rounded bg-neutral-800 border border-neutral-700 p-1.5 text-white font-mono"
                  />
                  <span className="text-neutral-400">м</span>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono text-[11px]">Ø15.88 мм (k=0.170)</label>
                <div className="mt-1 flex items-center gap-1">
                  <input
                    type="number"
                    value={pipe1588}
                    onChange={e => setPipe1588(Number(e.target.value))}
                    className="w-full rounded bg-neutral-800 border border-neutral-700 p-1.5 text-white font-mono"
                  />
                  <span className="text-neutral-400">м</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-neutral-300">
                Заводская заправка блока: <strong>{baseCharge} кг</strong> | Дополнительная: <strong>{calculatedAdditional} кг</strong>
              </div>
              <div className="text-sm font-bold text-amber-400">
                ИТОГОВАЯ МАССА ЗАПРАВКИ: {totalCalculatedCharge} кг R410A
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
