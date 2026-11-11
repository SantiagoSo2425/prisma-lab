import React, { useState } from 'react';
import { usePrismaStore } from '../../store/usePrismaStore';
import { PRISMA_42_CHECKLIST } from '../../data/checklist42';
import { validatePrismaFlow } from '../../core/flowValidator';
import { generateInteractivePrismaHtml } from '../../core/htmlExporter';
import { ChecklistItemStatus } from '../../types/prisma';
import {
  Download,
  Lock,
  FileCode2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ModuleHero,
  LearnMoreCapsule,
  Section,
  Card,
  Button,
  Chip,
  Toggle,
  Segmented,
  Ring,
  Field,
  StatusDot,
  inputCls,
  monoInputCls,
} from '../ui/ui';

export const Module4AuditOpenSci: React.FC = () => {
  const {
    session,
    checklistEntries,
    updateChecklistEntry,
    updateOpenScience,
    setActiveTab,
  } = usePrismaStore();

  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [onlyItem13, setOnlyItem13] = useState<boolean>(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const validation = validatePrismaFlow(session.flowCounts);

  const isEntryValid = (subItemId: string): boolean => {
    const entry = checklistEntries[subItemId];
    if (!entry) return false;
    if (entry.status === 'pending') return false;
    if (entry.status === 'completed') {
      return (
        entry.pageOrSection.trim().length > 0 &&
        entry.manuscriptExcerpt.trim().length >= 10
      );
    }
    if (entry.status === 'not_applicable') {
      return entry.naJustification.trim().length >= 20;
    }
    return false;
  };

  const validSubItemsCount = PRISMA_42_CHECKLIST.filter((item) =>
    isEntryValid(item.subItemId)
  ).length;

  const item13SubItems = PRISMA_42_CHECKLIST.filter(
    (item) => item.isItem13Breakdown
  );
  const validItem13Count = item13SubItems.filter((item) =>
    isEntryValid(item.subItemId)
  ).length;

  const filteredItems = PRISMA_42_CHECKLIST.filter((item) => {
    if (onlyItem13 && !item.isItem13Breakdown) return false;
    if (sectionFilter !== 'ALL' && item.section !== sectionFilter) return false;
    return true;
  });

  const handleDownloadInteractiveHtml = () => {
    if (!validation.canExport) {
      setExportFeedback(
        'Exportación bloqueada: corrige primero el desbalance en el Módulo 2.'
      );
      return;
    }
    try {
      const htmlContent = generateInteractivePrismaHtml(session, validation);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PRISMA2020_Diagrama_Interactivo_${session.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportFeedback(
        '✓ Diagrama HTML interactivo exportado con enlaces y notas emergentes.'
      );
    } catch (err) {
      setExportFeedback(
        err instanceof Error ? err.message : 'Error al exportar HTML.'
      );
    }
  };

  const handleDownloadJsonSession = () => {
    const payload = {
      prismaLabVersion: '1.0.0-PROTOTIPO',
      exportedAt: new Date().toISOString(),
      flowValidation: validation,
      sessionState: session,
      checklist42Audit: checklistEntries,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRISMA_Lab_Reporte_Auditoria_${session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-12">
      <ModuleHero
        eyebrow="Módulo 4 · Auditoría y Ciencia Abierta"
        title="42 pasos. Cero puntos ciegos."
        subtitle="Verifica cada sub-ítem operativo de PRISMA 2020 y exporta el diagrama interactivo solo cuando las matemáticas cuadren."
      />

      <LearnMoreCapsule
        raCode="RA4 · Nivel Auditar y Crear (Bloom)"
        raText="Verificar los 42 sub-ítems operativos (énfasis 13a–13f) y exportar bajo Ciencia Abierta."
        duration="15 min"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              1 · Por qué son 42 sub-ítems y no 27
            </div>
            <h4 className="text-lg font-semibold mt-1">Desglose operativo real</h4>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Los 27 ítems numerados de PRISMA 2020 contienen sub-filas obligatorias (como <code>10a–10b</code>, <code>13a–13f</code>, <code>16a–16b</code>, <code>20a–20d</code>, <code>23a–23d</code> y <code>24a–24c</code>) que suman exactamente <strong>42 verificaciones</strong>.
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              2 · El corazón estadístico: Ítem 13 (13a–13f)
            </div>
            <h4 className="text-lg font-semibold mt-1">Seis pilares de síntesis</h4>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Exige separar: elegibilidad por síntesis (<strong>13a</strong>), conversión de datos como medianas a medias (<strong>13b</strong>), gráficos (<strong>13c</strong>), modelo REML o SWiM (<strong>13d</strong>), causas de heterogeneidad (<strong>13e</strong>) y sensibilidad (<strong>13f</strong>).
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              3 · Ciencia Abierta e Interactividad (Ítem 27)
            </div>
            <h4 className="text-lg font-semibold mt-1">Estándar Haddaway PRISMA2020</h4>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              El diagrama exportado incrusta hipervínculos directos a tu repositorio en Zenodo/OSF/GitHub y despliega <em>tooltips</em> con el conteo exacto de cada causa de exclusión.
            </p>
          </div>
        </div>
      </LearnMoreCapsule>

      {/* 1. CIENCIA ABIERTA Y EXPORTADOR INTERACTIVO */}
      <Section
        eyebrow="Ítem 27 · Haddaway et al., 2022"
        title="Ciencia abierta y exportación."
        subtitle="Enlaza tus datos y scripts; se incrustan directamente dentro del diagrama HTML interactivo."
      >
        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          <Card className="lg:col-span-7 p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <Field label="Repositorio de datos abiertos (Zenodo, OSF, Figshare)">
                <input
                  type="url"
                  value={session.openScience.dataRepositoryUrl || ''}
                  onChange={(e) =>
                    updateOpenScience({ dataRepositoryUrl: e.target.value })
                  }
                  placeholder="https://zenodo.org/records/..."
                  className={monoInputCls}
                />
              </Field>

              <Field label="Repositorio de código analítico y búsquedas (GitHub, GitLab)">
                <input
                  type="url"
                  value={session.openScience.codeRepositoryUrl || ''}
                  onChange={(e) =>
                    updateOpenScience({ codeRepositoryUrl: e.target.value })
                  }
                  placeholder="https://github.com/..."
                  className={monoInputCls}
                />
              </Field>
            </div>

            <div className="mt-6 pt-5 border-t border-black/5">
              <Toggle
                checked={session.openScience.screeningFormsAvailable}
                onChange={(screeningFormsAvailable) =>
                  updateOpenScience({ screeningFormsAvailable })
                }
                label="Formularios de extracción y tamizaje públicos (Ítem 27)"
              />
            </div>
          </Card>

          {/* Tarjeta oscura de exportación */}
          <Card className="lg:col-span-5 p-7 bg-neutral-900 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Compuerta algebraica
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    validation.canExport
                      ? 'bg-[#34c759]/20 text-emerald-300'
                      : 'bg-[#ff3b30]/20 text-rose-300'
                  }`}
                >
                  {validation.canExport ? '✓ Listo para exportar' : '✕ Bloqueado'}
                </span>
              </div>
              <h3 className="text-2xl font-semibold mt-3">
                Diagrama interactivo HTML
              </h3>
              <p className="text-sm text-white/60 mt-1 leading-relaxed">
                Incluye el diagrama SVG PRISMA 2020, motivos de exclusión emergentes al pasar el cursor y enlaces clicables a tus repositorios.
              </p>
            </div>

            <div className="space-y-2.5 mt-6">
              <Button
                onClick={handleDownloadInteractiveHtml}
                disabled={!validation.canExport}
                className="w-full py-3"
              >
                {validation.canExport ? (
                  <>
                    <Download className="w-4 h-4" /> Descargar HTML interactivo
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Corrige el flujo en el Módulo 2
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleDownloadJsonSession}
                className="w-full rounded-full bg-white/10 hover:bg-white/15 text-white py-2.5 px-4 text-sm font-medium inline-flex items-center justify-center gap-2 transition"
              >
                <FileCode2 className="w-4 h-4" /> Descargar sesión JSON
              </button>

              {exportFeedback && (
                <div className="text-xs text-emerald-300 text-center pt-1">
                  {exportFeedback}
                </div>
              )}
            </div>
          </Card>
        </div>
      </Section>

      {/* 2. AUDITORÍA DE LOS 42 SUB-ÍTEMS */}
      <Section
        eyebrow="Lista operativa completa"
        title="Los 42 sub-ítems de PRISMA 2020."
        subtitle="Indica en qué página está cada punto o justifica por qué no aplica."
      >
        {/* Resumen visual con anillos */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Progreso total
              </div>
              <div className="text-3xl font-semibold text-neutral-900 mt-1">
                {validSubItemsCount} de 42 verificados
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                27 ítems canónicos desglosados en 42 filas operativas.
              </p>
            </div>
            <Ring
              value={validSubItemsCount}
              max={42}
              size={84}
              stroke={8}
              color="#0071e3"
            >
              <span className="text-sm font-bold">
                {Math.round((validSubItemsCount / 42) * 100)}%
              </span>
            </Ring>
          </Card>

          <Card className="p-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Métodos de síntesis · Ítem 13
              </div>
              <div className="text-3xl font-semibold text-neutral-900 mt-1">
                {validItem13Count} de 6 sub-ítems (13a–13f)
              </div>
              <button
                type="button"
                onClick={() => setOnlyItem13(!onlyItem13)}
                className="text-sm font-semibold text-[#0071e3] hover:underline mt-1 inline-flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {onlyItem13 ? 'Ver los 42 sub-ítems' : 'Enfocar solo 13a–13f'}
              </button>
            </div>
            <Ring
              value={validItem13Count}
              max={6}
              size={84}
              stroke={8}
              color="#34c759"
            >
              <span className="text-sm font-bold">{validItem13Count}/6</span>
            </Ring>
          </Card>
        </div>

        {/* Filtro de sección */}
        <div className="mb-6 overflow-x-auto no-scrollbar">
          <Segmented
            size="sm"
            value={onlyItem13 ? 'ITEM13' : sectionFilter}
            onChange={(val) => {
              if (val === 'ITEM13') {
                setOnlyItem13(true);
              } else {
                setOnlyItem13(false);
                setSectionFilter(val);
              }
            }}
            options={[
              { value: 'ALL', label: 'Todos (42)' },
              { value: 'ITEM13', label: '★ Ítem 13 (13a–13f)' },
              { value: 'Título', label: 'Título' },
              { value: 'Resumen', label: 'Resumen' },
              { value: 'Introducción', label: 'Introducción' },
              { value: 'Métodos', label: 'Métodos' },
              { value: 'Resultados', label: 'Resultados' },
              { value: 'Discusión', label: 'Discusión' },
              { value: 'Otra información', label: 'Otra info' },
            ]}
          />
        </div>

        {/* Tarjetas de sub-ítems */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const entry = checklistEntries[item.subItemId] || {
              subItemId: item.subItemId,
              status: 'pending',
              pageOrSection: '',
              manuscriptExcerpt: '',
              naJustification: '',
            };
            const valid = isEntryValid(item.subItemId);

            return (
              <Card key={item.subItemId} className="p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 max-w-2xl">
                    <StatusDot ok={valid} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-neutral-900 bg-black/[0.05] px-2.5 py-0.5 rounded-full">
                          #{item.subItemId}
                        </span>
                        <span className="text-xs font-medium text-neutral-400">
                          {item.section} · {item.topic}
                        </span>
                        {item.isItem13Breakdown && (
                          <Chip tone="blue">Desglose Ítem 13</Chip>
                        )}
                      </div>
                      <p className="text-[15px] text-neutral-800 mt-1.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <Segmented
                    size="sm"
                    value={entry.status}
                    onChange={(status) =>
                      updateChecklistEntry(item.subItemId, {
                        status: status as ChecklistItemStatus,
                      })
                    }
                    options={[
                      { value: 'completed', label: 'Reportado' },
                      { value: 'not_applicable', label: 'No aplica' },
                      { value: 'pending', label: 'Pendiente' },
                    ]}
                  />
                </div>

                {entry.status === 'completed' && (
                  <div className="grid md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-black/5">
                    <input
                      type="text"
                      aria-label={`Sub-ítem ${item.subItemId}: página o sección`}
                      value={entry.pageOrSection}
                      onChange={(e) =>
                        updateChecklistEntry(item.subItemId, {
                          pageOrSection: e.target.value,
                        })
                      }
                      placeholder="Página / sección"
                      className={inputCls}
                    />
                    <input
                      type="text"
                      aria-label={`Sub-ítem ${item.subItemId}: fragmento del manuscrito`}
                      value={entry.manuscriptExcerpt}
                      onChange={(e) =>
                        updateChecklistEntry(item.subItemId, {
                          manuscriptExcerpt: e.target.value,
                        })
                      }
                      placeholder={item.hintExample}
                      className={`${inputCls} md:col-span-3`}
                    />
                  </div>
                )}

                {entry.status === 'not_applicable' && (
                  <div className="mt-4 pt-4 border-t border-black/5">
                    <input
                      type="text"
                      aria-label={`Sub-ítem ${item.subItemId}: justificación de no aplica`}
                      value={entry.naJustification}
                      onChange={(e) =>
                        updateChecklistEntry(item.subItemId, {
                          naJustification: e.target.value,
                        })
                      }
                      placeholder="Justifica por qué no aplica (mínimo 20 caracteres)..."
                      className={inputCls}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end mt-10">
          <Button
            onClick={() => {
              setActiveTab('posttest_lori');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Ir a Evaluación Final <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Section>
    </div>
  );
};
