/**
 * Materiales para el Módulo 1: Deslinde Epistemológico (PRISMA 2020 vs AMSTAR 2 vs ROBIS)
 * Incluye la Matriz Comparativa y el Caso de Estudio de Auditoría donde un manuscrito
 * cumple 100% la transparencia de reporte PRISMA 2020 pero reprueba AMSTAR 2 (Calidad Críticamente Baja).
 */

export interface EpistemologicalDimension {
  aspect: string;
  prisma2020: string;
  amstar2: string;
  robis: string;
}

export const EPISTEMOLOGICAL_MATRIX: EpistemologicalDimension[] = [
  {
    aspect: 'Naturaleza y Propósito Primario',
    prisma2020:
      'Guía de Reporte (Reporting Guideline): Especifica QUÉ información mínima debe comunicarse con transparencia en el manuscrito para que el lector pueda evaluar lo que se hizo y lo que se encontró.',
    amstar2:
      'Instrumento de Evaluación Crítica de Calidad Metodológica: Evalúa CÓMO fue conducida la revisión sistemática (16 ítems, 7 dominios críticos) para calificar la confianza global en sus resultados.',
    robis:
      'Herramienta de Evaluación de Riesgo de Sesgo de la Revisión: Evalúa en 3 fases y 4 dominios si el diseño y ejecución de la revisión introdujeron sesgos sistemáticos en las conclusiones.',
  },
  {
    aspect: '¿Evalúa la calidad de ejecución metodológica?',
    prisma2020:
      'NO. Page et al. (2021) advierten explícitamente que PRISMA 2020 NO es un instrumento para medir la calidad metodológica de una revisión sistemática.',
    amstar2:
      'SÍ. Clasifica la confianza general en los resultados de la revisión como Alta, Moderada, Baja o Críticamente Baja según fallas en dominios críticos y no críticos.',
    robis:
      'SÍ (enfocado en sesgo). Evalúa sesgos en elegibilidad, identificación/selección, extracción/evaluación de estudios y síntesis de hallazgos.',
  },
  {
    aspect: 'Consecuencia de declarar una práctica deficiente (ej. no registrar protocolo o buscar en 1 sola base)',
    prisma2020:
      'CUMPLE el ítem de PRISMA si el autor declara honestamente: "Esta revisión no fue registrada y solo se buscó en PubMed". La transparencia es del 100%.',
    amstar2:
      'REPRUEBA los dominios críticos 2 (Protocolo previo) y 4 (Búsqueda exhaustiva en al menos 2 bases), degradando la calidad a "Críticamente Baja".',
    robis:
      'ALTO RIESGO DE SESGO en los Dominios 1 y 2 por alta probabilidad de omitir evidencia relevante y selección post-hoc.',
  },
  {
    aspect: 'Momento óptimo de uso en el ciclo ADDIE / Investigación',
    prisma2020:
      'Redacción del manuscrito final, preparación de tablas/diagramas de flujo y verificación editorial pre-envío.',
    amstar2:
      'Diseño del protocolo riguroso, arbitraje por pares (peer-review) y toma de decisiones clínicas o de ingeniería basada en evidencia.',
    robis:
      'Auditoría metodológica profunda en revisiones de revisiones (overviews / umbrella reviews) y guías de práctica.',
  },
];

export interface Amstar2CriticalDomainAuditItem {
  id: string;
  amstarItemNumber: number;
  domainTitle: string;
  manuscriptExcerpt: string;
   compliesWithPrismaReporting: boolean;
  prismaItemRef: string;
  passesAmstar2MethodologicalRigor: boolean;
  explanation: string;
}

export const SIMULATED_MANUSCRIPT_CASE = {
  title:
    'Eficacia de Asistentes de Codificación Basados en IA Generativa en Equipos Ágiles: Una Revisión Sistemática',
  authors: 'Gómez-Vargas et al. (Manuscrito Simulado para Arbitraje)',
  summaryContext:
    'Los autores entregan una lista de chequeo PRISMA 2020 con el 100% de las casillas marcadas y ubicadas por página. Sin embargo, como par evaluador debes auditar sus declaraciones frente a los 7 dominios críticos de AMSTAR 2 (Shea et al., 2017).',
  auditDomains: [
    {
      id: 'amstar_2',
      amstarItemNumber: 2,
      domainTitle: 'Dominio Crítico 2: Protocolo registrado antes de iniciar la revisión',
      manuscriptExcerpt:
        '"Página 4, Sección 2.1 (Ítem 24a-24b PRISMA): Declaramos explícitamente que esta revisión sistemática no contó con un protocolo escrito previo ni fue registrada en PROSPERO u OSF por limitaciones de tiempo del proyecto."',
      compliesWithPrismaReporting: true,
      prismaItemRef: 'Ítem 24a/24b (Declara con transparencia que no hubo registro)',
      passesAmstar2MethodologicalRigor: false,
      explanation:
        'Falla Crítica en AMSTAR 2 (Ítem 2): Aunque cumple con PRISMA 2020 al decir la verdad, carecer de un protocolo a priori impide verificar si los criterios PICO o el plan estadístico fueron modificados post-hoc.',
    },
    {
      id: 'amstar_4',
      amstarItemNumber: 4,
      domainTitle: 'Dominio Crítico 4: Estrategia de búsqueda exhaustiva de la literatura',
      manuscriptExcerpt:
        '"Página 5, Sección 2.3 (Ítems 6 y 7 PRISMA): Se ejecutó la búsqueda exclusivamente en la base de datos IEEE Xplore el 10 de mayo de 2026 con la cadena ("generative AI" AND "agile"). No se consultaron registros, literatura gris ni listas de referencias."',
      compliesWithPrismaReporting: true,
      prismaItemRef: 'Ítems 6 y 7 (Reporta fecha exacta y cadena ejecutada)',
      passesAmstar2MethodologicalRigor: false,
      explanation:
        'Falla Crítica en AMSTAR 2 (Ítem 4): AMSTAR 2 exige buscar en al menos 2 bases de datos relevantes, justificar restricciones, consultar listas de referencias y registros/literatura gris.',
    },
    {
      id: 'amstar_7',
      amstarItemNumber: 7,
      domainTitle: 'Dominio Crítico 7: Lista de estudios excluidos a texto completo y justificación',
      manuscriptExcerpt:
        '"Página 8, Sección 3.1 (Ítem 16a PRISMA): De los 42 informes leídos a texto completo, se excluyeron 28 por no cumplir los criterios. Por razones de espacio editorial, no se incluye la lista de citas de los 28 informes excluidos ni sus causas individuales."',
      compliesWithPrismaReporting: false,
      prismaItemRef: 'Incumple parcialmente Ítem 16b y falla Dominio Crítico 7 de AMSTAR 2',
      passesAmstar2MethodologicalRigor: false,
      explanation:
        'Falla Crítica en AMSTAR 2 (Ítem 7): Exige proporcionar una lista completa de los estudios excluidos en la lectura de texto completo y justificar la exclusión de cada uno.',
    },
    {
      id: 'amstar_9',
      amstarItemNumber: 9,
      domainTitle: 'Dominio Crítico 9: Técnica satisfactoria para evaluar el Riesgo de Sesgo (RoB)',
      manuscriptExcerpt:
        '"Página 6, Sección 2.6 (Ítem 11 PRISMA): Se evaluó el riesgo de sesgo de los 14 estudios incluidos utilizando los dominios formales de las herramientas RoB 2 y ROBINS-I por dos revisores independientes."',
      compliesWithPrismaReporting: true,
      prismaItemRef: 'Ítems 11 y 18 (Herramienta validada y proceso reportado)',
      passesAmstar2MethodologicalRigor: true,
      explanation:
        'Aprueba el Dominio Crítico 9 de AMSTAR 2: Utilizó herramientas validadas específicas según el diseño experimental evaluando confusión y sesgo de selección/medición.',
    },
    {
      id: 'amstar_11',
      amstarItemNumber: 11,
      domainTitle: 'Dominio Crítico 11: Métodos estadísticos apropiados para la combinación de resultados',
      manuscriptExcerpt:
        '"Página 7, Sección 2.7 (Ítem 13d PRISMA): Pese a que los estudios combinaban ensayos aleatorizados y estudios observacionales con métricas incompatibles (I² = 94%), se aplicó un metaanálisis de efectos fijos sin explorar causas de heterogeneidad."',
      compliesWithPrismaReporting: true,
      prismaItemRef: 'Ítem 13d (Describe el modelo estadístico empleado)',
      passesAmstar2MethodologicalRigor: false,
      explanation:
        'Falla Crítica en AMSTAR 2 (Ítem 11): Combinar diseños incompatibles bajo un modelo de efectos fijos con heterogeneidad extrema (I² = 94%) sin justificación ni investigación es metodológicamente inválido.',
    },
    {
      id: 'amstar_13',
      amstarItemNumber: 13,
      domainTitle: 'Dominio Crítico 13: Consideración del Riesgo de Sesgo al interpretar los resultados',
      manuscriptExcerpt:
        '"Página 12, Sección 4.1 (Ítem 23b PRISMA): Aunque 9 de los 14 estudios tuvieron alto riesgo de sesgo en ROBINS-I, nuestras conclusiones finales se basan en la estimación global sin realizar análisis de sensibilidad ni matizar las recomendaciones."',
      compliesWithPrismaReporting: true,
      prismaItemRef: 'Ítem 23 (Declara cómo interpretaron los resultados)',
      passesAmstar2MethodologicalRigor: false,
      explanation:
        'Falla Crítica en AMSTAR 2 (Ítem 13): Los autores no tuvieron en cuenta el impacto del alto riesgo de sesgo de los estudios primarios al formular las conclusiones de la revisión.',
    },
    {
      id: 'amstar_15',
      amstarItemNumber: 15,
      domainTitle: 'Dominio Crítico 15: Investigación adecuada del sesgo de publicación (pequeños estudios)',
      manuscriptExcerpt:
        '"Página 7, Sección 2.8 (Ítems 14 y 21 PRISMA): Se construyó el gráfico de embudo (funnel plot) y se aplicó la prueba de regresión de Egger (p = 0.28), discutiendo la posibilidad de resultados negativos no publicados."',
      compliesWithPrismaReporting: true,
      prismaItemRef: 'Ítems 14 y 21 (Métodos y resultados de sesgo de publicación)',
      passesAmstar2MethodologicalRigor: true,
      explanation:
        'Aprueba el Dominio Crítico 15 de AMSTAR 2: Evaluó gráfica y estadísticamente el sesgo de publicación y discutió su impacto.',
    },
  ] as Amstar2CriticalDomainAuditItem[],
};
