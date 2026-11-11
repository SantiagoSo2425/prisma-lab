import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

/* ------------------------------------------------------------------ */
/* Utilidades de scroll                                                */
/* ------------------------------------------------------------------ */

function useSectionProgress() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  return { ref, p: scrollYProgress };
}

/** Opacidad visible únicamente dentro de la ventana [start, end] del progreso. */
function useWindow(p: MotionValue<number>, start: number, end: number, edge = 0.06) {
  const input =
    start <= 0
      ? [0, end, end + edge]
      : end >= 1
      ? [start - edge, start, 1]
      : [start - edge, start, end, end + edge];
  const output = start <= 0 ? [1, 1, 0] : end >= 1 ? [0, 1, 1] : [0, 1, 1, 0];
  return useTransform(p, input, output);
}

function Caption({
  p,
  start,
  end,
  eyebrow,
  number,
  title,
  text,
  gradient,
}: {
  p: MotionValue<number>;
  start: number;
  end: number;
  eyebrow: string;
  number: string;
  title: string;
  text: string;
  gradient: string;
}) {
  const opacity = useWindow(p, start, end);
  const y = useTransform(opacity, [0, 1], [24, 0]);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center">
      <span className="text-sm font-semibold tracking-wide text-white/50 uppercase">{eyebrow}</span>
      <div className={`text-[96px] md:text-[128px] leading-none font-bold tracking-tighter bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {number}
      </div>
      <h3 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mt-1">{title}</h3>
      <p className="text-lg md:text-xl text-white/60 mt-4 max-w-md">{text}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Ontología: Registros → Informes → Estudios                       */
/* ------------------------------------------------------------------ */

const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const DOTS = Array.from({ length: 36 }, (_, i) => {
  const report = i % 12;
  const study = Math.floor(report / 3);
  const k = report % 3;
  const angle = (k / 3) * Math.PI * 2 - Math.PI / 2;
  return {
    x0: 55 + (i % 9) * 61 + (rand(i) - 0.5) * 34,
    y0: 70 + Math.floor(i / 9) * 82 + (rand(i + 99) - 0.5) * 34,
    x1: 72 + (report % 6) * 91,
    y1: 140 + Math.floor(report / 6) * 120,
    x2: 90 + study * 140 + Math.cos(angle) * 24,
    y2: 200 + Math.sin(angle) * 24,
  };
});

function Dot({ d, p }: { d: (typeof DOTS)[number]; p: MotionValue<number> }) {
  const stops = [0, 0.2, 0.38, 0.56, 0.74, 1];
  const cx = useTransform(p, stops, [d.x0, d.x0, d.x1, d.x1, d.x2, d.x2]);
  const cy = useTransform(p, stops, [d.y0, d.y0, d.y1, d.y1, d.y2, d.y2]);
  const r = useTransform(p, [0.2, 0.38, 0.56, 0.74], [7, 16, 16, 10]);
  const fill = useTransform(p, [0.2, 0.38, 0.56, 0.74], ['#0a84ff', '#bf5af2', '#bf5af2', '#30d158']);
  return <motion.circle cx={cx} cy={cy} r={r} fill={fill} fillOpacity={0.85} />;
}

function StudyRing({ index, p }: { index: number; p: MotionValue<number> }) {
  const opacity = useTransform(p, [0.68, 0.8], [0, 1]);
  const r = useTransform(p, [0.68, 0.8], [30, 52]);
  return (
    <motion.circle
      cx={90 + index * 140}
      cy={200}
      r={r}
      fill="none"
      stroke="#30d158"
      strokeWidth={2}
      strokeDasharray="4 6"
      style={{ opacity }}
    />
  );
}

export function OntologySection() {
  const { ref, p } = useSectionProgress();
  return (
    <section id="ontologia" ref={ref} className="relative h-[340vh] bg-black">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-6 grid md:grid-cols-2 gap-8 items-center">
          <div className="relative h-[380px]">
            <Caption
              p={p}
              start={0}
              end={0.24}
              eyebrow="Lo que devuelven las bases"
              number="36"
              title="Registros."
              text="Entradas crudas de Scopus, PubMed o IEEE. Muchas son la misma cosa repetida."
              gradient="from-sky-400 to-blue-600"
            />
            <Caption
              p={p}
              start={0.32}
              end={0.58}
              eyebrow="Sin duplicados"
              number="12"
              title="Informes."
              text="Documentos únicos: artículos, preprints, tesis, reportes."
              gradient="from-fuchsia-400 to-purple-600"
            />
            <Caption
              p={p}
              start={0.68}
              end={1}
              eyebrow="La investigación real"
              number="4"
              title="Estudios."
              text="Varios informes pueden describir un mismo estudio. Por eso siempre: Estudios ≤ Informes."
              gradient="from-emerald-400 to-green-600"
            />
          </div>

          <svg viewBox="0 0 600 400" className="w-full" aria-label="Animación de registros que se agrupan en informes y estudios">
            {[0, 1, 2, 3].map((i) => (
              <StudyRing key={i} index={i} p={p} />
            ))}
            {DOTS.map((d, i) => (
              <Dot key={i} d={d} p={p} />
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Embudo PRISMA con conteo animado                                 */
/* ------------------------------------------------------------------ */

const STAGES = [
  { label: 'Identificados', value: 1450, color: 'from-sky-400 to-blue-600', note: '' },
  { label: 'Cribados', value: 950, color: 'from-indigo-400 to-violet-600', note: '−500 duplicados e IA' },
  { label: 'Texto completo', value: 134, color: 'from-fuchsia-400 to-purple-600', note: '−816 por título/resumen y no recuperados' },
  { label: 'Incluidos', value: 28, color: 'from-emerald-400 to-green-600', note: '−106, cada uno con su razón' },
];

function FunnelBar({ stage, index, p }: { stage: (typeof STAGES)[number]; index: number; p: MotionValue<number> }) {
  const start = 0.06 + index * 0.18;
  const scaleX = useTransform(p, [start, start + 0.12], [0, 1]);
  const opacity = useTransform(p, [start, start + 0.06], [0, 1]);
  const width = Math.max(5, (stage.value / 1450) * 100);
  return (
    <motion.div style={{ opacity }} className="space-y-1.5">
      {stage.note && (
        <div className="text-center text-xs md:text-sm font-medium text-rose-500">{stage.note}</div>
      )}
      <div className="flex items-center gap-4">
        <div className="w-28 md:w-36 text-right text-sm md:text-base text-neutral-500">{stage.label}</div>
        <div className="flex-1 flex justify-center">
          <motion.div
            style={{ scaleX, width: `${width}%` }}
            className={`h-10 md:h-12 rounded-full bg-gradient-to-r ${stage.color} shadow-lg shadow-black/10`}
          />
        </div>
        <div className="w-16 md:w-20 text-lg md:text-xl font-semibold tabular-nums text-neutral-900">
          {stage.value.toLocaleString('es-CO')}
        </div>
      </div>
    </motion.div>
  );
}

export function FunnelSection() {
  const { ref, p } = useSectionProgress();
  const count = useTransform(p, [0.06, 0.3, 0.48, 0.66], [1450, 950, 134, 28]);
  const countText = useTransform(count, (v) => Math.round(v).toLocaleString('es-CO'));
  const okOpacity = useTransform(p, [0.8, 0.88], [0, 1]);
  const okScale = useTransform(p, [0.8, 0.88], [0.9, 1]);

  return (
    <section id="flujo" ref={ref} className="relative h-[300vh] bg-[#f5f5f7]">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="max-w-5xl mx-auto w-full px-6">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-violet-600">El diagrama de flujo</span>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-neutral-900 mt-2">
              Cada número cuenta.
            </h2>
            <motion.div className="text-6xl md:text-8xl font-bold tracking-tighter text-neutral-900 tabular-nums mt-4">
              {countText}
            </motion.div>
          </div>

          <div className="space-y-4">
            {STAGES.map((s, i) => (
              <FunnelBar key={s.label} stage={s} index={i} p={p} />
            ))}
          </div>

          <motion.div style={{ opacity: okOpacity, scale: okScale }} className="mt-10 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-xl shadow-black/5 border border-black/5">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">✓</span>
              <span className="text-neutral-800 font-medium">Todo cuadra. Si no cuadra, no se exporta.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Reportar ≠ Hacerlo bien (PRISMA vs AMSTAR 2)                     */
/* ------------------------------------------------------------------ */

const CHECK_ROWS = ['Protocolo', 'Búsqueda', 'Selección', 'Exclusiones', 'Riesgo de sesgo', 'Síntesis', 'Conclusiones'];

function CheckRow({ label, index, p }: { label: string; index: number; p: MotionValue<number> }) {
  const start = 0.12 + index * 0.07;
  const bg = useTransform(p, [start, start + 0.04], ['rgba(255,255,255,0.08)', '#30d158']);
  const scale = useTransform(p, [start, start + 0.02, start + 0.04], [1, 1.25, 1]);
  const textOpacity = useTransform(p, [start, start + 0.04], [0.4, 1]);
  return (
    <div className="flex items-center gap-3 py-2">
      <motion.span style={{ backgroundColor: bg, scale }} className="w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-bold text-black">
        ✓
      </motion.span>
      <motion.span style={{ opacity: textOpacity }} className="text-white text-base">
        {label}
      </motion.span>
    </div>
  );
}

export function QualitySection() {
  const { ref, p } = useSectionProgress();
  const C = 2 * Math.PI * 70;
  const dash = useTransform(p, [0.3, 0.85], [0, C * 0.86]);
  const stroke = useTransform(p, [0.3, 0.85], ['#30d158', '#ff453a']);
  const highOpacity = useTransform(p, [0.5, 0.6], [1, 0]);
  const lowOpacity = useTransform(p, [0.6, 0.7], [0, 1]);
  const titleOpacity = useTransform(p, [0, 0.08], [0, 1]);

  return (
    <section id="calidad" ref={ref} className="relative h-[280vh] bg-black">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-6">
          <motion.div style={{ opacity: titleOpacity }} className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white">
              Reportarlo <span className="text-white/60">no es</span> hacerlo bien.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-[32px] bg-white/[0.06] border border-white/10 p-8 backdrop-blur">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-2xl font-semibold text-white">PRISMA 2020</h3>
                <span className="text-sm text-white/50">¿Lo contaste?</span>
              </div>
              {CHECK_ROWS.map((r, i) => (
                <CheckRow key={r} label={r} index={i} p={p} />
              ))}
            </div>

            <div className="rounded-[32px] bg-white/[0.06] border border-white/10 p-8 backdrop-blur flex flex-col">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-2xl font-semibold text-white">AMSTAR 2</h3>
                <span className="text-sm text-white/50">¿Lo hiciste bien?</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                    <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
                    <motion.circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={C}
                      style={{ strokeDashoffset: dash, stroke }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-center">
                    <motion.div style={{ opacity: highOpacity }} className="absolute">
                      <div className="text-4xl font-bold text-emerald-400">Alta</div>
                      <div className="text-white/50 text-sm mt-1">confianza</div>
                    </motion.div>
                    <motion.div style={{ opacity: lowOpacity }} className="absolute">
                      <div className="text-3xl font-bold text-rose-500 leading-tight">Críticamente<br />baja</div>
                      <div className="text-white/50 text-sm mt-1">5 fallas críticas</div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Certeza GRADE                                                    */
/* ------------------------------------------------------------------ */

const DOMAINS = [
  { label: 'Riesgo de sesgo', down: false },
  { label: 'Inconsistencia', down: true },
  { label: 'Evidencia indirecta', down: false },
  { label: 'Imprecisión', down: true },
  { label: 'Sesgo de publicación', down: false },
];

function DomainChip({ d, index, p }: { d: (typeof DOMAINS)[number]; index: number; p: MotionValue<number> }) {
  const start = 0.1 + index * 0.14;
  const opacity = useTransform(p, [start, start + 0.06], [0.25, 1]);
  const y = useTransform(p, [start, start + 0.06], [10, 0]);
  return (
    <motion.div
      style={{ opacity, y }}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border ${
        d.down ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-black/5 text-neutral-700'
      }`}
    >
      <span>{d.down ? '↓' : '✓'}</span>
      {d.label}
    </motion.div>
  );
}

function CertaintyDot({ index, p }: { index: number; p: MotionValue<number> }) {
  // Se apaga el 4º círculo con "Inconsistencia" y el 3º con "Imprecisión"
  const offAt = index === 3 ? 0.3 : index === 2 ? 0.58 : 2;
  const fill = useTransform(p, [offAt, offAt + 0.06], ['#0a84ff', '#e5e5ea']);
  const scale = useTransform(p, [offAt, offAt + 0.03, offAt + 0.06], [1, 0.8, 1]);
  return (
    <motion.div
      style={{ backgroundColor: fill, scale }}
      className="w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-3xl md:text-5xl font-light shadow-lg shadow-black/5"
    >
      +
    </motion.div>
  );
}

export function GradeSection() {
  const { ref, p } = useSectionProgress();
  const high = useWindow(p, 0, 0.3, 0.04);
  const mod = useWindow(p, 0.34, 0.58, 0.04);
  const low = useWindow(p, 0.62, 1, 0.04);
  return (
    <section id="certeza" ref={ref} className="relative h-[280vh] bg-white">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="max-w-5xl mx-auto w-full px-6 text-center">
          <span className="text-sm font-semibold text-blue-600">GRADE</span>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-neutral-900 mt-2">
            ¿Cuánto confiar en la evidencia?
          </h2>

          <div className="flex justify-center gap-4 md:gap-6 mt-14">
            {[0, 1, 2, 3].map((i) => (
              <CertaintyDot key={i} index={i} p={p} />
            ))}
          </div>

          <div className="relative h-16 mt-8">
            <motion.div style={{ opacity: high }} className="absolute inset-0 text-4xl md:text-5xl font-bold text-blue-600">Alta</motion.div>
            <motion.div style={{ opacity: mod }} className="absolute inset-0 text-4xl md:text-5xl font-bold text-amber-500">Moderada</motion.div>
            <motion.div style={{ opacity: low }} className="absolute inset-0 text-4xl md:text-5xl font-bold text-rose-500">Baja</motion.div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {DOMAINS.map((d, i) => (
              <DomainChip key={d.label} d={d} index={i} p={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
