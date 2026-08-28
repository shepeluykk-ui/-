import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DefectRemark, DefectSeverity, DefectStatus } from '../types';
import { MobileMessagesBlock } from './MobileMessagesBlock';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Filter,
  Search,
  Camera,
  History,
  Lock,
  RotateCcw,
  Check
} from 'lucide-react';

export const RemarksDefectsView: React.FC = () => {
  const { defects, addDefect, updateDefectStatus, can, currentUser, activeProject } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDefect, setSelectedDefect] = useState<DefectRemark | null>(defects[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Defect Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSeverity, setNewSeverity] = useState<DefectSeverity>('CRITICAL');
  const [newBuilding, setNewBuilding] = useState('Корпус 1');
  const [newFloor, setNewFloor] = useState('3');
  const [newRoom, setNewRoom] = useState('Шахта Ш-3');
  const [newAxes, setNewAxes] = useState('В осях 4-6 / Б-В');
  const [newContractorName, setNewContractorName] = useState('ООО «ВентКлиматМонтаж»');
  const [newDeadline, setNewDeadline] = useState('2024-08-28');
  const [newRegulatoryBasis, setNewRegulatoryBasis] = useState('СП 73.13330.2016 п. 7.3');
  const [newDesignDocRef, setNewDesignDocRef] = useState('РД 240/24-ОВ1 Лист 14');
  const [newHoldPointBlocked, setNewHoldPointBlocked] = useState(true);

  // Rejection/Closure comment
  const [actionComment, setActionComment] = useState('');

  const filteredDefects = defects.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.defectNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || d.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleCreateDefect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;

    addDefect({
      projectId: activeProject.id,
      title: newTitle,
      description: newDescription,
      severity: newSeverity,
      status: 'OPEN',
      location: { building: newBuilding, floor: newFloor, room: newRoom, axes: newAxes },
      responsibleContractorOrgId: 'org-sub-ovik',
      responsibleContractorName: newContractorName,
      authorUserId: currentUser.id,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      deadlineDate: newDeadline,
      regulatoryBasis: newRegulatoryBasis,
      designDocReference: newDesignDocRef,
      isHoldPointBlocked: newHoldPointBlocked,
      photoUrls: ['/photos/defect_sample.jpg'],
      afterPhotoUrls: []
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            РЕЕСТР ДЕФЕКТОВ И ПРЕДПИСАНИЙ СТРОИТЕЛЬНОГО КОНТРОЛЯ
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Фиксация нарушений с фотопривязкой, контроль сроков устранения и повторных инспекций.
          </p>
        </div>

        {can('CREATE', 'defects') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-red-600 text-white px-3.5 py-2 text-xs font-semibold hover:bg-red-700 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Выставить замечание / предписание
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Поиск по номеру замечания, описанию, локации..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                severityFilter === sev
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {sev === 'ALL' ? 'Все уровни' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredDefects.map(defect => {
            const isSelected = selectedDefect?.id === defect.id;
            const isCritical = defect.severity === 'CRITICAL';
            const isClosed = defect.status === 'CLOSED';

            return (
              <div
                key={defect.id}
                onClick={() => setSelectedDefect(defect)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900/5 shadow-xs'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                        {defect.defectNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isCritical
                            ? 'bg-red-600 text-white'
                            : defect.severity === 'HIGH'
                            ? 'bg-amber-600 text-white'
                            : 'bg-neutral-200 text-neutral-800'
                        }`}
                      >
                        {defect.severity}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-neutral-900 mt-1.5 leading-snug">
                      {defect.title}
                    </h4>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                      isClosed
                        ? 'bg-emerald-100 text-emerald-800'
                        : defect.status === 'READY_FOR_REVIEW'
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {defect.status}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{defect.location.building}, {defect.location.room}</span>
                  <span className="text-red-700 font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Срок: {defect.deadlineDate}
                  </span>
                </div>

                {defect.isHoldPointBlocked && !isClosed && (
                  <div className="mt-2 text-[10px] font-bold text-red-700 bg-red-50 p-1.5 rounded flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Блокирует технологический процесс
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Detail Card (7 cols) */}
        <div className="lg:col-span-7">
          {selectedDefect ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-6">
              {/* Top Banner of Defect */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-neutral-900 text-white px-2.5 py-0.5 rounded">
                      {selectedDefect.defectNumber}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500">
                      Выдано: {selectedDefect.issuedDate} ({selectedDefect.authorName})
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mt-2">
                    {selectedDefect.title}
                  </h3>
                  <div className="mt-1 text-xs text-neutral-600">
                    Ответственный подрядчик: <strong>{selectedDefect.responsibleContractorName}</strong>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                    selectedDefect.status === 'CLOSED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedDefect.status}
                </span>
              </div>

              {/* Description & Norms */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Описание дефекта / брака</span>
                  <p className="text-neutral-800 mt-1 leading-relaxed">{selectedDefect.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Нормативное нарушение</span>
                    <div className="font-semibold text-neutral-800 mt-0.5">{selectedDefect.regulatoryBasis}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Проектный лист</span>
                    <div className="font-semibold text-neutral-800 mt-0.5">{selectedDefect.designDocReference}</div>
                  </div>
                </div>
              </div>

              {/* Photos Comparison (Before / After) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-neutral-600" />
                  Фотофиксация нарушения и устранения (Before / After)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-red-200 p-2 bg-red-50/40 text-center">
                    <div className="text-[10px] font-bold text-red-800 uppercase mb-1">ФОТО ПРИ ФИКСАЦИИ (ДО)</div>
                    <div className="h-28 bg-neutral-200 rounded flex items-center justify-center text-xs text-neutral-500 font-medium">
                      [Фото: Утечка / Дефект монтажа]
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-200 p-2 bg-emerald-50/40 text-center">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase mb-1">ФОТО ПОСЛЕ УСТРАНЕНИЯ</div>
                    {selectedDefect.afterPhotoUrls.length > 0 ? (
                      <div className="h-28 bg-emerald-100 rounded flex items-center justify-center text-xs text-emerald-800 font-bold">
                        [Фото: Стык перепаян / Устранено]
                      </div>
                    ) : (
                      <div className="h-28 bg-neutral-100 rounded flex items-center justify-center text-xs text-neutral-400">
                        Ожидает фото устранения от подрядчика
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Workflow Controls (RBAC) */}
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <div className="text-xs font-bold text-neutral-900">Управление жизненным циклом замечания</div>

                {/* Subcontractor action: Submit for review */}
                {(currentUser.role === 'FOREMAN' || currentUser.role === 'SUBCONTRACTOR' || currentUser.role === 'CONTRACTOR') &&
                  selectedDefect.status !== 'CLOSED' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateDefectStatus(selectedDefect.id, 'READY_FOR_REVIEW', 'Работы устранены, предъявлены технадзору', '/photos/repaired.jpg')}
                        className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-xs font-bold hover:bg-neutral-800"
                      >
                        Предъявить к повторной проверке (Устранено)
                      </button>
                    </div>
                  )}

                {/* Inspector/Supervisor action: Close or Reject */}
                {can('CLOSE_DEFECT', 'defects') && selectedDefect.status !== 'CLOSED' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateDefectStatus(selectedDefect.id, 'CLOSED', 'Дефект полностью устранен, повторная опрессовка пройдена')}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-700 shadow-xs"
                    >
                      <Check className="h-4 w-4" />
                      Закрыть замечание (Акт повторного контроля)
                    </button>

                    <button
                      onClick={() => updateDefectStatus(selectedDefect.id, 'REJECTED', 'Замечание не устранено, брак сохраняется')}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-xs font-bold hover:bg-red-100"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Отклонить и вернуть на доработку (Re-inspection +1)
                    </button>
                  </div>
                )}
              </div>

              {/* Audit Trail of Defect */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-neutral-600" />
                  Журнал действий по замечанию
                </h4>
                <div className="space-y-1.5">
                  {selectedDefect.auditTrail.map((entry, idx) => (
                    <div key={idx} className="p-2 rounded bg-neutral-50 border border-neutral-100 text-xs flex justify-between">
                      <div>
                        <span className="font-bold text-neutral-900">{entry.author}</span>: {entry.comment}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">{entry.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-xs text-neutral-400">
              Выберите замечание из реестра
            </div>
          )}
        </div>
      </div>

      {/* Add Defect Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">Выставление замечания строительного контроля</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <form onSubmit={handleCreateDefect} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700">Краткое наименование дефекта</label>
                <input
                  type="text"
                  required
                  placeholder="Нарушение целостности изоляции / Утечка"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700">Подробное описание нарушения</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Опишите дефект, привязку к осям и требования по устранению..."
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Критичность (Категория)</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs font-bold"
                  >
                    <option value="CRITICAL">CRITICAL (Угроза надежности / Блокер)</option>
                    <option value="HIGH">HIGH (Существенное отклонение)</option>
                    <option value="MEDIUM">MEDIUM (Устранимо в рабочем порядке)</option>
                    <option value="LOW">LOW (Косметическое / Незначительное)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700">Срок устранения</label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Нормативная ссылка</label>
                  <input
                    type="text"
                    value={newRegulatoryBasis}
                    onChange={e => setNewRegulatoryBasis(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700">Проектный лист</label>
                  <input
                    type="text"
                    value={newDesignDocRef}
                    onChange={e => setNewDesignDocRef(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="holdPointBlock"
                  checked={newHoldPointBlocked}
                  onChange={e => setNewHoldPointBlocked(e.target.checked)}
                  className="rounded border-neutral-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="holdPointBlock" className="text-xs font-bold text-red-800">
                  Блокировать последующие работы (Hold Point Lock)
                </label>
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
                  className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                >
                  Выставить замечание
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Messages Block */}
      <div className="block md:hidden">
        <MobileMessagesBlock />
      </div>
    </div>
  );
};
