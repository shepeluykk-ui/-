# АРХИТЕКТУРА СИСТЕМЫ «СТРОИТЕЛЬНЫЙ КОНТРОЛЬ»
## ООО «Комплексные Инженерные Технологии» (ООО «КИТ»)

---

## 1. ОБЩАЯ СХЕМА АРХИТЕКТУРЫ

```
+-------------------------------------------------------------------------+
|                              КЛИЕНТСКИЙ СЛОЙ                            |
|                                                                         |
|  +---------------------+  +---------------------+  +------------------+ |
|  |  Web UI (Desktop)   |  |   Mobile Terminal   |  | Brand Splash &   | |
|  |  React 18 + Tailwind|  | Offline Sync Queue  |  | Vector Identity  | |
|  +----------+----------+  +----------+----------+  +--------+---------+ |
|             |                        |                      |           |
+-------------+------------------------+----------------------+-----------+
                                       |
                                       v
+-------------------------------------------------------------------------+
|                         УПРАВЛЕНИЕ СОСТОЯНИЕМ (App Context)             |
|                                                                         |
|  +--------------------+  +--------------------+  +--------------------+ |
|  |  RBAC & Access     |  | Multi-Project      |  | Audit Trail        | |
|  |  Control (can())   |  | Isolation Layer    |  | Logging Engine     | |
|  +--------------------+  +--------------------+  +--------------------+ |
|  +--------------------+  +--------------------+  +--------------------+ |
|  | Traceability Engine|  | Engineering Math   |  | AI/RAG Search &    | |
|  | RD <-> KS-2 <->Fact|  | HVAC/OVIK Formula  |  | Normative Guard    | |
|  +--------------------+  +--------------------+  +--------------------+ |
+--------------------------------------+----------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------+
|                             СЕРВЕРНЫЙ СЛОЙ                              |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | Express.js Server (Node.js + TypeScript)                          |  |
|  | /api/health                                                       |  |
|  | /api/projects/:id (Tenant Isolated Handler)                       |  |
|  | /api/audit (Immutable append-only events)                         |  |
|  | /api/backup & /api/restore (AES-256 JSON Snapshot Manager)        |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 2. РОЛЕВАЯ МОДЕЛЬ (RBAC MATRIX)

| Роль | Просмотр данных | Утверждение РД | Создание дефектов | Закрытие Hold Point | Подписание КС-2 / Финансы |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `CONSTRUCTION_CONTROL` | Да | Только замечания | Да | **Да** | Нет |
| `CHIEF_ENGINEER` (ГИП) | Да | **Да** | Да | **Да** | Согласование |
| `PTO_ENGINEER` | Да | Проверка объемов | Да | Нет | Расчет и акты |
| `OVIK_ENGINEER` | Да | Замечания по сетям | Да | Опрессовка/ПНР | Нет |
| `FOREMAN` (Прораб) | Да | Просмотр | Сдача на проверку | Запрос освидетельствования | Нет |
| `CONTRACTOR` | Да | Просмотр | Устранение | Запрос проверки | Нет |
| `CUSTOMER` | Да | Утверждение | Да | Мониторинг | **Да** |
| `SUPER_ADMIN` | **Все** | **Все** | **Все** | **Все** | **Все** |

---

## 3. МОДЕЛИ ДАННЫХ И СВЯЗИ

* **Project:** `id`, `name`, `code`, `address`, `status`, `plannedBudgetRub`, `acceptedRub`, `physicalProgressPercent`, `docCompletenessPercent`.
* **Document:** `id`, `projectId`, `code`, `title`, `stage` (P/RD/ID), `version`, `status` (`APPROVED_FOR_CONSTRUCTION`, `DRAFT`, `ARCHIVED`), `pdfUrl`.
* **InspectionRecord:** `id`, `projectId`, `workName`, `pointType` (`STANDARD`, `WITNESS_POINT`, `HOLD_POINT`), `isHoldPointSatisfied`, `regulatoryBasis`, `designDocReference`, `result`.
* **DefectRemark:** `id`, `defectNumber`, `projectId`, `title`, `severity` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), `status` (`OPEN`, `FIXED_BY_CONTRACTOR`, `CLOSED`, `REJECTED`), `location`, `isHoldPointBlocked`.
* **EstimateComparisonItem:** `id`, `projectId`, `code`, `workName`, `unit`, `rdVolume`, `estimateVolume`, `factVolume`, `costPerUnitRub`, `status` (`MATCH`, `CONFLICT`, `PENDING`).
* **ExecutiveDocItem:** `id`, `projectId`, `actNumber`, `actType` (`AOSR`, `AOOK`, `AOUS`), `status` (`SIGNED`, `IN_REVIEW`, `DRAFT`, `MISSING`), `certificates`, `drawings`.
* **AuditLogEntry:** `id`, `timestamp`, `userId`, `userName`, `userRole`, `action`, `details`, `ipAddress`, `severity`.
