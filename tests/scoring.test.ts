import { describe, it, expect, beforeEach } from 'vitest';
import { PRE_POST_QUESTIONS } from '../src/data/prePostQuestions';
import {
  computeLmsResult,
  computeSusScore,
  computeLoriAvg,
  computeTestPct,
  MASTERY_SCORE,
} from '../src/core/scoring';

const postQs = PRE_POST_QUESTIONS.filter((q) => q.phase === 'post');

function answersWithCorrect(n: number): Record<string, number> {
  const out: Record<string, number> = {};
  postQs.forEach((q, i) => {
    out[q.id] = i < n ? q.correctIndex : (q.correctIndex + 1) % q.options.length;
  });
  return out;
}

describe('Calificación reportada al LMS (post-test)', () => {
  it('usa el umbral del manifiesto (75)', () => {
    expect(MASTERY_SCORE).toBe(75);
  });

  it('queda "incomplete" mientras no se envía el post-test, aunque las respuestas sean correctas', () => {
    const r = computeLmsResult(answersWithCorrect(postQs.length), false);
    expect(r.lessonStatus).toBe('incomplete');
  });

  it('aprueba con 80 % y reprueba con 70 %', () => {
    expect(computeLmsResult(answersWithCorrect(8), true)).toEqual({ scoreRaw: 80, lessonStatus: 'passed' });
    expect(computeLmsResult(answersWithCorrect(7), true)).toEqual({ scoreRaw: 70, lessonStatus: 'failed' });
  });

  it('un post-test sin responder vale 0 y reprueba', () => {
    expect(computeLmsResult({}, true)).toEqual({ scoreRaw: 0, lessonStatus: 'failed' });
    expect(computeTestPct({}, 'pre')).toBe(0);
  });
});

describe('Instrumentos de calidad del OVA (no son nota del estudiante)', () => {
  it('SUS es null hasta responder los 10 ítems', () => {
    expect(computeSusScore(Array(10).fill(null))).toBeNull();
    expect(computeSusScore([5, 1, 5, 1, 5, 1, 5, 1, 5, null])).toBeNull();
    expect(computeSusScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBe(100);
    expect(computeSusScore([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(50);
  });

  it('LORI es null sin criterios calificados', () => {
    expect(computeLoriAvg({})).toBeNull();
    expect(computeLoriAvg({ a: 4, b: 2 })).toBe(3);
  });
});

describe('Adaptador SCORM 1.2', () => {
  let calls: Array<[string, string]>;
  let store: Record<string, string>;

  beforeEach(async () => {
    calls = [];
    store = { 'cmi.core.lesson_status': 'not attempted', 'cmi.core.student_name': 'Pérez, Ana' };
    (globalThis as any).window = {
      API: {
        LMSInitialize: () => 'true',
        LMSFinish: () => 'true',
        LMSGetValue: (k: string) => store[k] ?? '',
        LMSSetValue: (k: string, v: string) => {
          calls.push([k, v]);
          store[k] = v;
          return 'true';
        },
        LMSCommit: () => 'true',
        LMSGetLastError: () => '0',
        LMSGetErrorString: () => '',
        LMSGetDiagnostic: () => '',
      },
    };
    (globalThis as any).window.parent = (globalThis as any).window;
  });

  it('cambiar de módulo solo actualiza la ubicación, sin tocar nota ni estado', async () => {
    const { scormAdapter } = await import('../src/core/scormAdapter');
    scormAdapter.initialize();
    store['cmi.core.lesson_status'] = 'passed';
    calls = [];
    scormAdapter.syncProgress({ lessonLocation: 'module2' });
    expect(calls).toEqual([['cmi.core.lesson_location', 'module2']]);
    expect(store['cmi.core.lesson_status']).toBe('passed');
  });

  it('lee el nombre del estudiante del LMS y registra el tiempo de sesión al salir', async () => {
    const { scormAdapter } = await import('../src/core/scormAdapter');
    scormAdapter.initialize();
    expect(scormAdapter.getStudentName()).toBe('Ana Pérez');
    scormAdapter.finish();
    expect(store['cmi.core.session_time']).toMatch(/^\d{4}:\d{2}:\d{2}\.\d{2}$/);
    expect(store['cmi.core.exit']).toBe('suspend');
  });
});
