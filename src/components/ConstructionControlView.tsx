import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InspectionRecord, InspectionType, InspectionResult } from '../types';
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Shield,
  FileCheck2,
  Calendar,
  Layers,
  Unlock,
  Lock,
  Camera
} from 'lucide-react';

export const ConstructionControlView: React.FC = () => {
  const { inspections, addInspection, resolveHoldPoint, can, currentUser, activeProject } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  // New inspection form
  const [workName, setWorkName] = useState('');
  const [inspectionType, setInspectionType] = useState<InspectionType>('PRESSURE_TEST');
  const [pointType, setPointType] = useState<'STANDARD' | 'WITNESS_POINT' | 'HOLD_POINT'>('HOLD_POINT');
  const [building, setBuilding] = useState('Корпус 1');
  const [floor, setFloor] = useState('3');
  const [room, setRoom] = useState('Шахта Ш-3');
  const [axes, setAxes] = useState('В осях 4-6 / Б-В');
  const [regulatoryBasis, setRegulatoryBasis] = useState('СП 73.13330.2016 п. 7.3, ГОСТ 32970-2014');
  const [designDocReference, setDesignDocReference] = useState('РД 240/24-ОВ1 Лист 14');
  const [result, setResult] = useState<InspectionResult>('PASSED');
  const [findings, setFindings] = useState('');

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workName || !findings) return;

    addInspection({
      projectId: activeProject.id,
      workName,
      inspectionType,
      pointType,
      isHoldPointSatisfied: result === 'PASSED',
      location: { building, floor, room, axes },
      contractorOrgId: 'org-sub-ovik',
      contractorOrgName: 'ООО «ВентКлиматМонтаж»',
      inspectorName: currentUser.fullName,
      inspectorRole: currentUser.role,
      inspectionDate: new Date().toISOString().split('T')[0],
      regulatoryBasis,
      designDocReference,
      result,
      findings,
      photoIds: [],
      defectsGeneratedIds: result === 'FAILED' ? ['def-new'] : []
    });

    setShowAddModal(false);
    setWorkName('');
    setFindings('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            СЛУЖБА СТРОИТЕЛЬНОГО КОНТРОЛЯ (ТЕХНАДЗОР)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Входной, операционный и приемочный контроль. Обязательные контрольные точки (Hold Points / Witness Points).
          </p>
        </div>

        {can('CREATE', 'construction_control') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-3.5 py-2 text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Оформить акт проверки / испытания
          </button>
        )}
      </div>

      {/* Hold Points Rules Banner */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-900 text-white p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
            <Lock className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              ПРАВИЛО HOLD POINT / WITNESS POINT (СП 48.13330)
            </h3>
            <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
              Если для скрытых работ (опрессовка, армирование, гидроизоляция) назначен статус <strong>HOLD POINT</strong>,
              подрядчик <strong>КАТЕГОРИЧЕСКИ НЕ ИМЕЕТ ПРАВА</strong> приступать к последующим технологическим операциям
              (зашивка потолков, бетонирование, засыпка) до официального подписания протокола инспектором строительного контроля.
            </p>
          </div>
        </div>
      </div>

      {/* Inspections Registry */}
      <div className="space-y-4">
        {inspections.map(insp => {
          const isFailed = insp.result === 'FAILED';
          const isHoldPoint = insp.pointType === 'HOLD_POINT';

          return (
            <div
              key={insp.id}
              className={`rounded-xl border p-5 bg-white shadow-xs transition-all ${
                isFailed ? 'border-red-300 ring-1 ring-red-100' : 'border-neutral-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                      isHoldPoint
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {insp.pointType}
                  </span>

                  <span className="text-xs font-bold text-neutral-900">{insp.workName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase flex items-center gap-1 ${
                      insp.result === 'PASSED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {insp.result === 'PASSED' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {insp.result}
                  </span>

                  <span className="text-[11px] text-neutral-500 font-mono">{insp.inspectionDate}</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Локация / Оси</span>
                  <div className="font-semibold text-neutral-800 mt-0.5">
                    {insp.location.building}, {insp.location.floor} эт., {insp.location.room} ({insp.location.axes})
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Нормативная база & РД</span>
                  <div className="font-semibold text-neutral-800 mt-0.5">
                    {insp.regulatoryBasis} <br />
                    <span className="text-[11px] text-neutral-500">{insp.designDocReference}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Инспектор / Подрядчик</span>
                  <div className="font-semibold text-neutral-800 mt-0.5">
                    {insp.inspectorName} ({insp.inspectorRole}) <br />
                    <span className="text-[11px] text-neutral-500">{insp.contractorOrgName}</span>
                  </div>
                </div>
              </div>

              {/* Findings text */}
              <div className="mt-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100 text-xs">
                <span className="font-bold text-neutral-700">Заключение строительного контроля: </span>
                <span className="text-neutral-800 leading-relaxed">{insp.findings}</span>
              </div>

              {/* Measurements table if present */}
              {insp.measurements && insp.measurements.length > 0 && (
                <div className="mt-3 border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-100 text-neutral-600 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Параметр контроля</th>
                        <th className="py-2 px-3">Требование норматива</th>
                        <th className="py-2 px-3">Фактическое измерение</th>
                        <th className="py-2 px-3 text-center">Результат</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {insp.measurements.map((m, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="py-2 px-3 font-medium">{m.parameter}</td>
                          <td className="py-2 px-3 font-mono text-neutral-600">{m.standardValue}</td>
                          <td className="py-2 px-3 font-mono font-bold">{m.actualValue}</td>
                          <td className="py-2 px-3 text-center font-bold">
                            <span className={m.pass ? 'text-emerald-700' : 'text-red-600'}>
                              {m.pass ? 'СООТВЕТСТВУЕТ' : 'ОТКЛОНЕНИЕ'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Hold Point Resolution Action for Supervisor */}
              {isHoldPoint && isFailed && can('APPROVE', 'construction_control') && (
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div className="text-xs text-red-800 font-bold flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-red-600" />
                    Блокировка смежных работ активна
                  </div>
                  <button
                    onClick={() => resolveHoldPoint(insp.id, true)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold hover:bg-emerald-800 transition-colors shadow-xs"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    Подтвердить устранение и снять Hold Point
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Inspection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">Регистрация проверки строительного контроля</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700">Наименование проверяемой работы</label>
                <input
                  type="text"
                  required
                  placeholder="Опрессовка магистральных фреонопроводов VRF-2"
                  value={workName}
                  onChange={e => setWorkName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Тип контроля</label>
                  <select
                    value={inspectionType}
                    onChange={e => setInspectionType(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  >
                    <option value="PRESSURE_TEST">Гидравлические/пневмо испытания</option>
                    <option value="INPUT_CONTROL">Входной контроль материалов</option>
                    <option value="OPERATIONAL_CONTROL">Операционный контроль монтажа</option>
                    <option value="ACCEPTANCE_CONTROL">Приемочный контроль (АОСР)</option>
                    <option value="COMMISSIONING">Пусконаладка (ПНР)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700">Категория точки</label>
                  <select
                    value={pointType}
                    onChange={e => setPointType(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs font-bold"
                  >
                    <option value="HOLD_POINT">HOLD POINT (Обязательный останов)</option>
                    <option value="WITNESS_POINT">WITNESS POINT (Точка освидетельствования)</option>
                    <option value="STANDARD">Обычная инспекция</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Этаж / Помещение</label>
                  <input
                    type="text"
                    value={floor}
                    onChange={e => setFloor(e.target.value)}
                    placeholder="3 этаж, Шахта Ш-3"
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Строительные оси</label>
                  <input
                    type="text"
                    value={axes}
                    onChange={e => setAxes(e.target.value)}
                    placeholder="В осях 4-6 / Б-В"
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Нормативная ссылка</label>
                  <input
                    type="text"
                    value={regulatoryBasis}
                    onChange={e => setRegulatoryBasis(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Лист РД / Проект</label>
                  <input
                    type="text"
                    value={designDocReference}
                    onChange={e => setDesignDocReference(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700">Результат проверки</label>
                <select
                  value={result}
                  onChange={e => setResult(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs font-bold"
                >
                  <option value="PASSED">PASSED (Работы соответствуют проекту и ГОСТ)</option>
                  <option value="FAILED">FAILED (Брак / Нарушение / Утечка)</option>
                  <option value="REWORK_REQUIRED">REWORK (Требуется доработка без остановки)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700">Заключение инспектора строительного контроля</label>
                <textarea
                  rows={3}
                  required
                  value={findings}
                  onChange={e => setFindings(e.target.value)}
                  placeholder="Опишите фактическое состояние, показания манометров, наличие дефектов..."
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-neutral-800"
                >
                  Сохранить запись контроля
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
