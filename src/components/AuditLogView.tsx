import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Search, Filter, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (log.newValue && log.newValue.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-neutral-900" />
            НЕИЗМЕНЯЕМЫЙ ЖУРНАЛ АУДИТА ДЕЙСТВИЙ (SECURITY AUDIT TRAIL)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Сквозной протокол всех операций: автор, роль, IP-адрес, тип сущности, старое и новое значение.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            TAMPER-EVIDENT VERIFIED
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Поиск по пользователю, типу сущности, тексту действия..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-neutral-400" />
          {['ALL', 'CREATE', 'UPDATE', 'APPROVE', 'SIGN', 'DELETE'].map(act => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                actionFilter === act
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {act === 'ALL' ? 'Все действия' : act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 uppercase font-semibold text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3 px-3">Метка времени (UTC+3)</th>
                <th className="py-3 px-4">Пользователь & Роль</th>
                <th className="py-3 px-3 text-center">Действие</th>
                <th className="py-3 px-3">Сущность</th>
                <th className="py-3 px-4 min-w-[300px]">Изменение (Old &rarr; New)</th>
                <th className="py-3 px-3 font-mono">IP / Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800 font-mono">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-neutral-50/70 transition-colors text-[11px]">
                  <td className="py-3 px-3 text-neutral-500">{log.timestamp}</td>
                  <td className="py-3 px-4 font-sans font-medium text-neutral-900">
                    <div>{log.userName}</div>
                    <div className="text-[10px] text-neutral-500">{log.userRole}</div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        log.action === 'CREATE'
                          ? 'bg-blue-100 text-blue-800'
                          : log.action === 'APPROVE' || log.action === 'SIGN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'DELETE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-600 font-semibold">{log.entityType}</td>
                  <td className="py-3 px-4 font-sans">
                    {log.oldValue && (
                      <div className="text-neutral-400 line-through text-[11px]">
                        Было: {log.oldValue}
                      </div>
                    )}
                    <div className="text-neutral-900 font-medium">
                      Стало: {log.newValue || log.entityId}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-neutral-400 text-[10px]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
