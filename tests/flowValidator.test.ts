import { describe, it, expect } from 'vitest';
import { validatePrismaFlow, autoReconcileFlowCounts } from '../src/core/flowValidator';
import { validateBooleanQuery } from '../src/core/booleanParser';
import { generateInteractivePrismaHtml } from '../src/core/htmlExporter';
import {
  PRESET_SOFTWARE_ENGINEERING,
  PRESET_HEALTH_SCIENCES,
  PRESET_BROKEN_AUDIT_CHALLENGE,
} from '../src/data/presets';

describe('Motor Algebraico de Conciliación PRISMA 2020 (flowValidator)', () => {
  it('aprueba un flujo perfectamente conciliado en Ingeniería de Software (SEGRESS)', () => {
    const report = validatePrismaFlow(PRESET_SOFTWARE_ENGINEERING.flowCounts);
    expect(report.isBalanced).toBe(true);
    expect(report.isOntologyValid).toBe(true);
    expect(report.areExclusionReasonsValid).toBe(true);
    expect(report.canExport).toBe(true);
    expect(report.totalIdentifiedDatabasesAndRegisters).toBe(1450);
    expect(report.expectedRecordsScreened).toBe(950);
    expect(report.expectedReportsSought).toBe(140);
    expect(report.expectedReportsAssessed).toBe(134);
    expect(report.sumExcludedReasons).toBe(106);
    expect(report.expectedReportsIncluded).toBe(28);
  });

  it('aprueba el caso clínico en Ciencias de la Salud y permite exportar HTML interactivo', () => {
    const report = validatePrismaFlow(PRESET_HEALTH_SCIENCES.flowCounts);
    expect(report.canExport).toBe(true);
    const html = generateInteractivePrismaHtml(PRESET_HEALTH_SCIENCES, report);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('CRD42026589120');
    expect(html).toContain('Estudios incluidos en la revisión (n = 16)');
    expect(html).toContain('Informes de estudios incluidos (n = 22)');
  });

  it('bloquea la exportación cuando existen inconsistencias numéricas o Estudios > Informes', () => {
    const report = validatePrismaFlow(PRESET_BROKEN_AUDIT_CHALLENGE.flowCounts);
    expect(report.isBalanced).toBe(false);
    expect(report.isOntologyValid).toBe(false);
    expect(report.canExport).toBe(false);
    expect(() =>
      generateInteractivePrismaHtml(PRESET_BROKEN_AUDIT_CHALLENGE, report)
    ).toThrow(/Exportación bloqueada/);
  });

  it('autoReconcileFlowCounts repara automáticamente un flujo desbalanceado y su ontología', () => {
    const fixed = autoReconcileFlowCounts(PRESET_BROKEN_AUDIT_CHALLENGE.flowCounts);
    const reportAfter = validatePrismaFlow(fixed);
    expect(reportAfter.isBalanced).toBe(true);
    expect(reportAfter.isOntologyValid).toBe(true);
    expect(reportAfter.canExport).toBe(true);
    expect(fixed.studiesIncludedReview).toBeLessThanOrEqual(fixed.reportsIncludedReview);
  });
});

describe('Validador de Sintaxis Booleana PRISMA-S (booleanParser)', () => {
  it('valida positivamente una ecuación booleana con paréntesis balanceados y etiquetas MeSH/tiab', () => {
    const query =
      '("Heart Failure"[Mesh] OR "heart failure"[tiab]) AND ("Telemedicine"[Mesh] OR "telemonitoring"[tiab])';
    const res = validateBooleanQuery(query);
    expect(res.isValid).toBe(true);
    expect(res.hasBalancedParentheses).toBe(true);
    expect(res.hasFieldTagsOrDescriptors).toBe(true);
    expect(res.operatorCounts.AND).toBe(1);
    expect(res.operatorCounts.OR).toBe(2);
  });

  it('detecta paréntesis desbalanceados y ambigüedad de precedencia AND/OR', () => {
    const brokenQuery = '("defect prediction" OR "bug prediction" AND "deep learning"';
    const res = validateBooleanQuery(brokenQuery);
    expect(res.isValid).toBe(false);
    expect(res.hasBalancedParentheses).toBe(false);
  });
});
