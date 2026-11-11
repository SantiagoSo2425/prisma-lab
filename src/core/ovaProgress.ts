import { usePrismaStore } from '../store/usePrismaStore';
import { validatePrismaFlow } from './flowValidator';
import { validateBooleanQuery } from './booleanParser';
import { SIMULATED_MANUSCRIPT_CASE } from '../data/epistemologicalCases';
import { PRISMA_42_CHECKLIST } from '../data/checklist42';
import { PRE_POST_QUESTIONS } from '../data/prePostQuestions';
import { ActiveTabId } from '../types/prisma';
import { computeLoriAvg, computeSusScore, computeTestPct } from './scoring';
import ovaConfig from '../data/ova.config.json';

export interface OvaProgressSummary {
  stepCompleted: Record<ActiveTabId, boolean>;
  completedStepsCount: number;
  overallPct: number;
  prePct: number;
  postPct: number;
  hakeGain: number;
  amstarCorrectCount: number;
  validSubItemsCount: number;
  /** null mientras no se respondan los 10 ítems. */
  susScore: number | null;
  /** null mientras no se califique ningún criterio. */
  loriAvg: number | null;
}

export function useOvaProgress(): OvaProgressSummary {
  const {
    session,
    amstarAuditAnswers,
    swimItems,
    gradeRows,
    checklistEntries,
    preTestAnswers,
    preTestSubmitted,
    postTestAnswers,
    postTestSubmitted,
    loriScores,
    susResponses,
  } = usePrismaStore();

  const preQs = PRE_POST_QUESTIONS.filter((q) => q.phase === 'pre');
  const postQs = PRE_POST_QUESTIONS.filter((q) => q.phase === 'post');

  const preAnsweredCount = preQs.filter((q) => preTestAnswers[q.id] !== undefined).length;
  const postAnsweredCount = postQs.filter((q) => postTestAnswers[q.id] !== undefined).length;

  const prePct = computeTestPct(preTestAnswers, 'pre');
  const postPct = computeTestPct(postTestAnswers, 'post');
  const hakeGain = prePct < 100 ? (postPct - prePct) / (100 - prePct) : 1;

  // Módulo 1: PICO completo + al menos 5 de 7 dominios AMSTAR auditados
  const auditDomains = SIMULATED_MANUSCRIPT_CASE.auditDomains;
  const amstarAnswered = auditDomains.filter((d) => amstarAuditAnswers[d.id] !== undefined).length;
  const amstarCorrectCount = auditDomains.filter(
    (d) => amstarAuditAnswers[d.id] === (d.passesAmstar2MethodologicalRigor ? 'pass' : 'fail')
  ).length;
  const picoOk =
    session.protocol.pico.population.trim().length > 5 &&
    session.protocol.pico.intervention.trim().length > 5;
  const mod1Done = picoOk && amstarAnswered === auditDomains.length;

  // Módulo 2: Todas las bases con query booleana válida + flujo conciliado
  const flowReport = validatePrismaFlow(session.flowCounts);
  const allQueriesOk =
    session.searchAndScreening.databases.length > 0 &&
    session.searchAndScreening.databases.every((db) => validateBooleanQuery(db.queryExecuted).isValid);
  const mod2Done = flowReport.canExport && allQueriesOk;

  // Módulo 3: Herramienta RoB seleccionada + 9 ítems SWiM completos + >=1 fila GRADE
  const swimDoneCount = swimItems.filter((it) => it.userResponse.trim().length >= 20).length;
  const mod3Done =
    session.synthesisAndQuality.riskOfBiasTools.length > 0 &&
    swimDoneCount === 9 &&
    gradeRows.length > 0;

  // Módulo 4: 42 sub-ítems válidos
  const validSubItemsCount = PRISMA_42_CHECKLIST.filter((item) => {
    const entry = checklistEntries[item.subItemId];
    if (!entry || entry.status === 'pending') return false;
    if (entry.status === 'completed') {
      return entry.pageOrSection.trim().length > 0 && entry.manuscriptExcerpt.trim().length >= 10;
    }
    return entry.naJustification.trim().length >= 20;
  }).length;
  const mod4Done = validSubItemsCount === 42 && flowReport.canExport;

  const stepCompleted: Record<ActiveTabId, boolean> = {
    pretest: preTestSubmitted || preAnsweredCount === 10,
    module1: mod1Done,
    module2: mod2Done,
    module3: mod3Done,
    module4: mod4Done,
    posttest_lori: postTestSubmitted || postAnsweredCount === 10,
  };

  const completedStepsCount = Object.values(stepCompleted).filter(Boolean).length;
  const overallPct = Math.round((completedStepsCount / 6) * 100);

  const loriAvg = computeLoriAvg(loriScores);
  const susScore = computeSusScore(susResponses);

  return {
    stepCompleted,
    completedStepsCount,
    overallPct,
    prePct,
    postPct,
    hakeGain,
    amstarCorrectCount,
    validSubItemsCount,
    susScore,
    loriAvg,
  };
}

export function generateOvaCertificateHtml(params: {
  learnerName: string;
  projectTitle: string;
  progress: OvaProgressSummary;
}): string {
  const { learnerName, projectTitle, progress } = params;
  const cleanName = (learnerName || 'Investigador(a) PRISMA-Lab').replace(/</g, '&lt;');
  const cleanTitle = projectTitle.replace(/</g, '&lt;');
  const dateStr = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Certificado y Reporte Pedagógico OVA PRISMA-Lab - ${cleanName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
      background: #f5f5f7;
      color: #1d1d1f;
      margin: 0;
      padding: 40px 20px;
    }
    .sheet {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 32px;
      padding: 56px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
    }
    .eyebrow {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #0071e3;
    }
    h1 {
      font-size: 44px;
      letter-spacing: -0.03em;
      margin: 8px 0 4px 0;
    }
    .learner {
      font-size: 28px;
      font-weight: 600;
      color: #5e5ce6;
      margin: 18px 0 6px 0;
    }
    .subtitle {
      font-size: 15px;
      color: #6e6e73;
      line-height: 1.5;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin: 36px 0;
    }
    .metric {
      background: #f5f5f7;
      border-radius: 20px;
      padding: 20px;
      text-align: center;
    }
    .metric .num {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .metric .lbl {
      font-size: 12px;
      color: #6e6e73;
      margin-top: 4px;
    }
    .outcomes {
      background: #fafafa;
      border-radius: 20px;
      padding: 24px;
      font-size: 13.5px;
      line-height: 1.6;
    }
    .footer {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid #e5e5ea;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #86868b;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .sheet { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="eyebrow">Objeto Virtual de Aprendizaje · Estándar IEEE LOM-CO / SCORM 1.2</div>
    <h1>Certificado de Competencia PRISMA 2020</h1>
    <div class="learner">${cleanName}</div>
    <p class="subtitle">
      Ha completado satisfactoriamente las etapas de simulación matemática, deslinde epistemológico (PRISMA 2020 vs. AMSTAR 2), búsqueda booleana PRISMA-S, evaluación RoB/SWiM/GRADE y auditoría de 42 sub-ítems sobre el caso:<br/>
      <strong>“${cleanTitle}”</strong>
    </p>

    <div class="grid">
      <div class="metric">
        <div class="num">${progress.prePct}% → ${progress.postPct}%</div>
        <div class="lbl">Diagnóstico vs. Final</div>
      </div>
      <div class="metric">
        <div class="num">g = ${progress.hakeGain.toFixed(2)}</div>
        <div class="lbl">Ganancia normalizada Hake</div>
      </div>
      <div class="metric">
        <div class="num">${progress.validSubItemsCount}/42</div>
        <div class="lbl">Sub-ítems PRISMA auditados</div>
      </div>
      <div class="metric">
        <div class="num">${progress.postPct >= ovaConfig.masteryScore ? 'Aprobado' : 'No aprobado'}</div>
        <div class="lbl">Post-test (mínimo ${ovaConfig.masteryScore} %)</div>
      </div>
    </div>

    <div class="outcomes">
      <strong>Resultados de Aprendizaje Verificados (Taxonomía de Bloom / ADDIE):</strong>
      <ul>
        <li><strong>RA1 (Epistemología y Ontología):</strong> Diferenciación Registro/Informe/Estudio (Estudios ≤ Informes) y auditoría AMSTAR 2 (${progress.amstarCorrectCount}/7 dominios críticos).</li>
        <li><strong>RA2 (Búsqueda PRISMA-S y Conciliación Algebraica):</strong> Validación sintáctica booleana y balance exacto de las 4 ecuaciones canónicas del diagrama de flujo.</li>
        <li><strong>RA3 (Síntesis y Certeza):</strong> Aplicación de matrices RoB 2 / ROBINS-I / QUADAS-2, protocolo SWiM de 9 ítems y tabla Summary of Findings GRADE.</li>
        <li><strong>RA4 (Auditoría y Ciencia Abierta):</strong> Verificación operativa de los 42 sub-ítems (incluyendo 13a–13f) y disponibilidad de datos/código (Ítem 27).</li>
      </ul>
    </div>

    <div class="footer">
      <span>Emitido por ${ovaConfig.shortTitle} v${ovaConfig.version} · ${ovaConfig.institution.name} · Fecha: ${dateStr}</span>
      <span>Autoría: ${ovaConfig.authors.map((a) => a.name).join(', ')} · ${ovaConfig.license.spdx}</span>
    </div>
  </div>
</body>
</html>`;
}
