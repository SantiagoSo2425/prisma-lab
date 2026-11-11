import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Compass, Layers, GraduationCap, ListChecks, ShieldCheck, Users } from 'lucide-react';
import { Segmented, Chip } from '../ui/ui';
import ovaConfig from '../../data/ova.config.json';

type GuideTab = 'start' | 'outcomes' | 'glossary' | 'references' | 'credits';

const HOW_TO_USE = [
  ['0 · Diagnóstico', 'Responde el pre-test de 10 preguntas. No afecta tu nota: sirve para medir cuánto aprendes.'],
  ['1 · Fundamentos', 'Distingue registro, informe y estudio; audita un manuscrito simulado con AMSTAR 2 y escribe tu pregunta PICO.'],
  ['2 · Flujo', 'Valida tus ecuaciones de búsqueda y concilia el diagrama de flujo hasta que el indicador muestre «Cuadra».'],
  ['3 · Sesgo y GRADE', 'Elige la herramienta de riesgo de sesgo, completa los 9 ítems SWiM y califica la certeza con GRADE.'],
  ['4 · Auditoría', 'Marca cada uno de los 42 sub-ítems como reportado (con página y fragmento) o no aplica (con justificación).'],
  ['5 · Evaluación', `Presenta el post-test: es tu calificación (mínimo ${ovaConfig.masteryScore} % para aprobar).`],
];

const NAV_TIPS = [
  'Avanza en orden usando la barra de pasos superior; un círculo verde indica un paso completado.',
  'Tu progreso se guarda automáticamente en este navegador (o en el LMS, si accediste desde la plataforma del curso).',
  'Con el selector del encabezado puedes cambiar de caso de estudio: ingeniería de software, ciencias de la salud o el reto «flujo roto».',
  'El botón de contraste activa el modo de alto contraste. Toda la interfaz se puede usar con teclado (Tab, Shift+Tab, Enter, Espacio, Esc).',
  'En cada módulo, el botón «Aprender la teoría» despliega la explicación conceptual antes de la práctica.',
];

interface DidacticGuideModalProps {
  open: boolean;
  onClose: () => void;
}

const LEARNING_OUTCOMES = [
  {
    code: 'RA1 · Módulo 1',
    bloom: 'Analizar y Diferenciar',
    title: 'Epistemología, Ontología y Protocolos',
    desc: 'Distingue operacionalmente Registro, Informe y Estudio (Estudios ≤ Informes), separa la transparencia de reporte (PRISMA 2020) de la calidad metodológica (AMSTAR 2 / ROBIS) y estructura protocolos PICO con trazabilidad de enmiendas (Ítem 24).',
    time: '15 min',
    tone: 'blue' as const,
  },
  {
    code: 'RA2 · Módulo 2',
    bloom: 'Formular y Conciliar',
    title: 'Búsqueda PRISMA-S, IA y Balance Algebraico',
    desc: 'Construye ecuaciones booleanas reproducibles con calificadores de campo (Ítem 7), declara el rol de clasificadores de IA (Ítems 8 y 9) y concilia sin errores las 4 ecuaciones canónicas del diagrama de flujo (Ítems 16a y 16b).',
    time: '20 min',
    tone: 'purple' as const,
  },
  {
    code: 'RA3 · Módulo 3',
    bloom: 'Evaluar y Sintetizar',
    title: 'Riesgo de Sesgo, Protocolo SWiM y GRADE',
    desc: 'Selecciona matrices validadas según diseño (RoB 2, ROBINS-I, QUADAS-2), aplica las 9 directrices SWiM cuando el metaanálisis no es viable (Ítem 13d) y califica la certeza por desenlace con GRADE (Ítems 15 y 22).',
    time: '20 min',
    tone: 'green' as const,
  },
  {
    code: 'RA4 · Módulo 4',
    bloom: 'Auditar y Publicar',
    title: '42 Sub-ítems, Ítem 13 y Ciencia Abierta',
    desc: 'Audita las 42 filas operativas de PRISMA 2020 (incluyendo 13a–13f) y exporta diagramas interactivos en HTML con hipervínculos a datos y código abierto (Ítem 27).',
    time: '15 min',
    tone: 'orange' as const,
  },
];

const VISUAL_GLOSSARY = [
  {
    term: 'Registro (Record)',
    def: 'Título o resumen indexado que devuelve una base de datos (Scopus, PubMed, IEEE). Un mismo artículo puede aparecer repetido en varias bases.',
  },
  {
    term: 'Informe (Report)',
    def: 'Documento accesible (artículo de revista, preprint, acta de congreso, tesis) que presenta resultados de una investigación.',
  },
  {
    term: 'Estudio (Study)',
    def: 'La investigación empírica real sobre una cohorte o sistema. Un solo estudio puede publicar varios informes (ej. resultados a 1 año y a 3 años).',
  },
  {
    term: 'PRISMA 2020 vs. AMSTAR 2',
    def: 'PRISMA 2020 evalúa si contaste con transparencia lo que hiciste; AMSTAR 2 evalúa si lo que hiciste fue metodológicamente riguroso.',
  },
  {
    term: 'SWiM (9 ítems)',
    def: 'Synthesis Without Meta-analysis (Campbell et al., 2020). Reemplaza la "síntesis narrativa libre" por reglas formales de agrupación y dirección del efecto.',
  },
  {
    term: 'GRADE Summary of Findings',
    def: 'Sistema que califica la certeza de la evidencia en Alta (⊕⊕⊕⊕), Moderada (⊕⊕⊕◯), Baja (⊕⊕◯◯) o Muy Baja (⊕◯◯◯) evaluando 5 dominios.',
  },
];

const REFERENCES = [
  ['Page, M. J. et al. (2021)', 'The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ, 372, n71.'],
  ['Kitchenham, B., Madeyski, L. & Budgen, D. (2023)', 'SEGRESS: Software Engineering Guidelines for Reporting Secondary Studies. IEEE TSE, 49(3).'],
  ['Haddaway, N. R., Page, M. J. et al. (2022)', 'PRISMA2020: An R package and Shiny app for producing PRISMA 2020-compliant flow diagrams. Campbell Syst Rev.'],
  ['Shea, B. J. et al. (2017)', 'AMSTAR 2: a critical appraisal tool for systematic reviews. BMJ, 358, j4008.'],
  ['Campbell, M. et al. (2020)', 'Synthesis without meta-analysis (SWiM) in systematic reviews: reporting guideline. BMJ, 368, l6890.'],
  ['Krnic Martinic, M. et al. (2022)', 'Educational intervention for PRISMA 2020 adherence: randomized controlled trial. JMIR, 24(8).'],
  ['Ivaldi, D. et al. (2024) & Banno, M. et al. (2025)', 'Empirical audits of arithmetic imbalances and exclusion reporting failures in PRISMA flow diagrams.'],
  ['Hevner, A. R. et al. (2004) & Branch, R. M. (2009)', 'Design Science Research in Information Systems (MIS Quarterly) & Instructional Design: The ADDIE Approach.'],
  ['Wiley, D. A. (2000) & Polsani, P. R. (2003)', 'Learning Object Design and Sequencing Theory & Use and Abuse of Reusable Learning Objects.'],
];

export const DidacticGuideModal: React.FC<DidacticGuideModalProps> = ({
  open,
  onClose,
}) => {
  const [tab, setTab] = useState<GuideTab>('start');
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Diálogo accesible: foco inicial en "Cerrar", Esc para salir y retorno del foco al cerrar.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guia-ova-titulo"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[88vh] flex flex-col text-neutral-900"
          >
            {/* Cabecera fija */}
            <div className="px-7 py-5 border-b border-black/5 flex flex-wrap items-center justify-between gap-4 bg-[#f5f5f7]/70 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-[#0071e3] text-white flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Objeto Virtual de Aprendizaje · MEN Colombia / IEEE LOM-CO
                  </div>
                  <h2 id="guia-ova-titulo" className="text-xl font-semibold tracking-tight text-neutral-900">
                    Guía Didáctica y Arquitectura Pedagógica
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Segmented
                  size="sm"
                  value={tab}
                  onChange={setTab}
                  ariaLabel="Secciones de la guía"
                  options={[
                    { value: 'start', label: 'Antes de empezar' },
                    { value: 'outcomes', label: 'Competencias (RA)' },
                    { value: 'glossary', label: 'Conceptos clave' },
                    { value: 'references', label: 'Marco teórico' },
                    { value: 'credits', label: 'Créditos y licencia' },
                  ]}
                />
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar la guía"
                  className="w-9 h-9 rounded-full bg-black/[0.06] hover:bg-black/[0.12] flex items-center justify-center text-neutral-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenido desplazable */}
            <div className="p-7 overflow-y-auto space-y-6">
              {tab === 'start' && (
                <>
                  <div className="rounded-2xl bg-neutral-900 text-white p-6">
                    <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                      Población objetivo · {ovaConfig.educational.typicalLearningTimeLabel} · Trabajo autónomo
                    </span>
                    <p className="text-[15px] mt-2 leading-relaxed text-white/90">
                      {ovaConfig.educational.audience}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <section className="rounded-2xl bg-[#f5f5f7] p-5">
                      <h3 className="flex items-center gap-2 font-semibold text-neutral-900">
                        <ListChecks className="w-4 h-4 text-[#0071e3]" aria-hidden="true" />
                        Prerrequisitos
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm text-neutral-600 leading-relaxed list-disc pl-5">
                        {ovaConfig.prerequisites.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </section>
                    <section className="rounded-2xl bg-[#f5f5f7] p-5">
                      <h3 className="flex items-center gap-2 font-semibold text-neutral-900">
                        <Compass className="w-4 h-4 text-[#0071e3]" aria-hidden="true" />
                        Cómo navegar el OVA
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm text-neutral-600 leading-relaxed list-disc pl-5">
                        {NAV_TIPS.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  <section>
                    <h3 className="font-semibold text-neutral-900 mb-3">Ruta de aprendizaje</h3>
                    <ol className="divide-y divide-black/5 rounded-2xl bg-[#f5f5f7] px-5">
                      {HOW_TO_USE.map(([step, desc]) => (
                        <li key={step} className="py-3 text-sm">
                          <span className="font-semibold text-neutral-900">{step}.</span>{' '}
                          <span className="text-neutral-600">{desc}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                </>
              )}

              {tab === 'credits' && (
                <div className="space-y-4">
                  <section className="rounded-2xl bg-[#f5f5f7] p-5">
                    <h3 className="flex items-center gap-2 font-semibold text-neutral-900">
                      <Users className="w-4 h-4 text-[#0071e3]" aria-hidden="true" />
                      Créditos
                    </h3>
                    <dl className="mt-3 grid sm:grid-cols-[180px_1fr] gap-x-4 gap-y-2 text-sm">
                      {ovaConfig.authors.map((p) => (
                        <React.Fragment key={p.name}>
                          <dt className="text-neutral-500">{p.roleLabel}</dt>
                          <dd className="text-neutral-900 font-medium">{p.name}</dd>
                        </React.Fragment>
                      ))}
                      <dt className="text-neutral-500">Institución</dt>
                      <dd className="text-neutral-900 font-medium">{ovaConfig.institution.name}</dd>
                      <dt className="text-neutral-500">Versión</dt>
                      <dd className="text-neutral-900 font-medium">
                        {ovaConfig.version} ({ovaConfig.statusLabel}) · {ovaConfig.creationDate}
                      </dd>
                    </dl>
                  </section>

                  <section className="rounded-2xl bg-[#f5f5f7] p-5 text-sm text-neutral-600 leading-relaxed">
                    <h3 className="font-semibold text-neutral-900">Licencia y derechos de autor</h3>
                    <p className="mt-2">
                      Esta obra se distribuye bajo{' '}
                      <a
                        href={ovaConfig.license.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0071e3] underline"
                      >
                        {ovaConfig.license.name}
                      </a>
                      . Puedes copiarla, adaptarla y redistribuirla citando a los autores. Titular de los derechos
                      patrimoniales: {ovaConfig.license.holder}. Los derechos morales se conservan (Ley 23 de 1982 y
                      Decisión Andina 351 de 1993).
                    </p>
                  </section>

                  <section className="rounded-2xl bg-[#f5f5f7] p-5 text-sm text-neutral-600 leading-relaxed">
                    <h3 className="flex items-center gap-2 font-semibold text-neutral-900">
                      <ShieldCheck className="w-4 h-4 text-[#0071e3]" aria-hidden="true" />
                      Tratamiento de datos personales (Ley 1581 de 2012)
                    </h3>
                    <p className="mt-2">
                      PRISMA-Lab no tiene servidor propio ni envía tus respuestas a terceros. Tu progreso se guarda solo
                      en el almacenamiento local de este navegador; puedes borrarlo limpiando los datos del sitio.
                    </p>
                    <p className="mt-2">
                      Si accedes desde el LMS de tu institución, la plataforma registra tu avance y la nota del
                      post-test conforme a su propia política de tratamiento de datos.
                    </p>
                  </section>

                  <section className="rounded-2xl bg-[#f5f5f7] p-5 text-sm text-neutral-600 leading-relaxed">
                    <h3 className="font-semibold text-neutral-900">Accesibilidad</h3>
                    <p className="mt-2">{ovaConfig.accessibility}</p>
                  </section>
                </div>
              )}

              {tab === 'outcomes' && (
                <>
                  <div className="rounded-2xl bg-neutral-900 text-white p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                        Competencia Global del OVA (Modelo ADDIE + DSR)
                      </span>
                      <span className="text-xs text-white/60">
                        Dedicación total estimada: ~80 minutos · Autónomo
                      </span>
                    </div>
                    <p className="text-lg font-medium mt-2 leading-snug">
                      Diseñar, conciliar matemáticamente y auditar revisiones sistemáticas de literatura en ingeniería y ciencias de la salud bajo el estándar internacional PRISMA 2020 y principios de Ciencia Abierta.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {LEARNING_OUTCOMES.map((ra) => (
                      <div
                        key={ra.code}
                        className="rounded-2xl bg-[#f5f5f7] p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <Chip tone={ra.tone}>{ra.code}</Chip>
                            <span className="text-xs text-neutral-400 font-medium">
                              Bloom: {ra.bloom} · {ra.time}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-neutral-900 mt-3">
                            {ra.title}
                          </h3>
                          <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                            {ra.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === 'glossary' && (
                <div className="grid md:grid-cols-2 gap-4">
                  {VISUAL_GLOSSARY.map((g) => (
                    <div key={g.term} className="rounded-2xl bg-[#f5f5f7] p-5">
                      <div className="flex items-center gap-2 text-[#0071e3] font-semibold">
                        <Layers className="w-4 h-4" />
                        <h4>{g.term}</h4>
                      </div>
                      <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                        {g.def}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'references' && (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-[#0071e3]/8 p-4 text-sm text-[#0071e3] flex items-center gap-2.5 font-medium">
                    <Compass className="w-4 h-4 shrink-0" />
                    Construido bajo Design Science Research (Hevner et al., 2004) e Instrucción ADDIE (Branch, 2009) como Objeto Reutilizable autónomo (Wiley, 2000; Polsani, 2003).
                  </div>
                  <div className="divide-y divide-black/5 rounded-2xl bg-[#f5f5f7] px-5">
                    {REFERENCES.map(([authors, work]) => (
                      <div key={authors} className="py-3.5 text-sm">
                        <div className="font-semibold text-neutral-900 flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                          {authors}
                        </div>
                        <div className="text-neutral-600 mt-0.5 pl-5">{work}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
