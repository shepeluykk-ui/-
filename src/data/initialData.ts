import {
  User,
  Organization,
  Project,
  ProjectDocument,
  EstimateItem,
  ScheduleTask,
  InspectionRecord,
  VrfSystemUnit,
  SitePhoto,
  DefectRemark,
  ExecutiveDocItem,
  ContractorPerformance,
  KsDocument,
  ProjectRisk,
  AppNotification,
  AuditLogEntry,
  WorkType,
  UnifiedControlRecord
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-001',
    fullName: 'Воронов Алексей Михайлович',
    email: 'a.voronov@stroycontrol.pro',
    phone: '+7 (916) 442-19-80',
    organizationId: 'org-control',
    organizationName: 'ООО «ТехНадзор Экспертиза»',
    role: 'CONSTRUCTION_CONTROL',
    allowedProjectIds: ['proj-aeron', 'proj-technopark'],
    certificateNumber: 'НОСТРОЙ С-77-009412',
    isActive: true
  },
  {
    id: 'usr-002',
    fullName: 'Иванов Сергей Павлович',
    email: 's.ivanov@aeron-corp.ru',
    phone: '+7 (925) 110-84-33',
    organizationId: 'org-gc',
    organizationName: 'АО «ГлавСтрой Комплекс»',
    role: 'CHIEF_ENGINEER',
    allowedProjectIds: ['proj-aeron'],
    certificateNumber: 'НОПРИЗ П-77-034821',
    isActive: true
  },
  {
    id: 'usr-003',
    fullName: 'Смирнова Елена Дмитриевна',
    email: 'e.smirnova@aeron-corp.ru',
    phone: '+7 (903) 782-99-12',
    organizationId: 'org-gc',
    organizationName: 'АО «ГлавСтрой Комплекс»',
    role: 'PTO_ENGINEER',
    allowedProjectIds: ['proj-aeron'],
    isActive: true
  },
  {
    id: 'usr-004',
    fullName: 'Ковалев Дмитрий Романович',
    email: 'd.kovalev@ventstroy-pro.ru',
    phone: '+7 (915) 304-55-71',
    organizationId: 'org-sub-ovik',
    organizationName: 'ООО «ВентКлиматМонтаж»',
    role: 'OVIK_ENGINEER',
    allowedProjectIds: ['proj-aeron'],
    isActive: true
  },
  {
    id: 'usr-005',
    fullName: 'Петров Валерий Анатольевич',
    email: 'v.petrov@ventstroy-pro.ru',
    phone: '+7 (905) 554-12-88',
    organizationId: 'org-sub-ovik',
    organizationName: 'ООО «ВентКлиматМонтаж»',
    role: 'FOREMAN',
    allowedProjectIds: ['proj-aeron'],
    isActive: true
  },
  {
    id: 'usr-006',
    fullName: 'Захаров Игорь Валентинович',
    email: 'i.zaharov@capital-invest.ru',
    phone: '+7 (495) 880-90-00',
    organizationId: 'org-customer',
    organizationName: 'ПАО «Капитал Девелопмент»',
    role: 'CUSTOMER',
    allowedProjectIds: ['proj-aeron', 'proj-technopark'],
    isActive: true
  },
  {
    id: 'usr-007',
    fullName: 'Администратор Системы (Root)',
    email: 'admin@stroycontrol.pro',
    phone: '+7 (800) 555-35-35',
    organizationId: 'org-control',
    organizationName: 'ООО «ТехНадзор Экспертиза»',
    role: 'SUPER_ADMIN',
    allowedProjectIds: ['proj-aeron', 'proj-technopark'],
    isActive: true
  }
];

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-customer',
    name: 'ПАО «Капитал Девелопмент»',
    inn: '7704819204',
    ogrn: '1127746193820',
    type: 'CUSTOMER',
    sroNumber: 'СРО-С-012-14052010',
    directorName: 'Захаров И. В.',
    contactEmail: 'info@capital-invest.ru',
    contactPhone: '+7 (495) 880-90-00',
    activeContractsCount: 4,
    qualityRatingScore: 96,
    createdAt: '2023-01-15'
  },
  {
    id: 'org-gc',
    name: 'АО «ГлавСтрой Комплекс»',
    inn: '7729481023',
    ogrn: '1087746920194',
    type: 'GENERAL_CONTRACTOR',
    sroNumber: 'СРО-С-055-18082012',
    directorName: 'Степанов М. А.',
    contactEmail: 'contract@glavstroy-k.ru',
    contactPhone: '+7 (495) 234-11-22',
    activeContractsCount: 3,
    qualityRatingScore: 88,
    createdAt: '2023-02-10'
  },
  {
    id: 'org-sub-ovik',
    name: 'ООО «ВентКлиматМонтаж»',
    inn: '7718992014',
    ogrn: '1157746109483',
    type: 'SUBCONTRACTOR',
    sroNumber: 'СРО-С-109-24092015',
    directorName: 'Ковалев Д. Р.',
    contactEmail: 'pto@ventstroy-pro.ru',
    contactPhone: '+7 (495) 777-40-12',
    activeContractsCount: 2,
    qualityRatingScore: 81,
    createdAt: '2023-05-20'
  },
  {
    id: 'org-control',
    name: 'ООО «ТехНадзор Экспертиза»',
    inn: '7708394821',
    ogrn: '1197746019482',
    type: 'SUPERVISION',
    sroNumber: 'СРО-И-004-11022019',
    directorName: 'Воронов А. М.',
    contactEmail: 'expert@stroycontrol.pro',
    contactPhone: '+7 (495) 900-33-44',
    activeContractsCount: 5,
    qualityRatingScore: 99,
    createdAt: '2023-01-10'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-aeron',
    name: 'ЖК «АэроСити» Блок А (Корпус 1-2 с подземным паркингом)',
    code: 'ОКС-2024/АЭРОН-А',
    address: 'г. Москва, Ленинградский проспект, вл. 72',
    customerOrgId: 'org-customer',
    customerOrgName: 'ПАО «Капитал Девелопмент»',
    generalContractorOrgId: 'org-gc',
    generalContractorOrgName: 'АО «ГлавСтрой Комплекс»',
    chiefEngineerName: 'Иванов С. П.',
    projectManagerName: 'Морозов К. Д.',
    startDate: '2024-03-01',
    plannedFinishDate: '2025-11-30',
    forecastFinishDate: '2025-12-14',
    status: 'ACTIVE_CONSTRUCTION',
    budgetContractRub: 1420000000,
    budgetEstimateRub: 1395000000,
    executedRub: 910000000,
    acceptedRub: 825000000,
    paidRub: 780000000,
    physicalProgressPercent: 65.4,
    financialProgressPercent: 58.1,
    docCompletenessPercent: 71.8,
    floorsCount: 18,
    sectionsCount: 3,
    axesDefinition: ['1-16', 'А-М'],
    createdAt: '2024-02-15'
  },
  {
    id: 'proj-technopark',
    name: 'МФК «Технопарк Восток» (Офисно-лабораторный комплекс)',
    code: 'ОКС-2024/ТЕХНО-В',
    address: 'г. Москва, шоссе Энтузиастов, з/у 38',
    customerOrgId: 'org-customer',
    customerOrgName: 'ПАО «Капитал Девелопмент»',
    generalContractorOrgId: 'org-gc',
    generalContractorOrgName: 'АО «ГлавСтрой Комплекс»',
    chiefEngineerName: 'Кузнецов В. А.',
    projectManagerName: 'Поляков А. Н.',
    startDate: '2024-06-01',
    plannedFinishDate: '2026-04-30',
    forecastFinishDate: '2026-04-30',
    status: 'ACTIVE_CONSTRUCTION',
    budgetContractRub: 890000000,
    budgetEstimateRub: 880000000,
    executedRub: 320000000,
    acceptedRub: 290000000,
    paidRub: 260000000,
    physicalProgressPercent: 36.0,
    financialProgressPercent: 32.5,
    docCompletenessPercent: 84.0,
    floorsCount: 9,
    sectionsCount: 1,
    axesDefinition: ['1-8', 'А-Е'],
    createdAt: '2024-05-10'
  }
];

export const INITIAL_DOCUMENTS: ProjectDocument[] = [
  {
    id: 'doc-ov-01',
    projectId: 'proj-aeron',
    title: 'РД ОВиК: Спецификация оборудования и холодоснабжения VRF',
    code: '240/24-ОВ1.СО',
    section: 'ОВ (Отопление и Вентиляция)',
    category: 'SPECIFICATION',
    currentRevision: 'Изм. 1',
    currentVersion: 2,
    status: 'APPROVED',
    uploadedBy: 'Смирнова Е. Д.',
    authorOrg: 'ООО «ИнжПроект-Групп»',
    pagesCount: 48,
    hasConflicts: true,
    conflictNotes: 'Разночтение по длине медной трубы Ø28.58 мм между листом 12 (2450 м) и сметной позицией № 18 (2380 м).',
    tags: ['VRF', 'Медная труба', 'Хладагент R410A', 'Kaiflex'],
    versions: [
      {
        versionNumber: 1,
        revision: 'Изм. 0',
        fileUrl: '/docs/240-24-OV1-rev0.pdf',
        fileName: '240_24_OV1_rev0.pdf',
        fileSizeMb: 14.2,
        uploadedBy: 'Смирнова Е. Д.',
        uploadedAt: '2024-04-10',
        changeDescription: 'Первичный выпуск проектным институтом',
        status: 'ARCHIVED'
      },
      {
        versionNumber: 2,
        revision: 'Изм. 1',
        fileUrl: '/docs/240-24-OV1-rev1.pdf',
        fileName: '240_24_OV1_rev1_stamped.pdf',
        fileSizeMb: 15.8,
        uploadedBy: 'Иванов С. П.',
        uploadedAt: '2024-07-15',
        changeDescription: 'Корректировка трасс по замечаниям авторского надзора',
        status: 'APPROVED',
        approvedBy: 'Воронов А. М.',
        approvedAt: '2024-07-18'
      }
    ],
    createdAt: '2024-04-10',
    updatedAt: '2024-07-18'
  },
  {
    id: 'doc-kr-02',
    projectId: 'proj-aeron',
    title: 'РД КР: Схема армирования монолитных перекрытий отм. +14.400',
    code: '240/24-КР-04',
    section: 'КР (Конструктивные решения)',
    category: 'DRAWING',
    currentRevision: 'Изм. 0',
    currentVersion: 1,
    status: 'APPROVED',
    uploadedBy: 'Иванов С. П.',
    authorOrg: 'ООО «ИнжПроект-Групп»',
    pagesCount: 16,
    hasConflicts: false,
    tags: ['Арматура А500С', 'Бетон B25 W6', 'Перекрытие'],
    versions: [
      {
        versionNumber: 1,
        revision: 'Изм. 0',
        fileUrl: '/docs/240-24-KR-04.pdf',
        fileName: '240_24_KR_04.pdf',
        fileSizeMb: 22.4,
        uploadedBy: 'Иванов С. П.',
        uploadedAt: '2024-05-02',
        changeDescription: 'Утверждено в производство работ со штампом ГИП',
        status: 'APPROVED',
        approvedBy: 'Воронов А. М.',
        approvedAt: '2024-05-05'
      }
    ],
    createdAt: '2024-05-02',
    updatedAt: '2024-05-05'
  },
  {
    id: 'doc-est-01',
    projectId: 'proj-aeron',
    title: 'Локальная смета № 02-01-04 на монтаж систем вентиляции и кондиционирования',
    code: 'ЛС-02-01-04',
    section: 'ОВ',
    category: 'ESTIMATE',
    currentRevision: 'Изм. 1',
    currentVersion: 1,
    status: 'APPROVED',
    uploadedBy: 'Смирнова Е. Д.',
    authorOrg: 'АО «ГлавСтрой Комплекс»',
    pagesCount: 32,
    hasConflicts: true,
    conflictNotes: 'Позиция 18: Объем медной трубы Ø28 занижен на 70 м по сравнению с РД Лист 12.',
    tags: ['ГЭСНм 20-01', 'ФЕР', 'Смета'],
    versions: [
      {
        versionNumber: 1,
        revision: 'Изм. 1',
        fileUrl: '/docs/LS_02_01_04_rev1.xlsx',
        fileName: 'LS_02_01_04_rev1.xlsx',
        fileSizeMb: 4.8,
        uploadedBy: 'Смирнова Е. Д.',
        uploadedAt: '2024-06-01',
        changeDescription: 'Утверждена Заказчиком с учетом индексов Минстроя III кв. 2024',
        status: 'APPROVED',
        approvedBy: 'Захаров И. В.',
        approvedAt: '2024-06-05'
      }
    ],
    createdAt: '2024-06-01',
    updatedAt: '2024-06-05'
  }
];

export const INITIAL_ESTIMATE_ITEMS: EstimateItem[] = [
  {
    id: 'est-item-1',
    projectId: 'proj-aeron',
    documentId: 'doc-est-01',
    itemNumber: '1.18',
    name: 'Труба медная бесшовная Cu-DHP Ø28.58х1.0 мм в теплоизоляции Kaiflex 19 мм',
    category: 'MATERIAL',
    unit: 'м.п.',
    plannedQty: 2450, // По РД Лист 12
    estimateQty: 2380, // По Локальной смете
    actualFactQty: 2420, // Монтаж по факту
    acceptedQty: 1800, // Принято технадзором по АОСР
    unitPriceRub: 1850,
    totalPriceRub: 4403000,
    contractorOrgId: 'org-sub-ovik',
    status: 'CONFLICT',
    conflictReason: 'РД (2450 м) > Смета (2380 м). Фактически смонтировано 2420 м, требуется выпуск доп. соглашения на 70 м.',
    coveragePercent: 98.7,
    riskScore: 'HIGH'
  },
  {
    id: 'est-item-2',
    projectId: 'proj-aeron',
    documentId: 'doc-est-01',
    itemNumber: '1.02',
    name: 'Наружный блок мультизональной VRF-системы с рекуперацией тепла ODU-56kW (R410A)',
    category: 'EQUIPMENT',
    unit: 'шт.',
    plannedQty: 8,
    estimateQty: 8,
    actualFactQty: 6,
    acceptedQty: 4,
    unitPriceRub: 1450000,
    totalPriceRub: 11600000,
    contractorOrgId: 'org-sub-ovik',
    status: 'DOCUMENT CONFIRMED',
    coveragePercent: 75.0,
    riskScore: 'MEDIUM'
  },
  {
    id: 'est-item-3',
    projectId: 'proj-aeron',
    documentId: 'doc-est-01',
    itemNumber: '1.44',
    name: 'Опрессовка фреоновых магистралей сухим азотом давлением 4.15 МПа с выдержкой 24 часа',
    category: 'WORK',
    unit: 'компл.',
    plannedQty: 8,
    estimateQty: 8,
    actualFactQty: 5,
    acceptedQty: 3,
    unitPriceRub: 120000,
    totalPriceRub: 960000,
    contractorOrgId: 'org-sub-ovik',
    status: 'DOCUMENT CONFIRMED',
    coveragePercent: 62.5,
    riskScore: 'HIGH'
  },
  {
    id: 'est-item-4',
    projectId: 'proj-aeron',
    documentId: 'doc-est-01',
    itemNumber: '2.05',
    name: 'Воздуховод из оцинкованной стали класса П (плотные) толщиной 0.8 мм прямоугольного сечения',
    category: 'MATERIAL',
    unit: 'м²',
    plannedQty: 3800,
    estimateQty: 3800,
    actualFactQty: 2950,
    acceptedQty: 2700,
    unitPriceRub: 1100,
    totalPriceRub: 4180000,
    contractorOrgId: 'org-sub-ovik',
    status: 'DOCUMENT CONFIRMED',
    coveragePercent: 77.6,
    riskScore: 'LOW'
  }
];

export const INITIAL_SCHEDULE_TASKS: ScheduleTask[] = [
  {
    id: 'task-01',
    projectId: 'proj-aeron',
    wbsCode: '2.1.1',
    title: 'Монтаж магистральных фреоновых трасс VRF Блок А (Корпус 1)',
    section: 'ОВ',
    startDate: '2024-07-01',
    finishDate: '2024-08-15',
    forecastFinishDate: '2024-08-20',
    durationDays: 45,
    plannedVolume: 2450,
    actualVolume: 2420,
    unit: 'м',
    progressPercent: 92,
    spi: 0.94,
    isCriticalPath: true,
    predecessorIds: [],
    assignedContractorId: 'org-sub-ovik',
    assignedContractorName: 'ООО «ВентКлиматМонтаж»',
    responsiblePerson: 'Петров В. А.',
    status: 'IN_PROGRESS',
    holdPointRequired: true,
    holdPointPassed: false, // Заблокировано до опрессовки!
    lastInspectionDate: '2024-08-18'
  },
  {
    id: 'task-02',
    projectId: 'proj-aeron',
    wbsCode: '2.1.2',
    title: 'Пневматические испытания (опрессовка азотом 41.5 бар) и вакуумирование контуров',
    section: 'ОВ',
    startDate: '2024-08-16',
    finishDate: '2024-08-25',
    forecastFinishDate: '2024-08-28',
    durationDays: 10,
    plannedVolume: 8,
    actualVolume: 5,
    unit: 'контур',
    progressPercent: 62,
    spi: 0.88,
    isCriticalPath: true,
    predecessorIds: ['task-01'],
    assignedContractorId: 'org-sub-ovik',
    assignedContractorName: 'ООО «ВентКлиматМонтаж»',
    responsiblePerson: 'Ковалев Д. Р.',
    status: 'HOLD_POINT_BLOCKED',
    holdPointRequired: true,
    holdPointPassed: false,
    lastInspectionDate: '2024-08-22'
  },
  {
    id: 'task-03',
    projectId: 'proj-aeron',
    wbsCode: '2.1.3',
    title: 'Зашивка инженерных шахт и устройство подвесных потолков ГКЛ',
    section: 'АР',
    startDate: '2024-08-26',
    finishDate: '2024-09-30',
    forecastFinishDate: '2024-10-08',
    durationDays: 35,
    plannedVolume: 1600,
    actualVolume: 0,
    unit: 'м²',
    progressPercent: 0,
    spi: 0.70,
    isCriticalPath: true,
    predecessorIds: ['task-02'],
    assignedContractorId: 'org-gc',
    assignedContractorName: 'АО «ГлавСтрой Комплекс»',
    responsiblePerson: 'Степанов М. А.',
    status: 'HOLD_POINT_BLOCKED', // Блокировано: предшествующая Hold Point не сдана
    holdPointRequired: true,
    holdPointPassed: false
  }
];

export const INITIAL_INSPECTIONS: InspectionRecord[] = [
  {
    id: 'insp-01',
    projectId: 'proj-aeron',
    taskId: 'task-02',
    workName: 'Опрессовка контура VRF-1 азотом (давление 4.15 МПа, 24 часа)',
    inspectionType: 'PRESSURE_TEST',
    location: {
      building: 'Корпус 1',
      floor: '3-8 этажи',
      room: 'Инженерная шахта Ш-3',
      axes: 'В осях 4-6 / Б-В'
    },
    contractorOrgId: 'org-sub-ovik',
    contractorOrgName: 'ООО «ВентКлиматМонтаж»',
    inspectorName: 'Воронов А. М.',
    inspectorRole: 'CONSTRUCTION_CONTROL',
    inspectionDate: '2024-08-22',
    regulatoryBasis: 'СП 73.13330.2016 п. 7.3, ГОСТ 32970-2014',
    designDocReference: 'РД 240/24-ОВ1 Лист 14',
    pointType: 'HOLD_POINT',
    isHoldPointSatisfied: false,
    result: 'FAILED',
    findings: 'Падение давления в контуре VRF-1 за 12 часов составило 0.35 МПа при допустимой температурной погрешности не более 0.05 МПа. Обнаружена микроутечка на рефнет-разветвителе R4-2 (3 этаж, пайка серебряным припоем без продувки азотом).',
    measurements: [
      { parameter: 'Давление закачки азота', standardValue: '4.15 МПа', actualValue: '4.15 МПа', pass: true },
      { parameter: 'Давление через 12 часов', standardValue: '≥ 4.10 МПа', actualValue: '3.80 МПа', pass: false },
      { parameter: 'Температура среды t1 / t2', standardValue: '+21°C / +20°C', actualValue: '+21°C / +20°C', pass: true }
    ],
    photoIds: ['photo-defect-01'],
    defectsGeneratedIds: ['def-001'],
    createdAt: '2024-08-22 17:30'
  },
  {
    id: 'insp-02',
    projectId: 'proj-aeron',
    workName: 'Входной контроль партии медных труб Ø28.58х1.0 и изоляции Kaiflex 19 мм',
    inspectionType: 'INPUT_CONTROL',
    location: {
      building: 'Корпус 1',
      room: 'Центральный склад материалов'
    },
    contractorOrgId: 'org-sub-ovik',
    contractorOrgName: 'ООО «ВентКлиматМонтаж»',
    inspectorName: 'Воронов А. М.',
    inspectorRole: 'CONSTRUCTION_CONTROL',
    inspectionDate: '2024-08-10',
    regulatoryBasis: 'ГОСТ Р 52318-2005, СП 48.13330.2019 п. 7.1',
    designDocReference: 'РД 240/24-ОВ1.СО Поз. 12',
    pointType: 'WITNESS_POINT',
    isHoldPointSatisfied: true,
    result: 'PASSED',
    findings: 'Сертификаты соответствия № ЕАЭС RU C-RU.АД54.В.00412/23 проверены в реестре Росаккредитации. Толщина стенки трубы проверена микрометром (1.02 мм). Заглушки на торцах труб установлены.',
    photoIds: ['photo-input-01'],
    defectsGeneratedIds: [],
    actNumberSigned: 'АКТ-ВК-2024/088',
    createdAt: '2024-08-10 11:15'
  }
];

export const INITIAL_VRF_SYSTEMS: VrfSystemUnit[] = [
  {
    id: 'vrf-sys-01',
    projectId: 'proj-aeron',
    systemTag: 'VRF-1',
    systemType: 'VRF_VRV',
    location: 'Корпус 1, Секция 1 (Кровля / 1-6 этажи)',
    oduModel: 'VRF-ODU-56kW-R410A-3H',
    oduSerial: 'VRF2024-SN-994102',
    oduCapacityKw: 56.0,
    iduCount: 14,
    refrigerantType: 'R410A',
    calculatedRefrigerantChargeKg: 18.4,
    actualRefrigerantChargedKg: 0,
    totalPipeLengthM: 420,
    refnetCount: 13,
    pipeDiameters: ['Ø9.52х0.8', 'Ø19.05х1.0', 'Ø28.58х1.0'],
    insulationType: 'Kaiflex 19 мм с герметизацией швов клеем Kaiflex 520',
    installationStatus: 'IN_PROGRESS',
    nitrogenPressureTestStatus: 'FAILED',
    vacuumTestStatus: 'NOT_TESTED',
    oilTrapInstalled: true,
    addressingCompleted: false,
    commissioningStatus: 'PENDING',
    executiveDocsComplete: false,
    lastTestedDate: '2024-08-22',
    responsibleEngineer: 'Ковалев Д. Р. (ООО «ВентКлиматМонтаж»)'
  },
  {
    id: 'vrf-sys-02',
    projectId: 'proj-aeron',
    systemTag: 'VRF-2',
    systemType: 'VRF_VRV',
    location: 'Корпус 1, Секция 2 (Кровля / 7-12 этажи)',
    oduModel: 'VRF-ODU-45kW-R410A',
    oduSerial: 'VRF2024-SN-994108',
    oduCapacityKw: 45.0,
    iduCount: 11,
    refrigerantType: 'R410A',
    calculatedRefrigerantChargeKg: 14.8,
    actualRefrigerantChargedKg: 14.8,
    totalPipeLengthM: 360,
    refnetCount: 10,
    pipeDiameters: ['Ø9.52х0.8', 'Ø15.88х1.0', 'Ø22.22х1.0'],
    insulationType: 'Kaiflex 19 мм',
    installationStatus: 'COMPLETED',
    nitrogenPressureTestStatus: 'PASSED_24H',
    vacuumTestStatus: 'PASSED_750_MICRONS',
    oilTrapInstalled: true,
    addressingCompleted: true,
    commissioningStatus: 'PASSED',
    executiveDocsComplete: true,
    lastTestedDate: '2024-08-15',
    responsibleEngineer: 'Ковалев Д. Р.'
  }
];

export const INITIAL_DEFECTS: DefectRemark[] = [
  {
    id: 'def-001',
    projectId: 'proj-aeron',
    defectNumber: 'ЗАМ-2024-0104',
    title: 'Падение давления в контуре VRF-1 при опрессовке азотом (утечка на рефнете)',
    description: 'В ходе гидравлических/пневматических испытаний контура VRF-1 зафиксирована утечка фреонопровода на узле разветвителя R4-2 (3 этаж). Пайка выполнена без подачи азота, нагар на внутренней стенке.',
    category: 'QUALITY',
    severity: 'CRITICAL',
    sourceType: 'INSPECTION',
    location: {
      floor: 3,
      room: 'Шахта Ш-3',
      axes: 'Оси 5-6 / В'
    },
    contractorOrgId: 'org-sub-ovik',
    contractorOrgName: 'ООО «ВентКлиматМонтаж»',
    responsiblePersonName: 'Петров В. А. (Прораб)',
    issuedByInspectorName: 'Воронов А. М. (Строительный контроль)',
    beforePhotoUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
    afterPhotoUrls: [],
    issuedDate: '2024-08-22',
    deadlineDate: '2024-08-25',
    status: 'OPEN',
    reinspectionNotes: 'Ожидается устранение: перепайка узла в среде азота и повторная опрессовка 4.15 МПа.',
    reinspectionCount: 0,
    auditTrail: [
      {
        timestamp: '2024-08-22 17:35',
        author: 'Воронов А. М.',
        action: 'CREATE',
        comment: 'Выставлено предписание с блокировкой смежных отделочных работ (Hold Point).'
      }
    ]
  },
  {
    id: 'def-002',
    projectId: 'proj-aeron',
    defectNumber: 'ЗАМ-2024-0098',
    title: 'Отсутствие огнезащитной изоляции воздуховода дымоудаления ДУ-1 в пересечении перекрытия',
    description: 'В месте прохода воздуховода ДУ-1 через перекрытие 4 этажа не выполнена заделка огнестойкой мастикой EI 120 согласно проекту РД Лист 22.',
    category: 'SAFETY',
    severity: 'HIGH',
    sourceType: 'SURVEILLANCE',
    location: {
      floor: 4,
      room: 'Лифтовой холл',
      axes: 'Оси 2-3 / Г'
    },
    contractorOrgId: 'org-sub-ovik',
    contractorOrgName: 'ООО «ВентКлиматМонтаж»',
    responsiblePersonName: 'Ковалев Д. Р.',
    issuedByInspectorName: 'Воронов А. М.',
    beforePhotoUrls: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'],
    afterPhotoUrls: ['https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'],
    issuedDate: '2024-08-14',
    deadlineDate: '2024-08-18',
    status: 'READY_FOR_REVIEW',
    reinspectionNotes: 'Подрядчик нанес огнезащитную систему ОГНЕЗА-В-КД. Требуется проверка сертификата и толщины слоя толщиномером.',
    reinspectionCount: 1,
    auditTrail: [
      {
        timestamp: '2024-08-14 14:00',
        author: 'Воронов А. М.',
        action: 'CREATE',
        comment: 'Выписано замечание категории HIGH.'
      },
      {
        timestamp: '2024-08-18 10:20',
        author: 'Петров В. А.',
        action: 'UPDATE',
        comment: 'Работы выполнены, прикреплен фотоотчет "ПОСЛЕ".'
      }
    ]
  }
];

export const INITIAL_EXECUTIVE_DOCS: ExecutiveDocItem[] = [
  {
    id: 'exec-01',
    projectId: 'proj-aeron',
    workId: 'task-01',
    workName: 'Монтаж трубопроводов хладагента в изоляции',
    docType: 'AOSR',
    docNumber: 'АОСР № 24-ОВ-012',
    title: 'Акт освидетельствования скрытых работ: Прокладка фреонопроводов VRF-1',
    requiredCount: 1,
    uploadedCount: 1,
    approvedCount: 0,
    status: 'UNDER_REVIEW',
    fileUrl: '/docs/AOSR_24_OV_012.pdf',
    signedByContractor: true,
    signedBySupervisor: false, // Блокировано дефектом def-001!
    signedByCustomer: false
  },
  {
    id: 'exec-02',
    projectId: 'proj-aeron',
    workId: 'task-02',
    workName: 'Испытания трубопроводов на прочность и герметичность',
    docType: 'TEST_REPORT',
    docNumber: 'АКТ-ИСП-24/09',
    title: 'Акт пневматического испытания фреоновых магистралей давлением 4.15 МПа',
    requiredCount: 1,
    uploadedCount: 0,
    approvedCount: 0,
    status: 'MISSING',
    signedByContractor: false,
    signedBySupervisor: false,
    signedByCustomer: false
  },
  {
    id: 'exec-03',
    projectId: 'proj-aeron',
    workId: 'task-01',
    workName: 'Входной контроль партии медной трубы Cu-DHP',
    docType: 'QUALITY_PASSPORT',
    docNumber: 'ПАСП-МЕДЬ-412',
    title: 'Паспорт качества и сертификат соответствия завода Wieland (Германия)',
    requiredCount: 1,
    uploadedCount: 1,
    approvedCount: 1,
    status: 'APPROVED',
    fileUrl: '/docs/Cert_Wieland_CuDHP.pdf',
    signedByContractor: true,
    signedBySupervisor: true,
    signedByCustomer: true,
    signingDate: '2024-08-10'
  }
];

export const INITIAL_CONTRACTOR_PERFORMANCE: ContractorPerformance[] = [
  {
    contractorId: 'org-sub-ovik',
    contractorName: 'ООО «ВентКлиматМонтаж»',
    projectId: 'proj-aeron',
    overallScore: 79,
    qualityScore: 74,
    scheduleScore: 78,
    volumeComplianceScore: 88,
    documentationScore: 72,
    disciplineScore: 85,
    openDefectsCount: 4,
    criticalDefectsCount: 1,
    overdueDefectsCount: 1,
    spiAverage: 0.91,
    status: 'WARNING'
  },
  {
    contractorId: 'org-gc',
    contractorName: 'АО «ГлавСтрой Комплекс»',
    projectId: 'proj-aeron',
    overallScore: 89,
    qualityScore: 91,
    scheduleScore: 86,
    volumeComplianceScore: 94,
    documentationScore: 88,
    disciplineScore: 92,
    openDefectsCount: 2,
    criticalDefectsCount: 0,
    overdueDefectsCount: 0,
    spiAverage: 0.98,
    status: 'GOOD'
  }
];

export const INITIAL_KS_DOCUMENTS: KsDocument[] = [
  {
    id: 'ks-01',
    projectId: 'proj-aeron',
    docType: 'KS2',
    docNumber: 'КС-2 № 07/24',
    periodStart: '2024-07-01',
    periodEnd: '2024-07-31',
    contractorOrgId: 'org-sub-ovik',
    contractorOrgName: 'ООО «ВентКлиматМонтаж»',
    totalSumWithoutVatRub: 18450000,
    vatAmountRub: 3690000,
    totalSumWithVatRub: 22140000,
    status: 'SIGNED_CUSTOMER',
    itemsCount: 14,
    createdAt: '2024-08-05'
  },
  {
    id: 'ks-02',
    projectId: 'proj-aeron',
    docType: 'KS2',
    docNumber: 'КС-2 № 08/24 (Проект)',
    periodStart: '2024-08-01',
    periodEnd: '2024-08-31',
    contractorOrgId: 'org-sub-ovik',
    contractorOrgName: 'ООО «ВентКлиматМонтаж»',
    totalSumWithoutVatRub: 14200000,
    vatAmountRub: 2840000,
    totalSumWithVatRub: 17040000,
    status: 'VERIFIED_PTO', // Заблокировано к подписанию технадзором из-за незакрытого дефекта def-001
    itemsCount: 11,
    createdAt: '2024-08-23'
  }
];

export const INITIAL_RISKS: ProjectRisk[] = [
  {
    id: 'risk-01',
    projectId: 'proj-aeron',
    title: 'Срыв сроков закрытия потолков из-за утечки при опрессовке VRF-1',
    description: 'Незавершенные пневмоиспытания блокируют чистовую отделку и зашивку шахт. Риск задержки сдачи этажа на 14 дней.',
    category: 'QUALITY',
    probability: 4,
    impact: 4,
    score: 16,
    level: 'CRITICAL',
    ownerName: 'Иванов С. П. (Главный инженер)',
    mitigationPlan: 'Привлечь дополнительную бригаду паяльщиков с аттестацией НАКС, перепаять стык в среде азота до 25.08.',
    deadlineDate: '2024-08-25',
    status: 'MITIGATING',
    detectedBy: 'CHIEF_ENGINEER'
  },
  {
    id: 'risk-02',
    projectId: 'proj-aeron',
    title: 'Коллизия объемов медной трубы Ø28 (РД 2450 м vs Смета 2380 м)',
    description: 'Дефицит сметного лимита на 70 метров трубы (129 500 руб.) при отсутствии резерва непредвиденных затрат.',
    category: 'FINANCE',
    probability: 5,
    impact: 2,
    score: 10,
    level: 'MEDIUM',
    ownerName: 'Смирнова Е. Д. (Инженер ПТО)',
    mitigationPlan: 'Оформить акт согласования доп. объемов с Заказчиком в составе КС-2 за август.',
    deadlineDate: '2024-08-30',
    status: 'IDENTIFIED',
    detectedBy: 'AI_AUDIT'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-01',
    projectId: 'proj-aeron',
    type: 'HOLD_POINT_TRIGGER',
    title: 'Обязательный HOLD POINT не пройден!',
    message: 'Испытания VRF-1 давлением 41.5 бар провалены. Запрещен переход к зашивке шахт и чистовой отделке.',
    severity: 'CRITICAL',
    linkModule: 'construction_control',
    linkEntityId: 'insp-01',
    isRead: false,
    createdAt: '2024-08-22 17:32'
  },
  {
    id: 'notif-02',
    projectId: 'proj-aeron',
    type: 'DOCUMENT_REVISION_CONFLICT',
    title: 'Обнаружен конфликт: РД ↔ Смета',
    message: 'Труба медная Ø28.58: в РД 2450 м, в смете 2380 м. Статус позиции переведен в CONFLICT.',
    severity: 'HIGH',
    linkModule: 'estimates',
    linkEntityId: 'est-item-1',
    isRead: false,
    createdAt: '2024-08-20 09:10'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    userId: 'usr-001',
    userName: 'Воронов А. М.',
    userRole: 'CONSTRUCTION_CONTROL',
    projectId: 'proj-aeron',
    action: 'CREATE',
    entityType: 'INSPECTION_RECORD',
    entityId: 'insp-01',
    newValue: 'Результат: FAILED. Hold Point: BLOCKED',
    ipAddress: '192.168.1.45',
    timestamp: '2024-08-22 17:30',
    source: 'WEB_APP'
  },
  {
    id: 'log-002',
    userId: 'usr-001',
    userName: 'Воронов А. М.',
    userRole: 'CONSTRUCTION_CONTROL',
    projectId: 'proj-aeron',
    action: 'CREATE',
    entityType: 'DEFECT_REMARK',
    entityId: 'def-001',
    newValue: 'Критичность: CRITICAL. Срок: 2024-08-25',
    ipAddress: '192.168.1.45',
    timestamp: '2024-08-22 17:35',
    source: 'WEB_APP'
  }
];

// Справочник видов работ (WORK_TYPE) — Полный спектр строительного контроля
export const INITIAL_WORK_TYPES: WorkType[] = [
  {
    id: 'wt-ovik',
    code: 'ОВ',
    name: 'Отопление, вентиляция и кондиционирование (ОВиК / VRF)',
    categoryGroup: 'HVAC_PLUMBING',
    defaultUnit: 'м.п.',
    regulatoryStandard: 'СП 60.13330.2020 / СП 73.13330.2016',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Входной контроль труб и теплоизоляции',
      'Опрессовка азотом 41.5 бар (24ч)',
      'Вакуумирование до 750 микрон',
      'Дозаправка хладагента по расчету',
      'Комплексное опробование и ПНР'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-vk',
    code: 'ВК',
    name: 'Водоснабжение и водоотведение (ВК / ВПВ)',
    categoryGroup: 'HVAC_PLUMBING',
    defaultUnit: 'м.п.',
    regulatoryStandard: 'СП 30.13330.2020 / СП 73.13330.2016',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Гидравлическое испытание трубопроводов на прочность и плотность',
      'Проверка уклонов безнапорных сетей',
      'Промывка и дезинфекция хоз-питьевого водопровода',
      'Пролив выпусков канализации'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-eom',
    code: 'ЭОМ',
    name: 'Силовое электрооборудование и освещение (ЭОМ)',
    categoryGroup: 'ELECTRICAL_LOW_CURRENT',
    defaultUnit: 'м.п.',
    regulatoryStandard: 'СП 256.1325800.2016 / ПУЭ 7',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Проверка сопротивления изоляции кабельных линий',
      'Проверка цепи между заземлителями и заземляемыми элементами',
      'Тестирование срабатывания УЗО и автоматических выключателей',
      'Замер петли «фаза-нуль»'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-ss',
    code: 'СС',
    name: 'Слаботочные сети и автоматизация (СС / BMS)',
    categoryGroup: 'ELECTRICAL_LOW_CURRENT',
    defaultUnit: 'м.п.',
    regulatoryStandard: 'СП 134.13330.2012 / СП 77.13330.2016',
    requiresHoldPoint: false,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Прокладка лотков и кабель-каналов в осях',
      'Маркировка слаботочных трасс и шкафов кроссовых',
      'Тестирование интерфейсных линий RS-485 / Modbus / BACnet'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-sks',
    code: 'СКС',
    name: 'Структурированные кабельные сети (СКС)',
    categoryGroup: 'ELECTRICAL_LOW_CURRENT',
    defaultUnit: 'порт',
    regulatoryStandard: 'ГОСТ Р 53246-2008 / ISO/IEC 11801',
    requiresHoldPoint: false,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Флюк-тестирование категорий Cat.6 / Cat.6A (Fluke DTX/DSX)',
      'Рефлектометрия оптических линий (OTDR)',
      'Паспортизация портов патч-панелей'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-cctv',
    code: 'CCTV',
    name: 'Видеонаблюдение и СКУД (CCTV / СКУД)',
    categoryGroup: 'ELECTRICAL_LOW_CURRENT',
    defaultUnit: 'шт.',
    regulatoryStandard: 'ГОСТ Р 54830-2011 / РД 78.36.003-2002',
    requiresHoldPoint: false,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Юстировка зон обзора видеокамер',
      'Проверка срабатывания турникетов и электромагнитных замков',
      'Проверка интеграции с пожарной сигнализацией на авторазблокировку'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-aps',
    code: 'АПС',
    name: 'Автоматическая пожарная сигнализация и СОУЭ (АПС / СОУЭ)',
    categoryGroup: 'ELECTRICAL_LOW_CURRENT',
    defaultUnit: 'шт.',
    regulatoryStandard: 'СП 484.1311500.2020 / СП 3.13130.2009',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Огнестойкие кабельные линии (ОКЛ) и крепление',
      'Адресация дымовых и тепловых извещателей',
      'Комплексное опробование сценариев эвакуации'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-aupt',
    code: 'АУПТ',
    name: 'Автоматическое пожаротушение (АУПТ / Спринклер / Газ)',
    categoryGroup: 'HVAC_PLUMBING',
    defaultUnit: 'узел',
    regulatoryStandard: 'СП 485.1311500.2020 / СП 73.13330.2016',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Гидроиспытание сухотрубов и спринклерных распределителей',
      'Входной контроль спринклерных оросителей',
      'Проверка срабатывания узлов управления и сигнализаторов давления'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-ar',
    code: 'АР',
    name: 'Архитектурные решения и перегородки (АР)',
    categoryGroup: 'FINISHING_FACADE',
    defaultUnit: 'м²',
    regulatoryStandard: 'СП 118.13330.2022 / СП 71.13330.2017',
    requiresHoldPoint: false,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Геометрия и вертикальность перегородок',
      'Звукоизоляционная заделка примыканий к перекрытиям',
      'Монтаж закладных деталей'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-kr',
    code: 'КР',
    name: 'Конструктивные решения и монолитные конструкции (КР)',
    categoryGroup: 'STRUCTURAL_BUILDING',
    defaultUnit: 'м³',
    regulatoryStandard: 'СП 63.13330.2018 / СП 70.13330.2012',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Армирование и защитный слой бетона (Hold Point перед заливкой)',
      'Качество опалубки и геодезическая съемка',
      'Лабораторный контроль прочности бетона (кубики на 7 и 28 сут)'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-earth',
    code: 'ЗЕМЛЯ',
    name: 'Земляные работы и котлованы',
    categoryGroup: 'STRUCTURAL_BUILDING',
    defaultUnit: 'м³',
    regulatoryStandard: 'СП 45.13330.2017',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Освидетельствование дна котлована с участием геолога',
      'Коэффициент уплотнения грунта обратной засыпки (Купл >= 0.95)',
      'Устройство песчано-гравийной подушки'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-concrete',
    code: 'БЕТОН',
    name: 'Бетонные и железобетонные работы',
    categoryGroup: 'STRUCTURAL_BUILDING',
    defaultUnit: 'м³',
    regulatoryStandard: 'СП 70.13330.2012 / ГОСТ 18105-2018',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Уход за бетоном и температурно-влажностный режим',
      'Склерометрия и ультразвуковой контроль прочности',
      'Снятие опалубки при достижении 70% прочности'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-km',
    code: 'КМ',
    name: 'Металлоконструкции (КМ / КМД)',
    categoryGroup: 'STRUCTURAL_BUILDING',
    defaultUnit: 'тн',
    regulatoryStandard: 'СП 16.13330.2017 / СП 70.13330.2012',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Визуально-измерительный и ультразвуковой контроль сварных швов (ВИК/УЗК)',
      'Момент затяжки высокопрочных болтов тарированным ключом',
      'Антикоррозионная и огнезащитная обработка (толщина слоя сухого покрытия)'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-roof',
    code: 'КРОВЛЯ',
    name: 'Кровельные работы и гидроизоляция',
    categoryGroup: 'FINISHING_FACADE',
    defaultUnit: 'м²',
    regulatoryStandard: 'СП 17.13330.2017 / СП 71.13330.2017',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Пароизоляция и разуклонка утеплителя',
      'Освидетельствование гидроизоляционного ковра',
      'Проливка кровли водой на отсутствие протечек (тест 48ч)'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-facade',
    code: 'ФАСАД',
    name: 'Фасадные работы (НВФ / СФТК / Светопрозрачные конструкции)',
    categoryGroup: 'FINISHING_FACADE',
    defaultUnit: 'м²',
    regulatoryStandard: 'СП 293.1325800.2017 / ГОСТ Р 58883-2020',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Испытание анкерных дюбелей на вырыв',
      'Крепление ветрозащитной мембраны и утеплителя',
      'Зазоры и компенсационные швы облицовочных панелей'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-finish',
    code: 'ОТДЕЛКА',
    name: 'Отделочные работы, полы и потолки',
    categoryGroup: 'FINISHING_FACADE',
    defaultUnit: 'м²',
    regulatoryStandard: 'СП 71.13330.2017 / СП 29.13330.2011',
    requiresHoldPoint: false,
    requiresWitnessPoint: true,
    requiresAosr: false,
    typicalInspectionCheckpoints: [
      'Ровность стяжки по двухметровой рейке (просвет <= 2 мм)',
      'Влажность основания перед укладкой финишных покрытий',
      'Качество примыканий и лакокрасочных покрытий'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-tx',
    code: 'ТХ',
    name: 'Монтаж технологического оборудования (ТХ)',
    categoryGroup: 'EQUIPMENT_COMMISSIONING',
    defaultUnit: 'компл.',
    regulatoryStandard: 'СП 75.13330.2011',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Приемка фундаментов под оборудование',
      'Центровка валов и виброизоляция',
      'Монтаж защитных кожухов и заземления'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  },
  {
    id: 'wt-pnr',
    code: 'ПНР',
    name: 'Пусконаладочные работы и комплексное опробование (ПНР)',
    categoryGroup: 'EQUIPMENT_COMMISSIONING',
    defaultUnit: 'система',
    regulatoryStandard: 'СП 68.13330.2017 / СП 73.13330.2016',
    requiresHoldPoint: true,
    requiresWitnessPoint: true,
    requiresAosr: true,
    typicalInspectionCheckpoints: [
      'Индивидуальное опробование агрегатов (72ч под нагрузкой)',
      'Комплексное опробование систем вентиляции и дымоудаления',
      'Составление паспортов систем вентиляции по ГОСТ Р 53300'
    ],
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    updatedAt: '2024-08-20'
  }
];

// Единая Модель Контроля — Реестр точек контроля
export const INITIAL_UNIFIED_CONTROL_RECORDS: UnifiedControlRecord[] = [
  {
    id: 'ucr-01',
    projectId: 'proj-aeron',
    objectName: 'Корпус 1 (Блок А)',
    zone: 'Секция 2',
    floor: '3 этаж',
    axis: 'В осях 2-5 / Б-В',
    workTypeId: 'wt-ovik',
    workTypeName: 'Монтаж фреонопроводов VRF-1',
    contractorOrgId: 'org-sub-ovik',
    contractorOrgName: 'ООО «ВентКлиматМонтаж»',
    assignedExecutorName: 'Прораб Петров В. А.',
    plannedVolume: 2450,
    actualVolume: 1650,
    unit: 'м.п.',
    documentRefId: 'doc-01',
    documentCode: '240/24-ОВ1',
    photoIds: ['photo-01'],
    defectRemarksIds: ['def-001'],
    holdPointRequired: true,
    holdPointSatisfied: false,
    witnessPointRequired: true,
    witnessPointPassed: true,
    aosrId: 'aosr-01',
    aosrStatus: 'DRAFT',
    acceptanceStatus: 'HOLD_BLOCKED',
    overallStatus: 'ON_HOLD',
    updatedAt: '2024-08-22'
  },
  {
    id: 'ucr-02',
    projectId: 'proj-aeron',
    objectName: 'Корпус 1 (Блок А)',
    zone: 'Секция 1',
    floor: '2 этаж',
    axis: 'В осях 1-4 / А-Б',
    workTypeId: 'wt-eom',
    workTypeName: 'Прокладка силового кабеля ВВГнг-FRLS 5х16',
    contractorOrgId: 'org-gc',
    contractorOrgName: 'АО «ГлавСтрой Комплекс»',
    assignedExecutorName: 'Бригадир Семенов Д. И.',
    plannedVolume: 820,
    actualVolume: 820,
    unit: 'м.п.',
    documentRefId: 'doc-03',
    documentCode: '240/24-ЭОМ1',
    photoIds: ['photo-02'],
    defectRemarksIds: [],
    holdPointRequired: true,
    holdPointSatisfied: true,
    witnessPointRequired: true,
    witnessPointPassed: true,
    aosrId: 'aosr-02',
    aosrStatus: 'SIGNED_BY_SUPERVISOR',
    acceptanceStatus: 'READY_FOR_ACCEPTANCE',
    overallStatus: 'ACTIVE',
    updatedAt: '2024-08-23'
  },
  {
    id: 'ucr-03',
    projectId: 'proj-aeron',
    objectName: 'Корпус 2 (Блок Б)',
    zone: 'Секция 1',
    floor: '4 этаж',
    axis: 'В осях 6-9 / Г-Е',
    workTypeId: 'wt-kr',
    workTypeName: 'Армирование и бетонирование колонн К-1..К-8',
    contractorOrgId: 'org-gc',
    contractorOrgName: 'АО «ГлавСтрой Комплекс»',
    assignedExecutorName: 'Нач. участка Васильев К. Е.',
    plannedVolume: 48,
    actualVolume: 48,
    unit: 'м³',
    documentRefId: 'doc-04',
    documentCode: '240/24-КР1',
    photoIds: ['photo-03'],
    defectRemarksIds: [],
    holdPointRequired: true,
    holdPointSatisfied: true,
    witnessPointRequired: true,
    witnessPointPassed: true,
    aosrId: 'aosr-03',
    aosrStatus: 'FULLY_APPROVED',
    acceptanceStatus: 'ACCEPTED',
    overallStatus: 'COMPLETED',
    updatedAt: '2024-08-24'
  }
];
