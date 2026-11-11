import { FlowValidationReport, PrismaSessionState, EquationCheckResult } from '../types/prisma';

/**
 * Motor Algorítmico de Conciliación Matemática del Diagrama de Flujo PRISMA 2020
 * Implementa las ecuaciones canónicas de balance (Sección 5.1) y bloquea la exportación
 * ante inconsistencias algebraicas, omisión de causas de exclusión (Ivaldi et al., 2024;
 * Banno et al., 2025) o violación de la ontología Estudio <= Informe.
 */
export function validatePrismaFlow(
  flowCounts: PrismaSessionState['flowCounts']
): FlowValidationReport {
  const {
    recordsIdentifiedDatabases,
    recordsIdentifiedRegisters,
    recordsDuplicatesRemoved,
    recordsMarkedIneligibleAutomation,
    recordsScreenedTitleAbstract,
    recordsExcludedTitleAbstract,
    reportsSoughtForRetrieval,
    reportsNotRetrieved,
    reportsAssessedForEligibility,
    reportsExcludedDetailed,
    studiesIncludedReview,
    reportsIncludedReview,
    studiesIncludedSynthesisQuantitative = 0,
  } = flowCounts;

  // 1. Balance de Identificación y Duplicados
  // Total_Identificados = Registros_Bases + Registros_Registros
  const totalIdentifiedDatabasesAndRegisters =
    recordsIdentifiedDatabases + recordsIdentifiedRegisters;

  // Registros_Cribados = Total_Identificados - (Registros_Duplicados + Registros_Ineligibles_Automatizacion)
  const expectedRecordsScreened =
    totalIdentifiedDatabasesAndRegisters -
    (recordsDuplicatesRemoved + recordsMarkedIneligibleAutomation);

  const eq1Screened: EquationCheckResult = {
    id: 'eq_screening_balance',
    name: '1. Balance de Identificación a Cribado',
    formulaLatex:
      '\\text{Registros\\_Cribados} = (\\text{Registros\\_Bases} + \\text{Registros\\_Registros}) - (\\text{Duplicados} + \\text{Ineligibles\\_IA})',
    formulaPlain:
      'Registros_Cribados = (Registros_Bases + Registros_Registros) - (Duplicados + Ineligibles_IA)',
    expected: expectedRecordsScreened,
    actual: recordsScreenedTitleAbstract,
    delta: recordsScreenedTitleAbstract - expectedRecordsScreened,
    isValid:
      recordsScreenedTitleAbstract === expectedRecordsScreened &&
      expectedRecordsScreened >= 0,
    errorMessage:
      recordsScreenedTitleAbstract !== expectedRecordsScreened
        ? `Desbalance en Cribado: Se esperaban ${expectedRecordsScreened} registros cribados (${totalIdentifiedDatabasesAndRegisters} identificados - ${recordsDuplicatesRemoved} duplicados - ${recordsMarkedIneligibleAutomation} por IA), pero se ingresaron ${recordsScreenedTitleAbstract} (Δ = ${recordsScreenedTitleAbstract - expectedRecordsScreened}).`
        : expectedRecordsScreened < 0
        ? 'El número de registros removidos antes del cribado supera el total identificado.'
        : undefined,
    affectedNodeIds: [
      'node_identified',
      'node_removed_before_screening',
      'node_records_screened',
    ],
  };

  // 2. Balance de Cribado a Informes Buscados para Recuperación
  // Informes_Buscados = Registros_Cribados - Registros_Excluidos_Titulo_Resumen
  const expectedReportsSought =
    recordsScreenedTitleAbstract - recordsExcludedTitleAbstract;

  const eq2ReportsSought: EquationCheckResult = {
    id: 'eq_sought_balance',
    name: '2. Balance de Cribado a Recuperación de Informes',
    formulaLatex:
      '\\text{Informes\\_Buscados} = \\text{Registros\\_Cribados} - \\text{Registros\\_Excluidos\\_Título\\_Resumen}',
    formulaPlain:
      'Informes_Buscados = Registros_Cribados - Registros_Excluidos_Título_Resumen',
    expected: expectedReportsSought,
    actual: reportsSoughtForRetrieval,
    delta: reportsSoughtForRetrieval - expectedReportsSought,
    isValid:
      reportsSoughtForRetrieval === expectedReportsSought &&
      expectedReportsSought >= 0,
    errorMessage:
      reportsSoughtForRetrieval !== expectedReportsSought
        ? `Desbalance en Informes Buscados: Se esperaban ${expectedReportsSought} informes (${recordsScreenedTitleAbstract} cribados - ${recordsExcludedTitleAbstract} excluidos en título/resumen), pero se declararon ${reportsSoughtForRetrieval} (Δ = ${reportsSoughtForRetrieval - expectedReportsSought}).`
        : expectedReportsSought < 0
        ? 'Los registros excluidos en título/resumen superan a los registros cribados.'
        : undefined,
    affectedNodeIds: [
      'node_records_screened',
      'node_records_excluded',
      'node_reports_sought',
    ],
  };

  // 3. Balance de Recuperación a Elegibilidad de Texto Completo
  // Informes_Evaluados = Informes_Buscados - Informes_No_Recuperados
  const expectedReportsAssessed =
    reportsSoughtForRetrieval - reportsNotRetrieved;

  const eq3ReportsAssessed: EquationCheckResult = {
    id: 'eq_eligibility_balance',
    name: '3. Balance de Recuperación a Elegibilidad',
    formulaLatex:
      '\\text{Informes\\_Evaluados} = \\text{Informes\\_Buscados} - \\text{Informes\\_No\\_Recuperados}',
    formulaPlain:
      'Informes_Evaluados = Informes_Buscados - Informes_No_Recuperados',
    expected: expectedReportsAssessed,
    actual: reportsAssessedForEligibility,
    delta: reportsAssessedForEligibility - expectedReportsAssessed,
    isValid:
      reportsAssessedForEligibility === expectedReportsAssessed &&
      expectedReportsAssessed >= 0,
    errorMessage:
      reportsAssessedForEligibility !== expectedReportsAssessed
        ? `Desbalance en Elegibilidad: Se esperaban ${expectedReportsAssessed} informes evaluados a texto completo (${reportsSoughtForRetrieval} buscados - ${reportsNotRetrieved} no recuperados), pero se ingresaron ${reportsAssessedForEligibility} (Δ = ${reportsAssessedForEligibility - expectedReportsAssessed}).`
        : expectedReportsAssessed < 0
        ? 'Los informes no recuperados superan a los informes buscados.'
        : undefined,
    affectedNodeIds: [
      'node_reports_sought',
      'node_reports_not_retrieved',
      'node_reports_assessed',
    ],
  };

  // 4. Balance de Exclusión Detallada y Conteo de Informes Incluidos
  // Total_Informes_Excluidos = sum(Conteo_Excluidos_Razon_i)
  const sumExcludedReasons = reportsExcludedDetailed.reduce(
    (acc, item) => acc + (Number(item.count) || 0),
    0
  );
  const expectedReportsIncluded =
    reportsAssessedForEligibility - sumExcludedReasons;

  const eq4ReportsIncluded: EquationCheckResult = {
    id: 'eq_inclusion_balance',
    name: '4. Balance de Exclusión a Informes Incluidos',
    formulaLatex:
      '\\text{Informes\\_Incluidos} = \\text{Informes\\_Evaluados} - \\sum_{i=1}^{k} \\text{Excluidos\\_Razón}_i',
    formulaPlain:
      'Informes_Incluidos = Informes_Evaluados - Σ(Conteo_Excluidos_Razón_i)',
    expected: expectedReportsIncluded,
    actual: reportsIncludedReview,
    delta: reportsIncludedReview - expectedReportsIncluded,
    isValid:
      reportsIncludedReview === expectedReportsIncluded &&
      expectedReportsIncluded >= 0,
    errorMessage:
      reportsIncludedReview !== expectedReportsIncluded
        ? `Desbalance en Inclusión Final: Se esperaban ${expectedReportsIncluded} informes incluidos (${reportsAssessedForEligibility} evaluados - ${sumExcludedReasons} excluidos por razones específicas), pero se declararon ${reportsIncludedReview} (Δ = ${reportsIncludedReview - expectedReportsIncluded}).`
        : expectedReportsIncluded < 0
        ? 'La suma de informes excluidos supera a los informes evaluados para elegibilidad.'
        : undefined,
    affectedNodeIds: [
      'node_reports_assessed',
      'node_reports_excluded_reasons',
      'node_included_studies',
    ],
  };

  // Validación de motivos de exclusión detallados (Ivaldi et al., 2024; Banno et al., 2025)
  const exclusionMessages: string[] = [];
  if (
    reportsAssessedForEligibility > reportsIncludedReview &&
    reportsExcludedDetailed.length === 0
  ) {
    exclusionMessages.push(
      'Debes desglosar al menos una categoría de razón de exclusión a texto completo (Ítem 16b).'
    );
  }
  reportsExcludedDetailed.forEach((reason, idx) => {
    if (!reason.reasonCategory || reason.reasonCategory.trim().length < 3) {
      exclusionMessages.push(
        `La razón de exclusión #${idx + 1} carece de descripción metodológica explícita.`
      );
    }
    if (reason.count < 0) {
      exclusionMessages.push(
        `La razón "${reason.reasonCategory || `#${idx + 1}`}" tiene un conteo negativo inválido.`
      );
    }
  });

  // 5. Restricción de Ontología (Informes frente a Estudios): Estudios_Incluidos <= Informes_Incluidos
  const ontologyMessages: string[] = [];
  if (studiesIncludedReview > reportsIncludedReview) {
    ontologyMessages.push(
      `Violación Ontológica Crítica (Estudios > Informes): Declaraste ${studiesIncludedReview} estudios incluidos pero solo ${reportsIncludedReview} informes. Todo estudio empírico requiere al menos un informe documental accesible que lo describa (Estudios_Incluidos ≤ Informes_Incluidos).`
    );
  }
  if (studiesIncludedReview <= 0 && reportsIncludedReview > 0) {
    ontologyMessages.push(
      'Si existen informes incluidos en la revisión (> 0), debe registrarse al menos 1 estudio subyacente.'
    );
  }
  if (studiesIncludedSynthesisQuantitative > studiesIncludedReview) {
    ontologyMessages.push(
      `Inconsistencia en Metaanálisis: Los estudios en síntesis cuantitativa (${studiesIncludedSynthesisQuantitative}) no pueden superar el total de estudios incluidos en la revisión (${studiesIncludedReview}).`
    );
  }

  const equations = [
    eq1Screened,
    eq2ReportsSought,
    eq3ReportsAssessed,
    eq4ReportsIncluded,
  ];

  const isBalanced = equations.every((eq) => eq.isValid);
  const isOntologyValid = ontologyMessages.length === 0;
  const areExclusionReasonsValid = exclusionMessages.length === 0;

  return {
    isBalanced,
    isOntologyValid,
    areExclusionReasonsValid,
    canExport: isBalanced && isOntologyValid && areExclusionReasonsValid,
    totalIdentifiedDatabasesAndRegisters,
    expectedRecordsScreened,
    expectedReportsSought,
    expectedReportsAssessed,
    sumExcludedReasons,
    expectedReportsIncluded,
    equations,
    ontologyCheck: {
      studiesIncluded: studiesIncludedReview,
      reportsIncluded: reportsIncludedReview,
      quantitativeStudies: studiesIncludedSynthesisQuantitative,
      isValid: isOntologyValid,
      messages: ontologyMessages,
    },
    exclusionDetailsCheck: {
      isValid: areExclusionReasonsValid,
      messages: exclusionMessages,
    },
  };
}

/**
 * Reconcilia automáticamente los nodos derivados a partir de los conteos primarios de entrada,
 * garantizando cumplimiento algebraico inmediato cuando el usuario solicita auto-reconciliación.
 */
export function autoReconcileFlowCounts(
  current: PrismaSessionState['flowCounts']
): PrismaSessionState['flowCounts'] {
  const totalIdentified =
    current.recordsIdentifiedDatabases + current.recordsIdentifiedRegisters;
  const recordsScreenedTitleAbstract = Math.max(
    0,
    totalIdentified -
      (current.recordsDuplicatesRemoved +
        current.recordsMarkedIneligibleAutomation)
  );
  const reportsSoughtForRetrieval = Math.max(
    0,
    recordsScreenedTitleAbstract - current.recordsExcludedTitleAbstract
  );
  const reportsAssessedForEligibility = Math.max(
    0,
    reportsSoughtForRetrieval - current.reportsNotRetrieved
  );
  const sumExcluded = current.reportsExcludedDetailed.reduce(
    (acc, r) => acc + (Number(r.count) || 0),
    0
  );
  const reportsIncludedReview = Math.max(
    0,
    reportsAssessedForEligibility - sumExcluded
  );
  const studiesIncludedReview = Math.min(
    current.studiesIncludedReview > 0
      ? current.studiesIncludedReview
      : reportsIncludedReview,
    reportsIncludedReview
  );
  const studiesIncludedSynthesisQuantitative =
    current.studiesIncludedSynthesisQuantitative !== undefined
      ? Math.min(
          current.studiesIncludedSynthesisQuantitative,
          studiesIncludedReview
        )
      : undefined;

  return {
    ...current,
    recordsScreenedTitleAbstract,
    reportsSoughtForRetrieval,
    reportsAssessedForEligibility,
    reportsIncludedReview,
    studiesIncludedReview,
    studiesIncludedSynthesisQuantitative,
  };
}
