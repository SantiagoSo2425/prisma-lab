import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ChevronDown, RotateCcw, X } from 'lucide-react';
import { usePrismaStore } from '../../store/usePrismaStore';
import { PRE_POST_QUESTIONS } from '../../data/prePostQuestions';
import { Button, Card, Chip, Ring } from '../ui/ui';

interface PrePostAssessmentProps {
  phase: 'pre' | 'post';
}

type Step = 'intro' | number | 'results';

const cleanStem = (s: string) => s.replace(/^\d+\.\s*/, '').replace(/^\[[^\]]*\]\s*/, '');

const CATEGORY_TONE: Record<string, 'blue' | 'purple' | 'orange' | 'green' | 'red' | 'neutral'> = {
  Ontología: 'blue',
  'Conciliación Matemática': 'purple',
  'Deslinde Epistemológico': 'orange',
  'PRISMA-S e IA': 'blue',
  'SWiM y GRADE': 'green',
  'Auditoría Ítem 13 y Ciencia Abierta': 'red',
};

export const PrePostAssessment: React.FC<PrePostAssessmentProps> = ({ phase }) => {
  const {
    preTestAnswers,
    preTestSubmitted,
    postTestAnswers,
    postTestSubmitted,
    setPreTestAnswer,
    submitPreTest,
    setPostTestAnswer,
    submitPostTest,
    resetTest,
    setActiveTab,
  } = usePrismaStore();

  const questions = PRE_POST_QUESTIONS.filter((q) => q.phase === phase);
  const answers = phase === 'pre' ? preTestAnswers : postTestAnswers;
  const submitted = phase === 'pre' ? preTestSubmitted : postTestSubmitted;

  const [step, setStep] = useState<Step>(submitted ? 'results' : 'intro');
  const [dir, setDir] = useState(1);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;

  const score = (ph: 'pre' | 'post') => {
    const qs = PRE_POST_QUESTIONS.filter((q) => q.phase === ph);
    const ans = ph === 'pre' ? preTestAnswers : postTestAnswers;
    const correct = qs.filter((q) => ans[q.id] === q.correctIndex).length;
    return { correct, pct: Math.round((correct / qs.length) * 100) };
  };

  const go = (next: Step) => {
    if (typeof next === 'number' && typeof step === 'number') setDir(next > step ? 1 : -1);
    else setDir(1);
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const choose = (qId: string, idx: number, qIndex: number) => {
    if (phase === 'pre') setPreTestAnswer(qId, idx);
    else setPostTestAnswer(qId, idx);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    if (qIndex < questions.length - 1) {
      advanceTimer.current = window.setTimeout(() => {
        setDir(1);
        setStep(qIndex + 1);
      }, 450);
    }
  };

  const finish = () => {
    if (phase === 'pre') submitPreTest();
    else submitPostTest();
    go('results');
  };

  const restart = () => {
    resetTest(phase);
    setOpenIdx(null);
    go(0);
  };

  /* ----------------------------- INTRO ----------------------------- */
  if (step === 'intro') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl"
        >
          <div className="mx-auto mb-8 w-28 h-28 rounded-[32px] bg-gradient-to-br from-[#0071e3] to-[#5e5ce6] flex items-center justify-center shadow-xl shadow-blue-500/20">
            <span className="text-5xl font-semibold text-white">{phase === 'pre' ? '?' : '✓'}</span>
          </div>
          <div className="text-[#0071e3] font-semibold">{phase === 'pre' ? 'Paso 0' : 'Paso final'}</div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-neutral-900 mt-2">
            {phase === 'pre' ? 'Diagnóstico.' : 'Demuestra lo aprendido.'}
          </h1>
          <p className="text-xl md:text-2xl text-neutral-500 mt-4">
            {phase === 'pre'
              ? 'Antes de empezar, veamos cuánto sabes. No hay presión.'
              : 'Las mismas ideas, casos nuevos. Compara tu resultado con el inicio.'}
          </p>
          <div className="flex justify-center gap-8 mt-10 text-neutral-900">
            {[
              ['10', 'preguntas'],
              ['~5', 'minutos'],
              ['6', 'temas'],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-4xl font-semibold tracking-tight">{n}</div>
                <div className="text-sm text-neutral-500">{l}</div>
              </div>
            ))}
          </div>
          <Button onClick={() => go(answeredCount > 0 ? Math.min(answeredCount, questions.length - 1) : 0)} className="mt-12 px-8 py-3.5 text-[17px]">
            {answeredCount > 0 ? 'Continuar' : 'Comenzar'} <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    );
  }

  /* ---------------------------- RESULTS ---------------------------- */
  if (step === 'results') {
    const pre = score('pre');
    const post = score('post');
    const mine = phase === 'pre' ? pre : post;
    const hake = pre.pct < 100 ? (post.pct - pre.pct) / (100 - pre.pct) : 1;
    const ringColor = mine.pct >= 70 ? '#34c759' : mine.pct >= 40 ? '#ff9500' : '#ff3b30';

    return (
      <div className="py-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-[#0071e3] font-semibold">{phase === 'pre' ? 'Tu punto de partida' : 'Tu resultado final'}</div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter text-neutral-900 mt-2">
            {mine.pct >= 70 ? 'Excelente.' : mine.pct >= 40 ? 'Buen comienzo.' : 'Hay mucho por descubrir.'}
          </h1>
          <div className="flex justify-center mt-10">
            <Ring value={mine.correct} max={10} size={220} stroke={18} color={ringColor}>
              <div className="text-6xl font-semibold tracking-tighter text-neutral-900">{mine.pct}%</div>
              <div className="text-neutral-500 text-sm mt-1">{mine.correct} de 10 correctas</div>
            </Ring>
          </div>
        </motion.div>

        {phase === 'post' && (
          <Card className="p-8 mt-10">
            <div className="text-center text-sm font-semibold text-neutral-400 mb-6">Antes vs. después</div>
            <div className="space-y-5">
              {[
                ['Diagnóstico', pre.pct, 'from-neutral-300 to-neutral-400'],
                ['Final', post.pct, 'from-[#34c759] to-[#30d158]'],
              ].map(([label, pct, grad]) => (
                <div key={label as string} className="flex items-center gap-4">
                  <div className="w-24 text-right text-neutral-500">{label}</div>
                  <div className="flex-1 h-10 rounded-full bg-black/[0.04] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, pct as number)}%` }}
                      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                      className={`h-full rounded-full bg-gradient-to-r ${grad}`}
                    />
                  </div>
                  <div className="w-14 text-xl font-semibold tabular-nums">{pct}%</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8 text-center">
              <div className="rounded-2xl bg-[#f5f5f7] p-5">
                <div className="text-4xl font-semibold tracking-tight text-neutral-900">
                  {post.pct - pre.pct >= 0 ? '+' : ''}
                  {post.pct - pre.pct}%
                </div>
                <div className="text-sm text-neutral-500 mt-1">Ganancia neta</div>
              </div>
              <div className="rounded-2xl bg-[#f5f5f7] p-5">
                <div className="text-4xl font-semibold tracking-tight text-neutral-900">{hake.toFixed(2)}</div>
                <div className="text-sm text-neutral-500 mt-1">Ganancia de Hake (g)</div>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-4">Revisa cada respuesta</h2>
          <Card className="divide-y divide-black/5 overflow-hidden">
            {questions.map((q, i) => {
              const ok = answers[q.id] === q.correctIndex;
              const open = openIdx === i;
              return (
                <div key={q.id}>
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : i)}
                    className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-black/[0.02] transition"
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        ok ? 'bg-[#34c759] text-white' : 'bg-[#ff3b30] text-white'
                      }`}
                    >
                      {ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </span>
                    <span className="flex-1 text-[15px] text-neutral-800 line-clamp-1">{cleanStem(q.stem)}</span>
                    <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pl-[4.25rem] space-y-3">
                          <p className="text-neutral-900 font-medium">{cleanStem(q.stem)}</p>
                          {!ok && answers[q.id] !== undefined && (
                            <div className="rounded-xl bg-[#ff3b30]/8 px-4 py-3 text-[14px] text-[#d70015]">
                              Tu respuesta: {q.options[answers[q.id]]}
                            </div>
                          )}
                          <div className="rounded-xl bg-[#34c759]/10 px-4 py-3 text-[14px] text-[#248a3d]">
                            Correcta: {q.options[q.correctIndex]}
                          </div>
                          <p className="text-[14px] text-neutral-500 leading-relaxed">{q.rationale}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </Card>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <Button variant="secondary" onClick={restart}>
            <RotateCcw className="w-4 h-4" /> Repetir
          </Button>
          {phase === 'pre' && (
            <Button
              onClick={() => {
                setActiveTab('module1');
                window.scrollTo({ top: 0 });
              }}
            >
              Ir a Fundamentos <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  /* ---------------------------- QUESTION --------------------------- */
  const q = questions[step];
  const selected = answers[q.id];
  const isLast = step === questions.length - 1;

  return (
    <div className="py-6 max-w-3xl mx-auto">
      {/* Progreso */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => go('intro')} className="text-[13px] text-neutral-500 hover:text-neutral-800">
          Salir
        </button>
        <span className="text-[13px] font-medium text-neutral-500 tabular-nums">
          {step + 1} / {questions.length}
        </span>
      </div>
      <div className="flex gap-1.5 mb-10">
        {questions.map((qq, i) => (
          <button
            key={qq.id}
            type="button"
            onClick={() => go(i)}
            aria-label={`Ir a la pregunta ${i + 1}`}
            className="flex-1 h-1.5 rounded-full overflow-hidden bg-black/[0.07]"
          >
            <motion.div
              className="h-full rounded-full bg-[#0071e3]"
              initial={false}
              animate={{
                width: answers[qq.id] !== undefined || i === step ? '100%' : '0%',
                opacity: i === step ? 1 : answers[qq.id] !== undefined ? 0.45 : 1,
              }}
              transition={{ duration: 0.35 }}
            />
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={q.id}
          custom={dir}
          initial={{ opacity: 0, x: dir * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -60 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Chip tone={CATEGORY_TONE[q.category] ?? 'neutral'}>{q.category}</Chip>
          <h2 className="text-2xl md:text-[32px] font-semibold tracking-tight leading-tight text-neutral-900 mt-4">
            {cleanStem(q.stem)}
          </h2>

          <div className="grid gap-3 mt-8">
            {q.options.map((opt, idx) => {
              const active = selected === idx;
              return (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={() => choose(q.id, idx, step)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 text-left rounded-2xl px-5 py-4 md:py-5 border-2 transition-colors ${
                    active
                      ? 'border-[#0071e3] bg-[#0071e3]/[0.06]'
                      : 'border-transparent bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.04)] hover:border-black/10'
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[15px] font-semibold transition-colors ${
                      active ? 'bg-[#0071e3] text-white' : 'bg-black/[0.05] text-neutral-500'
                    }`}
                  >
                    {active ? <Check className="w-5 h-5" /> : String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`text-[16px] md:text-[17px] leading-snug ${active ? 'text-neutral-900 font-medium' : 'text-neutral-700'}`}>
                    {opt}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-10">
        <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>
        {isLast ? (
          <Button onClick={finish} disabled={answeredCount < questions.length}>
            Ver resultados ({answeredCount}/10) <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => go(step + 1)}>
            Siguiente <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
