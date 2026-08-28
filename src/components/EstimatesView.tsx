import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EstimateItem, DataStatus } from '../types';
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Filter,
  Search,
  ArrowUpDown,
  Layers,
  Edit2,
  Check,
  X
} from 'lucide-react';

export const EstimatesView: React.FC = () => {
  const { estimateItems, updateEstimateItemQty, can } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempFactQty, setTempFactQty] = useState<number>(0);

  const filteredItems = estimateItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.itemNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const conflictsCount = estimateItems.filter(i => i.status === 'CONFLICT').length;
  const totalPlannedSum = estimateItems.reduce((acc, curr) => acc + ((curr.plannedQty ?? 0) * (curr.unitPriceRub ?? 0)), 0);
  const totalFactSum = estimateItems.reduce((acc, curr) => acc + ((curr.actualFactQty ?? 0) * (curr.unitPriceRub ?? 0)), 0);

  const startEdit = (item: EstimateItem) => {
    setEditingItemId(item.id);
    setTempFactQty(item.actualFactQty);
  };

  const saveEdit = (itemId: string) => {
    updateEstimateItemQty(itemId, Number(tempFactQty));
    setEditingItemId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            СМЕТНЫЙ И ОБЪЕМНЫЙ КОНТРОЛЬ (ПЛАН ↔ СМЕТА ↔ ФАКТ)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Сверка рабочей документации с локальными сметами и физическими объемами монтажа. Выявление коллизий.
          </p>
        </div>

        {conflictsCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-900 shadow-xs">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Обнаружено коллизий: {conflictsCount}</span>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-neutral-500">Стоимость по РД (План)</div>
          <div className="mt-1 text-xl font-bold text-neutral-900">
            {(totalPlannedSum / 1000000).toFixed(2)} млн ₽
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">На основе утвержденных спецификаций</div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-neutral-500">Смонтировано по факту</div>
          <div className="mt-1 text-xl font-bold text-neutral-900">
            {(totalFactSum / 1000000).toFixed(2)} млн ₽
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Выполнение: {totalPlannedSum > 0 ? ((totalFactSum / totalPlannedSum) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-neutral-500">Статус достоверности</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              {conflictsCount > 0 ? 'CONFLICT DETECTED' : 'CONFIRMED'}
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Запрет самостоятельного выбора верного значения
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Поиск по наименованию материала, оборудования, номеру позиции..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          {['ALL', 'CONFLICT', 'DOCUMENT CONFIRMED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {st === 'ALL' ? 'Все статусы' : st === 'CONFLICT' ? 'Только конфликты' : 'Подтверждено РД'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reconciliation Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 uppercase font-semibold border-b border-neutral-200 text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">№ Поз</th>
                <th className="py-3 px-4 min-w-[280px]">Наименование ресурса / работы</th>
                <th className="py-3 px-2">Ед. изм.</th>
                <th className="py-3 px-3 text-right">План (РД)</th>
                <th className="py-3 px-3 text-right">Смета (ЛС)</th>
                <th className="py-3 px-3 text-right">Факт (Монтаж)</th>
                <th className="py-3 px-3 text-right">Принято (АОСР)</th>
                <th className="py-3 px-3 text-right">Цена, ₽</th>
                <th className="py-3 px-3 text-center">Статус источника</th>
                <th className="py-3 px-3 text-center">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filteredItems.map(item => {
                const isEditing = editingItemId === item.id;
                const isConflict = item.status === 'CONFLICT';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-neutral-50/70 transition-colors ${
                      isConflict ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-neutral-500">{item.itemNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{item.name}</div>
                      {item.conflictReason && (
                        <div className="mt-1 text-[11px] text-amber-900 bg-amber-100/80 p-1.5 rounded flex items-start gap-1 font-medium">
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-amber-700" />
                          <span>{item.conflictReason}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 font-mono text-neutral-500">{item.unit}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">{item.plannedQty}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-neutral-600">{item.estimateQty}</td>
                    
                    {/* Fact Qty with inline editor */}
                    <td className="py-3 px-3 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempFactQty}
                          onChange={e => setTempFactQty(Number(e.target.value))}
                          className="w-20 rounded border border-neutral-400 p-1 text-right font-mono text-xs focus:ring-1 focus:ring-neutral-900"
                        />
                      ) : (
                        <span className={`font-bold ${(item.actualFactQty ?? 0) > (item.plannedQty ?? 0) ? 'text-red-600 underline' : 'text-neutral-900'}`}>
                          {item.actualFactQty ?? 0}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-bold">{item.acceptedQty}</td>
                    <td className="py-3 px-3 text-right font-mono">{typeof item.unitPriceRub === 'number' ? item.unitPriceRub.toLocaleString('ru-RU') : (item.unitPriceRub ?? 0)}</td>
                    
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                          item.status === 'DOCUMENT CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'CONFLICT'
                            ? 'bg-amber-200 text-amber-950 border border-amber-300'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {can('EDIT', 'estimates') && (
                        isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => saveEdit(item.id)}
                              className="p-1 rounded bg-neutral-900 text-white hover:bg-neutral-800"
                              title="Сохранить"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="p-1 rounded border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                              title="Отмена"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                            title="Ввести факт выполнения"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
