import React, { useState } from 'react';
import ovaConfig from '../../data/ova.config.json';
import { computeLmsResult, MASTERY_SCORE } from '../../core/scoring';
import { usePrismaStore } from '../../store/usePrismaStore';
import { useOvaProgress } from '../../core/ovaProgress';
import { PrePostAssessment } from './PrePostAssessment';
import { Send, Check, Award } from 'lucide-react';
import { Section, Card, Button, Chip, Segmented, Ring } from '../ui/ui';

const LORI_CRITERIA = [
  { key: 'contentQuality', title: 'Calidad de contenido', desc: 'Rigor matemático PRISMA 2020 y deslinde frente a AMSTAR 2.' },
  { key: 'learningGoalAlignment', title: 'Alineación pedagógica', desc: 'Coherencia entre objetivos RA1–RA4, simuladores y Pre/Post.' },
  { key: 'feedbackAndAdaptation', title: 'Retroalimentación viva', desc: 'Detección instantánea de fugas de balance y errores booleanos.' },
  { key: 'motivation', title: 'Motivación', desc: 'Casos aplicados reales en ingeniería de software y salud.' },
  { key: 'presentationDesign', title: 'Diseño visual', desc: 'Claridad visual, animaciones guiadas y diagrama interactivo.' },
  { key: 'interactionUsability', title: 'Usabilidad', desc: 'Navegación intuitiva y conciliación en un clic.' },
  { key: 'accessibility', title: 'Accesibilidad', desc: 'Teclado, etiquetas y alto contraste (WCAG 2.1 AA / NTC 5854).' },
  { key: 'reusability', title: 'Reusabilidad', desc: 'Autónomo y portable entre cursos y plataformas LMS.' },
  { key: 'standardsCompliance', title: 'Estándares', desc: 'Cumplimiento IEEE LOM-CO y SCORM 1.2.' },
];

const SUS_ITEMS = [
  'Usaría PRISMA-Lab con frecuencia para mis revisiones sistemáticas.',
  'Encontré PRISMA-Lab innecesariamente complejo.',
  'Me pareció fácil de usar.',
  'Necesitaría ayuda técnica para poder utilizarlo.',
  'Las funciones (flujo, PRISMA-S, SWiM, GRADE) están bien integradas.',
  'Sentí que había demasiada inconsistencia en el sistema.',
  'La mayoría aprendería a usarlo muy rápido.',
  'Lo encontré engorroso de utilizar.',
  'Me sentí seguro auditando mi revisión con esta herramienta.',
  'Tuve que aprender muchas cosas antes de poder empezar.',
];

const LOM_CARDS = [
  ['Título', ovaConfig.title],
  ['Autoría', ovaConfig.authors.map((a) => a.name).join(', ')],
  ['Institución', ovaConfig.institution.name],
  ['Idioma / Versión', `Español (es) · v${ovaConfig.version} (${ovaConfig.statusLabel})`],
  ['Interactividad', 'Activa · Nivel muy alto'],
  ['Tipo de recurso', ovaConfig.educational.learningResourceTypeLabel],
  ['Población objetivo', ovaConfig.educational.audience],
  ['Tiempo típico', ovaConfig.educational.typicalLearningTimeLabel],
  ['Derechos y licencia', `${ovaConfig.license.name} · Sin costo`],
  ['Clasificación', ovaConfig.classification.taxonPath.map((t) => t.entry).join(' → ')],
  ['Estándar LMS', 'SCORM 1.2 · IEEE LOM 1484.12.1 (perfil LOM-CO)'],
];

const SCALE_OPTIONS = [1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) }));

export const QualityEvaluation: React.FC = () => {
  const {
    loriScores,
    susResponses,
    setLoriScore,
    setSusResponse,
    syncScormToLms,
    postTestAnswers,
    postTestSubmitted,
  } = usePrismaStore();

  const progress = useOvaProgress();

  const [subTab, setSubTab] = useState<'post' | 'lori_sus' | 'scorm'>('post');
  const [scormMsg, setScormMsg] = useState<string | null>(null);

  const { loriAvg, susScore } = progress;

  const lmsResult = computeLmsResult(postTestAnswers, postTestSubmitted);
  const statusLabel =
    lmsResult.lessonStatus === 'passed'
      ? 'aprobado'
      : lmsResult.lessonStatus === 'failed'
      ? 'no aprobado'
      : 'en curso (falta enviar el post-test)';

  const handleReportScorm = () => {
    const ok = syncScormToLms();
    setScormMsg(
      ok
        ? `Enviado al LMS: nota del post-test ${lmsResult.scoreRaw}/100, estado ${statusLabel}.`
        : `No hay un LMS conectado. Tu progreso queda guardado en este navegador (post-test ${lmsResult.scoreRaw}/100, ${statusLabel}).`
    );
  };

  return (
    <div className="pb-12">
      {/* Selector superior de sub-vista */}
      <div className="flex justify-center pt-4 pb-6">
        <Segmented
          value={subTab}
          onChange={setSubTab}
          options={[
            { value: 'post', label: '1 · Post-Test' },
            { value: 'lori_sus', label: '2 · Calidad LORI y Usabilidad SUS' },
            { value: 'scorm', label: '3 · Progreso, LOM-CO y SCORM' },
          ]}
        />
      </div>

      {subTab === 'post' && <PrePostAssessment phase="post" />}

      {subTab === 'lori_sus' && (
        <div className="space-y-16 pt-4">
          {/* LORI */}
          <Section
            eyebrow="Learning Object Review Instrument"
            title="Calidad del objeto (LORI)."
            subtitle="Evalúa las 9 dimensiones del recurso en escala de 1 a 5. Valora el objeto; no forma parte de tu calificación."
            right={
              <div className="flex items-center gap-3">
                <Ring value={loriAvg ?? 0} max={5} size={64} stroke={6} color="#0071e3">
                  <span className="text-xs font-bold">{loriAvg === null ? '—' : loriAvg.toFixed(1)}</span>
                </Ring>
              </div>
            }
          >
            <div className="grid md:grid-cols-3 gap-5">
              {LORI_CRITERIA.map((c) => {
                const val = loriScores[c.key] ?? 0;
                return (
                  <Card key={c.key} className="p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {c.title}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1 leading-snug">
                        {c.desc}
                      </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-black/5 flex items-center justify-between">
                      <span className="text-xs text-neutral-400">Puntaje</span>
                      <Segmented
                        size="sm"
                        value={val}
                        onChange={(num) => setLoriScore(c.key, num)}
                        ariaLabel={`Puntaje LORI: ${c.title}`}
                        options={SCALE_OPTIONS}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </Section>

          {/* SUS */}
          <Section
            eyebrow="System Usability Scale · Meta DoD ≥ 75"
            title="Escala de usabilidad (SUS)."
            subtitle="1 = en desacuerdo · 5 = totalmente de acuerdo. Mide la usabilidad del OVA; no afecta tu calificación."
            right={
              <div className="flex items-center gap-3">
                <Chip tone={susScore === null ? 'neutral' : susScore >= 75 ? 'green' : 'orange'}>
                  {susScore === null
                    ? 'Responde los 10 ítems'
                    : susScore >= 75
                    ? '✓ Supera la meta ≥ 75'
                    : 'Meta: 75 pts'}
                </Chip>
                <Ring
                  value={susScore ?? 0}
                  max={100}
                  size={68}
                  stroke={6}
                  color={susScore !== null && susScore >= 75 ? '#34c759' : '#ff9500'}
                >
                  <span className="text-xs font-bold">{susScore === null ? '—' : susScore.toFixed(0)}</span>
                </Ring>
              </div>
            }
          >
            <Card className="divide-y divide-black/5 overflow-hidden">
              {SUS_ITEMS.map((text, idx) => {
                const currentVal = susResponses[idx] ?? 0;
                return (
                  <div
                    key={idx}
                    className="p-5 flex flex-wrap items-center justify-between gap-4"
                  >
                    <span className="text-[15px] text-neutral-800 max-w-xl">
                      <span className="text-neutral-400 font-mono mr-2">
                        {idx + 1}.
                      </span>
                      {text}
                    </span>
                    <Segmented
                      size="sm"
                      value={currentVal}
                      onChange={(v) => setSusResponse(idx, v)}
                      ariaLabel={`Ítem SUS ${idx + 1}: ${text}`}
                      options={SCALE_OPTIONS}
                    />
                  </div>
                );
              })}
            </Card>
          </Section>
        </div>
      )}

      {subTab === 'scorm' && (
        <div className="pt-4 space-y-16">
          {/* PROGRESO Y CALIFICACIÓN DEL OVA */}
          <Section
            eyebrow="Progreso en el OVA · SCORM 1.2"
            title="Tu avance y calificación."
            subtitle="Resultados Pre/Post, ganancia de Hake y etapas completadas. La nota que recibe el LMS es la del post-test."
          >
            <Card className="p-7 md:p-9 bg-gradient-to-br from-neutral-900 via-neutral-900 to-indigo-950 text-white">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-sky-300">
                    <Award className="w-4 h-4" />
                    {progress.completedStepsCount} de 6 etapas del OVA completadas
                  </div>
                  <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">
                    Post-test: {lmsResult.scoreRaw}/100 · {statusLabel}.
                  </h3>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button onClick={handleReportScorm}>
                      <Send className="w-4 h-4" /> Enviar nota al LMS
                    </Button>
                  </div>
                  <p className="text-sm text-white/70">
                    La calificación del OVA es el porcentaje de aciertos del post-test. Se aprueba con {MASTERY_SCORE} o más.
                  </p>
                </div>

                <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
                  <Ring
                    value={progress.completedStepsCount}
                    max={6}
                    size={164}
                    stroke={14}
                    color="#34c759"
                  >
                    <div className="text-4xl font-bold text-white">
                      {progress.overallPct}%
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">
                      avance OVA
                    </div>
                  </Ring>
                  <div className="grid grid-cols-2 gap-3 w-full mt-6 text-xs">
                    <div className="rounded-2xl bg-white/[0.07] p-3">
                      <div className="text-lg font-bold text-emerald-400">
                        g = {progress.hakeGain.toFixed(2)}
                      </div>
                      <div className="text-white/50">Ganancia Hake</div>
                    </div>
                    <div className="rounded-2xl bg-white/[0.07] p-3">
                      <div className="text-lg font-bold text-sky-400">
                        {progress.validSubItemsCount}/42
                      </div>
                      <div className="text-white/50">Sub-ítems OK</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Section>

          {/* METADATOS IEEE LOM-CO */}
          <Section
            eyebrow="IEEE Std 1484.12.1-2002 · LOM-CO · SCORM 1.2"
            title="Ficha técnica de metadatos educativos."
            subtitle="Resumen de los metadatos según el perfil LOM-CO del Ministerio de Educación Nacional. El registro completo está en lom-metadata.xml, dentro del paquete SCORM."
          >
            {scormMsg && (
              <Card role="status" className="p-4 mb-6 bg-[#34c759]/10 border border-[#34c759]/20 flex items-center gap-3 text-sm font-medium text-[#248a3d]">
                <Check className="w-4 h-4 shrink-0" />
                {scormMsg}
              </Card>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LOM_CARDS.map(([label, value]) => (
                <Card key={label} className="p-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {label}
                  </div>
                  <div className="text-[16px] font-semibold text-neutral-900 mt-2 leading-snug">
                    {value}
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
};
