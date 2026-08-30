import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ProjectAnalysisJob,
  AiAgentRole,
  ExecutiveDecisionCode,
  SingleAgentOutput
} from '../types';
import {
  BrainCircuit,
  Play,
  RotateCw,
  FileCheck2,
  TrendingUp,
  AlertTriangle,
  Layers,
  Cpu,
  Coins,
  HardHat,
  Scale,
  Sparkles,
  ArrowUpRight,
  Printer,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Briefcase,
  Search,
  Zap
} from 'lucide-react';

export const AiProjectAnalysisView: React.FC = () => {
  const { currentProject } = useApp();
  const [job, setJob] = useState<ProjectAnalysisJob | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningAnalysis, setRunningAnalysis] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'EXECUTIVE' | 'AGENTS' | 'DATASET' | 'ESTIMATE' | 'PRODUCTION' | 'PROFITABILITY' | 'RISKS_CONFLICTS'>('EXECUTIVE');
  const [datasetFilter, setDatasetFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoTriggerEnabled, setAutoTriggerEnabled] = useState<boolean>(true);

  const projectId = currentProject?.id || 'proj-sample-ov1';

  // Fetch or trigger analysis
  const fetchAnalysis = async (forceRun = false) => {
    try {
      if (forceRun) {
        setRunningAnalysis(true);
        const res = await fetch(`/api/projects/${projectId}/ai-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectName: currentProject?.name || 'Административно-деловой комплекс (Системы ОВиК / VRF)',
            documentIds: ['doc-240-ov1'],
            contractPriceRub: 40000000,
            autoTriggered: autoTriggerEnabled
          })
        });
        const data = await res.json();
        if (data.job) {
          setJob(data.job);
        }
      } else {
        const res = await fetch(`/api/projects/${projectId}/ai-analysis`);
        const data = await res.json();
        if (data.job) {
          setJob(data.job);
        }
      }
    } catch (err) {
      console.error('Failed to fetch project analysis:', err);
    } finally {
      setLoading(false);
      setRunningAnalysis(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [projectId]);

  // Polling if job is still in progress
  useEffect(() => {
    if (!job || job.status === 'COMPLETED' || job.status === 'FAILED') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/ai-analysis/status`);
        const statusData = await res.json();
        if (statusData.status === 'COMPLETED' || statusData.status === 'FAILED') {
          fetchAnalysis(false);
        } else {
          setJob(prev => prev ? { ...prev, ...statusData } : null);
        }
      } catch (err) {
        console.error('Polling status error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [job?.status, projectId]);

  const handlePrintReport = () => {
    window.print();
  };

  const getDecisionBadge = (decision?: ExecutiveDecisionCode) => {
    switch (decision) {
      case 'GO':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
          badge: 'bg-emerald-600 text-white',
          label: 'GO — ОДОБРЕНО К РЕАЛИЗАЦИИ',
          icon: CheckCircle2
        };
      case 'GO_WITH_CONDITIONS':
        return {
          bg: 'bg-amber-500/10 text-amber-900 border-amber-500/30',
          badge: 'bg-amber-600 text-white',
          label: 'GO WITH CONDITIONS — ПРИНЯТЬ С УСЛОВИЯМИ',
          icon: AlertTriangle
        };
      case 'RENEGOTIATE':
        return {
          bg: 'bg-orange-500/10 text-orange-900 border-orange-500/30',
          badge: 'bg-orange-600 text-white',
          label: 'RENEGOTIATE — ТРЕБУЕТСЯ ПЕРЕСОГЛАСОВАНИЕ ЦЕНЫ',
          icon: RotateCw
        };
      case 'NO_GO':
        return {
          bg: 'bg-red-500/10 text-red-900 border-red-500/30',
          badge: 'bg-red-600 text-white',
          label: 'NO-GO — ВЫСОКИЙ РИСК / ОТКЛОНИТЬ',
          icon: AlertOctagon
        };
      default:
        return {
          bg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
          badge: 'bg-neutral-800 text-white',
          label: 'АНАЛИЗ В ПРОЦЕССЕ',
          icon: Clock
        };
    }
  };

  if (loading && !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-semibold tracking-wider uppercase text-neutral-600">
          Загрузка и сборка инженерного консилиума AI...
        </div>
      </div>
    );
  }

  const decisionBadge = getDecisionBadge(job?.executiveDecision?.decision);
  const DecisionIcon = decisionBadge.icon;

  const filteredItems = (job?.dataset?.extractedItems || []).filter(item => {
    const matchesFilter = datasetFilter === 'ALL' || item.category === datasetFilter;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.section && item.section.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-900 text-white">
                <BrainCircuit className="w-3.5 h-3.5" />
                СК-КИТ MULTI-AGENT V2.5
              </span>
              <span className="text-xs font-medium text-neutral-500">
                12 Инженерных Агентов + Детерминированный Расчетный Движок
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              AI-Анализ Проекта, Смета ГЭСН, Рентабельность и Риски
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Объект: <strong className="text-neutral-900">{job?.projectName || currentProject?.name || 'Административно-деловой комплекс (ОВ1)'}</strong> • Шифр: <span className="font-mono font-semibold">240/24-ОВ1</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 select-none">
              <input
                type="checkbox"
                checked={autoTriggerEnabled}
                onChange={e => setAutoTriggerEnabled(e.target.checked)}
                className="rounded text-neutral-900 focus:ring-neutral-900"
              />
              <span>Автоанализ при загрузке РД</span>
            </label>

            <button
              onClick={() => fetchAnalysis(true)}
              disabled={runningAnalysis || job?.status === 'IN_PROGRESS'}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {runningAnalysis || job?.status === 'IN_PROGRESS' ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Анализ выполняется...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Запустить полный AI-консилиум</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-100 text-neutral-800 text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition border border-neutral-200/80 cursor-pointer"
              title="Печать отчета / Экспорт в PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Печать / PDF</span>
            </button>
          </div>
        </div>

        {/* Progress Bar when running */}
        {(runningAnalysis || job?.status === 'IN_PROGRESS' || job?.status === 'PARSING_DOCUMENTS') && (
          <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-neutral-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                {job?.currentPhaseText || 'Выполняется кросс-валидация проектных данных...'}
              </span>
              <span className="font-mono font-bold text-neutral-900">{job?.progressPercent || 25}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 transition-all duration-500 rounded-full"
                style={{ width: `${job?.progressPercent || 25}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Цена Договора</div>
          <div className="text-base sm:text-lg font-bold text-neutral-900 mt-1">
            {(job?.financialModel?.contractPriceRub || 0).toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">В т.ч. НДС 20%</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Себестоимость</div>
          <div className="text-base sm:text-lg font-bold text-neutral-900 mt-1">
            {(job?.financialModel?.grossCostRub || 0).toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">ГЭСН / 7 категорий затрат</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Ожидаемая Маржа</div>
          <div className="text-base sm:text-lg font-bold text-emerald-700 mt-1 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {job?.profitability?.expectedMarginPercent || 0}%
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            Наценка: {job?.profitability?.base?.markupPercent || 0}%
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Ожидаемая Прибыль</div>
          <div className="text-base sm:text-lg font-bold text-emerald-700 mt-1">
            {(job?.profitability?.expectedProfitRub || 0).toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">С учетом рисков</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Трудозатраты</div>
          <div className="text-base sm:text-lg font-bold text-neutral-900 mt-1 flex items-center gap-1">
            <HardHat className="w-4 h-4 text-neutral-700" />
            {job?.productionPlan?.totalLaborHours || 0} ч
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            {job?.productionPlan?.recommendedCrewSize || 0} чел. • {job?.productionPlan?.estimatedDurationDays || 0} дн.
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Коллизии / Риски</div>
          <div className="text-base sm:text-lg font-bold text-amber-700 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {job?.conflicts?.length || 0} / {job?.risks?.length || 0}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Коллизий в РД / Рисков</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200 overflow-x-auto no-scrollbar gap-1">
        {[
          { id: 'EXECUTIVE', label: 'Управленческое решение', icon: ShieldCheck },
          { id: 'AGENTS', label: '12 AI-Агентов Консилиума', icon: Cpu },
          { id: 'DATASET', label: 'Датасет РД & Провенанс', icon: Layers },
          { id: 'ESTIMATE', label: 'Смета ГЭСН / Затраты', icon: Coins },
          { id: 'PRODUCTION', label: 'Производство & График', icon: HardHat },
          { id: 'PROFITABILITY', label: '3 Сценария Рентабельности', icon: TrendingUp },
          { id: 'RISKS_CONFLICTS', label: 'Риски & Коллизии РД', icon: AlertOctagon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition cursor-pointer ${
                isActive
                  ? 'border-neutral-900 text-neutral-900 bg-white/50'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE DECISION */}
      {activeTab === 'EXECUTIVE' && (
        <div className="space-y-6">
          {/* Main Decision Banner */}
          <div className={`p-6 rounded-2xl border ${decisionBadge.bg} space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${decisionBadge.badge}`}>
                  <DecisionIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Итоговый вердикт Генерального Консилиума СК-КИТ
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-neutral-900">
                    {decisionBadge.label}
                  </h2>
                </div>
              </div>

              {job?.executiveDecision?.suggestedPriceAdjustmentRub ? (
                <div className="bg-white/80 backdrop-blur-xs px-4 py-2 rounded-xl border border-amber-300">
                  <div className="text-[10px] font-bold text-amber-900 uppercase">Рекомендуемая корректировка цены</div>
                  <div className="text-base font-extrabold text-amber-900">
                    +{job.executiveDecision.suggestedPriceAdjustmentRub.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              ) : null}
            </div>

            <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
              {job?.executiveDecision?.summary || 'Проект прошел многофакторную валидацию 12 инженерных и финансовых агентов.'}
            </p>

            {/* Key Conditions */}
            {job?.executiveDecision?.keyConditions && job.executiveDecision.keyConditions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-300/40">
                <div className="text-xs font-bold uppercase text-neutral-900 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-neutral-900" />
                  Обязательные условия принятия проекта в производство:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {job.executiveDecision.keyConditions.map((cond, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white/70 p-3 rounded-lg border border-neutral-200/80 text-xs text-neutral-800">
                      <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{cond}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Justifications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-neutral-700" />
                Инженерные обоснования (ОВиК / ПТО)
              </h3>
              <ul className="space-y-2 text-xs text-neutral-600">
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>21 наружный блок VRF Daikin/MDV 45 кВт требуют виброизолирующих рам и испытаний контура на 4.15 МПа.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>Выявлен дефицит медной трубы в сметном расчете (-70 м). Требуется доп. соглашение до выхода на кровлю.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>Определены 4 ключевые контрольные точки (Hold Points) со 100% оформлением АОСР.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Coins className="w-4 h-4 text-neutral-700" />
                Финансовый расчет и рентабельность
              </h3>
              <ul className="space-y-2 text-xs text-neutral-600">
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>Прямые затраты: <strong>{(job?.estimate?.directCosts?.totalDirectRub || 0).toLocaleString('ru-RU')} ₽</strong>.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>Точка безубыточности (Break-even): <strong>{(job?.financialModel?.breakEvenCostRub || 0).toLocaleString('ru-RU')} ₽</strong>.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>Базовая рентабельность проекта: <strong>{job?.profitability?.base?.marginPercent || 0}%</strong> (Прибыль {((job?.profitability?.base?.profitRub || 0)).toLocaleString('ru-RU')} ₽).</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-700" />
                Управление рисками и МТО
              </h3>
              <ul className="space-y-2 text-xs text-neutral-600">
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>Срок поставки блоков VRF — 45 дней. Требуется авансирование 35% в течение 3 рабочих дней.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>Стоимость выявленных рисков: <strong>{job?.risks?.reduce((acc, r) => acc + (r.costOfRiskRub || 0), 0).toLocaleString('ru-RU')} ₽</strong>.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>Резерв на непредвиденные расходы (5%): <strong>{(job?.estimate?.indirectCosts?.contingencyRub || 0).toLocaleString('ru-RU')} ₽</strong>.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 12 AI AGENTS TEAM */}
      {activeTab === 'AGENTS' && (
        <div className="space-y-4">
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs text-neutral-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-900" />
              <span>
                Команда из <strong>12 специализированных AI-агентов</strong> провела перекрестный анализ документации.
              </span>
            </div>
            <span className="font-mono text-neutral-500">AI Source: Multi-Tier Resilient Architecture</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {job?.agents && (Object.values(job.agents) as SingleAgentOutput[]).map(agent => (
              <div
                key={agent.agentRole}
                className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-2xs hover:shadow-xs transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-mono">
                      {agent.agentRole}
                    </span>
                    <h3 className="text-xs font-bold text-neutral-900 mt-0.5">
                      {agent.agentName}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    agent.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                  {agent.summary}
                </p>

                {agent.findings && agent.findings.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-neutral-100">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase">Ключевые выводы:</div>
                    {agent.findings.slice(0, 3).map((f, i) => (
                      <div key={i} className="text-[11px] text-neutral-600 flex items-start gap-1">
                        <span className="text-neutral-400">•</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-2 border-t border-neutral-50 font-mono">
                  <span>Достоверность: {Math.round((agent.confidence || 0.95) * 100)}%</span>
                  <span>{agent.aiSource} • {agent.modelUsed || 'Gemini'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROJECT DATASET & PROVENANCE */}
      {activeTab === 'DATASET' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200/80">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'ALL', label: 'Все позиции' },
                { id: 'EQUIPMENT', label: 'Оборудование' },
                { id: 'MATERIAL', label: 'Материалы' },
                { id: 'WORK', label: 'Работы' },
                { id: 'FITTING', label: 'Фасонные части' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setDatasetFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    datasetFilter === f.id
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Поиск по спецификации..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Dataset Table */}
          <div className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Категория</th>
                    <th className="py-2.5 px-3">Наименование и тех. характеристика</th>
                    <th className="py-2.5 px-3">Бренд / Марка</th>
                    <th className="py-2.5 px-3 text-right">Кол-во</th>
                    <th className="py-2.5 px-3">Ед.</th>
                    <th className="py-2.5 px-3">Лист / Раздел</th>
                    <th className="py-2.5 px-3">Источник РД</th>
                    <th className="py-2.5 px-3 text-center">Достоверность</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-50/70 transition">
                      <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-neutral-600">
                        {item.category}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-neutral-900">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">
                        {item.brand || item.model || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                        {item.quantity.toLocaleString('ru-RU')}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">
                        {item.unit}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-600">
                        {item.section || 'ОВ1'}{item.sheetNumber ? `, Л.${item.sheetNumber}` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 font-mono text-[11px]">
                        {item.source_document || '240/24-ОВ1.СО'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (item.confidence || 1) >= 0.9
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {Math.round((item.confidence || 0.95) * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESOURCE ESTIMATE */}
      {activeTab === 'ESTIMATE' && (
        <div className="space-y-6">
          {/* 7 Cost Categories Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Оборудование', sum: job?.estimate?.directCosts?.equipmentRub || 0 },
              { label: 'Материалы', sum: job?.estimate?.directCosts?.materialsRub || 0 },
              { label: 'Оплата труда', sum: job?.estimate?.directCosts?.laborRub || 0 },
              { label: 'Субподряд', sum: job?.estimate?.directCosts?.subcontractRub || 0 },
              { label: 'Логистика', sum: job?.estimate?.directCosts?.logisticsRub || 0 },
              { label: 'Инструмент / МАШ', sum: job?.estimate?.directCosts?.toolsRub || 0 },
              { label: 'Расходники', sum: job?.estimate?.directCosts?.consumablesRub || 0 }
            ].map((cat, i) => (
              <div key={i} className="bg-white p-3 rounded-xl border border-neutral-200/80 shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-neutral-500">{cat.label}</div>
                <div className="text-sm font-bold text-neutral-900 mt-1">
                  {cat.sum.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            ))}
          </div>

          {/* Overhead & Contingency Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200/80">
              <div className="text-xs font-bold text-neutral-500 uppercase">Прямые затраты (Direct Cost)</div>
              <div className="text-xl font-black text-neutral-900 mt-1">
                {(job?.estimate?.directCosts?.totalDirectRub || 0).toLocaleString('ru-RU')} ₽
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200/80">
              <div className="text-xs font-bold text-neutral-500 uppercase">Накладные расходы (12% НР)</div>
              <div className="text-xl font-black text-neutral-900 mt-1">
                {(job?.estimate?.indirectCosts?.overheadRub || 0).toLocaleString('ru-RU')} ₽
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200/80">
              <div className="text-xs font-bold text-neutral-500 uppercase">Непредвиденные расходы (5%)</div>
              <div className="text-xl font-black text-neutral-900 mt-1">
                {(job?.estimate?.indirectCosts?.contingencyRub || 0).toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          {/* Estimate Table */}
          <div className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-neutral-200 font-bold text-xs text-neutral-900">
              Позиции сметного расчета (Нормативная база ГЭСН / Рыночные прайсы)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2 px-3">Категория</th>
                    <th className="py-2 px-3">Наименование работ / ресурсов</th>
                    <th className="py-2 px-3 text-right">Объем</th>
                    <th className="py-2 px-3">Ед.</th>
                    <th className="py-2 px-3 text-right">Цена за ед.</th>
                    <th className="py-2 px-3 text-right">Сумма всего</th>
                    <th className="py-2 px-3">Источник цены</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(job?.estimate?.items || []).map(est => (
                    <tr key={est.id} className="hover:bg-neutral-50 transition">
                      <td className="py-2 px-3 font-mono text-[11px] text-neutral-500">{est.category}</td>
                      <td className="py-2 px-3 font-medium text-neutral-900">{est.workOrItemName}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-neutral-800">{est.quantity.toLocaleString('ru-RU')}</td>
                      <td className="py-2 px-3 text-neutral-600">{est.unit}</td>
                      <td className="py-2 px-3 text-right font-mono text-neutral-600">{est.unitPriceRub.toLocaleString('ru-RU')} ₽</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">{est.totalPriceRub.toLocaleString('ru-RU')} ₽</td>
                      <td className="py-2 px-3 text-neutral-500 text-[11px]">{est.priceSource || 'ГЭСН-2020'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRODUCTION & SCHEDULE */}
      {activeTab === 'PRODUCTION' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200/80">
              <div className="text-xs font-bold text-neutral-500 uppercase">Общие трудозатраты</div>
              <div className="text-2xl font-black text-neutral-900 mt-1">
                {job?.productionPlan?.totalLaborHours || 0} чел.-ч.
              </div>
              <div className="text-xs text-neutral-500 mt-1">По нормативам ГЭСН/ФЕР</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200/80">
              <div className="text-xs font-bold text-neutral-500 uppercase">Рекомендуемый состав бригады</div>
              <div className="text-2xl font-black text-neutral-900 mt-1">
                {job?.productionPlan?.recommendedCrewSize || 0} чел.
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {job?.productionPlan?.crewComposition?.join(', ') || 'Монтажники ОВиК, сварщики, слесари'}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200/80">
              <div className="text-xs font-bold text-neutral-500 uppercase">Длительность СМР</div>
              <div className="text-2xl font-black text-neutral-900 mt-1">
                {job?.productionPlan?.estimatedDurationDays || 0} раб. дней
              </div>
              <div className="text-xs text-neutral-500 mt-1">При 1-сменном 8-часовом графике</div>
            </div>
          </div>

          {/* PTO Hold Points List */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-900" />
              Обязательные контрольные точки ПТО (Hold Points & АОСР)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(job?.ptoHoldPoints || []).map(hp => (
                <div key={hp.id} className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-neutral-900">{hp.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white">
                      {hp.stage}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700">{hp.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-200 font-mono">
                    <span>Документ: {hp.requiredDocument}</span>
                    <span className="font-bold text-neutral-800">{hp.responsibleRole}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PROFITABILITY SCENARIOS */}
      {activeTab === 'PROFITABILITY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Optimistic Scenario */}
            <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  ОПТИМИСТИЧНЫЙ
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  Маржа: {job?.profitability?.optimistic?.marginPercent || 0}%
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-neutral-500">Ожидаемая себестоимость:</div>
                <div className="text-lg font-bold text-neutral-900">
                  {(job?.profitability?.optimistic?.costRub || 0).toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-xs text-neutral-500 pt-1">Чистая прибыль:</div>
                <div className="text-xl font-extrabold text-emerald-700">
                  {(job?.profitability?.optimistic?.profitRub || 0).toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <p className="text-xs text-neutral-600 border-t border-neutral-100 pt-2">
                {job?.profitability?.optimistic?.description}
              </p>
            </div>

            {/* Base Scenario */}
            <div className="bg-white p-5 rounded-xl border-2 border-neutral-900 shadow-xs space-y-3 relative">
              <div className="absolute -top-3 left-4 bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Базовый сценарий (60% вероятность)
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800">
                  БАЗОВЫЙ (СМЕТА)
                </span>
                <span className="text-xs font-bold text-neutral-900">
                  Маржа: {job?.profitability?.base?.marginPercent || 0}%
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-neutral-500">Себестоимость по ГЭСН:</div>
                <div className="text-lg font-bold text-neutral-900">
                  {(job?.profitability?.base?.costRub || 0).toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-xs text-neutral-500 pt-1">Плановая прибыль:</div>
                <div className="text-xl font-extrabold text-neutral-900">
                  {(job?.profitability?.base?.profitRub || 0).toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <p className="text-xs text-neutral-600 border-t border-neutral-100 pt-2">
                {job?.profitability?.base?.description}
              </p>
            </div>

            {/* Risk Scenario */}
            <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  РИСКОВЫЙ
                </span>
                <span className="text-xs font-bold text-amber-800">
                  Маржа: {job?.profitability?.risk?.marginPercent || 0}%
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-neutral-500">Себестоимость при рисках:</div>
                <div className="text-lg font-bold text-neutral-900">
                  {(job?.profitability?.risk?.costRub || 0).toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-xs text-neutral-500 pt-1">Минимальная прибыль:</div>
                <div className="text-xl font-extrabold text-amber-800">
                  {(job?.profitability?.risk?.profitRub || 0).toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <p className="text-xs text-neutral-600 border-t border-neutral-100 pt-2">
                {job?.profitability?.risk?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: RISKS & CONFLICTS */}
      {activeTab === 'RISKS_CONFLICTS' && (
        <div className="space-y-6">
          {/* Conflicts Section */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Выявленные коллизии и расхождения (РД ↔ Смета ↔ Спецификация)
            </h3>
            {job?.conflicts && job.conflicts.length > 0 ? (
              <div className="space-y-3">
                {job.conflicts.map(conf => (
                  <div key={conf.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="font-bold text-xs text-neutral-900">{conf.title}</div>
                      <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full self-start">
                        Финансовый эффект: +{conf.financialImpactRub?.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-neutral-200">
                      <div>
                        <span className="text-neutral-500">Источник А ({conf.sourceA.documentName}):</span>
                        <div className="font-bold text-neutral-900">{conf.sourceA.value} ({conf.sourceA.sheetOrPage})</div>
                      </div>
                      <div>
                        <span className="text-neutral-500">Источник B ({conf.sourceB.documentName}):</span>
                        <div className="font-bold text-neutral-900">{conf.sourceB.value} ({conf.sourceB.sheetOrPage})</div>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-700">
                      <strong>Рекомендация:</strong> {conf.resolutionRecommendation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-neutral-500 italic">Коллизий между РД и сметой не обнаружено.</div>
            )}
          </div>

          {/* Risks Table */}
          <div className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-neutral-200 font-bold text-xs text-neutral-900">
              Реестр выявленных проектных и производственных рисков
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Уровень</th>
                    <th className="py-2.5 px-3">Категория</th>
                    <th className="py-2.5 px-3">Наименование риска</th>
                    <th className="py-2.5 px-3 text-right">Оценка риска</th>
                    <th className="py-2.5 px-3">Компенсирующее мероприятие</th>
                    <th className="py-2.5 px-3">Ответственный</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(job?.risks || []).map(r => (
                    <tr key={r.id} className="hover:bg-neutral-50 transition">
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.severity === 'CRITICAL'
                            ? 'bg-red-600 text-white'
                            : r.severity === 'HIGH'
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-neutral-200 text-neutral-800'
                        }`}>
                          {r.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-500">{r.category}</td>
                      <td className="py-2.5 px-3 font-medium text-neutral-900">{r.title}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                        {r.costOfRiskRub.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="py-2.5 px-3 text-neutral-700">{r.mitigationMeasure}</td>
                      <td className="py-2.5 px-3 font-semibold text-neutral-800">{r.responsibleRole}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
