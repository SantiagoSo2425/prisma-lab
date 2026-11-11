import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  PrismaSessionState,
  ActiveTabId,
  ChecklistItemUserEntry,
  SwimProtocolEntry,
  GradeOutcomeRow,
} from '../types/prisma';
import {
  PRESET_SOFTWARE_ENGINEERING,
  PRESET_HEALTH_SCIENCES,
  PRESET_BROKEN_AUDIT_CHALLENGE,
  INITIAL_SWIM_ITEMS,
  INITIAL_GRADE_ROWS,
} from '../data/presets';
import { PRISMA_42_CHECKLIST } from '../data/checklist42';
import { autoReconcileFlowCounts } from '../core/flowValidator';
import { scormAdapter } from '../core/scormAdapter';
import { computeLmsResult } from '../core/scoring';

function buildInitialChecklistEntries(): Record<string, ChecklistItemUserEntry> {
  const map: Record<string, ChecklistItemUserEntry> = {};
  PRISMA_42_CHECKLIST.forEach((item) => {
    map[item.subItemId] = {
      subItemId: item.subItemId,
      // El estudiante debe auditar cada sub-ítem: nada viene marcado de antemano.
      status: 'pending',
      pageOrSection: '',
      manuscriptExcerpt: '',
      naJustification: '',
    };
  });
  return map;
}

interface PrismaLabStore {
  activeTab: ActiveTabId;
  highContrastMode: boolean;
  session: PrismaSessionState;
  // Módulo 1: Auditoría de caso AMSTAR 2 vs PRISMA
  amstarAuditAnswers: Record<string, 'pass' | 'fail'>;
  amendmentsDescription: string;
  // Módulo 3: SWiM y GRADE
  swimItems: SwimProtocolEntry[];
  gradeRows: GradeOutcomeRow[];
  // Módulo 4: Checklist de 42 sub-ítems
  checklistEntries: Record<string, ChecklistItemUserEntry>;
  // Evaluaciones Pre/Post y Calidad LORI/SUS
  preTestAnswers: Record<string, number>;
  preTestSubmitted: boolean;
  postTestAnswers: Record<string, number>;
  postTestSubmitted: boolean;
  loriScores: Record<string, number>; // 9 criterios (1 a 5)
  susResponses: Array<number | null>; // 10 ítems SUS (1 a 5); null = sin responder

  // Acciones
  setActiveTab: (tab: ActiveTabId) => void;
  toggleHighContrast: () => void;
  loadPreset: (presetKey: 'segress' | 'clinical' | 'broken') => void;
  updateProtocol: (partial: Partial<PrismaSessionState['protocol']>) => void;
  updatePico: (partial: Partial<PrismaSessionState['protocol']['pico']>) => void;
  updateRegistration: (partial: Partial<PrismaSessionState['protocol']['registration']>) => void;
  setAmendmentsDescription: (desc: string) => void;
  setAmstarAuditAnswer: (domainId: string, verdict: 'pass' | 'fail') => void;
  updateSearchAndScreening: (partial: Partial<PrismaSessionState['searchAndScreening']>) => void;
  updateDatabaseEntry: (index: number, entry: PrismaSessionState['searchAndScreening']['databases'][0]) => void;
  addDatabaseEntry: () => void;
  removeDatabaseEntry: (index: number) => void;
  syncDatabasesTotalToFlow: () => void;
  updateFlowCounts: (partial: Partial<PrismaSessionState['flowCounts']>) => void;
  updateExclusionReason: (index: number, reasonCategory: string, count: number) => void;
  addExclusionReason: () => void;
  removeExclusionReason: (index: number) => void;
  reconcileFlowCountsNow: () => void;
  updateSynthesisAndQuality: (partial: Partial<PrismaSessionState['synthesisAndQuality']>) => void;
  updateSwimItem: (itemNumber: number, response: string) => void;
  updateGradeRow: (id: string, partial: Partial<GradeOutcomeRow>) => void;
  addGradeRow: () => void;
  removeGradeRow: (id: string) => void;
  updateChecklistEntry: (subItemId: string, partial: Partial<ChecklistItemUserEntry>) => void;
  updateOpenScience: (partial: Partial<PrismaSessionState['openScience']>) => void;
  setPreTestAnswer: (qId: string, optionIdx: number) => void;
  submitPreTest: () => void;
  setPostTestAnswer: (qId: string, optionIdx: number) => void;
  submitPostTest: () => void;
  resetTest: (phase: 'pre' | 'post') => void;
  setLoriScore: (criterionKey: string, score: number) => void;
  setSusResponse: (index: number, value: number) => void;
  /** Reporta al LMS la nota del post-test y el estado passed/failed/incomplete. */
  syncScormToLms: () => boolean;
}

export const usePrismaStore = create<PrismaLabStore>()(
  persist(
    (set, get) => ({
      activeTab: 'module2',
      highContrastMode: false,
      session: PRESET_SOFTWARE_ENGINEERING,
      amstarAuditAnswers: {},
      amendmentsDescription:
        'Enmienda registrada el 2026-10-02 en OSF: Se incorporó la evaluación de modelos GraphCodeBERT y análisis de sensibilidad excluyendo estudios con desbalance extremo (< 2% commits defectuosos).',
      swimItems: INITIAL_SWIM_ITEMS,
      gradeRows: INITIAL_GRADE_ROWS,
      checklistEntries: buildInitialChecklistEntries(),
      preTestAnswers: {},
      preTestSubmitted: false,
      postTestAnswers: {},
      postTestSubmitted: false,
      // Los instrumentos de calidad empiezan vacíos: los responde quien evalúa el OVA.
      loriScores: {},
      susResponses: Array(10).fill(null),

      setActiveTab: (tab) => {
        set({ activeTab: tab });
        // Solo se actualiza la ubicación: la nota y el estado dependen del post-test.
        scormAdapter.syncProgress({ lessonLocation: tab });
      },

      toggleHighContrast: () =>
        set((state) => ({ highContrastMode: !state.highContrastMode })),

      loadPreset: (presetKey) => {
        const chosen =
          presetKey === 'segress'
            ? PRESET_SOFTWARE_ENGINEERING
            : presetKey === 'clinical'
            ? PRESET_HEALTH_SCIENCES
            : PRESET_BROKEN_AUDIT_CHALLENGE;
        set({
          session: structuredClone(chosen),
        });
      },

      updateProtocol: (partial) =>
        set((state) => ({
          session: {
            ...state.session,
            protocol: { ...state.session.protocol, ...partial },
          },
        })),

      updatePico: (partial) =>
        set((state) => ({
          session: {
            ...state.session,
            protocol: {
              ...state.session.protocol,
              pico: { ...state.session.protocol.pico, ...partial },
            },
          },
        })),

      updateRegistration: (partial) =>
        set((state) => ({
          session: {
            ...state.session,
            protocol: {
              ...state.session.protocol,
              registration: {
                ...state.session.protocol.registration,
                ...partial,
              },
            },
          },
        })),

      setAmendmentsDescription: (desc) => set({ amendmentsDescription: desc }),

      setAmstarAuditAnswer: (domainId, verdict) =>
        set((state) => ({
          amstarAuditAnswers: {
            ...state.amstarAuditAnswers,
            [domainId]: verdict,
          },
        })),

      updateSearchAndScreening: (partial) =>
        set((state) => ({
          session: {
            ...state.session,
            searchAndScreening: {
              ...state.session.searchAndScreening,
              ...partial,
            },
          },
        })),

      updateDatabaseEntry: (index, entry) =>
        set((state) => {
          const updated = [...state.session.searchAndScreening.databases];
          updated[index] = entry;
          return {
            session: {
              ...state.session,
              searchAndScreening: {
                ...state.session.searchAndScreening,
                databases: updated,
              },
            },
          };
        }),

      addDatabaseEntry: () =>
        set((state) => ({
          session: {
            ...state.session,
            searchAndScreening: {
              ...state.session.searchAndScreening,
              databases: [
                ...state.session.searchAndScreening.databases,
                {
                  name: 'Web of Science Core Collection',
                  queryExecuted:
                    'TS=(("systematic review" OR "meta-analysis") AND ("PRISMA 2020" OR "evidence synthesis"))',
                  recordsFound: 150,
                  dateSearched: new Date().toISOString().slice(0, 10),
                },
              ],
            },
          },
        })),

      removeDatabaseEntry: (index) =>
        set((state) => ({
          session: {
            ...state.session,
            searchAndScreening: {
              ...state.session.searchAndScreening,
              databases: state.session.searchAndScreening.databases.filter(
                (_, i) => i !== index
              ),
            },
          },
        })),

      syncDatabasesTotalToFlow: () =>
        set((state) => {
          const sumDb = state.session.searchAndScreening.databases.reduce(
            (acc, d) => acc + (Number(d.recordsFound) || 0),
            0
          );
          const sumReg = state.session.searchAndScreening.registers.reduce(
            (acc, r) => acc + (Number(r.recordsFound) || 0),
            0
          );
          const reconciled = autoReconcileFlowCounts({
            ...state.session.flowCounts,
            recordsIdentifiedDatabases: sumDb,
            recordsIdentifiedRegisters: sumReg,
            recordsDuplicatesRemoved:
              state.session.searchAndScreening.duplicatesRemoved,
          });
          return {
            session: {
              ...state.session,
              flowCounts: reconciled,
            },
          };
        }),

      updateFlowCounts: (partial) =>
        set((state) => ({
          session: {
            ...state.session,
            flowCounts: {
              ...state.session.flowCounts,
              ...partial,
            },
          },
        })),

      updateExclusionReason: (index, reasonCategory, count) =>
        set((state) => {
          const list = [...state.session.flowCounts.reportsExcludedDetailed];
          list[index] = { reasonCategory, count: Math.max(0, Number(count) || 0) };
          return {
            session: {
              ...state.session,
              flowCounts: {
                ...state.session.flowCounts,
                reportsExcludedDetailed: list,
              },
            },
          };
        }),

      addExclusionReason: () =>
        set((state) => ({
          session: {
            ...state.session,
            flowCounts: {
              ...state.session.flowCounts,
              reportsExcludedDetailed: [
                ...state.session.flowCounts.reportsExcludedDetailed,
                { reasonCategory: 'Desenlace primario no evaluado', count: 5 },
              ],
            },
          },
        })),

      removeExclusionReason: (index) =>
        set((state) => ({
          session: {
            ...state.session,
            flowCounts: {
              ...state.session.flowCounts,
              reportsExcludedDetailed:
                state.session.flowCounts.reportsExcludedDetailed.filter(
                  (_, i) => i !== index
                ),
            },
          },
        })),

      reconcileFlowCountsNow: () =>
        set((state) => ({
          session: {
            ...state.session,
            flowCounts: autoReconcileFlowCounts(state.session.flowCounts),
          },
        })),

      updateSynthesisAndQuality: (partial) =>
        set((state) => ({
          session: {
            ...state.session,
            synthesisAndQuality: {
              ...state.session.synthesisAndQuality,
              ...partial,
            },
          },
        })),

      updateSwimItem: (itemNumber, response) =>
        set((state) => ({
          swimItems: state.swimItems.map((it) =>
            it.itemNumber === itemNumber
              ? { ...it, userResponse: response }
              : it
          ),
        })),

      updateGradeRow: (id, partial) =>
        set((state) => ({
          gradeRows: state.gradeRows.map((r) =>
            r.id === id ? { ...r, ...partial } : r
          ),
        })),

      addGradeRow: () =>
        set((state) => ({
          gradeRows: [
            ...state.gradeRows,
            {
              id: `grade-${Date.now()}`,
              outcomeName: 'Nuevo desenlace clínico / de ingeniería',
              numberOfStudies: 8,
              studyDesign: 'RCT',
              riskOfBias: 0,
              inconsistency: 0,
              indirectness: 0,
              imprecision: -1,
              publicationBias: 0,
              effectSummary: 'OR 0.72 (IC 95%: 0.55 a 0.94)',
            },
          ],
        })),

      removeGradeRow: (id) =>
        set((state) => ({
          gradeRows: state.gradeRows.filter((r) => r.id !== id),
        })),

      updateChecklistEntry: (subItemId, partial) =>
        set((state) => ({
          checklistEntries: {
            ...state.checklistEntries,
            [subItemId]: {
              ...state.checklistEntries[subItemId],
              ...partial,
            },
          },
        })),

      updateOpenScience: (partial) =>
        set((state) => ({
          session: {
            ...state.session,
            openScience: {
              ...state.session.openScience,
              ...partial,
            },
          },
        })),

      setPreTestAnswer: (qId, optionIdx) =>
        set((state) => ({
          preTestAnswers: { ...state.preTestAnswers, [qId]: optionIdx },
        })),

      submitPreTest: () => set({ preTestSubmitted: true }),

      setPostTestAnswer: (qId, optionIdx) =>
        set((state) => ({
          postTestAnswers: { ...state.postTestAnswers, [qId]: optionIdx },
        })),

      submitPostTest: () => {
        set({ postTestSubmitted: true });
        get().syncScormToLms();
      },

      resetTest: (phase) =>
        set(phase === 'pre' ? { preTestAnswers: {}, preTestSubmitted: false } : { postTestAnswers: {}, postTestSubmitted: false }),

      setLoriScore: (criterionKey, score) =>
        set((state) => ({
          loriScores: { ...state.loriScores, [criterionKey]: score },
        })),

      setSusResponse: (index, value) =>
        set((state) => {
          const next = [...state.susResponses];
          next[index] = value;
          return { susResponses: next };
        }),

      syncScormToLms: () => {
        const state = get();
        const { scoreRaw, lessonStatus } = computeLmsResult(
          state.postTestAnswers,
          state.postTestSubmitted
        );
        return scormAdapter.syncProgress({
          scoreRaw,
          lessonStatus,
          lessonLocation: state.activeTab,
          suspendDataJson: JSON.stringify({
            id: state.session.id,
            tab: state.activeTab,
            pre: state.preTestAnswers,
            post: state.postTestAnswers,
          }),
        });
      },
    }),
    {
      // v3: se descartan los valores LORI/SUS y la lista de chequeo precargados de versiones previas.
      name: 'prisma-lab-ova-storage-v3',
    }
  )
);
