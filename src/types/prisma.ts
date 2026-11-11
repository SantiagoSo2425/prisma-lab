/**
 * Ontología de Datos y Modelo de Entidades de PRISMA-Lab
 * Implementa formalmente la especificación técnica de PRISMA 2020 (Page et al., 2021),
 * SEGRESS (Kitchenham et al., 2023), SWiM (Campbell et al., 2020), GRADE y estándares LOM-CO / SCORM 1.2.
 */

export interface PrismaSessionState {
  id: string;
  timestamp: string;
  protocol: {
    title: string;
    reviewType: 'new' | 'update';
    pico: { population: string; intervention: string; comparator: string; outcome: string };
    registration: { registered: boolean; platform?: 'PROSPERO' | 'OSF' | 'Other'; identifier?: string; amendments: boolean };
  };
  searchAndScreening: {
    databases: Array<{ name: string; queryExecuted: string; recordsFound: number; dateSearched: string }>;
    registers: Array<{ name: string; recordsFound: number }>;
    otherSources: Array<{ sourceName: string; recordsFound: number }>;
    duplicatesRemoved: number;
    automationToolsUsed: boolean;
    automationDetails?: { toolName: 'Rayyan' | 'ASReview' | 'Other'; modelType: string; humanRole: string };
  };
  flowCounts: {
    recordsIdentifiedDatabases: number;
    recordsIdentifiedRegisters: number;
    recordsIdentifiedOtherSources: number;
    recordsDuplicatesRemoved: number;
    recordsMarkedIneligibleAutomation: number;
    recordsScreenedTitleAbstract: number;
    recordsExcludedTitleAbstract: number;
    reportsSoughtForRetrieval: number;
    reportsNotRetrieved: number;
    reportsAssessedForEligibility: number;
    reportsExcludedDetailed: Array<{ reasonCategory: string; count: number }>;
    studiesIncludedReview: number;
    reportsIncludedReview: number;
    studiesIncludedSynthesisQuantitative?: number;
  };
  synthesisAndQuality: {
    riskOfBiasTools: Array<'RoB 2' | 'ROBINS-I' | 'QUADAS-2' | 'Other'>;
    synthesisType: 'quantitative_meta_analysis' | 'SWiM_narrative' | 'qualitative_only';
    gradeCertaintyApplied: boolean;
    amstar2SelfAuditCompleted: boolean;
  };
  openScience: {
    dataRepositoryUrl?: string;
    codeRepositoryUrl?: string;
    screeningFormsAvailable: boolean;
  };
}

/**
 * Ecuaciones canónicas y resultado del motor algebraico de conciliación PRISMA 2020
 */
export interface EquationCheckResult {
  id: string;
  name: string;
  formulaLatex: string;
  formulaPlain: string;
  expected: number;
  actual: number;
  delta: number;
  isValid: boolean;
  errorMessage?: string;
  affectedNodeIds: string[];
}

export interface FlowValidationReport {
  isBalanced: boolean;
  isOntologyValid: boolean;
  areExclusionReasonsValid: boolean;
  canExport: boolean;
  totalIdentifiedDatabasesAndRegisters: number;
  expectedRecordsScreened: number;
  expectedReportsSought: number;
  expectedReportsAssessed: number;
  sumExcludedReasons: number;
  expectedReportsIncluded: number;
  equations: EquationCheckResult[];
  ontologyCheck: {
    studiesIncluded: number;
    reportsIncluded: number;
    quantitativeStudies: number;
    isValid: boolean;
    messages: string[];
  };
  exclusionDetailsCheck: {
    isValid: boolean;
    messages: string[];
  };
}

/**
 * Sub-ítems de la lista de chequeo operativa de 42 filas de PRISMA 2020
 */
export type ChecklistItemStatus = 'pending' | 'completed' | 'not_applicable';

export interface ChecklistItemDefinition {
  subItemId: string;        // ej. '1', '2', '13a', '13b', ..., '27'
  canonicalItemNumber: number;
  section: 'Título' | 'Resumen' | 'Introducción' | 'Métodos' | 'Resultados' | 'Discusión' | 'Otra información';
  topic: string;
  description: string;
  isItem13Breakdown?: boolean;
  hintExample: string;
}

export interface ChecklistItemUserEntry {
  subItemId: string;
  status: ChecklistItemStatus;
  pageOrSection: string;
  manuscriptExcerpt: string;
  naJustification: string;
}

/**
 * Protocolo SWiM (Synthesis Without Meta-analysis) - 9 ítems (Campbell et al., 2020)
 */
export interface SwimProtocolEntry {
  itemNumber: number;
  title: string;
  description: string;
  userResponse: string;
}

/**
 * Fila de evidencia GRADE Summary of Findings (SoF)
 */
export type GradeDowngradeLevel = 0 | -1 | -2;
export type GradeCertaintyLevel = 'Alta' | 'Moderada' | 'Baja' | 'Muy Baja';

export interface GradeOutcomeRow {
  id: string;
  outcomeName: string;
  numberOfStudies: number;
  studyDesign: 'RCT' | 'Observational';
  riskOfBias: GradeDowngradeLevel;
  inconsistency: GradeDowngradeLevel;
  indirectness: GradeDowngradeLevel;
  imprecision: GradeDowngradeLevel;
  publicationBias: 0 | -1;
  effectSummary: string;
}

/**
 * Evaluación Diagnóstica (Pre-Test) y Sumativa (Post-Test) basada en Krnic Martinic et al. (2022)
 */
export interface AssessmentQuestion {
  id: string;
  homologousPairId: number; // 1 a 10
  phase: 'pre' | 'post';
  category: 'Ontología' | 'Conciliación Matemática' | 'Deslinde Epistemológico' | 'PRISMA-S e IA' | 'SWiM y GRADE' | 'Auditoría Ítem 13 y Ciencia Abierta';
  stem: string;
  options: string[];
  correctIndex: number;
  rationale: string;
}

/**
 * Navegación principal de PRISMA-Lab
 */
export type ActiveTabId =
  | 'pretest'
  | 'module1'
  | 'module2'
  | 'module3'
  | 'module4'
  | 'posttest_lori';
