import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrismaStore } from '../../store/usePrismaStore';
import {
  EPISTEMOLOGICAL_MATRIX,
  SIMULATED_MANUSCRIPT_CASE,
} from '../../data/epistemologicalCases';
import {
  ArrowRight,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
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
  inputCls,
  monoInputCls,
} from '../ui/ui';

export const Module1Epistemology: React.FC = () => {
  const {
    session,
    amstarAuditAnswers,
    amendmentsDescription,
    updateProtocol,
    updatePico,
    updateRegistration,
    setAmendmentsDescription,
    setAmstarAuditAnswer,
    setActiveTab,
  } = usePrismaStore();

  const [dimIndex, setDimIndex] = useState(0);
  const [domainIdx, setDomainIdx] = useState(0);

  const { protocol, flowCounts } = session;

  // Validación del identificador de registro prospectivo (PROSPERO / OSF)
  const validateRegistrationId = () => {
    if (!protocol.registration.registered) {
      return {
        valid: true,
        warning:
          'Sin registro previo: cumple PRISMA 24a si lo declaras, pero falla el Dominio Crítico 2 de AMSTAR 2.',
      };
    }
    const id = (protocol.registration.identifier || '').trim();
    if (!id) {
      return { valid: false, error: 'Ingresa el código o enlace del registro.' };
    }
    if (protocol.registration.platform === 'PROSPERO') {
      if (!/^CRD420\d{6,9}$/i.test(id)) {
        return {
          valid: false,
          error: 'Formato esperado: CRD420 seguido de 6 a 9 dígitos (ej. CRD42026589120).',
        };
      }
    }
    if (protocol.registration.platform === 'OSF') {
      if (!/^(https?:\/\/)?(osf\.io\/[a-z0-9]{5,}|10\.17605\/OSF\.IO\/[A-Z0-9]+)/i.test(id)) {
        return {
          valid: false,
          error: 'Formato esperado: https://osf.io/9x7pr o DOI 10.17605/OSF.IO/...',
        };
      }
    }
    return {
      valid: true,
      message: `Identificador ${protocol.registration.platform} verificado.`,
    };
  };

  const regStatus = validateRegistrationId();

  const auditDomains = SIMULATED_MANUSCRIPT_CASE.auditDomains;
  const activeDomain = auditDomains[domainIdx];
  const userChoice = amstarAuditAnswers[activeDomain.id];
  const expectedChoice = activeDomain.passesAmstar2MethodologicalRigor ? 'pass' : 'fail';
  const isChoiceCorrect = userChoice === expectedChoice;

  const answeredCount = auditDomains.filter((d) => amstarAuditAnswers[d.id] !== undefined).length;
  const correctAuditCount = auditDomains.filter((d) => {
    const v = amstarAuditAnswers[d.id];
    return v === (d.passesAmstar2MethodologicalRigor ? 'pass' : 'fail');
  }).length;

  const totalIdentified =
    flowCounts.recordsIdentifiedDatabases + flowCounts.recordsIdentifiedRegisters;

  return (
    <div className="pb-12">
      <ModuleHero
        eyebrow="Módulo 1 · Fundamentos"
        title="Tres unidades. Tres lentes."
        subtitle="Aprende a distinguir registros, informes y estudios, y por qué un artículo transparente aún puede ser metodológicamente débil."
      />

      <LearnMoreCapsule
        raCode="RA1 · Nivel Analizar (Bloom)"
        raText="Diferenciar Registro, Informe y Estudio y auditar protocolos frente a AMSTAR 2."
        duration="15 min"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              1 · Ejemplo visual de ontología
            </div>
            <h4 className="text-lg font-semibold mt-1">1 Estudio → 3 Informes → 9 Registros</h4>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Un ensayo clínico sobre 500 pacientes es <strong>1 Estudio</strong>. Si publica protocolo (2023), resultados a 1 año (2024) y seguimiento a 3 años (2025), son <strong>3 Informes</strong>. Si cada informe está indexado en PubMed, Scopus y Web of Science, tu búsqueda recupera <strong>9 Registros</strong>.
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              2 · La trampa del 100% PRISMA
            </div>
            <h4 className="text-lg font-semibold mt-1">Transparencia ≠ Calidad</h4>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Si un autor escribe: <em>“No registramos protocolo y buscamos solo en Google Scholar”</em>, cumple al 100% la transparencia de reporte de PRISMA 2020, pero reprueba los dominios críticos 2 y 4 de <strong>AMSTAR 2</strong>.
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              3 · ¿Por qué registrar en PROSPERO / OSF?
            </div>
            <h4 className="text-lg font-semibold mt-1">Evitar el reporte selectivo</h4>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Congelar la pregunta PICO antes de extraer datos demuestra que no cambiaste el desenlace primario después de ver los resultados. Si haces un ajuste, el <strong>Ítem 24c</strong> exige declararlo.
            </p>
          </div>
        </div>
      </LearnMoreCapsule>

      {/* 1. ONTOLOGÍA VISUAL */}
      <Section
        eyebrow="Ontología PRISMA 2020"
        title="No todo resultado de búsqueda es un estudio."
        subtitle="Cada etapa filtra una entidad distinta. Al final, un estudio puede tener varios informes publicados."
      >
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              tag: 'Identificación',
              name: 'Registros',
              en: 'Records',
              count: totalIdentified,
              color: 'from-[#0071e3] to-[#5ac8fa]',
              dotColor: '#0071e3',
              dots: 12,
              desc: 'Entradas crudas que devuelve cada base de datos antes de quitar duplicados.',
            },
            {
              tag: 'Elegibilidad',
              name: 'Informes',
              en: 'Reports',
              count: flowCounts.reportsIncludedReview,
              color: 'from-[#5e5ce6] to-[#bf5af2]',
              dotColor: '#5e5ce6',
              dots: 6,
              desc: 'Documentos concretos (artículos, tesis, preprints) que describen hallazgos.',
            },
            {
              tag: 'Inclusión',
              name: 'Estudios',
              en: 'Studies',
              count: flowCounts.studiesIncludedReview,
              color: 'from-[#34c759] to-[#30d158]',
              dotColor: '#34c759',
              dots: 3,
              desc: 'La investigación empírica real. Varios informes pueden nacer del mismo estudio.',
            },
          ].map((u) => (
            <Card key={u.name} className="p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {u.tag}
                  </span>
                  <span className="text-xs text-neutral-400">{u.en}</span>
                </div>
                <div
                  className={`text-6xl font-bold tracking-tighter bg-gradient-to-r ${u.color} bg-clip-text text-transparent mt-3 tabular-nums`}
                >
                  {u.count.toLocaleString('es-CO')}
                </div>
                <h3 className="text-2xl font-semibold text-neutral-900 mt-1">{u.name}</h3>
                <p className="text-[15px] text-neutral-500 mt-2 leading-snug">{u.desc}</p>
              </div>

              {/* Mini visualización de agrupación */}
              <div className="mt-6 pt-4 border-t border-black/5 flex items-center gap-2">
                {Array.from({ length: u.dots }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.04, type: 'spring' }}
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: u.dotColor, opacity: 0.85 }}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Regla de oro */}
        <Card className="mt-6 p-6 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 font-bold">
              ≤
            </span>
            <div>
              <div className="text-sm text-white/60">Restricción ontológica obligatoria</div>
              <div className="text-lg font-semibold">
                Estudios ({flowCounts.studiesIncludedReview}) ≤ Informes ({flowCounts.reportsIncludedReview})
              </div>
            </div>
          </div>
          <span className="text-sm text-white/60">
            Ningún estudio existe sin al menos un informe que lo describa.
          </span>
        </Card>
      </Section>

      {/* 2. DESLINDE EPISTEMOLÓGICO INTERACTIVO */}
      <Section
        eyebrow="Deslinde epistemológico"
        title="PRISMA vs. AMSTAR 2 vs. ROBIS"
        subtitle="Elige una pregunta para comparar qué evalúa cada instrumento."
        right={
          <Segmented
            size="sm"
            value={dimIndex}
            onChange={setDimIndex}
            options={[
              { value: 0, label: '¿Qué es?' },
              { value: 1, label: '¿Mide calidad?' },
              { value: 2, label: 'Si hay fallas' },
              { value: 3, label: '¿Cuándo usarlo?' },
            ]}
          />
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={dimIndex}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                name: 'PRISMA 2020',
                role: 'Guía de reporte',
                color: '#0071e3',
                chip: 'blue' as const,
                text: EPISTEMOLOGICAL_MATRIX[dimIndex].prisma2020,
              },
              {
                name: 'AMSTAR 2',
                role: 'Calidad metodológica',
                color: '#ff9500',
                chip: 'orange' as const,
                text: EPISTEMOLOGICAL_MATRIX[dimIndex].amstar2,
              },
              {
                name: 'ROBIS',
                role: 'Riesgo de sesgo',
                color: '#34c759',
                chip: 'green' as const,
                text: EPISTEMOLOGICAL_MATRIX[dimIndex].robis,
              },
            ].map((item) => (
              <Card key={item.name} className="p-7 flex flex-col justify-between">
                <div>
                  <Chip tone={item.chip}>{item.role}</Chip>
                  <h3 className="text-3xl font-semibold tracking-tight text-neutral-900 mt-3">
                    {item.name}
                  </h3>
                  <p className="text-[16px] text-neutral-600 mt-4 leading-relaxed">{item.text}</p>
                </div>
                <div className="mt-6 h-1.5 rounded-full" style={{ backgroundColor: item.color, opacity: 0.25 }} />
              </Card>
            ))}
          </motion.div>
        </AnimatePresence>
      </Section>

      {/* 3. TALLER DE ARBITRAJE PASO A PASO */}
      <Section
        eyebrow="Taller interactivo"
        title="100% transparente. Críticamente débil."
        subtitle="Audita los 7 dominios críticos de AMSTAR 2 en un manuscrito que completó toda la lista PRISMA."
      >
        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          {/* Tarjeta interactiva del dominio actual */}
          <Card className="lg:col-span-8 p-7 md:p-9 flex flex-col justify-between">
            <div>
              {/* Píldoras de navegación de los 7 dominios */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex gap-1.5 flex-wrap">
                  {auditDomains.map((d, idx) => {
                    const ans = amstarAuditAnswers[d.id];
                    const ok = ans && ans === (d.passesAmstar2MethodologicalRigor ? 'pass' : 'fail');
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDomainIdx(idx)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                          idx === domainIdx
                            ? 'bg-neutral-900 text-white'
                            : ans
                            ? ok
                              ? 'bg-[#34c759]/15 text-[#248a3d]'
                              : 'bg-[#ff9500]/15 text-[#c93400]'
                            : 'bg-black/[0.05] text-neutral-500 hover:bg-black/[0.08]'
                        }`}
                      >
                        Ítem {d.amstarItemNumber}
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-neutral-400 tabular-nums">
                  {domainIdx + 1} / {auditDomains.length}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDomain.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Chip tone="green">PRISMA: {activeDomain.prismaItemRef}</Chip>
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-neutral-900">
                    {activeDomain.domainTitle}
                  </h3>

                  <div className="mt-5 rounded-2xl bg-[#f5f5f7] p-5 text-[16px] text-neutral-800 leading-relaxed italic">
                    {activeDomain.manuscriptExcerpt}
                  </div>

                  {/* Botones de dictamen */}
                  <div className="grid sm:grid-cols-2 gap-3 mt-6">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAmstarAuditAnswer(activeDomain.id, 'pass')}
                      className={`flex items-center justify-center gap-2.5 rounded-2xl py-4 px-5 text-[15px] font-semibold border-2 transition ${
                        userChoice === 'pass'
                          ? 'border-[#34c759] bg-[#34c759]/10 text-[#248a3d]'
                          : 'border-black/5 bg-white hover:border-black/15 text-neutral-700'
                      }`}
                    >
                      <Check className="w-5 h-5" /> Aprueba AMSTAR 2
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAmstarAuditAnswer(activeDomain.id, 'fail')}
                      className={`flex items-center justify-center gap-2.5 rounded-2xl py-4 px-5 text-[15px] font-semibold border-2 transition ${
                        userChoice === 'fail'
                          ? 'border-[#ff3b30] bg-[#ff3b30]/10 text-[#d70015]'
                          : 'border-black/5 bg-white hover:border-black/15 text-neutral-700'
                      }`}
                    >
                      <X className="w-5 h-5" /> Falla crítica
                    </motion.button>
                  </div>

                  {/* Explicación inmediata al elegir */}
                  {userChoice && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-5 rounded-2xl p-4 text-[14px] leading-relaxed ${
                        isChoiceCorrect
                          ? 'bg-[#34c759]/10 text-[#1d6f31]'
                          : 'bg-[#ff9500]/12 text-[#9a4a00]'
                      }`}
                    >
                      <strong className="font-semibold">
                        {isChoiceCorrect ? '✓ Dictamen acertado. ' : 'Mira con lupa: '}
                      </strong>
                      {activeDomain.explanation}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-black/5">
              <Button
                variant="secondary"
                onClick={() => setDomainIdx(Math.max(0, domainIdx - 1))}
                disabled={domainIdx === 0}
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Button>
              <Button
                variant="secondary"
                onClick={() => setDomainIdx(Math.min(auditDomains.length - 1, domainIdx + 1))}
                disabled={domainIdx === auditDomains.length - 1}
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Tarjeta lateral con medidor AMSTAR 2 */}
          <Card className="lg:col-span-4 p-7 flex flex-col items-center justify-between text-center bg-neutral-900 text-white">
            <div>
              <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">
                Tu precisión de arbitraje
              </span>
              <h4 className="text-xl font-semibold mt-1">{SIMULATED_MANUSCRIPT_CASE.authors}</h4>
            </div>

            <div className="my-6">
              <Ring
                value={correctAuditCount}
                max={auditDomains.length}
                size={168}
                stroke={14}
                color="#34c759"
              >
                <div className="text-4xl font-bold text-white">
                  {correctAuditCount}/{auditDomains.length}
                </div>
                <div className="text-xs text-white/50 mt-0.5">aciertos</div>
              </Ring>
            </div>

            <div className="w-full rounded-2xl bg-white/[0.07] p-4 text-left">
              <div className="text-xs text-rose-400 font-semibold uppercase">
                Veredicto global AMSTAR 2
              </div>
              <div className="text-lg font-semibold text-white mt-0.5">
                Confianza críticamente baja
              </div>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                {answeredCount < auditDomains.length
                  ? `Evalúa los ${auditDomains.length - answeredCount} dominios restantes para completar la auditoría.`
                  : '5 fallas en dominios críticos (Ítems 2, 4, 7, 11 y 13), pese a cumplir PRISMA.'}
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* 4. PROTOCOLO PICO Y REGISTRO PROSPECTIVO */}
      <Section
        eyebrow="Protocolo e Ítem 24"
        title="Pregunta PICO y registro prospectivo."
        subtitle="Define tu pregunta estructurada y valida el registro en PROSPERO u OSF."
        right={
          <Segmented
            size="sm"
            value={protocol.reviewType}
            onChange={(v) => updateProtocol({ reviewType: v })}
            options={[
              { value: 'new', label: 'Revisión nueva' },
              { value: 'update', label: 'Actualización' },
            ]}
          />
        }
      >
        <Card className="p-7 mb-6">
          <Field label="Título de la revisión sistemática (Ítem 1)">
            <input
              type="text"
              value={protocol.title}
              onChange={(e) => updateProtocol({ title: e.target.value })}
              className={inputCls}
            />
          </Field>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {[
              {
                letter: 'P',
                title: 'Población / Sistemas',
                key: 'population' as const,
                color: 'bg-[#0071e3]/10 text-[#0071e3]',
              },
              {
                letter: 'I',
                title: 'Intervención / Modelo',
                key: 'intervention' as const,
                color: 'bg-[#5e5ce6]/10 text-[#5e5ce6]',
              },
              {
                letter: 'C',
                title: 'Comparador / Baseline',
                key: 'comparator' as const,
                color: 'bg-[#af52de]/10 text-[#8944ab]',
              },
              {
                letter: 'O',
                title: 'Desenlaces (Outcomes)',
                key: 'outcome' as const,
                color: 'bg-[#34c759]/12 text-[#248a3d]',
              },
            ].map((p) => (
              <div key={p.letter} className="rounded-2xl bg-[#f5f5f7] p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${p.color}`}
                  >
                    {p.letter}
                  </span>
                  <span className="text-sm font-semibold text-neutral-800">{p.title}</span>
                </div>
                <textarea
                  rows={2}
                  aria-label={`PICO — ${p.title}`}
                  value={protocol.pico[p.key]}
                  onChange={(e) => updatePico({ [p.key]: e.target.value })}
                  className="w-full rounded-xl bg-white px-3.5 py-2.5 text-[14px] text-neutral-900 border border-transparent focus:border-[#0071e3] focus:outline-none transition"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Tarjeta de registro prospectivo */}
        <Card className="p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Toggle
              checked={protocol.registration.registered}
              onChange={(registered) => updateRegistration({ registered })}
              label={
                <div>
                  <div className="font-semibold text-neutral-900">
                    Protocolo registrado prospectivamente (Ítem 24a)
                  </div>
                  <div className="text-xs text-neutral-400">
                    Requisito del Dominio Crítico 2 de AMSTAR 2
                  </div>
                </div>
              }
            />

            {protocol.registration.registered && (
              <Segmented
                size="sm"
                value={protocol.registration.platform || 'PROSPERO'}
                onChange={(platform) => updateRegistration({ platform })}
                options={[
                  { value: 'PROSPERO', label: 'PROSPERO' },
                  { value: 'OSF', label: 'OSF' },
                  { value: 'Other', label: 'Otro' },
                ]}
              />
            )}
          </div>

          {protocol.registration.registered && (
            <div className="grid md:grid-cols-2 gap-5 mt-6 pt-6 border-t border-black/5 items-center">
              <Field label="Identificador o URL oficial">
                <input
                  type="text"
                  value={protocol.registration.identifier || ''}
                  onChange={(e) => updateRegistration({ identifier: e.target.value })}
                  placeholder={
                    protocol.registration.platform === 'PROSPERO'
                      ? 'CRD42026589120'
                      : 'https://osf.io/9x7pr'
                  }
                  className={monoInputCls}
                />
              </Field>

              <div className="pt-4 md:pt-5">
                <Toggle
                  checked={protocol.registration.amendments}
                  onChange={(amendments) => updateRegistration({ amendments })}
                  label="Hubo enmiendas al protocolo original (Ítem 24c)"
                />
              </div>
            </div>
          )}

          <div className="mt-5">
            {!regStatus.valid ? (
              <Chip tone="red">✕ {regStatus.error}</Chip>
            ) : regStatus.warning ? (
              <Chip tone="orange">⚠ {regStatus.warning}</Chip>
            ) : (
              <Chip tone="green">
                <Sparkles className="w-3.5 h-3.5" /> {regStatus.message}
              </Chip>
            )}
          </div>

          {protocol.registration.amendments && (
            <div className="mt-5 pt-5 border-t border-black/5">
              <Field label="Qué cambió en el protocolo y por qué (Ítem 24c)">
                <textarea
                  rows={2}
                  value={amendmentsDescription}
                  onChange={(e) => setAmendmentsDescription(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          )}
        </Card>

        <div className="flex justify-end mt-10">
          <Button
            onClick={() => {
              setActiveTab('module2');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Continuar a Búsqueda y Flujo <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Section>
    </div>
  );
};
