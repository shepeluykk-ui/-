/**
 * СК-КИТ — ДЕТЕРМИНИРОВАННОЕ РАСЧЕТНОЕ ЯДРО (CALCULATION ENGINE)
 * Исключает генеративные математические ошибки LLM.
 * Производит строго детерминированные расчеты объемов, смет, трудозатрат,
 * себестоимости, рентабельности и рисков по нормам ГЭСН/ФЕР/СП.
 */

import {
  CalculatedEstimateItem,
  CostCategory,
  ResourceModel,
  ProductionPlan,
  FinancialCalculation,
  ProfitabilityAnalysis,
  ProfitabilityScenario,
  AiProjectRiskItem,
  AiConflictItem,
  ProjectItemExtraction
} from '../types';

export class ProjectCalculationEngine {
  /**
   * 1. Расчет детальной ресурсной сметы
   * Группирует прямые затраты по 7 категориям и начисляет накладные (НР) и непредвиденные затраты.
   */
  public static calculateResourceEstimate(
    items: CalculatedEstimateItem[],
    options: {
      overheadPercent?: number;    // % накладных расходов (default 12%)
      contingencyPercent?: number; // % непредвиденных затрат (default 5%)
      taxRatePercent?: number;     // % налогов (default 6% УСН / отчисления)
    } = {}
  ): ResourceModel {
    const overheadPercent = options.overheadPercent ?? 12;
    const contingencyPercent = options.contingencyPercent ?? 5;
    const taxRatePercent = options.taxRatePercent ?? 6;

    let laborRub = 0;
    let materialsRub = 0;
    let equipmentRub = 0;
    let subcontractRub = 0;
    let logisticsRub = 0;
    let toolsRub = 0;
    let consumablesRub = 0;

    const normalizedItems = items.map(item => {
      // Deterministic total for line item
      const totalPriceRub = Math.round((item.quantity * item.unitPriceRub) * 100) / 100;
      const totalLaborHours = item.laborHoursPerUnit
        ? Math.round(item.quantity * item.laborHoursPerUnit * 10) / 10
        : undefined;

      switch (item.category) {
        case 'LABOR':
          laborRub += totalPriceRub;
          break;
        case 'MATERIALS':
          materialsRub += totalPriceRub;
          break;
        case 'EQUIPMENT':
          equipmentRub += totalPriceRub;
          break;
        case 'SUBCONTRACT':
          subcontractRub += totalPriceRub;
          break;
        case 'LOGISTICS':
          logisticsRub += totalPriceRub;
          break;
        case 'TOOLS':
          toolsRub += totalPriceRub;
          break;
        case 'CONSUMABLES':
          consumablesRub += totalPriceRub;
          break;
      }

      return {
        ...item,
        totalPriceRub,
        totalLaborHours
      };
    });

    const totalDirectRub = Math.round(
      (laborRub + materialsRub + equipmentRub + subcontractRub + logisticsRub + toolsRub + consumablesRub) * 100
    ) / 100;

    const overheadRub = Math.round((totalDirectRub * (overheadPercent / 100)) * 100) / 100;
    const taxesRub = Math.round((totalDirectRub * (taxRatePercent / 100)) * 100) / 100;
    const contingencyRub = Math.round(((totalDirectRub + overheadRub) * (contingencyPercent / 100)) * 100) / 100;
    const totalIndirectRub = Math.round((overheadRub + taxesRub + contingencyRub) * 100) / 100;
    const totalEstimatedCostRub = Math.round((totalDirectRub + totalIndirectRub) * 100) / 100;

    return {
      items: normalizedItems,
      directCosts: {
        laborRub: Math.round(laborRub),
        materialsRub: Math.round(materialsRub),
        equipmentRub: Math.round(equipmentRub),
        subcontractRub: Math.round(subcontractRub),
        logisticsRub: Math.round(logisticsRub),
        toolsRub: Math.round(toolsRub),
        consumablesRub: Math.round(consumablesRub),
        totalDirectRub: Math.round(totalDirectRub)
      },
      indirectCosts: {
        overheadRub: Math.round(overheadRub),
        overheadPercent,
        taxesRub: Math.round(taxesRub),
        contingencyRub: Math.round(contingencyRub),
        contingencyPercent,
        totalIndirectRub: Math.round(totalIndirectRub)
      },
      totalEstimatedCostRub: Math.round(totalEstimatedCostRub)
    };
  }

  /**
   * 2. Производственный расчет: трудозатраты, бригады, смены, длительность
   */
  public static calculateProductionPlan(
    estimateItems: CalculatedEstimateItem[],
    standardWorkHoursPerDay: number = 8,
    targetDurationDays?: number
  ): ProductionPlan {
    let totalLaborHours = 0;
    estimateItems.forEach(item => {
      if (item.totalLaborHours) {
        totalLaborHours += item.totalLaborHours;
      } else if (item.category === 'LABOR') {
        // Approximate from wage rate if hours not directly specified
        const approxHours = item.totalPriceRub / 1200; // Average 1200 rub/hour standard rate
        totalLaborHours += approxHours;
      }
    });

    totalLaborHours = Math.max(80, Math.round(totalLaborHours));

    // Calculate optimal crew size based on total labor hours
    // Optimal crew sizing: e.g., 4 to 12 persons depending on volume
    let recommendedCrewSize = 4;
    if (totalLaborHours > 4000) recommendedCrewSize = 12;
    else if (totalLaborHours > 2000) recommendedCrewSize = 8;
    else if (totalLaborHours > 1000) recommendedCrewSize = 6;
    else if (totalLaborHours < 300) recommendedCrewSize = 2;

    const effectiveHoursPerDay = recommendedCrewSize * standardWorkHoursPerDay * 0.85; // 85% productivity factor
    const estimatedDurationDays = Math.ceil(totalLaborHours / effectiveHoursPerDay);

    const crewComposition = [
      `Бригадир / Мастер участка (6 разряд) — 1 чел.`,
      `Монтажник систем вентиляции и кондиционирования (4-5 разряд) — ${Math.max(1, Math.floor(recommendedCrewSize * 0.5))} чел.`,
      `Электрогазосварщик / Пайщик медных контуров (5 разряд) — ${Math.max(1, Math.floor(recommendedCrewSize * 0.25))} чел.`,
      `Слесарь-монтажник / Помощник (3 разряд) — ${Math.max(1, Math.ceil(recommendedCrewSize * 0.25))} чел.`
    ];

    const milestones = [
      {
        name: 'Подготовительный этап, доставка оборудования и раскладка трасс',
        durationDays: Math.max(3, Math.ceil(estimatedDurationDays * 0.15)),
        laborHours: Math.round(totalLaborHours * 0.15),
        crewSize: recommendedCrewSize
      },
      {
        name: 'Монтаж наружных и внутренних блоков VRF, воздуховодов и трубопроводов',
        durationDays: Math.max(5, Math.ceil(estimatedDurationDays * 0.50)),
        laborHours: Math.round(totalLaborHours * 0.50),
        crewSize: recommendedCrewSize
      },
      {
        name: 'Пайка рефнетов, опрессовка азотом (4.15 МПа) и вакуумирование',
        durationDays: Math.max(2, Math.ceil(estimatedDurationDays * 0.15)),
        laborHours: Math.round(totalLaborHours * 0.15),
        crewSize: recommendedCrewSize
      },
      {
        name: 'Заправка хладагентом, автоматизация и комплексные ПНР',
        durationDays: Math.max(2, Math.ceil(estimatedDurationDays * 0.20)),
        laborHours: Math.round(totalLaborHours * 0.20),
        crewSize: recommendedCrewSize
      }
    ];

    return {
      totalLaborHours: Math.round(totalLaborHours),
      recommendedCrewSize,
      crewComposition,
      estimatedDurationDays,
      shiftsCount: 1,
      workFrontsCount: Math.min(3, Math.max(1, Math.floor(recommendedCrewSize / 3))),
      criticalPathSummary: 'Поставка наружных блоков VRF → Монтаж магистральных медных фреонопроводов → Испытание на прочность и плотность (азот 4.15 МПа) → Комплексная наладка и сдача ИД.',
      milestones
    };
  }

  /**
   * 3. Финансовая модель проекта
   */
  public static calculateFinancialModel(
    contractPriceRub: number,
    resourceModel: ResourceModel,
    vatPercent: number = 20
  ): FinancialCalculation {
    const isContractPriceProvided = contractPriceRub > 0;
    const directCostRub = resourceModel.directCosts.totalDirectRub;
    const indirectCostRub = resourceModel.indirectCosts.totalIndirectRub;
    const grossCostRub = resourceModel.totalEstimatedCostRub;

    if (!isContractPriceProvided) {
      return {
        contractPriceRub: 0,
        vatPercent,
        vatAmountRub: 0,
        revenueWithoutVatRub: 0,
        directCostRub,
        indirectCostRub,
        grossCostRub,
        grossProfitRub: -grossCostRub,
        netProfitRub: -grossCostRub,
        marginPercent: 0,
        markupPercent: 0,
        breakEvenCostRub: grossCostRub,
        isContractPriceProvided: false
      };
    }

    const vatAmountRub = Math.round((contractPriceRub * (vatPercent / (100 + vatPercent))) * 100) / 100;
    const revenueWithoutVatRub = Math.round((contractPriceRub - vatAmountRub) * 100) / 100;

    const grossProfitRub = Math.round((revenueWithoutVatRub - directCostRub) * 100) / 100;
    const netProfitRub = Math.round((revenueWithoutVatRub - grossCostRub) * 100) / 100;

    const marginPercent = revenueWithoutVatRub > 0
      ? Math.round((netProfitRub / revenueWithoutVatRub) * 1000) / 10
      : 0;

    const markupPercent = grossCostRub > 0
      ? Math.round((netProfitRub / grossCostRub) * 1000) / 10
      : 0;

    const breakEvenCostRub = grossCostRub;

    return {
      contractPriceRub,
      vatPercent,
      vatAmountRub,
      revenueWithoutVatRub,
      directCostRub,
      indirectCostRub,
      grossCostRub,
      grossProfitRub,
      netProfitRub,
      marginPercent,
      markupPercent,
      breakEvenCostRub,
      isContractPriceProvided: true
    };
  }

  /**
   * 4. Расчет рентабельности по 3 сценариям (Optimistic, Base, Risk)
   */
  public static calculateProfitabilityScenarios(
    financialModel: FinancialCalculation,
    risks: AiProjectRiskItem[]
  ): ProfitabilityAnalysis {
    if (!financialModel.isContractPriceProvided || financialModel.contractPriceRub <= 0) {
      return {
        status: 'DATA_INCOMPLETE',
        contractPriceRub: 0,
        optimistic: { costRub: 0, profitRub: 0, marginPercent: 0, markupPercent: 0, description: 'Цена договора не указана', probabilityScore: 0.2 },
        base: { costRub: 0, profitRub: 0, marginPercent: 0, markupPercent: 0, description: 'Цена договора не указана', probabilityScore: 0.6 },
        risk: { costRub: 0, profitRub: 0, marginPercent: 0, markupPercent: 0, description: 'Цена договора не указана', probabilityScore: 0.2 },
        expectedProfitRub: 0,
        expectedMarginPercent: 0,
        breakEvenRub: financialModel.grossCostRub,
        targetPriceForTargetMarginRub: Math.round(financialModel.grossCostRub * 1.25),
        reasonIfIncomplete: 'В проекте отсутствует зафиксированная стоимость договора (Contract Price). Рентабельность не может быть рассчитана.'
      };
    }

    const revenue = financialModel.revenueWithoutVatRub;
    const baseCost = financialModel.grossCostRub;

    // Total cost of all identified risks
    const totalRiskCostRub = risks.reduce((acc, r) => acc + (r.costOfRiskRub * r.probability), 0);

    // Optimistic: 8% savings on procurement/subcontract, zero risk realization
    const optimisticCost = Math.round(baseCost * 0.92);
    const optimisticProfit = Math.round(revenue - optimisticCost);
    const optimisticMargin = Math.round((optimisticProfit / revenue) * 1000) / 10;
    const optimisticMarkup = Math.round((optimisticProfit / optimisticCost) * 1000) / 10;

    // Base: standard estimated cost
    const baseProfit = Math.round(revenue - baseCost);
    const baseMargin = Math.round((baseProfit / revenue) * 1000) / 10;
    const baseMarkup = Math.round((baseProfit / baseCost) * 1000) / 10;

    // Risk: realization of potential risks + 10% inflation on materials
    const riskCost = Math.round(baseCost + totalRiskCostRub + (baseCost * 0.05));
    const riskProfit = Math.round(revenue - riskCost);
    const riskMargin = Math.round((riskProfit / revenue) * 1000) / 10;
    const riskMarkup = Math.round((riskProfit / riskCost) * 1000) / 10;

    // Weighted expected profit (20% optimistic, 60% base, 20% risk)
    const expectedProfitRub = Math.round((optimisticProfit * 0.2) + (baseProfit * 0.6) + (riskProfit * 0.2));
    const expectedMarginPercent = Math.round((expectedProfitRub / revenue) * 1000) / 10;

    // Target contract price for 25% healthy margin
    const targetPriceForTargetMarginRub = Math.round((baseCost / 0.75) * 1.2); // with VAT

    return {
      status: baseMargin < 0 ? 'REQUIRES_REVIEW' : 'CALCULATED',
      contractPriceRub: financialModel.contractPriceRub,
      optimistic: {
        costRub: optimisticCost,
        profitRub: optimisticProfit,
        marginPercent: optimisticMargin,
        markupPercent: optimisticMarkup,
        description: 'Оптимальная логистика, скидки поставщиков -8%, отсутствие простоев.',
        probabilityScore: 0.20
      },
      base: {
        costRub: baseCost,
        profitRub: baseProfit,
        marginPercent: baseMargin,
        markupPercent: baseMarkup,
        description: 'Реалистичный сметный расчет с учетом нормативных накладных расходов.',
        probabilityScore: 0.60
      },
      risk: {
        costRub: riskCost,
        profitRub: riskProfit,
        marginPercent: riskMargin,
        markupPercent: riskMarkup,
        description: 'Срабатывание рисков срыва поставок, устранение коллизий в РД, инфляция.',
        probabilityScore: 0.20
      },
      expectedProfitRub,
      expectedMarginPercent,
      breakEvenRub: baseCost,
      targetPriceForTargetMarginRub
    };
  }

  /**
   * 5. Детерминированное выявление коллизий и противоречий (РД ↔ Смета ↔ Спецификация)
   */
  public static detectDiscrepancies(
    extractedItems: ProjectItemExtraction[],
    estimateItems: CalculatedEstimateItem[]
  ): AiConflictItem[] {
    const conflicts: AiConflictItem[] = [];

    const normalizeTokens = (str: string) => {
      return str
        .toLowerCase()
        .replace(/[хx]/g, 'x') // normalize cyrillic and latin x
        .replace(/[øØ]/g, 'd')
        .replace(/[^a-zа-я0-9]/gi, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2);
    };

    estimateItems.forEach(estItem => {
      const estTokens = normalizeTokens(estItem.workOrItemName);

      for (const specItem of extractedItems) {
        const specTokens = normalizeTokens(specItem.name);
        
        // Count common significant tokens
        const commonTokens = estTokens.filter(t => specTokens.includes(t));
        const similarity = commonTokens.length / Math.max(1, Math.min(estTokens.length, specTokens.length));

        const isMatch = similarity >= 0.5 ||
          (specItem.brand && estItem.workOrItemName.toLowerCase().includes(specItem.brand.toLowerCase())) ||
          (specItem.model && estItem.workOrItemName.toLowerCase().includes(specItem.model.toLowerCase()));

        if (isMatch && specItem.quantity !== estItem.quantity) {
          const deltaNum = estItem.quantity - specItem.quantity;
          const deltaSign = deltaNum > 0 ? `+${deltaNum}` : `${deltaNum}`;
          const deltaUnit = specItem.unit || estItem.unit || 'ед.';
          const unitPrice = estItem.unitPriceRub || 2500;
          const financialImpactRub = Math.abs(deltaNum * unitPrice);

          conflicts.push({
            id: `conf-${conflicts.length + 1}`,
            title: `Коллизия объемов: ${specItem.name}`,
            item: specItem.name,
            sourceA: {
              documentName: specItem.source_document || 'РД Спецификация',
              section: specItem.section || 'ОВ',
              sheetOrPage: `Лист ${specItem.sheetNumber || specItem.source_page || '1'}`,
              value: `${specItem.quantity} ${deltaUnit}`
            },
            sourceB: {
              documentName: estItem.source_document || 'Локальная смета',
              section: estItem.source_section || 'Смета',
              sheetOrPage: `Поз. ${estItem.source_page || 'ЛС'}`,
              value: `${estItem.quantity} ${deltaUnit}`
            },
            delta: `${deltaSign} ${deltaUnit} (${deltaNum < 0 ? 'Дефицит сметы' : 'Превышение сметы'})`,
            financialImpactRub,
            severity: financialImpactRub > 100000 ? 'HIGH' : 'MEDIUM',
            resolutionRecommendation: deltaNum < 0
              ? `Оформить сопоставительную ведомость объемов работ (дефицит сметного лимита на ${Math.abs(deltaNum)} ${deltaUnit}) и выпустить доп. соглашение.`
              : `Проверить необходимость корректировки сметы в сторону уменьшения на ${deltaNum} ${deltaUnit}.`,
            requiresReview: true
          });
        }
      }
    });

    return conflicts;
  }
}
