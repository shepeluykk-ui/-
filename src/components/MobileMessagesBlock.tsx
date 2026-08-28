import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SystemModule } from '../types';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronRight,
  Bell,
  ArrowUpRight,
  X
} from 'lucide-react';

export type MobileMessageType = 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';

export interface MobileMessageItem {
  id: string;
  type: MobileMessageType;
  text: string;
  moduleTarget?: SystemModule;
  details?: string;
  timestamp?: string;
}

interface MobileMessagesBlockProps {
  onNavigate?: (module: SystemModule) => void;
  className?: string;
}

export const MobileMessagesBlock: React.FC<MobileMessagesBlockProps> = ({
  onNavigate,
  className = ''
}) => {
  const { inspections, defects, executiveDocs, notifications } = useApp();
  const [selectedMessage, setSelectedMessage] = useState<MobileMessageItem | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);

  // Compute dynamic smart messages from active project state
  const criticalHoldPoints = inspections.filter(i => i.isHoldPoint && i.holdPointStatus === 'ACTIVE_HOLD').length;
  const criticalDefects = defects.filter(d => d.severity === 'CRITICAL' && d.status !== 'CLOSED').length;
  const pendingDocs = executiveDocs.filter(d => d.status === 'READY_FOR_SIGN' || d.status === 'UNDER_REVIEW').length;
  const approvedDocs = executiveDocs.filter(d => d.status === 'SIGNED' || d.status === 'ARCHIVED').length;

  const messages: MobileMessageItem[] = [
    ...(criticalHoldPoints > 0
      ? [
          {
            id: 'msg-crit-hp',
            type: 'CRITICAL' as const,
            text: `${criticalHoldPoints} Hold Point блокирует приемку`,
            moduleTarget: 'construction_control' as SystemModule,
            details: 'Критическая точка остановки работ не снята. Опрессовка или скрытые работы требуют подтверждения инженера технадзора.'
          }
        ]
      : []),
    ...(criticalDefects > 0
      ? [
          {
            id: 'msg-crit-def',
            type: 'CRITICAL' as const,
            text: `${criticalDefects} критических дефекта требуют устранения`,
            moduleTarget: 'defects' as SystemModule,
            details: 'Выявлены предписания с риском остановки монтажных работ. Требуется фотофиксация устранения.'
          }
        ]
      : []),
    {
      id: 'msg-warn-col',
      type: 'WARNING' as const,
      text: 'Обнаружена коллизия объемов по смете',
      moduleTarget: 'estimates' as SystemModule,
      details: 'Разница между рабочей документацией (РД) и фактически принятыми объемами превышает допустимый допуск.'
    },
    ...(pendingDocs > 0
      ? [
          {
            id: 'msg-info-aosr',
            type: 'INFO' as const,
            text: `АОСР №${pendingDocs + 20} ожидает подписания`,
            moduleTarget: 'executive_docs' as SystemModule,
            details: 'Акт освидетельствования скрытых работ сформирован инженером ПТО и направлен на визирование заказчику.'
          }
        ]
      : [
          {
            id: 'msg-info-gen',
            type: 'INFO' as const,
            text: 'Журнал работ актуализирован инженером ПТО',
            moduleTarget: 'executive_docs' as SystemModule,
            details: 'Записи общего и специального журналов работ согласованы.'
          }
        ]),
    ...(approvedDocs > 0
      ? [
          {
            id: 'msg-succ-aosr',
            type: 'SUCCESS' as const,
            text: 'АОСР №23 успешно принят и подписан',
            moduleTarget: 'executive_docs' as SystemModule,
            details: 'Комплект исполнительной документации утвержден технадзором и заказчиком без замечаний.'
          }
        ]
      : [
          {
            id: 'msg-succ-gen',
            type: 'SUCCESS' as const,
            text: 'Все контрольные точки этажа сданы',
            moduleTarget: 'construction_control' as SystemModule,
            details: 'Очередной этап монтажа инженерных сетей принят в полном объеме.'
          }
        ])
  ];

  const getBadgeStyle = (type: MobileMessageType) => {
    switch (type) {
      case 'CRITICAL':
        return {
          icon: <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />,
          badgeBg: 'bg-red-100 text-red-800 border-red-200',
          cardBorder: 'border-red-200/80 bg-red-50/40'
        };
      case 'WARNING':
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />,
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          cardBorder: 'border-amber-200/80 bg-amber-50/40'
        };
      case 'INFO':
        return {
          icon: <Info className="h-3.5 w-3.5 text-sky-600 shrink-0" />,
          badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
          cardBorder: 'border-sky-200/80 bg-sky-50/40'
        };
      case 'SUCCESS':
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />,
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          cardBorder: 'border-emerald-200/80 bg-emerald-50/40'
        };
    }
  };

  return (
    <div className={`w-full mt-4 space-y-2 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-600">
          <Bell className="h-3.5 w-3.5 text-cyan-600" />
          <span>Оперативные сообщения</span>
        </div>
        <button
          onClick={() => setShowAllModal(true)}
          className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-900 flex items-center gap-0.5 cursor-pointer py-1"
        >
          <span>Все сообщения</span>
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-1.5">
        {messages.slice(0, 3).map((item) => {
          const style = getBadgeStyle(item.type);
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border ${style.cardBorder} transition-all`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="shrink-0">{style.icon}</span>
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border tracking-wider shrink-0 ${style.badgeBg}`}
                >
                  {item.type}
                </span>
                <span className="text-xs font-medium text-neutral-900 truncate">
                  {item.text}
                </span>
              </div>

              <button
                onClick={() => setSelectedMessage(item)}
                className="text-[11px] font-bold text-neutral-700 hover:text-neutral-950 bg-white/90 hover:bg-white border border-neutral-200/80 px-2 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                Подробнее
              </button>
            </div>
          );
        })}
      </div>

      {/* Details Popup Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-neutral-200 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <div className="flex items-center gap-1.5">
                {getBadgeStyle(selectedMessage.type).icon}
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getBadgeStyle(selectedMessage.type).badgeBg}`}
                >
                  {selectedMessage.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="font-bold text-neutral-900 text-sm">
              {selectedMessage.text}
            </div>

            {selectedMessage.details && (
              <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60">
                {selectedMessage.details}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2">
              {selectedMessage.moduleTarget && onNavigate && (
                <button
                  onClick={() => {
                    const target = selectedMessage.moduleTarget!;
                    setSelectedMessage(null);
                    onNavigate(target);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer min-h-[40px]"
                >
                  <span>Перейти в модуль</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold cursor-pointer min-h-[40px]"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Messages Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-neutral-200 p-4 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-cyan-600" />
                <span className="text-sm font-bold text-neutral-900">
                  Все оперативные сообщения
                </span>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2 overflow-y-auto pr-1">
              {messages.map((item) => {
                const style = getBadgeStyle(item.type);
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border ${style.cardBorder} space-y-1`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {style.icon}
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${style.badgeBg}`}
                        >
                          {item.type}
                        </span>
                      </div>
                      {item.moduleTarget && onNavigate && (
                        <button
                          onClick={() => {
                            setShowAllModal(false);
                            onNavigate(item.moduleTarget!);
                          }}
                          className="text-[10px] font-bold text-cyan-700 hover:underline cursor-pointer"
                        >
                          Перейти →
                        </button>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-neutral-900 pt-1">
                      {item.text}
                    </div>
                    {item.details && (
                      <div className="text-[11px] text-neutral-600 leading-normal">
                        {item.details}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-neutral-100 mt-3">
              <button
                onClick={() => setShowAllModal(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 transition-colors cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
