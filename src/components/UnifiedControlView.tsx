import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UnifiedControlRecord } from '../types';
import {
  GitCommit,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  ShieldCheck,
  Building,
  UserCheck,
  Layers,
  ArrowRight,
  ShieldAlert,
  FolderLock,
  Clock,
  CheckCircle
} from 'lucide-react';

export const UnifiedControlView: React.FC = () => {
  const {
    activeProject,
    unifiedControlRecords,
    workTypes,
    organizations,
    addUnifiedControlRecord,
    updateUnifiedControlRecord,
    can,
    currentUser
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New control record form state
  const [formObjectName, setFormObjectName] = useState('Корпус 1 (Блок А)');
  const [formZone, setFormZone] = useState('Секция 1');
  const [formFloor, setFormFloor] = useState('2 этаж');
  const [formAxis, setFormAxis] = useState('В осях 1-4 / А-Б');
  const [formWorkTypeId, setFormWorkTypeId] = useState(workTypes[0]?.id || 'wt-ovik');
  const [formContractorOrgId, setFormContractorOrgId] = useState(organizations[0]?.id || 'org-gc');
  const [formExecutorName, setFormExecutorName] = useState('Прораб Иванов С.П.');
  const [formPlannedVolume, setFormPlannedVolume] = useState<number>(100);
  const [formActualVolume, setFormActualVolume] = useState<number>(0);
  const [formUnit, setFormUnit] = useState('м.п.');
  const [formDocCode, setFormDocCode] = useState('РД-2024-ОВ-01');
  const [formHoldRequired, setFormHoldRequired] = useState(true);
  const [formWitnessRequired, setFormWitnessRequired] = useState(true);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedWorkType = workTypes.find(w => w.id === formWorkTypeId);
    const matchedOrg = organizations.find(o => o.id === formContractorOrgId);

    addUnifiedControlRecord({
      projectId: activeProject.id,
      objectName: formObjectName.trim(),
      zone: formZone.trim(),
      floor: formFloor.trim(),
      axis: formAxis.trim(),
      workTypeId: formWorkTypeId,
      workTypeName: matchedWorkType ? matchedWorkType.name : 'Строительно-монтажные работы',
      contractorOrgId: formContractorOrgId,
      contractorOrgName: matchedOrg ? matchedOrg.name : 'Генеральный подрядчик',
      assignedExecutorName: formExecutorName.trim(),
      plannedVolume: Number(formPlannedVolume) || 0,
      actualVolume: Number(formActualVolume) || 0,
      unit: formUnit.trim(),
      documentCode: formDocCode.trim(),
      photoIds: [],
      defectRemarksIds: [],
      holdPointRequired: formHoldRequired,
      holdPointSatisfied: false,
      witnessPointRequired: formWitnessRequired,
      witnessPointPassed: false,
      aosrStatus: formHoldRequired ? 'DRAFT' : 'NOT_REQUIRED',
      acceptanceStatus: formHoldRequired ? 'HOLD_BLOCKED' : 'IN_PROGRESS',
      overallStatus: 'ACTIVE'
    });

    setIsCreateModalOpen(false);
  };

  const handleToggleHoldPoint = (record: UnifiedControlRecord) => {
    if (!can('APPROVE', 'construction_control') && currentUser.role !== 'SUPER_ADMIN') {
      alert('Только инспектор строительного контроля (Технадзор) имеет право подтверждать Hold Point.');
      return;
    }

    const nextSatisfied = !record.holdPointSatisfied;
    const nextAcceptance = nextSatisfied ? 'READY_FOR_ACCEPTANCE' : 'HOLD_BLOCKED';
    updateUnifiedControlRecord(record.id, {
      holdPointSatisfied: nextSatisfied,
      acceptanceStatus: nextAcceptance,
      overallStatus: nextSatisfied ? 'ACTIVE' : 'ON_HOLD'
    });
  };

  const handleSignAosr = (record: UnifiedControlRecord) => {
    if (!can('SIGN_ACT', 'construction_control') && currentUser.role !== 'SUPER_ADMIN') {
      alert('Недостаточно прав для подписания АОСР.');
      return;
    }

    updateUnifiedControlRecord(record.id, {
      aosrStatus: 'FULLY_APPROVED',
      acceptanceStatus: 'ACCEPTED',
      overallStatus: 'COMPLETED'
    });
  };

  const filteredRecords = unifiedControlRecords.filter(r => {
    const matchSearch = r.workTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.objectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.axis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.contractorOrgName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || r.acceptanceStatus === selectedStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6" id="unified-control-model-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <GitCommit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Единая Модель Контроля Качества
              </h1>
              <p className="text-sm text-slate-500">
                Сквозная цепочка: Объект → Зона → Этаж → Ось → Вид работ → Подрядчик → Hold Point → АОСР → Приёмка
              </p>
            </div>
          </div>
        </div>

        {can('CREATE', 'construction_control') && (
          <button
            id="btn-add-unified-point"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Зафиксировать точку контроля
          </button>
        )}
      </div>

      {/* Model Chain Diagram */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 shadow-sm overflow-x-auto">
        <div className="text-xs font-semibold text-sky-400 mb-2 uppercase tracking-wider">
          Сквозной Цикл Валидации Качества (Unified Inspection Cycle):
        </div>
        <div className="flex items-center gap-2 min-w-max text-xs font-medium">
          <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700">Проект / Объект</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700">Зона / Секция</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700">Этаж / Осевая привязка</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2.5 py-1 bg-sky-950 text-sky-300 rounded border border-sky-800 font-semibold">WORK_TYPE</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700">Подрядчик / Объём</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2.5 py-1 bg-amber-950 text-amber-300 rounded border border-amber-800 font-semibold">Hold Point</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2.5 py-1 bg-purple-950 text-purple-300 rounded border border-purple-800 font-semibold">АОСР</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 rounded border border-emerald-800 font-semibold">Итоговая Приёмка</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по объекту, оси, виду работ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 font-medium">Статус приёмки:</div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Все статусы</option>
            <option value="HOLD_BLOCKED">Заблокировано Hold Point</option>
            <option value="READY_FOR_ACCEPTANCE">Готово к приёмке</option>
            <option value="ACCEPTED">Принято технадзором</option>
            <option value="IN_PROGRESS">В процессе выполнения</option>
          </select>
        </div>
      </div>

      {/* Control Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecords.map(record => {
          const isHoldBlocked = record.holdPointRequired && !record.holdPointSatisfied;
          const isAccepted = record.acceptanceStatus === 'ACCEPTED';

          return (
            <div
              key={record.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                isHoldBlocked ? 'border-amber-300 ring-1 ring-amber-100' : isAccepted ? 'border-emerald-300' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3.5">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                    {record.objectName}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isHoldBlocked
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : isAccepted
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}
                  >
                    {isHoldBlocked ? '🛑 HOLD POINT БЛОКИРОВКА' : isAccepted ? '✅ ПРИНЯТО' : '⚙️ В РАБОТЕ'}
                  </span>
                </div>

                {/* Location & Work Type */}
                <div>
                  <div className="text-xs text-slate-500 font-medium">
                    {record.zone} • {record.floor} • <span className="font-semibold text-slate-700">{record.axis}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                    {record.workTypeName}
                  </h3>
                </div>

                {/* Contractor & Executor */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Подрядчик:</span>
                    <span className="font-semibold text-slate-800">{record.contractorOrgName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ответственный:</span>
                    <span className="text-slate-700">{record.assignedExecutorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Объем (Факт / План):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {record.actualVolume} / {record.plannedVolume} {record.unit}
                    </span>
                  </div>
                </div>

                {/* Milestones Check */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Стоп-точка (Hold Point):</span>
                    <span className={`font-semibold ${record.holdPointSatisfied ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {record.holdPointRequired ? (record.holdPointSatisfied ? 'Пройдена' : 'АКТИВНА / ТРЕБУЕТ ОСМОТРА') : 'Не требуется'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">АОСР:</span>
                    <span className={`font-semibold ${record.aosrStatus === 'FULLY_APPROVED' ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {record.aosrStatus === 'FULLY_APPROVED' ? 'Подписан всеми сторонами' : record.aosrStatus === 'SIGNED_BY_SUPERVISOR' ? 'Подписан технадзором' : 'В подготовке'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                {record.holdPointRequired && (
                  <button
                    onClick={() => handleToggleHoldPoint(record)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      record.holdPointSatisfied
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                    }`}
                  >
                    {record.holdPointSatisfied ? 'Отозвать Hold Point' : 'Снять Hold Point'}
                  </button>
                )}

                {record.aosrStatus !== 'FULLY_APPROVED' && (
                  <button
                    onClick={() => handleSignAosr(record)}
                    className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition cursor-pointer ml-auto"
                  >
                    Подписать АОСР
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Point */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                Фиксация точки сквозного контроля
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Корпус / Блок *</label>
                  <input
                    type="text"
                    required
                    value={formObjectName}
                    onChange={e => setFormObjectName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Зона / Секция *</label>
                  <input
                    type="text"
                    required
                    value={formZone}
                    onChange={e => setFormZone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Этаж *</label>
                  <input
                    type="text"
                    required
                    value={formFloor}
                    onChange={e => setFormFloor(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Осевая привязка *</label>
                  <input
                    type="text"
                    required
                    placeholder="В осях 1-4 / А-Б"
                    value={formAxis}
                    onChange={e => setFormAxis(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Вид работ (WORK_TYPE) *</label>
                <select
                  value={formWorkTypeId}
                  onChange={e => {
                    setFormWorkTypeId(e.target.value);
                    const matched = workTypes.find(w => w.id === e.target.value);
                    if (matched) {
                      setFormUnit(matched.defaultUnit);
                      setFormHoldRequired(matched.requiresHoldPoint);
                      setFormWitnessRequired(matched.requiresWitnessPoint);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {workTypes.map(wt => (
                    <option key={wt.id} value={wt.id}>
                      [{wt.code}] {wt.name} ({wt.regulatoryStandard})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Подрядчик *</label>
                  <select
                    value={formContractorOrgId}
                    onChange={e => setFormContractorOrgId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ответственный исполнитель *</label>
                  <input
                    type="text"
                    required
                    value={formExecutorName}
                    onChange={e => setFormExecutorName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">План объем</label>
                  <input
                    type="number"
                    value={formPlannedVolume}
                    onChange={e => setFormPlannedVolume(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Факт объем</label>
                  <input
                    type="number"
                    value={formActualVolume}
                    onChange={e => setFormActualVolume(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ед. изм.</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={e => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Сохранить точку контроля
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
