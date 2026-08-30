/**
 * ИНФОРМАЦИОННАЯ СИСТЕМА «СТРОИТЕЛЬНЫЙ КОНТРОЛЬ»
 * ПОЛНАЯ ТИПИЗАЦИЯ И СХЕМЫ ДАННЫХ (PRODUCTION READY)
 */

// 1. Статусы достоверности данных (Data Provenance & Traceability)
export type DataStatus = 
  | 'DOCUMENT CONFIRMED' // Найдено в утвержденном документе
  | 'CALCULATED'         // Рассчитано по формуле
  | 'REQUIRES REVIEW'    // Требует проверки экспертом/ГИПом
  | 'CONFLICT'           // Противоречие между источниками (РД != Смета != Факт)
  | 'NO DATA';           // Данные отсутствуют (запрет выдумывания)

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SourceTraceability {
  documentId?: string;
  documentTitle: string;
  documentCode?: string;
  page?: number | string;
  section?: string;
  item?: string;
  value: string | number;
  unit: string;
  relatedWorkId?: string;
  relatedProjectId?: string;
  confirmedBy?: string;
  date: string;
  status: DataStatus;
  confidence?: ConfidenceLevel;
}

export interface CalculationTrace {
  formulaName: string;
  formula: string;
  inputs: Record<string, number | string>;
  result: number | string;
  unit: string;
  calculatedAt: string;
  calculatedBy: string;
  normativeBasis?: string; // e.g. СП 73.13330.2016
}

// 2. Ролевая модель и RBAC (14 ролей)
export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PROJECT_DIRECTOR'
  | 'PROJECT_MANAGER'
  | 'CHIEF_ENGINEER'       // ГИП / Главный инженер
  | 'CONSTRUCTION_CONTROL'  // Инженер строительного контроля / Технадзор
  | 'PTO_ENGINEER'          // Инженер ПТО
  | 'OVIK_ENGINEER'         // Инженер ОВиК / Спец. сети
  | 'ELECTRICAL_ENGINEER'   // Инженер ЭОМ
  | 'FOREMAN'               // Прораб / Начальник участка
  | 'CONTRACTOR'            // Генподрядчик
  | 'SUBCONTRACTOR'         // Субподрядчик
  | 'CUSTOMER'              // Технический заказчик
  | 'VIEWER';               // Аудитор / Наблюдатель

export type PermissionAction = 
  | 'VIEW' 
  | 'CREATE' 
  | 'EDIT' 
  | 'DELETE' 
  | 'APPROVE' 
  | 'REJECT' 
  | 'EXPORT' 
  | 'DOWNLOAD' 
  | 'CLOSE_DEFECT' 
  | 'SIGN_ACT';

export type SystemModule =
  | 'dashboard'
  | 'projects'
  | 'organizations'
  | 'work_types'
  | 'unified_control'
  | 'documents'
  | 'drawings'
  | 'specifications'
  | 'estimates'
  | 'schedule'
  | 'volume_control'
  | 'construction_control'
  | 'ovik'
  | 'photo_control'
  | 'defects'
  | 'executive_docs'
  | 'contractors'
  | 'finance'
  | 'risks'
  | 'ai_assistant'
  | 'ai_project_analysis'
  | 'reports'
  | 'audit_log'
  | 'security_redteam'
  | 'backup_restore'
  | 'registration_requests'
  | 'mobile_site';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  organizationId: string;
  organizationName: string;
  role: UserRole;
  allowedProjectIds: string[]; // Strict project isolation
  avatarUrl?: string;
  certificateNumber?: string; // Номер в НОПРИЗ / НОСТРОЙ
  isActive: boolean;
  lastLoginAt?: string;
}

// 3. Организации и Структура Участников
export type OrganizationType = 
  | 'CUSTOMER'        // Технический заказчик / Инвестор
  | 'GENERAL_CONTRACTOR' // Генподрядчик
  | 'SUBCONTRACTOR'   // Субподрядчик
  | 'DESIGN_INSTITUTE'// Проектный институт (Генпроектировщик)
  | 'SUPERVISION'     // Независимый строительный контроль / Лаборатория
  | 'SUPPLIER';       // Поставщик материалов/оборудования

export interface Organization {
  id: string;
  name: string;
  inn: string;
  ogrn: string;
  type: OrganizationType;
  sroNumber?: string; // Номер СРО
  sroExpiryDate?: string;
  directorName: string;
  contactEmail: string;
  contactPhone: string;
  activeContractsCount: number;
  qualityRatingScore: number; // 0-100
  createdAt: string;
}

// 4. Проекты (Строительные Объекты)
export type ProjectStatus = 'PLANNING' | 'ACTIVE_CONSTRUCTION' | 'COMMISSIONING' | 'ACCEPTED' | 'ARCHIVED';

export interface Project {
  id: string;
  name: string;
  code: string; // Шифр объекта (напр. ОКС-2025/БЛОК-А)
  address: string;
  customerOrgId: string;
  customerOrgName: string;
  generalContractorOrgId: string;
  generalContractorOrgName: string;
  chiefEngineerName: string;
  projectManagerName: string;
  startDate: string;
  plannedFinishDate: string;
  forecastFinishDate: string;
  status: ProjectStatus;
  
  // KPI и Метрики
  budgetContractRub: number;
  budgetEstimateRub: number;
  executedRub: number;
  acceptedRub: number;
  paidRub: number;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  docCompletenessPercent: number;
  
  // Координаты и оси
  floorsCount: number;
  sectionsCount: number;
  axesDefinition: string[]; // ['1-12', 'А-Ж']
  
  createdAt: string;
}

// 5. Документооборот (ПД, РД, Спецификации, Чертежи)
export type DocumentCategory = 
  | 'PROJECT_DOC'      // ПД (Проектная документация)
  | 'WORKING_DOC'      // РД (Рабочая документация)
  | 'SPECIFICATION'    // Спецификация
  | 'ESTIMATE'         // Смета (ГрандСмета / Excel)
  | 'DRAWING'          // Чертеж (PDF/DWG)
  | 'EXECUTIVE_SCHEME' // Исполнительная схема
  | 'TEST_CERTIFICATE' // Паспорт / Сертификат качества
  | 'ACT'              // Акт (АОСР, АОПИ)
  | 'JOURNAL';         // Общий/специальный журнал работ

export type DocumentStatus = 
  | 'DRAFT' 
  | 'UPLOADED' 
  | 'PROCESSING' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' // В производство работ
  | 'REJECTED' 
  | 'ARCHIVED';

export interface DocumentVersion {
  versionNumber: number;
  revision: string; // Ревизия (напр. Изм. 0, Изм. 1)
  fileUrl: string;
  fileName: string;
  fileSizeMb: number;
  uploadedBy: string;
  uploadedAt: string;
  changeDescription: string;
  status: DocumentStatus;
  approvedBy?: string;
  approvedAt?: string;
  sha256?: string;
  storagePath?: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  code: string; // Шифр (напр. 240/24-ОВ1)
  section: string; // Марка: АР, КР, ОВ, ВК, ЭОМ, СС, АВТ
  category: DocumentCategory;
  currentRevision: string;
  currentVersion: number;
  status: DocumentStatus;
  uploadedBy: string;
  authorOrg: string;
  pagesCount: number;
  versions: DocumentVersion[];
  tags: string[];
  hasConflicts: boolean;
  conflictNotes?: string;
  createdAt: string;
  updatedAt: string;
  sha256?: string;
}

// 6. Спецификации и Сметы (Estimates & Volumes)
export interface EstimateItem {
  id: string;
  projectId: string;
  documentId: string;
  itemNumber: string; // 1.1, 1.2
  name: string;
  category: 'EQUIPMENT' | 'MATERIAL' | 'WORK';
  unit: string; // м, шт, м², компл, чел-ч
  plannedQty: number; // Объем по РД
  estimateQty: number; // Объем по смете
  actualFactQty: number; // Выполнено по факту
  acceptedQty: number; // Принято технадзором (по АОСР)
  unitPriceRub: number;
  totalPriceRub: number;
  contractorOrgId: string;
  status: DataStatus; // DOCUMENT CONFIRMED, CONFLICT, etc.
  conflictReason?: string;
  coveragePercent: number; // (actual / planned) * 100
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
}

// 7. График, WBS и Календарный план
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'HOLD_POINT_BLOCKED' | 'COMPLETED' | 'DELAYED';

export interface ScheduleTask {
  id: string;
  projectId: string;
  wbsCode: string; // 1.2.4
  title: string;
  section: string; // ОВ, ВК, КР
  startDate: string;
  finishDate: string;
  forecastFinishDate: string;
  durationDays: number;
  plannedVolume: number;
  actualVolume: number;
  unit: string;
  progressPercent: number;
  spi: number; // Schedule Performance Index (< 1 = отставание)
  isCriticalPath: boolean;
  predecessorIds: string[];
  assignedContractorId: string;
  assignedContractorName: string;
  responsiblePerson: string;
  status: TaskProgressStatus;
  holdPointRequired: boolean;
  holdPointPassed: boolean;
  lastInspectionDate?: string;
}

// 8. Строительный контроль, Проверки, Hold Points
export type InspectionType = 
  | 'INPUT_CONTROL'       // Входной контроль материалов и оборудования
  | 'OPERATIONAL_CONTROL' // Операционный контроль при монтаже
  | 'ACCEPTANCE_CONTROL'  // Приемочный контроль
  | 'HIDDEN_WORK'         // Освидетельствование скрытых работ
  | 'LABORATORY_TEST'     // Лабораторные испытания (бетон, сварка)
  | 'PRESSURE_TEST'       // Гидравлические / пневматические испытания (ОВиК)
  | 'COMMISSIONING';      // Пусконаладка и комплексное опробование

export type InspectionResult = 'PASSED' | 'FAILED' | 'REWORK_REQUIRED' | 'UNDER_REVIEW';

export interface InspectionRecord {
  id: string;
  projectId: string;
  taskId?: string;
  workName: string;
  inspectionType: InspectionType;
  location: {
    building?: string;
    floor?: number | string;
    room?: string;
    axes?: string; // В осях 2-5 / Б-В
  };
  contractorOrgId: string;
  contractorOrgName: string;
  inspectorName: string;
  inspectorRole: UserRole;
  inspectionDate: string;
  
  // Нормативно-техническая база
  regulatoryBasis: string; // СП 73.13330.2016, ГОСТ 32970-2014
  designDocReference: string; // РД Лист 14
  
  // Тип контрольной точки
  pointType: 'STANDARD' | 'WITNESS_POINT' | 'HOLD_POINT';
  isHoldPointSatisfied: boolean;
  
  result: InspectionResult;
  findings: string;
  measurements?: Array<{ parameter: string; standardValue: string; actualValue: string; pass: boolean }>;
  photoIds: string[];
  defectsGeneratedIds: string[];
  actNumberSigned?: string;
  createdAt: string;
}

// 9. Отраслевой Модуль ОВиК & VRF Системы
export type OvikSystemType = 
  | 'VRF_VRV' 
  | 'VENTILATION_SUPPLY_EXHAUST' 
  | 'SMOKE_EXHAUST' 
  | 'HEATING' 
  | 'CHILLED_WATER' 
  | 'AUTOMATION';

export interface VrfSystemUnit {
  id: string;
  projectId: string;
  systemTag: string; // VRF-1, В1, ДУ-2
  systemType: OvikSystemType;
  location: string;
  
  // Оборудование
  oduModel: string; // Наружный блок
  oduSerial: string;
  oduCapacityKw: number;
  iduCount: number; // Кол-во внутренних блоков
  refrigerantType: 'R410A' | 'R32' | 'R134a';
  calculatedRefrigerantChargeKg: number; // Расчетная дозаправка
  actualRefrigerantChargedKg: number;
  
  // Протяженность и материалы
  totalPipeLengthM: number;
  refnetCount: number;
  pipeDiameters: string[]; // ['Ø9.52', 'Ø19.05', 'Ø28.58']
  insulationType: string; // Kaiflex 13mm / 19mm
  
  // Статусы технологических этапов (Строгая последовательность)
  installationStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  nitrogenPressureTestStatus: 'NOT_TESTED' | 'TESTING_41_BAR' | 'PASSED_24H' | 'FAILED';
  vacuumTestStatus: 'NOT_TESTED' | 'VACUUMING' | 'PASSED_750_MICRONS' | 'FAILED';
  oilTrapInstalled: boolean;
  addressingCompleted: boolean;
  commissioningStatus: 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
  executiveDocsComplete: boolean;
  
  lastTestedDate?: string;
  responsibleEngineer: string;
}

// 10. Фотофиксация и геопривязка
export interface SitePhoto {
  id: string;
  projectId: string;
  workId?: string;
  inspectionId?: string;
  defectId?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  location: {
    floor: string | number;
    room: string;
    axes: string;
    gpsCoords?: { lat: number; lng: number };
  };
  capturedBy: string;
  capturedAt: string;
  photoType: 'BEFORE' | 'IN_PROGRESS' | 'AFTER_FIX' | 'DEFECT_EVIDENCE' | 'ROUTINE';
  comment: string;
  aiTags: string[];
  aiObservations?: string; // AI observation != confirmed fact
  isVerifiedByHuman: boolean;
}

// 11. Дефекты и Замечания
export type DefectSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type DefectStatus = 
  | 'OPEN' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'READY_FOR_REVIEW' 
  | 'REJECTED' // Отклонено инспектором при повторной проверке
  | 'CLOSED';  // Закрыто уполномоченным лицом

export interface DefectRemark {
  id: string;
  projectId: string;
  defectNumber: string; // ЗАМ-2025-0042
  title: string;
  description: string;
  category: 'QUALITY' | 'SAFETY' | 'NON_COMPLIANCE_RD' | 'MATERIAL_DEFECT' | 'DOCUMENTATION';
  severity: DefectSeverity;
  sourceType: 'INSPECTION' | 'SURVEILLANCE' | 'CUSTOMER_AUDIT' | 'AI_OBSERVATION';
  
  location: {
    floor: string | number;
    room: string;
    axes: string;
  };
  
  contractorOrgId: string;
  contractorOrgName: string;
  responsiblePersonName: string;
  issuedByInspectorName: string;
  
  beforePhotoUrls: string[];
  afterPhotoUrls: string[];
  
  issuedDate: string;
  deadlineDate: string;
  closedDate?: string;
  status: DefectStatus;
  
  reinspectionNotes?: string;
  reinspectionCount: number;
  auditTrail: Array<{
    timestamp: string;
    author: string;
    action: string;
    comment: string;
  }>;
}

// 12. Исполнительная документация (ИД, АОСР, Журналы)
export type ExecutiveDocType = 
  | 'AOSR'               // Акт освидетельствования скрытых работ (Приказ Минстроя)
  | 'EXECUTIVE_SCHEME'   // Исполнительная геодезическая/монтажная схема
  | 'TEST_REPORT'        // Протокол испытаний / Акт опрессовки
  | 'QUALITY_PASSPORT'   // Паспорт качества / Сертификат ТР ТС
  | 'GENERAL_JOURNAL'    // Общий журнал работ (РД-11-05-2007)
  | 'SPECIAL_JOURNAL';   // Журнал сварочных работ, журнал входного контроля

export type ExecutiveDocStatus = 'MISSING' | 'UNDER_REVIEW' | 'APPROVED' | 'EXPIRED';

export interface ExecutiveDocItem {
  id: string;
  projectId: string;
  workId: string;
  workName: string;
  docType: ExecutiveDocType;
  docNumber: string;
  title: string;
  requiredCount: number;
  uploadedCount: number;
  approvedCount: number;
  status: ExecutiveDocStatus;
  fileUrl?: string;
  signedByContractor: boolean;
  signedBySupervisor: boolean;
  signedByCustomer: boolean;
  signingDate?: string;
  expiryDate?: string;
}

// 13. Подрядчики и Индекс Производительности
export interface ContractorPerformance {
  contractorId: string;
  contractorName: string;
  projectId: string;
  overallScore: number; // 0 - 100
  qualityScore: number;
  scheduleScore: number;
  volumeComplianceScore: number;
  documentationScore: number;
  disciplineScore: number;
  openDefectsCount: number;
  criticalDefectsCount: number;
  overdueDefectsCount: number;
  spiAverage: number;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
}

// 14. Финансовый контроль и КС-2 / КС-3
export interface Ks2Item {
  id: string;
  ks2Id: string;
  estimateItemId: string;
  workName: string;
  unit: string;
  quantityExecuted: number;
  unitPriceRub: number;
  totalSumRub: number;
  aoSrConfirmed: boolean; // Обязательное условие: подтверждено АОСР
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
}

export interface KsDocument {
  id: string;
  projectId: string;
  docType: 'KS2' | 'KS3';
  docNumber: string;
  periodStart: string;
  periodEnd: string;
  contractorOrgId: string;
  contractorOrgName: string;
  totalSumWithoutVatRub: number;
  vatAmountRub: number;
  totalSumWithVatRub: number;
  status: 'DRAFT' | 'VERIFIED_PTO' | 'APPROVED_SUPERVISOR' | 'SIGNED_CUSTOMER' | 'PAID';
  itemsCount: number;
  items?: Ks2Item[];
  createdAt: string;
}

// 15. Управление Рисками (Risk Management Matrix)
export type RiskCategory = 
  | 'TECHNICAL'
  | 'DESIGN'
  | 'PRODUCTION'
  | 'STAFF'
  | 'FINANCE'
  | 'PROCUREMENT'
  | 'SCHEDULE'
  | 'CONTRACTOR'
  | 'QUALITY'
  | 'SAFETY'
  | 'DOCUMENTATION';

export interface ProjectRisk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: RiskCategory;
  probability: 1 | 2 | 3 | 4 | 5; // 1 = очень низкая, 5 = почти неизбежно
  impact: 1 | 2 | 3 | 4 | 5;      // 1 = незначительно, 5 = критично
  score: number;                   // Probability * Impact (1 - 25)
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ownerName: string;
  mitigationPlan: string;
  deadlineDate: string;
  status: 'IDENTIFIED' | 'MITIGATING' | 'CONTROLLED' | 'REALIZED' | 'CLOSED';
  detectedBy: 'AI_AUDIT' | 'CHIEF_ENGINEER' | 'PROJECT_MANAGER';
}

// 16. Уведомления и Системный Аудит (Notifications & Audit Trail)
export type NotificationType = 
  | 'CRITICAL_DEFECT' 
  | 'HOLD_POINT_TRIGGER' 
  | 'SCHEDULE_DELAY' 
  | 'BUDGET_OVERRUN' 
  | 'MISSING_EXECUTIVE_DOC' 
  | 'DOCUMENT_REVISION_CONFLICT' 
  | 'CERTIFICATE_EXPIRING';

// 17. Универсальная сущность WORK_TYPE (Справочник видов работ)
export type WorkTypeStatus = 'ACTIVE' | 'ARCHIVED';

export interface WorkType {
  id: string;
  code: string; // ОВ, ВК, ЭОМ, СС, СКС, CCTV, АПС, АУПТ, АР, КР, БЕТОН, КМ, КРОВЛЯ, ФАСАД, ОТДЕЛКА, ТХ, ПНР и др.
  name: string;
  categoryGroup: 'HVAC_PLUMBING' | 'ELECTRICAL_LOW_CURRENT' | 'STRUCTURAL_BUILDING' | 'FINISHING_FACADE' | 'EQUIPMENT_COMMISSIONING' | 'SPECIAL';
  defaultUnit: string; // м.п., м², м³, шт., компл., тн, узел
  regulatoryStandard: string; // СП 60.13330, СП 73.13330, СП 48.13330, ГОСТ и др.
  requiresHoldPoint: boolean;
  requiresWitnessPoint: boolean;
  requiresAosr: boolean;
  typicalInspectionCheckpoints: string[];
  status: WorkTypeStatus;
  isCustomCreated?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 19. Заявки на регистрацию и жизненный цикл (PENDING -> APPROVED -> VERIFIED -> ACTIVE)
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'VERIFIED' | 'ACTIVE' | 'REJECTED';

export interface RegistrationRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  organization: string;
  position: string;
  login: string;
  role?: UserRole;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  attemptsCount?: number;
  otpExpiresAt?: string;
  otpLastSentAt?: string;
  notificationChannel?: 'EMAIL' | 'SMS';
}

export interface RegistrationFormData {
  fullName: string;
  phone: string;
  email: string;
  organization: string;
  position: string;
  login: string;
  password: string;
  confirmPassword: string;
}

export interface UnifiedControlRecord {
  id: string;
  projectId: string;
  objectName: string; // Объект / Корпус / Блок
  zone: string;       // Зона / Секция
  floor: string;      // Этаж
  axis: string;       // Осевая привязка (в осях 1-6 / А-Г)
  workTypeId: string; // Ссылка на WORK_TYPE
  workTypeName: string;
  contractorOrgId: string;
  contractorOrgName: string;
  assignedExecutorName: string; // Исполнитель / Бригадир / Прораб
  plannedVolume: number;
  actualVolume: number;
  unit: string;
  documentRefId?: string; // Привязка к РД / Спецификации
  documentCode?: string;
  photoIds: string[];
  defectRemarksIds: string[];
  holdPointRequired: boolean;
  holdPointSatisfied: boolean;
  witnessPointRequired: boolean;
  witnessPointPassed: boolean;
  aosrId?: string;
  aosrStatus?: 'NOT_REQUIRED' | 'DRAFT' | 'SIGNED_BY_CONTRACTOR' | 'SIGNED_BY_SUPERVISOR' | 'FULLY_APPROVED';
  acceptanceStatus: 'IN_PROGRESS' | 'HOLD_BLOCKED' | 'READY_FOR_ACCEPTANCE' | 'ACCEPTED' | 'REJECTED';
  overallStatus: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  projectId: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  linkModule?: SystemModule;
  linkEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  projectId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'SIGN' | 'CLOSE_DEFECT';
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  timestamp: string;
  source: 'WEB_APP' | 'MOBILE_SITE' | 'API';
}

// 20. AI PROJECT ENGINEERING & COMMERCIAL ANALYSIS TYPES (MULTI-AGENT ARCHITECTURE)

export type AnalysisJobStatus =
  | 'QUEUED'
  | 'PARSING'
  | 'EXTRACTING'
  | 'ANALYZING'
  | 'CALCULATING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED';

export type AiAgentRole =
  | 'PROJECT_DIRECTOR'      // Руководитель AI-проектирования
  | 'PTO_ENGINEER'           // Инженер ПТО
  | 'HVAC_ENGINEER'          // Инженер ОВиК / Специальные сети
  | 'ESTIMATOR'              // Инженер-сметчик
  | 'PROCUREMENT'            // Инженер по закупкам и МТО
  | 'PRODUCTION'             // Начальник производства / Производственник
  | 'FINANCIAL'              // Финансовый аналитик
  | 'PROFITABILITY'          // Аналитик рентабельности
  | 'RISK'                   // Аналитик рисков
  | 'CONTRACT'               // Юридическо-договорной аналитик
  | 'VALIDATION'             // Контролер проекта (Cross-validation)
  | 'EXECUTIVE_DECISION';    // Финальный директор (Go / No-Go)

export type AgentExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FALLBACK_LOCAL'
  | 'FAILED'
  | 'SKIPPED';

export interface AgentProvenance {
  source_document: string;
  source_page?: number | string;
  source_section?: string;
  source_table?: string;
  confidence: number; // 0..1
}

// Structured Project Dataset item with provenance
export interface ProjectItemExtraction extends AgentProvenance {
  id: string;
  category: 'EQUIPMENT' | 'MATERIAL' | 'WORK' | 'FITTING' | 'AUTOMATION' | 'OTHER';
  name: string;
  brand?: string;
  model?: string;
  specification?: string;
  quantity: number;
  unit: string;
  section: string;
  sheetNumber?: string;
  isConfirmed: boolean;
  requiresReview: boolean;
  notes?: string;
}

export interface ProjectDataset {
  projectId: string;
  documentIds: string[];
  projectName: string;
  code: string;
  sectionsDetected: string[];
  totalExtractedItems: number;
  extractedItems: ProjectItemExtraction[];
  equipmentList: ProjectItemExtraction[];
  materialsList: ProjectItemExtraction[];
  worksList: ProjectItemExtraction[];
  drawingsCount: number;
  specificationsCount: number;
  notesCount: number;
  datasetConfidence: number; // 0..1
  isComplete: boolean;
  missingSections: string[];
}

export type CostCategory =
  | 'LABOR'
  | 'MATERIALS'
  | 'EQUIPMENT'
  | 'SUBCONTRACT'
  | 'LOGISTICS'
  | 'TOOLS'
  | 'CONSUMABLES';

export interface CalculatedEstimateItem extends AgentProvenance {
  id: string;
  workOrItemName: string;
  category: CostCategory;
  quantity: number;
  unit: string;
  unitPriceRub: number;
  totalPriceRub: number;
  laborHoursPerUnit?: number;
  totalLaborHours?: number;
  priceSource: string;
  codeFER_GESN?: string;
  isEstimated: boolean;
}

export interface ResourceModel {
  items: CalculatedEstimateItem[];
  directCosts: {
    laborRub: number;
    materialsRub: number;
    equipmentRub: number;
    subcontractRub: number;
    logisticsRub: number;
    toolsRub: number;
    consumablesRub: number;
    totalDirectRub: number;
  };
  indirectCosts: {
    overheadRub: number;     // Накладные расходы (HP)
    overheadPercent: number;
    taxesRub: number;        // Налоги и отчисления
    contingencyRub: number;  // Непредвиденные затраты
    contingencyPercent: number;
    totalIndirectRub: number;
  };
  totalEstimatedCostRub: number;
}

export interface ProductionPlan {
  totalLaborHours: number;
  recommendedCrewSize: number;
  crewComposition: string[];
  estimatedDurationDays: number;
  shiftsCount: number;
  workFrontsCount: number;
  criticalPathSummary: string;
  milestones: {
    name: string;
    durationDays: number;
    laborHours: number;
    crewSize: number;
    dependencies?: string[];
  }[];
}

export interface ProcurementItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCostRub: number;
  leadTimeDays: number;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  isLongLead: boolean;
  isImported: boolean;
  supplyRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  potentialAnalogue?: string;
  supplierRecommendation?: string;
}

export interface FinancialCalculation {
  contractPriceRub: number;
  vatPercent: number;
  vatAmountRub: number;
  revenueWithoutVatRub: number;
  directCostRub: number;
  indirectCostRub: number;
  grossCostRub: number;
  grossProfitRub: number;
  netProfitRub: number;
  marginPercent: number;
  markupPercent: number;
  breakEvenCostRub: number;
  isContractPriceProvided: boolean;
}

export interface ProfitabilityScenario {
  costRub: number;
  profitRub: number;
  marginPercent: number;
  markupPercent: number;
  description: string;
  probabilityScore: number;
}

export interface ProfitabilityAnalysis {
  status: 'CALCULATED' | 'DATA_INCOMPLETE' | 'REQUIRES_REVIEW';
  contractPriceRub: number;
  optimistic: ProfitabilityScenario;
  base: ProfitabilityScenario;
  risk: ProfitabilityScenario;
  expectedProfitRub: number;
  expectedMarginPercent: number;
  breakEvenRub: number;
  targetPriceForTargetMarginRub: number;
  reasonIfIncomplete?: string;
}

export interface AiProjectRiskItem {
  id: string;
  title: string;
  category: 'TECHNICAL' | 'FINANCIAL' | 'PRODUCTION' | 'PROCUREMENT' | 'CONTRACT' | 'QUALITY';
  probability: number; // 0..1
  impact: number;      // 0..1
  score: number;       // probability * impact (0..1)
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  costOfRiskRub: number;
  sourceDescription: string;
  mitigationMeasure: string;
  responsibleRole: string;
}

export interface AiConflictItem {
  id: string;
  title: string;
  item: string;
  sourceA: {
    documentName: string;
    section: string;
    sheetOrPage: string;
    value: string | number;
  };
  sourceB: {
    documentName: string;
    section: string;
    sheetOrPage: string;
    value: string | number;
  };
  delta: string;
  financialImpactRub: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  resolutionRecommendation: string;
  requiresReview: boolean;
}

export type ExecutiveDecisionCode =
  | 'GO'
  | 'GO_WITH_CONDITIONS'
  | 'RENEGOTIATE'
  | 'HIGH_RISK'
  | 'NO_GO';

export interface ExecutiveDecision {
  decision: ExecutiveDecisionCode;
  decisionTitle: string;
  summary: string;
  keyConditions: string[];
  justifications: string[];
  financialRecommendation: string;
  suggestedPriceAdjustmentRub: number;
  confidenceScore: number;
}

export interface SingleAgentOutput {
  agentRole: AiAgentRole;
  agentName: string;
  status: AgentExecutionStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  summary: string;
  findings: string[];
  dataGenerated?: any;
  confidence: number;
  aiSource: 'gemini' | 'local_rag' | 'deterministic_engine';
  modelUsed?: string;
}

export interface ProjectAnalysisJob {
  analysisId: string;
  projectId: string;
  projectName: string;
  documentIds: string[];
  status: AnalysisJobStatus;
  progressPercent: number;
  currentPhaseText: string;
  currentAgentRole?: AiAgentRole;
  createdAt: string;
  updatedAt: string;
  autoTriggered: boolean;

  // Artifacts
  dataset: ProjectDataset;
  agents: Record<AiAgentRole, SingleAgentOutput>;
  ptoHoldPoints: string[];
  productionPlan: ProductionPlan;
  procurementPlan: ProcurementItem[];
  estimate: ResourceModel;
  financialModel: FinancialCalculation;
  profitability: ProfitabilityAnalysis;
  risks: AiProjectRiskItem[];
  conflicts: AiConflictItem[];
  executiveDecision: ExecutiveDecision;

  // Metadata & Resilience Telemetry
  telemetry: {
    totalDurationMs: number;
    modelsAttempted: string[];
    fallbackEventsCount: number;
    usedLocalRagCount: number;
    deterministicCalculationsCount: number;
  };
}

