import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrismaSessionState, FlowValidationReport } from '../../types/prisma';
import { Check, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import { Card, Chip } from '../ui/ui';

interface PrismaFlowDiagramProps {
  session: PrismaSessionState;
  validation: FlowValidationReport;
  onSelectNode?: (nodeFieldKey: string) => void;
}

export const PrismaFlowDiagram: React.FC<PrismaFlowDiagramProps> = ({
  session,
  validation,
  onSelectNode,
}) => {
  const { flowCounts, searchAndScreening, openScience } = session;
  const [hovered, setHovered] = useState<{
    title: string;
    detail: string;
    formula?: string;
    ok?: boolean;
  } | null>(null);

  const eq1Ok = validation.equations[0]?.isValid ?? true;
  const eq2Ok = validation.equations[1]?.isValid ?? true;
  const eq3Ok = validation.equations[2]?.isValid ?? true;
  const eq4Ok = validation.equations[3]?.isValid ?? true;
  const ontologyOk = validation.ontologyCheck.isValid;

  const nodeStroke = (ok: boolean, accent = '#d2d2d7') => (ok ? accent : '#ff3b30');
  const nodeFill = (ok: boolean, base = '#ffffff') => (ok ? base : '#fff5f5');

  return (
    <Card className="p-6 md:p-8 overflow-hidden">
      {/* Barra de estado minimalista */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          {validation.canExport ? (
            <Chip tone="green">
              <Check className="w-3.5 h-3.5" /> Flujo conciliado
            </Chip>
          ) : (
            <Chip tone="red">
              <AlertTriangle className="w-3.5 h-3.5" /> Hay números que no cuadran
            </Chip>
          )}
          <span className="text-[13px] text-neutral-400">
            Toca cualquier bloque para ver su fórmula
          </span>
        </div>

        <div className="flex items-center gap-2 text-[12px] font-medium text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" /> Registros
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5e5ce6]" /> Informes
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34c759]" /> Estudios
          </span>
        </div>
      </div>

      {/* Píldora flotante de inspección */}
      <div className="min-h-[64px] mb-5 rounded-2xl bg-[#f5f5f7] px-5 py-3.5 flex items-center justify-between gap-4">
        <AnimatePresence mode="wait">
          {hovered ? (
            <motion.div
              key={hovered.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-wrap items-center justify-between gap-3 w-full"
            >
              <div>
                <div className="text-[13px] font-semibold text-neutral-900 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hovered.ok === false ? 'bg-[#ff3b30]' : 'bg-[#34c759]'
                    }`}
                  />
                  {hovered.title}
                </div>
                <div className="text-[13px] text-neutral-500 mt-0.5">{hovered.detail}</div>
              </div>
              {hovered.formula && (
                <span className="font-mono text-[12px] bg-white px-3 py-1.5 rounded-full text-neutral-700 shadow-sm">
                  {hovered.formula}
                </span>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[13px] text-neutral-400 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#0071e3]" />
              Pasa el cursor sobre cualquier etapa del diagrama PRISMA 2020 para inspeccionar el balance.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lienzo SVG estilo Apple */}
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 880 720"
          className="w-full h-auto max-w-[860px] mx-auto select-none"
          role="img"
          aria-label="Diagrama de flujo interactivo PRISMA 2020"
        >
          <defs>
            <marker
              id="apple-arrow"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="5.5"
              markerHeight="5.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#86868b" />
            </marker>
            <filter id="card-shadow" x="-8%" y="-8%" width="116%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.05" />
            </filter>
          </defs>

          {/* Indicadores laterales de fase */}
          <g fontFamily="-apple-system, BlinkMacSystemFont, Inter, sans-serif" fontSize="11" fontWeight="600">
            <rect x="8" y="20" width="28" height="142" rx="14" fill="#0071e3" fillOpacity="0.1" />
            <text x="22" y="91" textAnchor="middle" fill="#0071e3" transform="rotate(-90 22 91)">
              IDENTIFICACIÓN
            </text>

            <rect x="8" y="182" width="28" height="340" rx="14" fill="#5e5ce6" fillOpacity="0.1" />
            <text x="22" y="352" textAnchor="middle" fill="#5e5ce6" transform="rotate(-90 22 352)">
              CRIBADO Y ELEGIBILIDAD
            </text>

            <rect x="8" y="542" width="28" height="154" rx="14" fill="#34c759" fillOpacity="0.12" />
            <text x="22" y="619" textAnchor="middle" fill="#248a3d" transform="rotate(-90 22 619)">
              INCLUSIÓN
            </text>
          </g>

          {/* NODO 1: Registros identificados */}
          <g
            className="cursor-pointer"
            filter="url(#card-shadow)"
            onClick={() => onSelectNode?.('recordsIdentifiedDatabases')}
            onMouseEnter={() =>
              setHovered({
                title: 'Registros identificados',
                detail: `Bases (${flowCounts.recordsIdentifiedDatabases}) + Registros (${flowCounts.recordsIdentifiedRegisters}) = ${validation.totalIdentifiedDatabasesAndRegisters}`,
                formula: 'Total = Bases + Registros',
                ok: true,
              })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <rect x="52" y="20" width="375" height="142" rx="20" fill="#ffffff" stroke="#d2d2d7" strokeWidth="1.5" />
            <circle cx="78" cy="48" r="5" fill="#0071e3" />
            <text x="92" y="52" fontSize="13" fontWeight="600" fill="#1d1d1f">
              Registros identificados
            </text>
            <text x="74" y="80" fontSize="13" fill="#6e6e73">
              Bases de datos
            </text>
            <text x="403" y="80" textAnchor="end" fontSize="14" fontWeight="600" fill="#1d1d1f">
              {flowCounts.recordsIdentifiedDatabases.toLocaleString('es-CO')}
            </text>
            <text x="74" y="104" fontSize="13" fill="#6e6e73">
              Registros de ensayos
            </text>
            <text x="403" y="104" textAnchor="end" fontSize="14" fontWeight="600" fill="#1d1d1f">
              {flowCounts.recordsIdentifiedRegisters.toLocaleString('es-CO')}
            </text>
            <line x1="74" y1="118" x2="403" y2="118" stroke="#f0f0f2" />
            <text x="74" y="140" fontSize="13" fontWeight="600" fill="#0071e3">
              Total identificados
            </text>
            <text x="403" y="140" textAnchor="end" fontSize="16" fontWeight="700" fill="#0071e3">
              {validation.totalIdentifiedDatabasesAndRegisters.toLocaleString('es-CO')}
            </text>
          </g>

          {/* NODO 2: Eliminados antes del cribado */}
          <g
            className="cursor-pointer"
            filter="url(#card-shadow)"
            onClick={() => onSelectNode?.('recordsDuplicatesRemoved')}
            onMouseEnter={() =>
              setHovered({
                title: 'Eliminados antes del cribado',
                detail: `Duplicados (${flowCounts.recordsDuplicatesRemoved}) + IA ${
                  searchAndScreening.automationDetails?.toolName || ''
                } (${flowCounts.recordsMarkedIneligibleAutomation})`,
                formula: `−${flowCounts.recordsDuplicatesRemoved + flowCounts.recordsMarkedIneligibleAutomation} registros`,
                ok: true,
              })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <rect x="485" y="20" width="375" height="142" rx="20" fill="#fbfbfd" stroke="#d2d2d7" strokeWidth="1.5" />
            <text x="509" y="52" fontSize="13" fontWeight="600" fill="#1d1d1f">
              Eliminados antes del cribado
            </text>
            <text x="509" y="80" fontSize="13" fill="#6e6e73">
              Duplicados
            </text>
            <text x="836" y="80" textAnchor="end" fontSize="14" fontWeight="600" fill="#1d1d1f">
              −{flowCounts.recordsDuplicatesRemoved.toLocaleString('es-CO')}
            </text>
            <text x="509" y="104" fontSize="13" fill="#6e6e73">
              Marcados por IA
            </text>
            <text x="836" y="104" textAnchor="end" fontSize="14" fontWeight="600" fill="#1d1d1f">
              −{flowCounts.recordsMarkedIneligibleAutomation.toLocaleString('es-CO')}
            </text>
            <line x1="509" y1="118" x2="836" y2="118" stroke="#f0f0f2" />
            <text x="509" y="140" fontSize="13" fontWeight="600" fill="#6e6e73">
              Total removidos
            </text>
            <text x="836" y="140" textAnchor="end" fontSize="15" fontWeight="700" fill="#1d1d1f">
              −{(flowCounts.recordsDuplicatesRemoved + flowCounts.recordsMarkedIneligibleAutomation).toLocaleString('es-CO')}
            </text>
          </g>

          {/* Flechas Identificación */}
          <line x1="427" y1="91" x2="480" y2="91" stroke="#86868b" strokeWidth="1.8" markerEnd="url(#apple-arrow)" />
          <line x1="239" y1="162" x2="239" y2="188" stroke="#86868b" strokeWidth="1.8" markerEnd="url(#apple-arrow)" />

          {/* NODO 3: Registros cribados */}
          <g
            className="cursor-pointer"
            filter="url(#card-shadow)"
            onClick={() => onSelectNode?.('recordsScreenedTitleAbstract')}
            onMouseEnter={() =>
              setHovered({
                title: 'Registros cribados (título y resumen)',
                detail: eq1Ok
                  ? `Cuadra: ${validation.totalIdentifiedDatabasesAndRegisters} − ${
                      flowCounts.recordsDuplicatesRemoved + flowCounts.recordsMarkedIneligibleAutomation
                    } = ${flowCounts.recordsScreenedTitleAbstract}`
                  : `Esperado ${validation.expectedRecordsScreened}, ingresaste ${flowCounts.recordsScreenedTitleAbstract}`,
                formula: 'Cribados = Identificados − Removidos',
                ok: eq1Ok,
              })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <rect
              x="52"
              y="194"
              width="375"
              height="92"
              rx="20"
              fill={nodeFill(eq1Ok)}
              stroke={nodeStroke(eq1Ok)}
              strokeWidth={eq1Ok ? '1.5' : '2.5'}
            />
            <circle cx="78" cy="226" r="5" fill="#0071e3" />
            <text x="92" y="230" fontSize="13" fontWeight="600" fill="#1d1d1f">
              Registros cribados
            </text>
            <text x="74" y="262" fontSize="24" fontWeight="700" fill={eq1Ok ? '#1d1d1f' : '#ff3b30'}>
              {flowCounts.recordsScreenedTitleAbstract.toLocaleString('es-CO')}
            </text>
            {!eq1Ok && (
              <text x="403" y="260" textAnchor="end" fontSize="12" fontWeight="600" fill="#ff3b30">
                Debería ser {validation.expectedRecordsScreened}
              </text>
            )}
          </g>

          {/* NODO 4: Excluidos título/resumen */}
          <g
            className="cursor-pointer"
            filter="url(#card-shadow)"
            onClick={() => onSelectNode?.('recordsExcludedTitleAbstract')}
            onMouseEnter={() =>
              setHovered({
                title: 'Registros excluidos en título y resumen',
                detail: `${flowCounts.recordsExcludedTitleAbstract} descartados antes de buscar texto completo.`,
                formula: `−${flowCounts.recordsExcludedTitleAbstract} registros`,
                ok: true,
              })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <rect x="485" y="194" width="375" height="92" rx="20" fill="#fbfbfd" stroke="#d2d2d7" strokeWidth="1.5" />
            <text x="509" y="230" fontSize="13" fontWeight="600" fill="#6e6e73">
              Excluidos por título y resumen
            </text>
            <text x="509" y="262" fontSize="24" fontWeight="700" fill="#ff3b30">
              −{flowCounts.recordsExcludedTitleAbstract.toLocaleString('es-CO')}
            </text>
          </g>

          <line x1="427" y1="240" x2="480" y2="240" stroke="#86868b" strokeWidth="1.8" markerEnd="url(#apple-arrow)" />
          <line x1="239" y1="286" x2="239" y2="312" stroke="#86868b" strokeWidth="1.8" markerEnd="url(#apple-arrow)" />

          {/* NODO 5: Informes buscados */}
          <g
            className="cursor-pointer"
            filter="url(#card-shadow)"
            onClick={() => onSelectNode?.('reportsSoughtForRetrieval')}
            onMouseEnter={() =>
              setHovered({
                title: 'Informes buscados a texto completo',
                detail: eq2Ok
                  ? `Cuadra: ${flowCounts.recordsScreenedTitleAbstract} − ${flowCounts.recordsExcludedTitleAbstract} = ${flowCounts.reportsSoughtForRetrieval}`
                  : `Esperado ${validation.expectedReportsSought}, ingresaste ${flowCounts.reportsSoughtForRetrieval}`,
                formula: 'Buscados = Cribados − Excluidos',
                ok: eq2Ok,
              })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <rect
              x="52"
              y="318"
              width="375"
              height="92"
              rx="20"
              fill={nodeFill(eq2Ok)}
              stroke={nodeStroke(eq2Ok)}
              strokeWidth={eq2Ok ? '1.5' : '2.5'}
            />
            <circle cx="78" cy="350" r="5" fill="#5e5ce6" />
            <text x="92" y="354" fontSize="13" fontWeight="600" fill="#1d1d1f">
              Informes buscados (texto completo)
            </text>
            <text x="74" y="386" fontSize="24" fontWeight="700" fill={eq2Ok ? '#1d1d1f' : '#ff3b30'}>
              {flowCounts.reportsSoughtForRetrieval.toLocaleString('es-CO')}
            </text>
            {!eq2Ok && (
              <text x="403" y="384" textAnchor="end" fontSize="12" fontWeight="600" fill="#ff3b30">
                Debería ser {validation.expectedReportsSought}
              </text>
            )}
          </g>

          {/* NODO 6: Informes no recuperados */}
          <g
            className="cursor-pointer"
            filter="url(#card-shadow)"
            onClick={() => onSelectNode?.('reportsNotRetrieved')}
            onMouseEnter={() =>
              setHovered({
                title: 'Informes no recuperados',
                detail: `${flowCounts.reportsNotRetrieved} documentos cuyo texto completo no se consiguió.`,
                formula: `−${flowCounts.reportsNotRetrieved} informes`,
                ok: true,
              })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <rect x="485" y="318" width="375" height="92" rx="20" fill="#fbfbfd" stroke="#d2d2d7" strokeWidth="1.5" />
            <text x="509" y="354" fontSize="13" fontWeight="600" fill="#6e6e73">
              Informes no recuperados
            </text>
            <text x="509" y="386" fontSize="24" fontWeight="700" fill="#ff9500">
              −{flowCounts.reportsNotRetrieved.toLocaleString('es-CO')}
            </text>
          </g>

          <line x1="427" y1="364" x2="480" y2="364" stroke="#86868b" strokeWidth="1.8" markerEnd="url(#apple-arrow)" />
          <line x1="239" y1="410" x2="239" y2="436" stroke="#86868b" strokeWidth="1.8" markerEnd="url(#apple-arrow)" />

          {/* NODO 7: Informes evaluados */}
          <g
            className="cursor-pointer"
            filter="url(#card-shadow)"
            onClick={() => onSelectNode?.('reportsAssessedForEligibility')}
            onMouseEnter={() =>
              setHovered({
                title: 'Informes evaluados para elegibilidad',
                detail: eq3Ok
                  ? `Cuadra: ${flowCounts.reportsSoughtForRetrieval} − ${flowCounts.reportsNotRetrieved} = ${flowCounts.reportsAssessedForEligibility}`
                  : `Esperado ${validation.expectedReportsAssessed}, ingresaste ${flowCounts.reportsAssessedForEligibility}`,
                formula: 'Evaluados = Buscados − No recuperados',
                ok: eq3Ok,
              })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <rect
              x="52"
              y="442"
              width="375"
              height="92"
              rx="20"
              fill={nodeFill(eq3Ok)}
              stroke={nodeStroke(eq3Ok)}
              strokeWidth={eq3Ok ? '1.5' : '2.5'}
            />
            <circle cx="78" cy="474" r="5" fill="#5e5ce6" />
            <text x="92" y="478" fontSize="13" fontWeight="600" fill="#1d1d1f">
              Informes evaluados a texto completo
            </text>
            <text x="74" y="510" fontSize="24" fontWeight="700" fill={eq3Ok ? '#1d1d1f' : '#ff3b30'}>
              {flowCounts.reportsAssessedForEligibility.toLocaleString('es-CO')}
            </text>
            {!eq3Ok && (
              <text x="403" y="508" textAnchor="end" fontSize="12" fontWeight="600" fill="#ff3b30">
                Debería ser {validation.expectedReportsAssessed}
              </text>
            )}
          </g>

          {/* NODO 8: Excluidos con razones */}
          <g
            className="cursor-pointer"
            filter="url(#card-shadow)"
            onClick={() => onSelectNode?.('reportsExcludedDetailed')}
            onMouseEnter={() =>
              setHovered({
                title: 'Informes excluidos con razón (Ítem 16b)',
                detail:
                  flowCounts.reportsExcludedDetailed
                    .map((r) => `${r.reasonCategory}: ${r.count}`)
                    .join(' · ') || 'Sin motivos registrados',
                formula: `Σ excluidos = ${validation.sumExcludedReasons}`,
                ok: validation.areExclusionReasonsValid,
              })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <rect
              x="485"
              y="442"
              width="375"
              height="148"
              rx="20"
              fill="#fff8f8"
              stroke={validation.areExclusionReasonsValid ? '#ffd5d5' : '#ff3b30'}
              strokeWidth="1.5"
            />
            <text x="509" y="472" fontSize="13" fontWeight="600" fill="#d70015">
              Informes excluidos (total −{validation.sumExcludedReasons})
            </text>
            {flowCounts.reportsExcludedDetailed.slice(0, 4).map((item, idx) => (
              <g key={idx}>
                <text x="509" y={498 + idx * 21} fontSize="12" fill="#6e6e73">
                  {item.reasonCategory.slice(0, 38)}
                </text>
                <text x="836" y={498 + idx * 21} textAnchor="end" fontSize="12.5" fontWeight="600" fill="#d70015">
                  −{item.count}
                </text>
              </g>
            ))}
          </g>

          <line x1="427" y1="488" x2="480" y2="488" stroke="#86868b" strokeWidth="1.8" markerEnd="url(#apple-arrow)" />
          <line x1="239" y1="534" x2="239" y2="560" stroke="#86868b" strokeWidth="1.8" markerEnd="url(#apple-arrow)" />

          {/* NODO 9: Inclusión final */}
          <g
            className="cursor-pointer"
            filter="url(#card-shadow)"
            onClick={() => onSelectNode?.('studiesIncludedReview')}
            onMouseEnter={() =>
              setHovered({
                title: 'Estudios e informes incluidos',
                detail:
                  eq4Ok && ontologyOk
                    ? `${flowCounts.studiesIncludedReview} estudios descritos en ${flowCounts.reportsIncludedReview} informes.`
                    : [validation.equations[3]?.errorMessage, ...validation.ontologyCheck.messages]
                        .filter(Boolean)
                        .join(' · '),
                formula: 'Estudios ≤ Informes',
                ok: eq4Ok && ontologyOk,
              })
            }
            onMouseLeave={() => setHovered(null)}
          >
            <rect
              x="52"
              y="566"
              width="375"
              height="130"
              rx="22"
              fill={nodeFill(eq4Ok && ontologyOk, '#f2fcf5')}
              stroke={nodeStroke(eq4Ok && ontologyOk, '#34c759')}
              strokeWidth="2"
            />
            <circle cx="78" cy="596" r="5" fill="#34c759" />
            <text x="92" y="600" fontSize="13" fontWeight="600" fill="#1d1d1f">
              Incluidos en la revisión
            </text>

            <text x="74" y="632" fontSize="13" fill="#6e6e73">
              Estudios únicos
            </text>
            <text x="403" y="632" textAnchor="end" fontSize="18" fontWeight="700" fill={ontologyOk ? '#248a3d' : '#ff3b30'}>
              {flowCounts.studiesIncludedReview}
            </text>

            <text x="74" y="658" fontSize="13" fill="#6e6e73">
              Informes publicados
            </text>
            <text x="403" y="658" textAnchor="end" fontSize="18" fontWeight="700" fill={eq4Ok ? '#248a3d' : '#ff3b30'}>
              {flowCounts.reportsIncludedReview}
            </text>

            <text x="74" y="682" fontSize="12" fill="#6e6e73">
              En metaanálisis cuantitativo
            </text>
            <text x="403" y="682" textAnchor="end" fontSize="13" fontWeight="600" fill="#248a3d">
              {flowCounts.studiesIncludedSynthesisQuantitative ?? 0}
            </text>
          </g>
        </svg>
      </div>

      {/* Pie con accesos directos a ciencia abierta */}
      <div className="mt-5 pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-3 text-[13px] text-neutral-500">
        <div className="flex flex-wrap items-center gap-4">
          {openScience.dataRepositoryUrl && (
            <a
              href={openScience.dataRepositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#0071e3] font-medium hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Datos abiertos
            </a>
          )}
          {openScience.codeRepositoryUrl && (
            <a
              href={openScience.codeRepositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#0071e3] font-medium hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Código y scripts
            </a>
          )}
        </div>
        <span className="font-mono text-[12px]">
          {flowCounts.studiesIncludedReview} estudios ≤ {flowCounts.reportsIncludedReview} informes
        </span>
      </div>
    </Card>
  );
};
