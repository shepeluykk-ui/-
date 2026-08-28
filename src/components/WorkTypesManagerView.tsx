import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkType, WorkTypeStatus } from '../types';
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  Archive,
  RotateCcw,
  Edit2,
  Building2,
  Zap,
  Flame,
  Wrench,
  Compass,
  Sparkles,
  Info
} from 'lucide-react';

const CATEGORY_NAMES: Record<WorkType['categoryGroup'], { label: string; icon: any; color: string }> = {
  HVAC_PLUMBING: { label: 'ОВиК и Водоснабжение', icon: Flame, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ELECTRICAL_LOW_CURRENT: { label: 'ЭОМ, СС, СКС, СКУД', icon: Zap, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  STRUCTURAL_BUILDING: { label: 'Конструктивы, КР, Монолит, КМ', icon: Building2, color: 'text-slate-700 bg-slate-100 border-slate-300' },
  FINISHING_FACADE: { label: 'Фасады, Кровли, Отделка, АР', icon: Compass, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  EQUIPMENT_COMMISSIONING: { label: 'Тех. Оборудование и ПНР', icon: Wrench, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  SPECIAL: { label: 'Специальные и Прочие работы', icon: Sparkles, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' }
};

export const WorkTypesManagerView: React.FC = () => {
  const { workTypes, addWorkType, updateWorkType, archiveWorkType, can, activeProject } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkType, setEditingWorkType] = useState<WorkType | null>(null);

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<WorkType['categoryGroup']>('HVAC_PLUMBING');
  const [formDefaultUnit, setFormDefaultUnit] = useState('м.п.');
  const [formStandard, setFormStandard] = useState('');
  const [formRequiresHoldPoint, setFormRequiresHoldPoint] = useState(true);
  const [formRequiresWitnessPoint, setFormRequiresWitnessPoint] = useState(true);
  const [formRequiresAosr, setFormRequiresAosr] = useState(true);
  const [formCheckpoints, setFormCheckpoints] = useState<string>('');

  const openCreateModal = () => {
    setEditingWorkType(null);
    setFormCode('');
    setFormName('');
    setFormCategory('HVAC_PLUMBING');
    setFormDefaultUnit('м.п.');
    setFormStandard('СП 60.13330 / СП 73.13330');
    setFormRequiresHoldPoint(true);
    setFormRequiresWitnessPoint(true);
    setFormRequiresAosr(true);
    setFormCheckpoints('Входной контроль\nПромежуточное освидетельствование\nИтоговое испытание');
    setIsModalOpen(true);
  };

  const openEditModal = (wt: WorkType) => {
    setEditingWorkType(wt);
    setFormCode(wt.code);
    setFormName(wt.name);
    setFormCategory(wt.categoryGroup);
    setFormDefaultUnit(wt.defaultUnit);
    setFormStandard(wt.regulatoryStandard);
    setFormRequiresHoldPoint(wt.requiresHoldPoint);
    setFormRequiresWitnessPoint(wt.requiresWitnessPoint);
    setFormRequiresAosr(wt.requiresAosr);
    setFormCheckpoints((wt.typicalInspectionCheckpoints || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) {
      alert('Пожалуйста, укажите шифр (код) и наименование вида работ');
      return;
    }

    const checkpointsArray = formCheckpoints
      .split('\n')
      .map(c => c.trim())
      .filter(Boolean);

    if (editingWorkType) {
      updateWorkType(editingWorkType.id, {
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        categoryGroup: formCategory,
        defaultUnit: formDefaultUnit.trim(),
        regulatoryStandard: formStandard.trim(),
        requiresHoldPoint: formRequiresHoldPoint,
        requiresWitnessPoint: formRequiresWitnessPoint,
        requiresAosr: formRequiresAosr,
        typicalInspectionCheckpoints: checkpointsArray
      });
    } else {
      addWorkType({
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        categoryGroup: formCategory,
        defaultUnit: formDefaultUnit.trim(),
        regulatoryStandard: formStandard.trim(),
        requiresHoldPoint: formRequiresHoldPoint,
        requiresWitnessPoint: formRequiresWitnessPoint,
        requiresAosr: formRequiresAosr,
        typicalInspectionCheckpoints: checkpointsArray,
        status: 'ACTIVE'
      });
    }

    setIsModalOpen(false);
  };

  const filteredWorkTypes = workTypes.filter(wt => {
    const matchSearch = wt.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        wt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        wt.regulatoryStandard.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || wt.categoryGroup === selectedCategory;
    const matchStatus = statusFilter === 'ALL' || wt.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const activeCount = workTypes.filter(w => w.status === 'ACTIVE').length;
  const archivedCount = workTypes.filter(w => w.status === 'ARCHIVED').length;
  const holdPointCount = workTypes.filter(w => w.requiresHoldPoint && w.status === 'ACTIVE').length;

  return (
    <div className="space-y-6" id="work-types-manager-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 text-sky-800 rounded-lg">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Справочник Видов Работ (Универсальная сущность WORK_TYPE)
              </h1>
              <p className="text-sm text-slate-500">
                Универсальная модель строительного контроля ООО «КИТ» • Проект: <span className="font-semibold text-slate-700">{activeProject.name}</span>
              </p>
            </div>
          </div>
        </div>

        {can('CREATE', 'work_types') && (
          <button
            id="btn-add-work-type"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-lg transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Добавить вид работ
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{activeCount}</div>
            <div className="text-xs text-slate-500 font-medium">Активных видов работ</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-700">{holdPointCount}</div>
            <div className="text-xs text-slate-500 font-medium">С контролем Hold Point (Критические точки)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-700">{archivedCount}</div>
            <div className="text-xs text-slate-500 font-medium">В архиве</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по коду, названию, СП..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2">
            <Filter className="w-3.5 h-3.5" />
            Категория:
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">Все категории</option>
            {Object.entries(CATEGORY_NAMES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${statusFilter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Активные ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('ARCHIVED')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${statusFilter === 'ARCHIVED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Архив ({archivedCount})
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Все
            </button>
          </div>
        </div>
      </div>

      {/* Work Types Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Шифр / Код</th>
                <th className="px-4 py-3">Наименование вида работ</th>
                <th className="px-4 py-3">Категория</th>
                <th className="px-4 py-3">Ед. изм.</th>
                <th className="px-4 py-3">Норматив (СП / ГОСТ)</th>
                <th className="px-4 py-3 text-center">Контрольные требования</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkTypes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Виды работ не найдены
                  </td>
                </tr>
              ) : (
                filteredWorkTypes.map(wt => {
                  const cat = CATEGORY_NAMES[wt.categoryGroup] || CATEGORY_NAMES.SPECIAL;
                  const Icon = cat.icon;

                  return (
                    <tr key={wt.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 bg-slate-100 text-slate-800 rounded border border-slate-200">
                          {wt.code}
                        </span>
                        {wt.isCustomCreated && (
                          <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                            Кастомный
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{wt.name}</div>
                        {wt.typicalInspectionCheckpoints && wt.typicalInspectionCheckpoints.length > 0 && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                            Чек-поинты: {wt.typicalInspectionCheckpoints.join(' • ')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cat.color}`}>
                          <Icon className="w-3 h-3" />
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {wt.defaultUnit}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {wt.regulatoryStandard}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            title={wt.requiresHoldPoint ? 'Требуется Hold Point (Остановка до приемки)' : 'Без Hold Point'}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              wt.requiresHoldPoint
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            Hold: {wt.requiresHoldPoint ? 'ДА' : 'НЕТ'}
                          </span>
                          <span
                            title={wt.requiresWitnessPoint ? 'Witness Point (Точка освидетельствования)' : 'Без Witness'}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              wt.requiresWitnessPoint
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            Witness: {wt.requiresWitnessPoint ? 'ДА' : 'НЕТ'}
                          </span>
                          <span
                            title={wt.requiresAosr ? 'Обязательно оформление АОСР' : 'АОСР не требуется'}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              wt.requiresAosr
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            АОСР: {wt.requiresAosr ? 'ДА' : 'НЕТ'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(wt)}
                            title="Редактировать вид работ"
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => archiveWorkType(wt.id)}
                            title={wt.status === 'ACTIVE' ? 'Архивировать вид работ' : 'Восстановить из архива'}
                            className={`p-1.5 rounded transition cursor-pointer ${
                              wt.status === 'ACTIVE'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {wt.status === 'ACTIVE' ? <Archive className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit Work Type */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-100 text-sky-800 rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingWorkType ? 'Редактирование вида работ' : 'Создание нового вида работ (WORK_TYPE)'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Шифр / Код *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Напр. ОВ, ВК, ЭОМ..."
                    value={formCode}
                    onChange={e => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 uppercase font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Категория *
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  >
                    {Object.entries(CATEGORY_NAMES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Полное наименование вида работ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Монтаж фреонопроводов VRF систем"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Единица измерения по умолчанию
                  </label>
                  <input
                    type="text"
                    placeholder="м.п., м², м³, шт., компл."
                    value={formDefaultUnit}
                    onChange={e => setFormDefaultUnit(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Нормативный стандарт (СП / ГОСТ)
                  </label>
                  <input
                    type="text"
                    placeholder="СП 60.13330 / СП 73.13330"
                    value={formStandard}
                    onChange={e => setFormStandard(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Checkbox controls */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-semibold text-slate-800">
                  Обязательные этапы контроля качества:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formRequiresHoldPoint}
                      onChange={e => setFormRequiresHoldPoint(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span>Hold Point (Стоп-точка)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formRequiresWitnessPoint}
                      onChange={e => setFormRequiresWitnessPoint(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span>Witness Point (Освидетельствование)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formRequiresAosr}
                      onChange={e => setFormRequiresAosr(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span>Требуется АОСР</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Типовые контрольные чек-поинты (каждый с новой строки)
                </label>
                <textarea
                  rows={4}
                  placeholder="Входной контроль труб и изоляции&#10;Опрессовка азотом 41.5 бар (24ч)&#10;Вакуумирование до 750 микрон"
                  value={formCheckpoints}
                  onChange={e => setFormCheckpoints(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer"
                >
                  {editingWorkType ? 'Сохранить изменения' : 'Создать вид работ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
