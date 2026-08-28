import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, Building, ShieldCheck, Mail, Phone } from 'lucide-react';

export const OrganizationsView: React.FC = () => {
  const { organizations } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            УЧАСТНИКИ СТРОИТЕЛЬНОГО ПРОЦЕССА
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Реестр организаций: Технический заказчик, Генпроектировщик, Генподрядчик, Строительный контроль, Субподрядчики.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map(org => (
          <div key={org.id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded uppercase">
                  {org.type}
                </span>
                <h3 className="text-sm font-bold text-neutral-900 mt-1.5">{org.name}</h3>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">ИНН: {org.inn}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
              <div>
                <span className="font-semibold text-neutral-900">СРО / Лицензия: </span>
                <span>{org.sroNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-900">Контактное лицо: </span>
                <span>{org.contactPerson}</span>
              </div>
              <div className="flex items-center gap-1 text-neutral-500">
                <Mail className="h-3 w-3" /> <span>{org.email}</span>
              </div>
              <div className="flex items-center gap-1 text-neutral-500">
                <Phone className="h-3 w-3" /> <span>{org.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
