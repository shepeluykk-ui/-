import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ExecutiveDocItem, ExecutiveDocType, ExecutiveDocStatus } from '../types';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PenTool,
  Search,
  Filter,
  Layers,
  Award,
  ShieldCheck
} from 'lucide-react';

export const ExecutiveDocsView: React.FC = () => {
  const { executiveDocs, signExecutiveDoc, can, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredDocs = executiveDocs.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.actNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || d.docType === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalCount = executiveDocs.length;
  const approvedCount = executiveDocs.filter(d => d.status === 'APPROVED').length;
  const missingCount = executiveDocs.filter(d => d.status === 'MISSING').length;
  const completenessPercent = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            РЕЕСТР ИСПОЛНИТЕЛЬНОЙ ДОКУМЕНТАЦИИ (АОСР / ПАСПОРТА / СЕРТИФИКАТЫ)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Формирование комплектов по РД-11-02-2006. Трехстороннее подписание: Подрядчик ↔ Технадзор ↔ Заказчик.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-neutral-100 text-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200">
            РД-11-02-2006 / СП 48.13330
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-neutral-500">Готовность комплекта ИД</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{completenessPercent}%</span>
            <span className="text-xs text-neutral-500">{approvedCount} из {totalCount} актов</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${completenessPercent}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-neutral-500">Недостающие документы</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">{missingCount} шт</div>
          <div className="text-[11px] text-neutral-400 mt-1">Блокируют передачу объекта в ГАСН</div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-neutral-500">Статус подписания (RBAC)</div>
          <div className="mt-1 text-xs font-bold text-neutral-800">
            Текущая роль: <span className="text-neutral-900 underline">{currentUser.role}</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            ЭЦП формируется при согласовании всех 3 сторон
          </div>
        </div>
      </div>

      {/* Search & Type Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Поиск по номеру АОСР, наименованию скрытых работ..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          {['ALL', 'AOSR', 'PRESSURE_TEST_ACT', 'PASSPORT', 'CERTIFICATE'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === t
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {t === 'ALL' ? 'Все типы' : t === 'AOSR' ? 'АОСР' : t === 'PRESSURE_TEST_ACT' ? 'Акты испытаний' : t === 'PASSPORT' ? 'Паспорта' : 'Сертификаты'}
            </button>
          ))}
        </div>
      </div>

      {/* Executive Docs Registry Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 uppercase font-semibold text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3 px-3">Номер документа</th>
                <th className="py-3 px-4 min-w-[280px]">Наименование скрытых работ / оборудования</th>
                <th className="py-3 px-3">Раздел</th>
                <th className="py-3 px-3 text-center">Подрядчик</th>
                <th className="py-3 px-3 text-center">Технадзор</th>
                <th className="py-3 px-3 text-center">Заказчик</th>
                <th className="py-3 px-3 text-center">Статус</th>
                <th className="py-3 px-3 text-center">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filteredDocs.map(doc => {
                return (
                  <tr key={doc.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900">{doc.actNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{doc.title}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Объем: {doc.volume} • Приложения: {doc.attachedPassportsCount} паспортов, {doc.attachedCertificatesCount} сертификатов
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-neutral-700">{doc.section}</td>
                    
                    {/* Contractor Signature */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          doc.signedByContractor ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {doc.signedByContractor ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {doc.signedByContractor ? 'Подписан' : 'Ожидает'}
                      </span>
                    </td>

                    {/* Supervisor Signature */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          doc.signedBySupervisor ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {doc.signedBySupervisor ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {doc.signedBySupervisor ? 'Подписан' : 'Ожидает'}
                      </span>
                    </td>

                    {/* Customer Signature */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          doc.signedByCustomer ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {doc.signedByCustomer ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {doc.signedByCustomer ? 'Подписан' : 'Ожидает'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                          doc.status === 'APPROVED'
                            ? 'bg-emerald-600 text-white'
                            : doc.status === 'MISSING'
                            ? 'bg-red-100 text-red-800 font-bold'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>

                    {/* Sign Button */}
                    <td className="py-3 px-3 text-center">
                      {doc.status !== 'APPROVED' ? (
                        <button
                          onClick={() => signExecutiveDoc(doc.id, currentUser.role)}
                          className="flex items-center gap-1 text-xs font-bold text-neutral-900 border border-neutral-300 rounded px-2.5 py-1 hover:bg-neutral-100 mx-auto"
                        >
                          <PenTool className="h-3 w-3" /> Подписать
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold">Скомплектован</span>
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
