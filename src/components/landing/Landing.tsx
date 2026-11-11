import React, { useRef } from 'react';
import ovaConfig from '../../data/ova.config.json';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  ClipboardList,
  Scale,
  Calculator,
  GitMerge,
  CheckSquare,
  Award,
} from 'lucide-react';
import { ActiveTabId } from '../../types/prisma';
import { OntologySection, FunnelSection, QualitySection, GradeSection } from './StorySections';

interface LandingProps {
  onEnter: (tab?: ActiveTabId) => void;
}

const SPECTRUM = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#0a84ff', '#5e5ce6', '#bf5af2'];

export function PrismLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5ac8fa" />
          <stop offset="0.5" stopColor="#bf5af2" />
          <stop offset="1" stopColor="#ff375f" />
        </linearGradient>
      </defs>
      <path d="M12 3 L21 20 H3 Z" fill="none" stroke="url(#logo-g)" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------------------- Navegación ---------------------------- */

function TopNav({ onEnter }: LandingProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const links = [
    ['Ontología', '#ontologia'],
    ['Flujo', '#flujo'],
    ['Calidad', '#calidad'],
    ['Certeza', '#certeza'],
    ['Módulos', '#modulos'],
  ];
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="backdrop-blur-xl bg-black/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto h-12 px-5 flex items-center justify-between text-[13px]">
          <a href="#top" className="flex items-center gap-2 font-semibold text-white">
            <PrismLogo />
            PRISMA-Lab
          </a>
          <nav className="hidden md:flex gap-8 text-white/70">
            {links.map(([label, href]) => (
              <a key={href} href={href} className="hover:text-white transition-colors">
                {label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => onEnter()}
            className="rounded-full bg-white text-black px-4 py-1 text-xs font-semibold hover:bg-white/90 transition"
          >
            Entrar
          </button>
        </div>
      </div>
      <motion.div style={{ scaleX }} className="h-[2px] origin-left bg-gradient-to-r from-sky-400 via-violet-500 to-pink-500" />
    </header>
  );
}

/* ------------------------------- Hero ------------------------------- */

function Beam({ color, index, spread }: { color: string; index: number; spread: MotionValue<number> }) {
  const y2 = useTransform(spread, (s) => 185 + (index - 3) * s);
  return (
    <motion.line
      x1={352}
      y1={160}
      x2={640}
      y2={y2}
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.95 }}
      transition={{ delay: 1.1 + index * 0.07, duration: 0.9, ease: 'easeOut' }}
    />
  );
}

function Hero({ onEnter }: LandingProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const spread = useTransform(scrollYProgress, [0, 1], [12, 46]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section id="top" ref={ref} className="relative h-[130vh] bg-black">
      <motion.div style={{ scale, opacity, y }} className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 pt-12">
        {/* Halo de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
        </div>

        <svg viewBox="0 0 640 320" className="relative w-full max-w-3xl" aria-hidden="true">
          <defs>
            <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.03" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <motion.line
            x1={0}
            y1={212}
            x2={242}
            y2={172}
            stroke="#ffffff"
            strokeWidth={3.5}
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
          <g filter="url(#glow)">
            {SPECTRUM.map((c, i) => (
              <Beam key={c} color={c} index={i} spread={spread} />
            ))}
          </g>
          <motion.polygon
            points="300,50 405,245 195,245"
            fill="url(#glass)"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          />
        </svg>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="relative text-6xl md:text-8xl font-semibold tracking-tighter text-white mt-4"
        >
          PRISMA-Lab
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9 }}
          className="relative text-2xl md:text-3xl font-medium text-gradient-prism mt-3 text-center"
        >
          Revisiones sistemáticas. Sin un número fuera de lugar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="relative flex flex-wrap items-center justify-center gap-4 mt-9"
        >
          <button
            type="button"
            onClick={() => onEnter('pretest')}
            className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-7 py-3 text-base font-medium transition inline-flex items-center gap-2"
          >
            Empezar <ArrowRight className="w-4 h-4" />
          </button>
          <a href="#ontologia" className="text-[#2997ff] hover:underline text-base font-medium">
            Descubrir cómo funciona ›
          </a>
        </motion.div>

        <motion.div
          className="absolute bottom-10 text-white/60"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------------------- Intro de frase grande ----------------------- */

function Statement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const words = 'Del caos de miles de resultados a un puñado de estudios en los que puedes confiar.'.split(' ');
  return (
    <section ref={ref} className="bg-black py-40 px-6">
      <p className="max-w-4xl mx-auto text-3xl md:text-6xl font-semibold tracking-tight leading-tight text-center flex flex-wrap justify-center gap-x-3 gap-y-1">
        {words.map((w, i) => (
          <Word key={i} p={scrollYProgress} start={i / words.length} end={(i + 1) / words.length}>
            {w}
          </Word>
        ))}
      </p>
    </section>
  );
}

function Word({ children, p, start, end }: { children: React.ReactNode; p: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(p, [start, end], [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="text-white">
      {children}
    </motion.span>
  );
}

/* ---------------------- Carrusel horizontal ------------------------- */

const MODULES: Array<{
  tab: ActiveTabId;
  tag: string;
  title: string;
  line: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}> = [
  { tab: 'pretest', tag: 'Paso 0', title: 'Diagnóstico', line: '10 preguntas para saber dónde estás.', icon: ClipboardList, gradient: 'from-slate-700 to-slate-900' },
  { tab: 'module1', tag: 'Módulo 1', title: 'Fundamentos', line: 'PRISMA vs AMSTAR 2. PICO. Registro.', icon: Scale, gradient: 'from-sky-500 to-blue-700' },
  { tab: 'module2', tag: 'Módulo 2', title: 'Búsqueda y flujo', line: 'Booleanos, IA y el diagrama vivo.', icon: Calculator, gradient: 'from-violet-500 to-indigo-700' },
  { tab: 'module3', tag: 'Módulo 3', title: 'Sesgo y certeza', line: 'RoB 2, SWiM y GRADE.', icon: GitMerge, gradient: 'from-fuchsia-500 to-purple-700' },
  { tab: 'module4', tag: 'Módulo 4', title: 'Auditoría', line: '42 sub-ítems y ciencia abierta.', icon: CheckSquare, gradient: 'from-rose-500 to-pink-700' },
  { tab: 'posttest_lori', tag: 'Final', title: 'Evaluación', line: 'Mide cuánto aprendiste.', icon: Award, gradient: 'from-emerald-500 to-green-700' },
];

function ModulesCarousel({ onEnter }: LandingProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], ['0%', '-62%']);

  return (
    <section id="modulos" ref={ref} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-6 mb-10">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white">
            Seis pasos. <span className="text-white/60">Un laboratorio.</span>
          </h2>
        </div>
        <motion.div style={{ x }} className="flex gap-6 pl-6 md:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <motion.button
                key={m.tab}
                type="button"
                onClick={() => onEnter(m.tab)}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className={`shrink-0 w-[300px] md:w-[360px] h-[440px] rounded-[36px] bg-gradient-to-br ${m.gradient} p-8 text-left flex flex-col justify-between relative overflow-hidden group`}
              >
                <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition" />
                <div>
                  <span className="text-sm font-semibold text-white/70">{m.tag}</span>
                  <h3 className="text-3xl font-semibold text-white mt-1">{m.title}</h3>
                  <p className="text-white/80 mt-2 text-lg">{m.line}</p>
                </div>
                <div className="flex items-end justify-between relative">
                  <Icon className="w-24 h-24 text-white/90" />
                  <span className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition">
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------- CTA ------------------------------- */

function FinalCta({ onEnter }: LandingProps) {
  return (
    <section className="relative bg-black py-40 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r from-sky-500/30 via-violet-500/30 to-pink-500/30 blur-[120px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="relative text-center max-w-3xl mx-auto"
      >
        <PrismLogo className="w-14 h-14 mx-auto mb-6" />
        <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white">
          Tu turno.
        </h2>
        <p className="text-xl md:text-2xl text-white/60 mt-4">Entra, rompe el diagrama y vuelve a cuadrarlo.</p>
        <button
          type="button"
          onClick={() => onEnter('module2')}
          className="mt-10 rounded-full bg-white text-black px-8 py-4 text-lg font-semibold hover:scale-105 transition inline-flex items-center gap-2"
        >
          Abrir el laboratorio <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
      <footer className="relative mt-32 text-center text-xs text-white/60">
        <p>
          {ovaConfig.shortTitle} · OVA v{ovaConfig.version} · PRISMA 2020 · IEEE LOM-CO · SCORM 1.2 · {ovaConfig.license.spdx}
        </p>
        <p className="mt-2">
          Autoría: {ovaConfig.authors.map((a) => a.name).join(', ')} · {ovaConfig.institution.name}
        </p>
      </footer>
    </section>
  );
}

/* ------------------------------ Landing ----------------------------- */

export function Landing({ onEnter }: LandingProps) {
  return (
    <div className="bg-black text-white selection:bg-violet-500/40">
      <TopNav onEnter={onEnter} />
      <Hero onEnter={onEnter} />
      <Statement />
      <OntologySection />
      <FunnelSection />
      <QualitySection />
      <GradeSection />
      <ModulesCarousel onEnter={onEnter} />
      <FinalCta onEnter={onEnter} />
    </div>
  );
}
