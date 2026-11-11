import { PRE_POST_QUESTIONS } from '../data/prePostQuestions';
import ovaConfig from '../data/ova.config.json';

/** Puntaje mínimo para aprobar (coincide con adlcp:masteryscore del manifiesto). */
export const MASTERY_SCORE: number = ovaConfig.masteryScore;

/** Porcentaje de aciertos (0-100) de la prueba diagnóstica o final. */
export function computeTestPct(answers: Record<string, number>, phase: 'pre' | 'post'): number {
  const qs = PRE_POST_QUESTIONS.filter((q) => q.phase === phase);
  if (qs.length === 0) return 0;
  const correct = qs.filter((q) => answers[q.id] === q.correctIndex).length;
  return Math.round((correct / qs.length) * 100);
}

export type LmsLessonStatus = 'incomplete' | 'passed' | 'failed';

/**
 * Resultado que se reporta al LMS. La calificación es SOLO el desempeño en el post-test
 * (aprendizaje); los instrumentos LORI y SUS evalúan la calidad del objeto, no al estudiante.
 */
export function computeLmsResult(postAnswers: Record<string, number>, postSubmitted: boolean): {
  scoreRaw: number;
  lessonStatus: LmsLessonStatus;
} {
  const scoreRaw = computeTestPct(postAnswers, 'post');
  if (!postSubmitted) return { scoreRaw, lessonStatus: 'incomplete' };
  return { scoreRaw, lessonStatus: scoreRaw >= MASTERY_SCORE ? 'passed' : 'failed' };
}

/** Puntaje SUS (0-100). Devuelve null mientras falten respuestas. */
export function computeSusScore(responses: Array<number | null>): number | null {
  if (responses.length !== 10 || responses.some((v) => v === null || v === undefined)) return null;
  return (
    (responses as number[]).reduce((acc, val, idx) => acc + (idx % 2 === 0 ? val - 1 : 5 - val), 0) * 2.5
  );
}

/** Promedio LORI (1-5) de los criterios respondidos. Devuelve null si no hay ninguno. */
export function computeLoriAvg(scores: Record<string, number>): number | null {
  const vals = Object.values(scores);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
