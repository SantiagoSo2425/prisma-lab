import { PrismaSessionState, SwimProtocolEntry, GradeOutcomeRow } from '../types/prisma';

/**
 * Casos de Estudio Precargados para PRISMA-Lab:
 * 1. Ingeniería de Software (SEGRESS / PRISMA 2020): Predicción de Defectos de Software con Modelos Fundacionales.
 * 2. Ciencias de la Salud / Clínica: Telemedicina con Monitoreo Remoto en Insuficiencia Cardíaca Crónica.
 * 3. Caso con Errores Algebraicos y Ontológicos (Modo Entrenamiento de Auditoría).
 */

export const PRESET_SOFTWARE_ENGINEERING: PrismaSessionState = {
  id: 'preset-segress-2026',
  timestamp: '2026-11-10T12:00:00Z',
  protocol: {
    title:
      'Modelos de Lenguaje y Aprendizaje Profundo para Predicción de Defectos de Software Just-in-Time: Revisión Sistemática bajo PRISMA 2020 y SEGRESS',
    reviewType: 'new',
    pico: {
      population: 'Repositorios de código fuente industrial y open-source a nivel de commit (Java, Python, C++)',
      intervention: 'Arquitecturas de Aprendizaje Profundo y Transformers de Código (CodeBERT, GraphCodeBERT, LLMs)',
      comparator: 'Modelos clásicos de Machine Learning basados en métricas estáticas de código (Random Forest, Regresión Logística)',
      outcome: 'Desempeño predictivo medido en F1-Score, AUC-ROC, Matthews Correlation Coefficient (MCC) y esfuerzo de inspección (Effort@20%Recall)',
    },
    registration: {
      registered: true,
      platform: 'OSF',
      identifier: 'https://osf.io/9x7pr',
      amendments: true,
    },
  },
  searchAndScreening: {
    databases: [
      {
        name: 'Scopus',
        queryExecuted:
          'TITLE-ABS-KEY(("defect prediction" OR "just-in-time defect" OR "bug prediction") AND ("deep learning" OR "transformer" OR "large language model" OR "CodeBERT")) AND PUBYEAR > 2019',
        recordsFound: 640,
        dateSearched: '2026-10-15',
      },
      {
        name: 'IEEE Xplore',
        queryExecuted:
          '("All Metadata":"defect prediction" OR "All Metadata":"bug prediction") AND ("All Metadata":"deep learning" OR "All Metadata":"CodeBERT" OR "All Metadata":"LLM")',
        recordsFound: 420,
        dateSearched: '2026-10-15',
      },
      {
        name: 'ACM Digital Library',
        queryExecuted:
          '("just-in-time" OR "software defect") AND ("transformer" OR "neural network" OR "representation learning") [Title/Abstract]',
        recordsFound: 310,
        dateSearched: '2026-10-16',
      },
    ],
    registers: [
      {
        name: 'arXiv CS.SE / Zenodo Registered Reports',
        recordsFound: 80,
      },
    ],
    otherSources: [
      {
        sourceName: 'Búsqueda hacia atrás y adelante por bolas de nieve (Snowballing de Wohlin)',
        recordsFound: 24,
      },
    ],
    duplicatesRemoved: 390,
    automationToolsUsed: true,
    automationDetails: {
      toolName: 'ASReview',
      modelType: 'Aprendizaje Activo con TF-IDF + Clasificador Naive Bayes / Embeddings SBERT',
      humanRole:
        'Dos revisores humanos entrenaron el modelo inicial con 20 estudios semilla; se aplicó regla de parada tras 100 registros irrelevantes consecutivos y verificación manual dual de los excluidos por umbral.',
    },
  },
  flowCounts: {
    recordsIdentifiedDatabases: 1370, // 640 + 420 + 310
    recordsIdentifiedRegisters: 80,   // Total = 1450
    recordsIdentifiedOtherSources: 24,
    recordsDuplicatesRemoved: 390,
    recordsMarkedIneligibleAutomation: 110, // 1450 - (390 + 110) = 950 cribados
    recordsScreenedTitleAbstract: 950,
    recordsExcludedTitleAbstract: 810,      // 950 - 810 = 140 informes buscados
    reportsSoughtForRetrieval: 140,
    reportsNotRetrieved: 6,                 // 140 - 6 = 134 informes evaluados
    reportsAssessedForEligibility: 134,
    reportsExcludedDetailed: [
      { reasonCategory: 'Predicción a nivel de archivo/módulo y no Just-in-Time (commit)', count: 48 },
      { reasonCategory: 'Sin validación cruzada temporal (fuga de datos / data leakage)', count: 32 },
      { reasonCategory: 'Ausencia de comparador baseline reproducible', count: 19 },
      { reasonCategory: 'Informe extendido duplicado del mismo experimento base', count: 7 },
    ], // Suma excluidos = 106 -> 134 - 106 = 28 informes incluidos
    studiesIncludedReview: 24,
    reportsIncludedReview: 28,
    studiesIncludedSynthesisQuantitative: 19,
  },
  synthesisAndQuality: {
    riskOfBiasTools: ['ROBINS-I', 'QUADAS-2'],
    synthesisType: 'quantitative_meta_analysis',
    gradeCertaintyApplied: true,
    amstar2SelfAuditCompleted: true,
  },
  openScience: {
    dataRepositoryUrl: 'https://zenodo.org/records/prisma-lab-segress-dataset',
    codeRepositoryUrl: 'https://github.com/prisma-lab-ova/jit-defect-replication-package',
    screeningFormsAvailable: true,
  },
};

export const PRESET_HEALTH_SCIENCES: PrismaSessionState = {
  id: 'preset-clinical-2026',
  timestamp: '2026-11-10T12:00:00Z',
  protocol: {
    title:
      'Telemonitoreo Hemodinámico No Invasivo frente al Cuidado Estándar en Pacientes con Insuficiencia Cardíaca Crónica: Revisión Sistemática y Metaanálisis PRISMA 2020',
    reviewType: 'new',
    pico: {
      population: 'Adultos (≥ 18 años) con diagnóstico confirmado de insuficiencia cardíaca crónica (NYHA II-IV)',
      intervention: 'Telemonitoreo multiparamétrico domiciliario con alertas tempranas al equipo clínico',
      comparator: 'Seguimiento ambulatorio presencial estándar sin telemetría continua',
      outcome: 'Mortalidad por todas las causas y reingreso hospitalario por insuficiencia cardíaca a los 12 meses',
    },
    registration: {
      registered: true,
      platform: 'PROSPERO',
      identifier: 'CRD42026589120',
      amendments: false,
    },
  },
  searchAndScreening: {
    databases: [
      {
        name: 'MEDLINE (vía PubMed)',
        queryExecuted:
          '("Heart Failure"[Mesh] OR "heart failure"[tiab] OR "cardiac failure"[tiab]) AND ("Telemedicine"[Mesh] OR "telemonitoring"[tiab] OR "remote patient monitoring"[tiab]) AND ("Randomized Controlled Trial"[Publication Type] OR "randomized"[tiab])',
        recordsFound: 520,
        dateSearched: '2026-09-20',
      },
      {
        name: 'Embase',
        queryExecuted:
          "('heart failure'/exp OR 'heart failure':ti,ab) AND ('telemonitoring'/exp OR 'remote monitoring':ti,ab) AND ('randomized controlled trial'/exp)",
        recordsFound: 680,
        dateSearched: '2026-09-20',
      },
      {
        name: 'Cochrane CENTRAL',
        queryExecuted:
          '([mh "Heart Failure"] OR "heart failure":ti,ab,kw) AND ([mh "Telemedicine"] OR telemonitoring:ti,ab,kw)',
        recordsFound: 340,
        dateSearched: '2026-09-21',
      },
    ],
    registers: [
      {
        name: 'ClinicalTrials.gov & WHO ICTRP',
        recordsFound: 110,
      },
    ],
    otherSources: [
      {
        sourceName: 'Referencias de guías ESC/AHA y contacto con investigadores principales',
        recordsFound: 15,
      },
    ],
    duplicatesRemoved: 450,
    automationToolsUsed: true,
    automationDetails: {
      toolName: 'Rayyan',
      modelType: 'Clasificador SVM de similitud léxica y detección difusa de duplicados',
      humanRole:
        'Deduplicación asistida revisada por un documentalista médico y cribado ciego independiente por dos cardiólogos investigadores.',
    },
  },
  flowCounts: {
    recordsIdentifiedDatabases: 1540, // 520 + 680 + 340
    recordsIdentifiedRegisters: 110,  // Total = 1650
    recordsIdentifiedOtherSources: 15,
    recordsDuplicatesRemoved: 450,
    recordsMarkedIneligibleAutomation: 0, // 1650 - 450 = 1200
    recordsScreenedTitleAbstract: 1200,
    recordsExcludedTitleAbstract: 1090,   // 1200 - 1090 = 110
    reportsSoughtForRetrieval: 110,
    reportsNotRetrieved: 4,               // 110 - 4 = 106
    reportsAssessedForEligibility: 106,
    reportsExcludedDetailed: [
      { reasonCategory: 'Dispositivo implantable invasivo (no elegible por protocolo)', count: 34 },
      { reasonCategory: 'Seguimiento inferior a 6 meses', count: 25 },
      { reasonCategory: 'Diseño observacional no aleatorizado', count: 16 },
      { reasonCategory: 'Protocolo en curso sin resultados preliminares', count: 9 },
    ], // Suma excluidos = 84 -> 106 - 84 = 22 informes incluidos
    studiesIncludedReview: 16,
    reportsIncludedReview: 22,
    studiesIncludedSynthesisQuantitative: 16,
  },
  synthesisAndQuality: {
    riskOfBiasTools: ['RoB 2'],
    synthesisType: 'quantitative_meta_analysis',
    gradeCertaintyApplied: true,
    amstar2SelfAuditCompleted: true,
  },
  openScience: {
    dataRepositoryUrl: 'https://osf.io/hf-telemonitoring-data/',
    codeRepositoryUrl: 'https://osf.io/hf-telemonitoring-r-scripts/',
    screeningFormsAvailable: true,
  },
};

export const PRESET_BROKEN_AUDIT_CHALLENGE: PrismaSessionState = {
  ...PRESET_SOFTWARE_ENGINEERING,
  id: 'preset-broken-challenge',
  protocol: {
    ...PRESET_SOFTWARE_ENGINEERING.protocol,
    title: '[MODO RETO AUDITORÍA] Revisión con Fugas Algebraicas y Violación Ontológica (Corrige el Flujo)',
  },
  flowCounts: {
    recordsIdentifiedDatabases: 1000,
    recordsIdentifiedRegisters: 100, // Total = 1100
    recordsIdentifiedOtherSources: 10,
    recordsDuplicatesRemoved: 200,
    recordsMarkedIneligibleAutomation: 50,
    recordsScreenedTitleAbstract: 900, // ERROR: Debería ser 850 (1100 - 250)
    recordsExcludedTitleAbstract: 700,
    reportsSoughtForRetrieval: 180,    // ERROR: 900 - 700 = 200
    reportsNotRetrieved: 10,
    reportsAssessedForEligibility: 170,
    reportsExcludedDetailed: [
      { reasonCategory: 'Población fuera de alcance', count: 80 },
      { reasonCategory: 'Sin datos empíricos', count: 50 },
    ], // Suma = 130 -> 170 - 130 = 40 informes esperados
    studiesIncludedReview: 45,         // ERROR ONTOLÓGICO: 45 estudios > 35 informes
    reportsIncludedReview: 35,         // ERROR BALANCE: Debería ser 40
    studiesIncludedSynthesisQuantitative: 50,
  },
};

export const INITIAL_SWIM_ITEMS: SwimProtocolEntry[] = [
  {
    itemNumber: 1,
    title: '1. Agrupación de estudios para la síntesis',
    description: 'Describa los criterios (PICO, diseño, contexto) usados para agrupar los estudios en cada comparación.',
    userResponse:
      'Los estudios se agruparon en tres clústeres según la arquitectura del modelo (Transformers preentrenados vs. Redes Neuronales de Grafos vs. CNN/LSTM) y el horizonte de validación temporal.',
  },
  {
    itemNumber: 2,
    title: '2. Métrica estandarizada utilizada',
    description: 'Especifique la métrica común o dirección del efecto utilizada para comparar los estudios.',
    userResponse:
      'Se utilizó el cambio porcentual relativo en F1-Score y MCC respecto al clasificador baseline de regresión logística entrenado sobre las mismas particiones.',
  },
  {
    itemNumber: 3,
    title: '3. Método formal de síntesis sin metaanálisis',
    description: 'Especifique el método estadístico o estructurado (ej. resumen de estadísticos medianos/RIC, combinación de valores p, conteo de votos por dirección del efecto).',
    userResponse:
      'Síntesis mediante mediana y rango intercuartílico (RIC) de las diferencias de desempeño, complementada con conteo de votos basado en la dirección del efecto (prueba binomial exacta de dos colas).',
  },
  {
    itemNumber: 4,
    title: '4. Criterios para priorizar resultados',
    description: 'Indique cómo se priorizaron determinados estudios en las conclusiones (ej. bajo riesgo de sesgo, mayor tamaño muestral).',
    userResponse:
      'Se dio prioridad interpretativa a los estudios con validación inter-proyecto libre de fuga temporal y riesgo de sesgo bajo/moderado en ROBINS-I.',
  },
  {
    itemNumber: 5,
    title: '5. Investigación de la heterogeneidad en los hallazgos',
    description: 'Describa los métodos no paramétricos o estratificados para explorar variabilidad entre estudios.',
    userResponse:
      'Estratificación visual y tabulada según el lenguaje de programación del repositorio, tasa de desbalance de clases (< 10% vs ≥ 10% commits defectuosos) y tamaño del conjunto de entrenamiento.',
  },
  {
    itemNumber: 6,
    title: '6. Evaluación de la certeza de la evidencia',
    description: 'Especifique cómo se aplicó GRADE adaptado para síntesis narrativas/SWiM (Murad et al., 2017).',
    userResponse:
      'Se aplicaron las directrices GRADE para síntesis sin estimador único agrupado evaluando riesgo de sesgo, inconsistencia en la dirección del efecto, evidencia indirecta, imprecisión del tamaño muestral total y sesgo de publicación.',
  },
  {
    itemNumber: 7,
    title: '7. Métodos de presentación de datos (Tablas y Gráficos)',
    description: 'Indique qué visualizaciones estructuradas acompañan al texto (ej. Harvest plot, Effect direction plot, Albatross plot).',
    userResponse:
      'Gráfico de dirección del efecto (Effect Direction Plot) con triángulos codificados por tamaño muestral y color según el riesgo de sesgo ROBINS-I.',
  },
  {
    itemNumber: 8,
    title: '8. Reporte de resultados por síntesis',
    description: 'Para cada desenlace, reporte el número de estudios/participantes y la síntesis de hallazgos vinculada a la certeza GRADE.',
    userResponse:
      'En 18 de 24 estudios (75%, p = 0.023 binomial), los modelos basados en Transformers superaron al baseline estático con una ganancia mediana de +6.4 puntos en F1-Score (RIC: +3.1 a +9.8; certeza GRADE Moderada).',
  },
  {
    itemNumber: 9,
    title: '9. Limitaciones de la síntesis realizada',
    description: 'Discuta las razones por las que no fue posible el metaanálisis y las limitaciones del método SWiM elegido.',
    userResponse:
      'La ausencia de desviaciones estándar y matrices de covarianza en 9 estudios impidió ponderar por varianza inversa, por lo que el método de medianas no pondera por precisión intrínseca de cada estudio.',
  },
];

export const INITIAL_GRADE_ROWS: GradeOutcomeRow[] = [
  {
    id: 'grade-1',
    outcomeName: 'Desempeño predictivo F1-Score en validación temporal estricta',
    numberOfStudies: 19,
    studyDesign: 'Observational',
    riskOfBias: 0,
    inconsistency: -1,
    indirectness: 0,
    imprecision: 0,
    publicationBias: 0,
    effectSummary: 'SMD +0.54 (IC 95%: +0.38 a +0.70) a favor de Transformers de Código',
  },
  {
    id: 'grade-2',
    outcomeName: 'Esfuerzo de inspección ahorrado (Effort@20%Recall)',
    numberOfStudies: 14,
    studyDesign: 'RCT',
    riskOfBias: -1,
    inconsistency: 0,
    indirectness: 0,
    imprecision: 0,
    publicationBias: 0,
    effectSummary: 'Reducción media de -18.4% en líneas de código inspeccionadas (IC 95%: -24.1% a -12.7%)',
  },
];
