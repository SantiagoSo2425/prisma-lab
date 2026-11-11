import React from 'react';
import { PrismaSessionState } from '../../types/prisma';
import { usePrismaStore } from '../../store/usePrismaStore';
import { validateBooleanQuery } from '../../core/booleanParser';
import { validatePrismaFlow } from '../../core/flowValidator';
import { PrismaFlowDiagram } from '../diagram/PrismaFlowDiagram';
import {
  Plus,
  Trash2,
  Wand2,
  RefreshCw,
  ArrowRight,
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

export const Module2SearchFlow: React.FC = () => {
  const {
    session,
    updateSearchAndScreening,
    updateDatabaseEntry,
    addDatabaseEntry,
    removeDatabaseEntry,
    syncDatabasesTotalToFlow,
    updateFlowCounts,
    updateExclusionReason,
    addExclusionReason,
    removeExclusionReason,
    reconcileFlowCountsNow,
    setActiveTab,
  } = usePrismaStore();

  const { searchAndScreening, flowCounts } = session;
  const validation = validatePrismaFlow(flowCounts);

  const handleNumberChange = (
    field: keyof PrismaSessionState['flowCounts'],
    rawValue: string
  ) => {
    const parsed = Math.max(0, parseInt(rawValue, 10) || 0);
    updateFlowCounts({ [field]: parsed });
  };

  return (
    <div className="pb-12">
      <ModuleHero
        eyebrow="Módulo 2 · Simulador"
        title="Búsqueda y flujo vivo."
        subtitle="Valida tus cadenas booleanas PRISMA-S, declara el rol de la IA y observa cómo cada número se propaga por el diagrama."
      />

      <LearnMoreCapsule
        raCode="RA2 · Nivel Aplicar y Conciliar (Bloom)"
        raText="Construir búsquedas reproducibles PRISMA-S y conciliar algebraicamente el flujo."
        duration="20 min"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              1 · Sintaxis Booleana PRISMA-S (Ítem 7)
            </div>
            <h4 className="text-lg font-semibold mt-1">(Sinónimos OR) AND (Conceptos)</h4>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Agrupa siempre los sinónimos con <code>OR</code> dentro de paréntesis y cruza los bloques PICO con <code>AND</code> en MAYÚSCULAS: <code>(&quot;heart failure&quot;[Mesh] OR &quot;cardiac failure&quot;[tiab]) AND (&quot;telemonitoring&quot;[tiab])</code>.
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-violet-400">
              2 · IA en el Cribado (Ítems 8 y 16a)
            </div>
            <h4 className="text-lg font-semibold mt-1">Priorizar vs. Excluir</h4>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Si usas <strong>ASReview</strong> o <strong>Rayyan</strong>, especifica si el algoritmo solo reordenó la fila para lectura humana o si descartó registros automáticamente (que deben contarse en la caja de <em>Ineligibles por IA</em>).
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              3 · Las 4 Ecuaciones de Balance
            </div>
            <h4 className="text-lg font-semibold mt-1">Cero fugas aritméticas</h4>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Estudios recientes (Ivaldi et al., 2024; Banno et al., 2025) muestran que más del 35% de las revisiones publicadas tienen restas mal hechas en su diagrama. Aquí ningún cambio pasa sin cuadrar.
            </p>
          </div>
        </div>
      </LearnMoreCapsule>

      {/* 1. PRISMA-S BOOLEAN STUDIO */}
      <Section
        eyebrow="PRISMA-S · Ítems 6 y 7"
        title="Ecuaciones de búsqueda reproducibles."
        subtitle="Cada motor necesita su cadena exacta, fecha y descriptores controlados."
        right={
          <>
            <Button variant="secondary" onClick={syncDatabasesTotalToFlow}>
              <RefreshCw className="w-4 h-4" /> Pasar suma al diagrama
            </Button>
            <Button onClick={addDatabaseEntry}>
              <Plus className="w-4 h-4" /> Añadir base
            </Button>
          </>
        }
      >
        <div className="grid gap-5">
          {searchAndScreening.databases.map((db, idx) => {
            const check = validateBooleanQuery(db.queryExecuted);
            const ringColor = check.isValid
              ? check.score >= 90
                ? '#34c759'
                : '#0071e3'
              : '#ff3b30';

            return (
              <Card key={idx} className="p-6 md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <Ring value={check.score} max={100} size={64} stroke={6} color={ringColor}>
                      <span className="text-xs font-bold text-neutral-900">{check.score}%</span>
                    </Ring>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Base #{idx + 1}
                      </div>
                      <input
                        type="text"
                        aria-label={`Nombre de la base de datos ${idx + 1}`}
                        value={db.name}
                        onChange={(e) =>
                          updateDatabaseEntry(idx, { ...db, name: e.target.value })
                        }
                        className="text-xl font-semibold text-neutral-900 bg-transparent border-b border-transparent focus:border-[#0071e3] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl bg-[#f5f5f7] px-3.5 py-2 flex items-center gap-2">
                      <span className="text-xs text-neutral-500">Registros</span>
                      <input
                        type="number"
                        min={0}
                        aria-label={`Registros encontrados en ${db.name || `la base ${idx + 1}`}`}
                        value={db.recordsFound}
                        onChange={(e) =>
                          updateDatabaseEntry(idx, {
                            ...db,
                            recordsFound: Math.max(0, parseInt(e.target.value, 10) || 0),
                          })
                        }
                        className="w-20 bg-white rounded-lg px-2 py-1 text-sm font-semibold text-right tabular-nums focus:outline-none"
                      />
                    </div>

                    <div className="rounded-2xl bg-[#f5f5f7] px-3.5 py-2 flex items-center gap-2">
                      <span className="text-xs text-neutral-500">Fecha</span>
                      <input
                        type="date"
                        aria-label={`Fecha de búsqueda en ${db.name || `la base ${idx + 1}`}`}
                        value={db.dateSearched}
                        onChange={(e) =>
                          updateDatabaseEntry(idx, { ...db, dateSearched: e.target.value })
                        }
                        className="bg-white rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
                      />
                    </div>

                    {searchAndScreening.databases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDatabaseEntry(idx)}
                        className="w-9 h-9 rounded-full bg-black/[0.04] hover:bg-[#ff3b30]/10 text-neutral-400 hover:text-[#d70015] flex items-center justify-center transition"
                        title="Eliminar base"
                        aria-label={`Eliminar la base ${db.name || idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={2}
                  aria-label={`Ecuación de búsqueda ejecutada en ${db.name || `la base ${idx + 1}`}`}
                  value={db.queryExecuted}
                  onChange={(e) =>
                    updateDatabaseEntry(idx, { ...db, queryExecuted: e.target.value })
                  }
                  className={monoInputCls}
                />

                {/* Píldoras de diagnóstico */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Chip tone="blue">AND {check.operatorCounts.AND}</Chip>
                  <Chip tone="purple">OR {check.operatorCounts.OR}</Chip>
                  {check.operatorCounts.NOT > 0 && (
                    <Chip tone="neutral">NOT {check.operatorCounts.NOT}</Chip>
                  )}
                  <Chip tone={check.hasBalancedParentheses ? 'green' : 'red'}>
                    {check.hasBalancedParentheses ? '✓ Paréntesis' : '✕ Paréntesis'}
                  </Chip>
                  {check.detectedDescriptors.map((d) => (
                    <Chip key={d} tone="neutral">
                      {d}
                    </Chip>
                  ))}
                </div>

                {check.errors.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {check.errors.map((err, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-[#ff3b30]/10 px-3.5 py-2 text-[13px] font-medium text-[#d70015]"
                      >
                        {err}
                      </div>
                    ))}
                  </div>
                )}

                {check.warnings.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {check.warnings.map((w, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-[#ff9500]/12 px-3.5 py-2 text-[13px] text-[#9a4a00]"
                      >
                        {w}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Section>

      {/* 2. IA Y AUTOMATIZACIÓN */}
      <Section
        eyebrow="Tamizaje asistido · Ítems 8 y 9"
        title="Inteligencia artificial en el cribado."
        subtitle="Si usaste aprendizaje activo o clasificadores, declara qué modelo fue y cómo supervisó el equipo humano."
      >
        <Card className="p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Toggle
              checked={searchAndScreening.automationToolsUsed}
              onChange={(automationToolsUsed) =>
                updateSearchAndScreening({ automationToolsUsed })
              }
              label={
                <div>
                  <div className="font-semibold text-neutral-900">
                    Usamos herramientas de IA / aprendizaje activo
                  </div>
                  <div className="text-xs text-neutral-400">
                    Conecta con el conteo de ineligibles por automatización en el diagrama
                  </div>
                </div>
              }
            />

            {searchAndScreening.automationToolsUsed && (
              <Segmented
                size="sm"
                value={searchAndScreening.automationDetails?.toolName || 'ASReview'}
                onChange={(toolName) =>
                  updateSearchAndScreening({
                    automationDetails: {
                      toolName,
                      modelType:
                        searchAndScreening.automationDetails?.modelType ||
                        'Aprendizaje activo SVM / Naive Bayes',
                      humanRole:
                        searchAndScreening.automationDetails?.humanRole ||
                        'Priorización supervisada por dos revisores humanos',
                    },
                  })
                }
                options={[
                  { value: 'ASReview', label: 'ASReview' },
                  { value: 'Rayyan', label: 'Rayyan' },
                  { value: 'Other', label: 'Otro / LLM' },
                ]}
              />
            )}
          </div>

          {searchAndScreening.automationToolsUsed && (
            <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-black/5">
              <Field label="Modelo o clasificador">
                <input
                  type="text"
                  value={searchAndScreening.automationDetails?.modelType || ''}
                  onChange={(e) =>
                    updateSearchAndScreening({
                      automationDetails: {
                        toolName:
                          searchAndScreening.automationDetails?.toolName || 'ASReview',
                        modelType: e.target.value,
                        humanRole:
                          searchAndScreening.automationDetails?.humanRole || '',
                      },
                    })
                  }
                  className={inputCls}
                />
              </Field>

              <Field label="Rol humano y regla de parada">
                <input
                  type="text"
                  value={searchAndScreening.automationDetails?.humanRole || ''}
                  onChange={(e) =>
                    updateSearchAndScreening({
                      automationDetails: {
                        toolName:
                          searchAndScreening.automationDetails?.toolName || 'ASReview',
                        modelType:
                          searchAndScreening.automationDetails?.modelType || '',
                        humanRole: e.target.value,
                      },
                    })
                  }
                  className={inputCls}
                />
              </Field>
            </div>
          )}
        </Card>
      </Section>

      {/* 3. SIMULADOR MATEMÁTICO DEL FLUJO PRISMA 2020 */}
      <Section
        eyebrow="Conciliación algebraica · Ítems 16a y 16b"
        title="El diagrama que no permite trampas."
        subtitle="Cambia cualquier número para probar el motor, o concilia todo el flujo con un clic."
        right={
          <Button variant="success" onClick={reconcileFlowCountsNow}>
            <Wand2 className="w-4 h-4" /> Auto-conciliar números
          </Button>
        }
      >
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Columna de controles */}
          <div className="lg:col-span-5 space-y-5">
            {/* Etapa 1 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Chip tone="blue">1 · Identificación (Registros)</Chip>
                <span className="text-xs text-neutral-400 font-mono">
                  Σ = {validation.totalIdentifiedDatabasesAndRegisters}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bases de datos">
                  <input
                    type="number"
                    min={0}
                    value={flowCounts.recordsIdentifiedDatabases}
                    onChange={(e) =>
                      handleNumberChange('recordsIdentifiedDatabases', e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Registros de ensayos">
                  <input
                    type="number"
                    min={0}
                    value={flowCounts.recordsIdentifiedRegisters}
                    onChange={(e) =>
                      handleNumberChange('recordsIdentifiedRegisters', e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Duplicados (−)">
                  <input
                    type="number"
                    min={0}
                    value={flowCounts.recordsDuplicatesRemoved}
                    onChange={(e) =>
                      handleNumberChange('recordsDuplicatesRemoved', e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Ineligibles IA (−)">
                  <input
                    type="number"
                    min={0}
                    value={flowCounts.recordsMarkedIneligibleAutomation}
                    onChange={(e) =>
                      handleNumberChange(
                        'recordsMarkedIneligibleAutomation',
                        e.target.value
                      )
                    }
                    className={inputCls}
                  />
                </Field>
              </div>
            </Card>

            {/* Etapa 2 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Chip tone="purple">2 · Cribado y elegibilidad</Chip>
                <StatusDot
                  ok={
                    validation.equations[0].isValid &&
                    validation.equations[1].isValid &&
                    validation.equations[2].isValid
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label={`Cribados (${validation.expectedRecordsScreened})`}
                >
                  <input
                    type="number"
                    min={0}
                    value={flowCounts.recordsScreenedTitleAbstract}
                    onChange={(e) =>
                      handleNumberChange(
                        'recordsScreenedTitleAbstract',
                        e.target.value
                      )
                    }
                    className={`${inputCls} ${
                      !validation.equations[0].isValid
                        ? 'ring-2 ring-[#ff3b30] bg-[#ff3b30]/5'
                        : ''
                    }`}
                  />
                </Field>
                <Field label="Excluidos tít/res (−)">
                  <input
                    type="number"
                    min={0}
                    value={flowCounts.recordsExcludedTitleAbstract}
                    onChange={(e) =>
                      handleNumberChange(
                        'recordsExcludedTitleAbstract',
                        e.target.value
                      )
                    }
                    className={inputCls}
                  />
                </Field>
                <Field
                  label={`Buscados (${validation.expectedReportsSought})`}
                >
                  <input
                    type="number"
                    min={0}
                    value={flowCounts.reportsSoughtForRetrieval}
                    onChange={(e) =>
                      handleNumberChange('reportsSoughtForRetrieval', e.target.value)
                    }
                    className={`${inputCls} ${
                      !validation.equations[1].isValid
                        ? 'ring-2 ring-[#ff3b30] bg-[#ff3b30]/5'
                        : ''
                    }`}
                  />
                </Field>
                <Field label="No recuperados (−)">
                  <input
                    type="number"
                    min={0}
                    value={flowCounts.reportsNotRetrieved}
                    onChange={(e) =>
                      handleNumberChange('reportsNotRetrieved', e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <Field
                  className="col-span-2"
                  label={`Evaluados a texto completo (esperado: ${validation.expectedReportsAssessed})`}
                >
                  <input
                    type="number"
                    min={0}
                    value={flowCounts.reportsAssessedForEligibility}
                    onChange={(e) =>
                      handleNumberChange(
                        'reportsAssessedForEligibility',
                        e.target.value
                      )
                    }
                    className={`${inputCls} ${
                      !validation.equations[2].isValid
                        ? 'ring-2 ring-[#ff3b30] bg-[#ff3b30]/5'
                        : ''
                    }`}
                  />
                </Field>
              </div>

              {/* Razones de exclusión */}
              <div className="mt-5 pt-5 border-t border-black/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-neutral-500">
                    Razones de exclusión (Σ = {validation.sumExcludedReasons})
                  </span>
                  <button
                    type="button"
                    onClick={addExclusionReason}
                    className="text-xs font-semibold text-[#0071e3] hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir
                  </button>
                </div>
                <div className="space-y-2">
                  {flowCounts.reportsExcludedDetailed.map((r, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        aria-label={`Motivo de exclusión ${rIdx + 1}`}
                        value={r.reasonCategory}
                        onChange={(e) =>
                          updateExclusionReason(rIdx, e.target.value, r.count)
                        }
                        className="flex-1 rounded-xl bg-[#f5f5f7] px-3 py-2 text-[13px] text-neutral-800 focus:bg-white focus:outline-none"
                      />
                      <input
                        type="number"
                        min={0}
                        aria-label={`Número de informes excluidos por: ${r.reasonCategory}`}
                        value={r.count}
                        onChange={(e) =>
                          updateExclusionReason(
                            rIdx,
                            r.reasonCategory,
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-16 rounded-xl bg-[#f5f5f7] px-2.5 py-2 text-[13px] font-semibold text-right tabular-nums focus:bg-white focus:outline-none"
                      />
                      {flowCounts.reportsExcludedDetailed.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExclusionReason(rIdx)}
                          aria-label={`Eliminar el motivo de exclusión: ${r.reasonCategory}`}
                          className="p-1.5 text-neutral-400 hover:text-[#d70015]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Etapa 3 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Chip tone="green">3 · Inclusión (Estudios ≤ Informes)</Chip>
                <StatusDot
                  ok={
                    validation.equations[3].isValid &&
                    validation.ontologyCheck.isValid
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label={`Informes (${validation.expectedReportsIncluded})`}
                >
                  <input
                    type="number"
                    min={0}
                    value={flowCounts.reportsIncludedReview}
                    onChange={(e) =>
                      handleNumberChange('reportsIncludedReview', e.target.value)
                    }
                    className={`${inputCls} ${
                      !validation.equations[3].isValid
                        ? 'ring-2 ring-[#ff3b30] bg-[#ff3b30]/5'
                        : ''
                    }`}
                  />
                </Field>
                <Field
                  label={`Estudios (≤ ${flowCounts.reportsIncludedReview})`}
                >
                  <input
                    type="number"
                    min={0}
                    value={flowCounts.studiesIncludedReview}
                    onChange={(e) =>
                      handleNumberChange('studiesIncludedReview', e.target.value)
                    }
                    className={`${inputCls} ${
                      !validation.ontologyCheck.isValid
                        ? 'ring-2 ring-[#ff3b30] bg-[#ff3b30]/5'
                        : ''
                    }`}
                  />
                </Field>
                <Field className="col-span-2" label="Estudios en metaanálisis cuantitativo">
                  <input
                    type="number"
                    min={0}
                    value={flowCounts.studiesIncludedSynthesisQuantitative ?? 0}
                    onChange={(e) =>
                      handleNumberChange(
                        'studiesIncludedSynthesisQuantitative',
                        e.target.value
                      )
                    }
                    className={inputCls}
                  />
                </Field>
              </div>
            </Card>
          </div>

          {/* Diagrama SVG */}
          <div className="lg:col-span-7">
            <PrismaFlowDiagram session={session} validation={validation} />

            {/* 4 tarjetas compactas de ecuaciones */}
            <div className="grid sm:grid-cols-2 gap-3 mt-5">
              {validation.equations.map((eq) => (
                <Card key={eq.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <StatusDot ok={eq.isValid} />
                    <div>
                      <div className="text-[13px] font-semibold text-neutral-900">
                        {eq.name.replace(/^\d+\.\s*/, '')}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        Esperado {eq.expected} · Actual {eq.actual}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {!validation.ontologyCheck.isValid && (
              <div className="mt-4 rounded-2xl bg-[#ff3b30] text-white p-4 text-sm font-medium">
                {validation.ontologyCheck.messages.map((m, i) => (
                  <div key={i}>{m}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-10">
          <Button
            onClick={() => {
              setActiveTab('module3');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Continuar a Sesgo y GRADE <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Section>
    </div>
  );
};
