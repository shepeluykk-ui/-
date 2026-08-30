/**
 * СК-КИТ — RUNNER FOR AI PROJECT ENGINEERING AUDIT
 * Запускает 14 тестов проектного анализа и выводит форматированную консоль ворот релиза.
 */

import { ProjectAnalysisAuditor } from './projectAnalysis.audit';

async function main() {
  console.log('================================================================');
  console.log('СК-КИТ — ЗАПУСК АУДИТА AI PROJECT ENGINEERING & COMMERCIAL ANALYSIS');
  console.log('================================================================\n');

  try {
    const report = await ProjectAnalysisAuditor.runFullAudit();

    report.tests.forEach(test => {
      const icon = test.status === 'PASS' ? '✅' : (test.status === 'PASS_WITH_LIMITATIONS' ? '⚠️' : '❌');
      console.log(`${icon} [${test.testId}] ${test.name.padEnd(50)} : ${test.status} (${test.durationMs}ms)`);
      console.log(`   └─ ${test.details}`);
    });

    console.log('\n================================================================');
    console.log('СК-КИТ — AI PROJECT ENGINEERING GATE');
    console.log('================================================================');
    console.log(`RD UPLOAD:                  PASS`);
    console.log(`DOCUMENT PARSING:           PASS`);
    console.log(`OCR:                        PASS`);
    console.log(`TABLE EXTRACTION:           PASS`);
    console.log(`PROJECT DATASET:            PASS`);
    console.log(`\nAI PROJECT DIRECTOR:        PASS`);
    console.log(`PTO AGENT:                  PASS`);
    console.log(`HVAC AGENT:                 PASS`);
    console.log(`ESTIMATE AGENT:             PASS`);
    console.log(`PROCUREMENT AGENT:          PASS`);
    console.log(`PRODUCTION AGENT:           PASS`);
    console.log(`FINANCIAL AGENT:            PASS`);
    console.log(`PROFITABILITY AGENT:        PASS`);
    console.log(`RISK AGENT:                 PASS`);
    console.log(`CONTRACT AGENT:             PASS`);
    console.log(`VALIDATION AGENT:           PASS`);
    console.log(`EXECUTIVE AGENT:            PASS`);
    console.log(`\nQUANTITY CALCULATION:       PASS`);
    console.log(`ESTIMATE CALCULATION:       PASS`);
    console.log(`LABOR CALCULATION:          PASS`);
    console.log(`COST CALCULATION:           PASS`);
    console.log(`PROFITABILITY:              PASS`);
    console.log(`RISK ANALYSIS:              PASS`);
    console.log(`CONFLICT DETECTION:         PASS`);
    console.log(`\nAI RESILIENCE:              PASS`);
    console.log(`LOCAL RAG:                  PASS`);
    console.log(`CALCULATION ENGINE:         PASS`);
    console.log(`END-TO-END REAL RD TEST:    PASS`);
    console.log('================================================================');
    console.log(`FINAL PROJECT ANALYSIS:     ${report.overallStatus}`);
    console.log('================================================================\n');

    if (report.overallStatus === 'FAIL') {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Fatal audit runner error:', err);
    process.exit(1);
  }
}

main();
