import { PrismaSessionState, FlowValidationReport } from '../types/prisma';

/**
 * Generador de Salida HTML Interactivo (Estilo paquete R PRISMA2020 de Haddaway et al., 2022)
 * Exporta un documento HTML5 autónomo con el diagrama de flujo PRISMA 2020 en SVG,
 * nodos con hipervínculos configurables de Ciencia Abierta (Ítem 27) y tooltips interactivos
 * al pasar el cursor que despliegan el detalle cuantitativo de exclusión y bases de datos.
 */
export function generateInteractivePrismaHtml(
  session: PrismaSessionState,
  validation: FlowValidationReport
): string {
  if (!validation.canExport) {
    throw new Error(
      'Exportación bloqueada por el motor algebraico: corrige todas las inconsistencias numéricas y ontológicas antes de exportar.'
    );
  }

  const { flowCounts, protocol, searchAndScreening, openScience } = session;
  const dataUrl = openScience.dataRepositoryUrl || '#ciencia-abierta';
  const codeUrl = openScience.codeRepositoryUrl || '#ciencia-abierta';

  const databasesTooltipHtml = searchAndScreening.databases
    .map(
      (db) =>
        `<li><strong>${escapeHtml(db.name)}:</strong> n = ${db.recordsFound} (${escapeHtml(db.dateSearched)})</li>`
    )
    .join('');

  const exclusionReasonsTooltipHtml = flowCounts.reportsExcludedDetailed
    .map(
      (r) =>
        `<li><span>${escapeHtml(r.reasonCategory)}</span> <strong>n = ${r.count}</strong></li>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Diagrama de Flujo Interactivo PRISMA 2020 - ${escapeHtml(protocol.title)}</title>
  <style>
    :root {
      --primary: #1e293b;
      --accent: #4f46e5;
      --bg: #f8fafc;
      --card: #ffffff;
      --border: #cbd5e1;
    }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--primary);
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 1080px;
      margin: 0 auto;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
    }
    header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      font-weight: 700;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid #86efac;
    }
    h1 { font-size: 20px; margin: 6px 0; color: #0f172a; }
    .meta { font-size: 13px; color: #475569; margin: 0; }
    .diagram-wrapper {
      position: relative;
      overflow-x: auto;
      padding: 12px 0;
    }
    svg {
      width: 100%;
      max-width: 960px;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    .interactive-node {
      cursor: pointer;
      transition: filter 0.15s ease;
    }
    .interactive-node:hover rect {
      stroke: #4f46e5;
      stroke-width: 2.5px;
      filter: drop-shadow(0 4px 8px rgba(79, 70, 229, 0.18));
    }
    .tooltip-panel {
      margin-top: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      font-size: 13px;
    }
    .info-card h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #1e293b;
    }
    .info-card ul {
      margin: 0;
      padding-left: 18px;
    }
    .info-card li {
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #e2e8f0;
      padding-bottom: 3px;
    }
    #floating-tooltip {
      position: fixed;
      pointer-events: none;
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
      max-width: 320px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      display: none;
      z-index: 1000;
      line-height: 1.45;
    }
    footer {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
    a { color: #4f46e5; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div id="floating-tooltip"></div>
  <div class="container">
    <header>
      <div>
        <span class="badge">✓ Flujo Algebraicamente Conciliado (PRISMA 2020 / Haddaway Interactive Format)</span>
        <h1>${escapeHtml(protocol.title)}</h1>
        <p class="meta">
          Registro: <strong>${protocol.registration.registered ? `${protocol.registration.platform} (${escapeHtml(protocol.registration.identifier || 'N/A')})` : 'No registrado'}</strong>
          | Generado por <strong>PRISMA-Lab OVA v1.0.0</strong> (${new Date().toISOString().slice(0, 10)})
        </p>
      </div>
      <div style="text-align:right; font-size:13px;">
        <div><a href="${escapeHtml(dataUrl)}" target="_blank" rel="noopener">📂 Repositorio de Datos Abiertos (Ítem 27)</a></div>
        <div style="margin-top:4px;"><a href="${escapeHtml(codeUrl)}" target="_blank" rel="noopener">💻 Scripts / Estrategias de Búsqueda</a></div>
      </div>
    </header>

    <div class="diagram-wrapper">
      <svg viewBox="0 0 920 760" role="img" aria-label="Diagrama de flujo interactivo PRISMA 2020">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
          </marker>
        </defs>

        <!-- Etiquetas laterales de Fase -->
        <g font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">
          <rect x="10" y="55" width="32" height="145" rx="6" fill="#dbeafe" stroke="#93c5fd" />
          <text x="26" y="127" text-anchor="middle" transform="rotate(-90 26 127)">IDENTIFICACIÓN</text>

          <rect x="10" y="220" width="32" height="315" rx="6" fill="#e0e7ff" stroke="#a5b4fc" />
          <text x="26" y="377" text-anchor="middle" transform="rotate(-90 26 377)">CRIBADO Y ELEGIBILIDAD</text>

          <rect x="10" y="555" width="32" height="150" rx="6" fill="#dcfce7" stroke="#86efac" />
          <text x="26" y="630" text-anchor="middle" transform="rotate(-90 26 630)">INCLUSIÓN</text>
        </g>

        <!-- Banner superior -->
        <rect x="60" y="12" width="840" height="32" rx="6" fill="#f59e0b" />
        <text x="480" y="33" text-anchor="middle" font-size="13" font-weight="700" fill="#ffffff">
          Identificación de estudios vía bases de datos y registros (PRISMA 2020)
        </text>

        <!-- Caja 1: Identificados -->
        <a href="${escapeHtml(codeUrl)}" target="_blank">
          <g class="interactive-node" data-tooltip="Desglose por base de datos: ${escapeHtml(searchAndScreening.databases.map((d) => `${d.name} (${d.recordsFound})`).join(', '))}. Otras fuentes: ${flowCounts.recordsIdentifiedOtherSources}.">
            <rect x="60" y="60" width="380" height="125" rx="8" fill="#ffffff" stroke="#64748b" stroke-width="1.8" />
            <text x="76" y="84" font-size="13" font-weight="700" fill="#0f172a">Registros identificados de:</text>
            <text x="86" y="108" font-size="12.5" fill="#334155">• Bases de datos (n = ${flowCounts.recordsIdentifiedDatabases})</text>
            <text x="86" y="128" font-size="12.5" fill="#334155">• Registros de ensayos (n = ${flowCounts.recordsIdentifiedRegisters})</text>
            <text x="86" y="148" font-size="12.5" font-weight="700" fill="#1e40af">Total bases + registros (n = ${validation.totalIdentifiedDatabasesAndRegisters})</text>
            <text x="86" y="168" font-size="11.5" fill="#64748b">• Otras fuentes complementarias (n = ${flowCounts.recordsIdentifiedOtherSources})</text>
          </g>
        </a>

        <!-- Caja 2: Removidos antes del cribado -->
        <g class="interactive-node" data-tooltip="Registros eliminados antes del tamizaje manual. Herramienta IA declarada: ${searchAndScreening.automationToolsUsed ? escapeHtml(searchAndScreening.automationDetails?.toolName || 'Sí') : 'Ninguna'}.">
          <rect x="500" y="60" width="400" height="125" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="1.8" />
          <text x="516" y="84" font-size="13" font-weight="700" fill="#0f172a">Registros eliminados antes del cribado:</text>
          <text x="526" y="110" font-size="12.5" fill="#334155">• Registros duplicados eliminados (n = ${flowCounts.recordsDuplicatesRemoved})</text>
          <text x="526" y="132" font-size="12.5" fill="#334155">• Marcados como ineligibles por IA (n = ${flowCounts.recordsMarkedIneligibleAutomation})</text>
          <text x="526" y="156" font-size="12" font-weight="600" fill="#475569">Total removidos pre-cribado (n = ${flowCounts.recordsDuplicatesRemoved + flowCounts.recordsMarkedIneligibleAutomation})</text>
        </g>

        <!-- Flechas Identificación -->
        <line x1="440" y1="122" x2="498" y2="122" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
        <line x1="250" y1="185" x2="250" y2="225" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />

        <!-- Caja 3: Registros Cribados -->
        <g class="interactive-node" data-tooltip="Balance verificado: ${validation.totalIdentifiedDatabasesAndRegisters} identificados - ${flowCounts.recordsDuplicatesRemoved + flowCounts.recordsMarkedIneligibleAutomation} removidos = ${flowCounts.recordsScreenedTitleAbstract} cribados.">
          <rect x="60" y="228" width="380" height="78" rx="8" fill="#ffffff" stroke="#64748b" stroke-width="1.8" />
          <text x="76" y="258" font-size="13" font-weight="700" fill="#0f172a">Registros cribados (Título y Resumen)</text>
          <text x="76" y="282" font-size="14" font-weight="700" fill="#4f46e5">(n = ${flowCounts.recordsScreenedTitleAbstract})</text>
        </g>

        <!-- Caja 4: Registros Excluidos -->
        <g class="interactive-node" data-tooltip="Registros descartados en la fase de tamizaje primario de título y resumen.">
          <rect x="500" y="228" width="400" height="78" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="1.8" />
          <text x="516" y="258" font-size="13" font-weight="700" fill="#0f172a">Registros excluidos en Título/Resumen</text>
          <text x="516" y="282" font-size="14" font-weight="700" fill="#dc2626">(n = ${flowCounts.recordsExcludedTitleAbstract})</text>
        </g>

        <line x1="440" y1="267" x2="498" y2="267" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
        <line x1="250" y1="306" x2="250" y2="338" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />

        <!-- Caja 5: Informes buscados para recuperación -->
        <g class="interactive-node" data-tooltip="Transición ontológica: De Registros (entradas bibliográficas) a Informes (documentos buscados a texto completo).">
          <rect x="60" y="340" width="380" height="78" rx="8" fill="#ffffff" stroke="#64748b" stroke-width="1.8" />
          <text x="76" y="370" font-size="13" font-weight="700" fill="#0f172a">Informes buscados para recuperación</text>
          <text x="76" y="394" font-size="14" font-weight="700" fill="#4f46e5">(n = ${flowCounts.reportsSoughtForRetrieval})</text>
        </g>

        <!-- Caja 6: Informes no recuperados -->
        <g class="interactive-node" data-tooltip="Informes cuyo texto completo no pudo obtenerse pese a contactar autores o bibliotecas.">
          <rect x="500" y="340" width="400" height="78" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="1.8" />
          <text x="516" y="370" font-size="13" font-weight="700" fill="#0f172a">Informes no recuperados</text>
          <text x="516" y="394" font-size="14" font-weight="700" fill="#d97706">(n = ${flowCounts.reportsNotRetrieved})</text>
        </g>

        <line x1="440" y1="379" x2="498" y2="379" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
        <line x1="250" y1="418" x2="250" y2="450" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />

        <!-- Caja 7: Informes evaluados para elegibilidad -->
        <g class="interactive-node" data-tooltip="Informes leídos a texto completo para verificar criterios de inclusión y exclusión.">
          <rect x="60" y="452" width="380" height="85" rx="8" fill="#ffffff" stroke="#64748b" stroke-width="1.8" />
          <text x="76" y="484" font-size="13" font-weight="700" fill="#0f172a">Informes evaluados para elegibilidad</text>
          <text x="76" y="510" font-size="14" font-weight="700" fill="#4f46e5">(n = ${flowCounts.reportsAssessedForEligibility})</text>
        </g>

        <!-- Caja 8: Informes excluidos con razones detalladas -->
        <g class="interactive-node" data-tooltip="Motivos de exclusión (Ítem 16b): ${escapeHtml(flowCounts.reportsExcludedDetailed.map((r) => `${r.reasonCategory}: ${r.count}`).join(' | '))}">
          <rect x="500" y="452" width="400" height="145" rx="8" fill="#fff1f2" stroke="#f43f5e" stroke-width="1.8" />
          <text x="516" y="476" font-size="13" font-weight="700" fill="#881337">Informes excluidos (Total n = ${validation.sumExcludedReasons}):</text>
          ${flowCounts.reportsExcludedDetailed
            .slice(0, 5)
            .map(
              (r, idx) =>
                `<text x="526" y="${500 + idx * 18}" font-size="12" fill="#9f1239">• ${escapeHtml(r.reasonCategory)} (n = ${r.count})</text>`
            )
            .join('\n          ')}
        </g>

        <line x1="440" y1="494" x2="498" y2="494" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />
        <line x1="250" y1="537" x2="250" y2="572" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />

        <!-- Caja 9: Estudios e Informes Incluidos -->
        <a href="${escapeHtml(dataUrl)}" target="_blank">
          <g class="interactive-node" data-tooltip="Separación ontológica PRISMA 2020: ${flowCounts.studiesIncludedReview} estudios únicos descritos en ${flowCounts.reportsIncludedReview} informes publicados (Estudios ≤ Informes).">
            <rect x="60" y="575" width="380" height="130" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="2.2" />
            <text x="76" y="602" font-size="13" font-weight="700" fill="#065f46">Síntesis Final (Inclusión):</text>
            <text x="86" y="628" font-size="13" font-weight="700" fill="#047857">• Estudios incluidos en la revisión (n = ${flowCounts.studiesIncludedReview})</text>
            <text x="86" y="652" font-size="13" font-weight="700" fill="#047857">• Informes de estudios incluidos (n = ${flowCounts.reportsIncludedReview})</text>
            <text x="86" y="678" font-size="12" fill="#065f46">• Estudios en síntesis cuantitativa / metaanálisis (n = ${flowCounts.studiesIncludedSynthesisQuantitative ?? 0})</text>
          </g>
        </a>
      </svg>
    </div>

    <div class="tooltip-panel" id="ciencia-abierta">
      <div class="info-card">
        <h3>🔍 Bases de Datos Interrogadas (PRISMA-S Ítem 7)</h3>
        <ul>${databasesTooltipHtml || '<li>Sin bases registradas</li>'}</ul>
      </div>
      <div class="info-card">
        <h3>📋 Desglose de Informes Excluidos a Texto Completo (Ítem 16b)</h3>
        <ul>${exclusionReasonsTooltipHtml || '<li>Sin exclusiones registradas</li>'}</ul>
      </div>
    </div>

    <footer>
      <span>Estándar: PRISMA 2020 (Page et al., 2021) &amp; Paquete Interactivo PRISMA2020 (Haddaway et al., 2022)</span>
      <span>Licencia CC BY 4.0 Internacional | Metadatos IEEE LOM-CO / SCORM 1.2</span>
    </footer>
  </div>

  <script>
    const tooltip = document.getElementById('floating-tooltip');
    document.querySelectorAll('.interactive-node').forEach(node => {
      node.addEventListener('mouseenter', (e) => {
        const text = node.getAttribute('data-tooltip');
        if (text) {
          tooltip.textContent = text;
          tooltip.style.display = 'block';
        }
      });
      node.addEventListener('mousemove', (e) => {
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY + 14) + 'px';
      });
      node.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    });
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
