import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrismaStore } from '../../store/usePrismaStore';
import {
  GradeCertaintyLevel,
  GradeDowngradeLevel,
  GradeOutcomeRow,
} from '../../types/prisma';
import { Plus, Trash2, Check, ArrowRight } from 'lucide-react';
import {
  ModuleHero,
  LearnMoreCapsule,
  Section,
  Card,
  Button,
  Chip,
  Segmented,
  Ring,
  Field,
  inputCls,
} from '../ui/ui';

const ROB_TOOLS = [
  {
    code: 'RoB 2' as const,
    subtitle: 'Ensayos aleatorizados (ECA)',
    accent: 'from-[#0071e3] to-[#5ac8fa]',
    domains: [
      'Aleatorización',
      'Desviaciones de la intervención',
      'Datos faltantes',
      'Medición del desenlace',
      'Reporte selectivo',
    ],
  },
  {
    code: 'ROBINS-I' as const,
    subtitle: 'No aleatorizados e ingeniería empírica',
    accent: 'from-[#5e5ce6] to-[#bf5af2]',
    domains: [
      'Confusión',
      'Selección de muestra',
      'Clasificación',
      'Desviaciones',
      'Datos faltantes',
      'Medición',
      'Reporte selectivo',
    ],
  },
  {
    code: 'QUADAS-2' as const,
    subtitle: 'Pruebas diagnósticas y clasificadores',
    accent: 'from-[#34c759] to-[#30d158]',
    domains: [
      'Selección de casos',
      'Prueba índice / Modelo',
      'Estándar de referencia',
      'Flujo y tiempos',
    ],
  },
];

function computeGradeCertainty(row: GradeOutcomeRow): {
  level: GradeCertaintyLevel;
  points: number;
  color: string;
  chipTone: 'green' | 'blue' | 'orange' | 'red';
} {
  const basePoints = row.studyDesign === 'RCT' ? 4 : 3;
  const totalDowngrades =
    row.riskOfBias +
    row.inconsistency +
    row.indirectness +
    row.imprecision +
    row.publicationBias;
  const finalPoints = Math.max(1, Math.min(4, basePoints + totalDowngrades));

  if (finalPoints === 4) {
    return { level: 'Alta', points: 4, color: '#34c759', chipTone: 'green' };
  }
  if (finalPoints === 3) {
    return { level: 'Moderada', points: 3, color: '#0071e3', chipTone: 'blue' };
  }
  if (finalPoints === 2) {
    return { level: 'Baja', points: 2, color: '#ff9500', chipTone: 'orange' };
  }
  return { level: 'Muy Baja', points: 1, color: '#ff3b30', chipTone: 'red' };
}

export const Module3Synthesis: React.FC = () => {
  const {
    session,
    swimItems,
    gradeRows,
    updateSynthesisAndQuality,
    updateSwimItem,
    updateGradeRow,
    addGradeRow,
    removeGradeRow,
    setActiveTab,
  } = usePrismaStore();

  const [activeSwimIdx, setActiveSwimIdx] = useState(0);

  const { synthesisAndQuality } = session;

  const toggleRobTool = (tool: 'RoB 2' | 'ROBINS-I' | 'QUADAS-2' | 'Other') => {
    const exists = synthesisAndQuality.riskOfBiasTools.includes(tool);
    const next = exists
      ? synthesisAndQuality.riskOfBiasTools.filter((t) => t !== tool)
      : [...synthesisAndQuality.riskOfBiasTools, tool];
    updateSynthesisAndQuality({
      riskOfBiasTools: next.length > 0 ? next : ['RoB 2'],
    });
  };

  const completedSwimCount = swimItems.filter(
    (it) => it.userResponse.trim().length >= 20
  ).length;
  const activeSwim = swimItems[activeSwimIdx] || swimItems[0];

  return (
    <div className="pb-12">
      <ModuleHero
        eyebrow="Módulo 3 · Evidencia"
        title="Sesgo, síntesis y certeza."
        subtitle="Elige la matriz de riesgo de sesgo correcta, aplica el protocolo SWiM de 9 pasos y gradúa la confianza con GRADE."
      />

      <LearnMoreCapsule
        raCode="RA3 · Nivel Evaluar (Bloom)"
        raText="Seleccionar matrices RoB, estructurar síntesis SWiM y calificar certeza GRADE."
        duration="20 min"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              1 · Diseño → Herramienta RoB (Ítem 11)
            </div>
            <h4 className="text-lg font-semibold mt-1">No uses escalas obsoletas</h4>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Usa <strong>RoB 2</strong> para ensayos clínicos aleatorizados, <strong>ROBINS-I</strong> para estudios cuasi-experimentales u observacionales de intervención y <strong>QUADAS-2</strong> para modelos diagnósticos o clasificadores.
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-fuchsia-400">
              2 · Directriz SWiM (Ítem 13d)
            </div>
            <h4 className="text-lg font-semibold mt-1">Prohibido contar votos por p &lt; 0.05</h4>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Cuando la heterogeneidad impide el metaanálisis, Campbell et al. (2020) exigen declarar cómo agrupaste los estudios, la métrica común y la dirección del efecto (con <em>harvest plots</em> o <em>effect direction plots</em>).
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              3 · Certeza GRADE (Ítems 15 y 22)
            </div>
            <h4 className="text-lg font-semibold mt-1">De 4 estrellas a la realidad</h4>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Cada desenlace arranca en <strong>Alta (⊕⊕⊕⊕)</strong> en ensayos aleatorizados y puede bajar 1 o 2 niveles por riesgo de sesgo, inconsistencia ($I^2$ alto), evidencia indirecta, imprecisión o sesgo de publicación.
            </p>
          </div>
        </div>
      </LearnMoreCapsule>

      {/* 1. HERRAMIENTAS DE RIESGO DE SESGO */}
      <Section
        eyebrow="Ítems 11 y 18"
        title="Cada diseño exige su propio lente."
        subtitle="Toca las herramientas que utilizaste para evaluar el riesgo de sesgo individual."
      >
        <div className="grid md:grid-cols-3 gap-6">
          {ROB_TOOLS.map((tool) => {
            const selected = synthesisAndQuality.riskOfBiasTools.includes(tool.code);
            return (
              <motion.div
                key={tool.code}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleRobTool(tool.code)}
                className={`cursor-pointer rounded-[28px] p-7 transition-all border-2 ${
                  selected
                    ? 'bg-white border-[#0071e3] shadow-[0_12px_40px_rgba(0,113,227,0.12)]'
                    : 'bg-white border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_40px_rgba(0,0,0,0.05)] opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-3xl font-bold tracking-tight bg-gradient-to-r ${tool.accent} bg-clip-text text-transparent`}
                  >
                    {tool.code}
                  </span>
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                      selected
                        ? 'bg-[#0071e3] text-white'
                        : 'bg-black/[0.05] text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-[15px] text-neutral-500 mt-1">{tool.subtitle}</p>

                <div className="flex flex-wrap gap-1.5 mt-5 pt-5 border-t border-black/5">
                  {tool.domains.map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-[#f5f5f7] px-3 py-1 text-xs font-medium text-neutral-700"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* 2. PROTOCOLO SWiM DE 9 PASOS */}
      <Section
        eyebrow="Ítem 13d · Campbell et al., 2020"
        title="Síntesis sin metaanálisis (SWiM)."
        subtitle="Cuando no puedes promediar efectos, necesitas nueve reglas formales — no un resumen libre."
        right={
          <Segmented
            size="sm"
            value={synthesisAndQuality.synthesisType}
            onChange={(synthesisType) =>
              updateSynthesisAndQuality({ synthesisType })
            }
            options={[
              { value: 'quantitative_meta_analysis', label: 'Metaanálisis' },
              { value: 'SWiM_narrative', label: 'SWiM (9 ítems)' },
              { value: 'qualitative_only', label: 'Cualitativa' },
            ]}
          />
        }
      >
        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          {/* Selector de los 9 ítems */}
          <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Directriz SWiM
                </div>
                <div className="text-lg font-semibold text-neutral-900">
                  {completedSwimCount} de 9 completados
                </div>
              </div>
              <Ring value={completedSwimCount} max={9} size={56} stroke={6} color="#34c759">
                <span className="text-xs font-bold">{completedSwimCount}/9</span>
              </Ring>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {swimItems.map((it, idx) => {
                const done = it.userResponse.trim().length >= 20;
                const active = idx === activeSwimIdx;
                return (
                  <button
                    key={it.itemNumber}
                    type="button"
                    onClick={() => setActiveSwimIdx(idx)}
                    className={`rounded-2xl p-3 text-left transition border ${
                      active
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : done
                        ? 'bg-[#34c759]/10 text-[#248a3d] border-transparent hover:bg-[#34c759]/15'
                        : 'bg-[#f5f5f7] text-neutral-700 border-transparent hover:bg-black/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">#{it.itemNumber}</span>
                      {done && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="text-[11px] font-medium mt-1 line-clamp-1 opacity-85">
                      {it.title.replace(/^\d+\.\s*/, '')}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Editor del ítem SWiM activo */}
          <Card className="lg:col-span-7 p-7 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSwim.itemNumber}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex items-center justify-between">
                  <Chip
                    tone={
                      activeSwim.userResponse.trim().length >= 20 ? 'green' : 'orange'
                    }
                  >
                    SWiM #{activeSwim.itemNumber}
                  </Chip>
                  <span className="text-xs text-neutral-400">
                    {activeSwim.userResponse.trim().length} caracteres
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-neutral-900 mt-3">
                  {activeSwim.title}
                </h3>
                <p className="text-[15px] text-neutral-500 mt-1">
                  {activeSwim.description}
                </p>

                <textarea
                  rows={4}
                  aria-label={`Respuesta SWiM ítem ${activeSwim.itemNumber}: ${activeSwim.title}`}
                  value={activeSwim.userResponse}
                  onChange={(e) =>
                    updateSwimItem(activeSwim.itemNumber, e.target.value)
                  }
                  className={`${inputCls} mt-5`}
                />
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>
      </Section>

      {/* 3. CERTEZA GRADE INTERACTIVA */}
      <Section
        eyebrow="GRADE · Ítems 15 y 22"
        title="¿Cuánto confiar en cada desenlace?"
        subtitle="Ajusta los cinco dominios y observa cómo cambia la certeza en tiempo real."
        right={
          <Button onClick={addGradeRow}>
            <Plus className="w-4 h-4" /> Añadir desenlace
          </Button>
        }
      >
        <div className="space-y-6">
          {gradeRows.map((row) => {
            const cert = computeGradeCertainty(row);
            return (
              <Card key={row.id} className="p-7">
                {/* Cabecera del desenlace con los 4 círculos animados */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-black/5">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Segmented
                        size="sm"
                        value={row.studyDesign}
                        onChange={(studyDesign) =>
                          updateGradeRow(row.id, { studyDesign })
                        }
                        options={[
                          { value: 'RCT', label: 'ECA (base 4)' },
                          { value: 'Observational', label: 'Observacional (base 3)' },
                        ]}
                      />
                      <div className="rounded-full bg-[#f5f5f7] px-3 py-1 text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                        <span>Estudios:</span>
                        <input
                          type="number"
                          min={1}
                          aria-label={`Número de estudios para: ${row.outcomeName}`}
                          value={row.numberOfStudies}
                          onChange={(e) =>
                            updateGradeRow(row.id, {
                              numberOfStudies: Math.max(
                                1,
                                parseInt(e.target.value, 10) || 1
                              ),
                            })
                          }
                          className="w-10 bg-transparent font-bold text-neutral-900 text-center focus:outline-none"
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      aria-label="Nombre del desenlace"
                      value={row.outcomeName}
                      onChange={(e) =>
                        updateGradeRow(row.id, { outcomeName: e.target.value })
                      }
                      className="w-full text-2xl font-semibold text-neutral-900 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Visualizador de certeza con 4 esferas */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map((dot) => {
                        const active = dot <= cert.points;
                        return (
                          <motion.span
                            key={dot}
                            animate={{
                              scale: active ? 1 : 0.85,
                              backgroundColor: active ? cert.color : '#e5e5ea',
                            }}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-sm"
                          >
                            +
                          </motion.span>
                        );
                      })}
                    </div>
                    <div className="text-right min-w-[90px]">
                      <Chip tone={cert.chipTone}>{cert.level}</Chip>
                    </div>
                    {gradeRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGradeRow(row.id)}
                        aria-label={`Eliminar el desenlace: ${row.outcomeName}`}
                        className="w-9 h-9 rounded-full bg-black/[0.04] hover:bg-[#ff3b30]/10 text-neutral-400 hover:text-[#d70015] flex items-center justify-center transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 5 dominios GRADE con píldoras segmentadas */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                  {(
                    [
                      ['riskOfBias', 'Riesgo de sesgo'],
                      ['inconsistency', 'Inconsistencia'],
                      ['indirectness', 'Evidencia indirecta'],
                      ['imprecision', 'Imprecisión'],
                    ] as const
                  ).map(([field, label]) => (
                    <div
                      key={field}
                      className="rounded-2xl bg-[#f5f5f7] p-3.5 flex flex-col justify-between gap-2"
                    >
                      <span className="text-xs font-semibold text-neutral-600">
                        {label}
                      </span>
                      <Segmented
                        size="sm"
                        value={row[field]}
                        onChange={(v) =>
                          updateGradeRow(row.id, {
                            [field]: v as GradeDowngradeLevel,
                          })
                        }
                        options={[
                          { value: 0, label: '0' },
                          { value: -1, label: '−1' },
                          { value: -2, label: '−2' },
                        ]}
                      />
                    </div>
                  ))}

                  <div className="rounded-2xl bg-[#f5f5f7] p-3.5 flex flex-col justify-between gap-2">
                    <span className="text-xs font-semibold text-neutral-600">
                      Sesgo de publicación
                    </span>
                    <Segmented
                      size="sm"
                      value={row.publicationBias}
                      onChange={(v) =>
                        updateGradeRow(row.id, { publicationBias: v as 0 | -1 })
                      }
                      options={[
                        { value: 0, label: '0' },
                        { value: -1, label: '−1' },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <Field label="Efecto sintetizado (IC 95%)">
                    <input
                      type="text"
                      value={row.effectSummary}
                      onChange={(e) =>
                        updateGradeRow(row.id, { effectSummary: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end mt-10">
          <Button
            onClick={() => {
              setActiveTab('module4');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Continuar a Auditoría de 42 Sub-ítems <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Section>
    </div>
  );
};
