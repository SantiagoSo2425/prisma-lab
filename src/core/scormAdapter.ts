/**
 * Adaptador de Interoperabilidad SCORM 1.2 (ADL SCORM Run-Time Environment)
 * Implementa las funciones canónicas CMI: LMSInitialize, LMSSetValue, LMSGetValue, LMSCommit y LMSFinish.
 * Funciona de forma transparente en Moodle, Canvas, Blackboard o en modo Standalone (LocalStorage).
 */

interface Scorm12API {
  LMSInitialize: (param: string) => string;
  LMSFinish: (param: string) => string;
  LMSGetValue: (element: string) => string;
  LMSSetValue: (element: string, value: string) => string;
  LMSCommit: (param: string) => string;
  LMSGetLastError: () => string;
  LMSGetErrorString: (errorCode: string) => string;
  LMSGetDiagnostic: (errorCode: string) => string;
}

declare global {
  interface Window {
    API?: Scorm12API;
  }
}

class ScormService {
  private api: Scorm12API | null = null;
  private initialized = false;
  private startedAt = Date.now();

  private findAPI(win: Window): Scorm12API | null {
    let findAPITries = 0;
    let currentWin: Window | null = win;
    while (currentWin && !currentWin.API && currentWin.parent && currentWin.parent !== currentWin) {
      findAPITries++;
      if (findAPITries > 10) return null;
      try {
        currentWin = currentWin.parent;
      } catch {
        return null;
      }
    }
    return currentWin?.API || null;
  }

  public initialize(): boolean {
    if (this.initialized) return true;
    if (typeof window === 'undefined') return false;

    this.api = this.findAPI(window);
    if (!this.api && window.opener) {
      try {
        this.api = this.findAPI(window.opener as Window);
      } catch {
        this.api = null;
      }
    }

    if (this.api) {
      const result = this.api.LMSInitialize('');
      this.initialized = result === 'true';
      if (this.initialized) {
        this.startedAt = Date.now();
        const status = this.api.LMSGetValue('cmi.core.lesson_status');
        if (!status || status === 'not attempted') {
          this.api.LMSSetValue('cmi.core.lesson_status', 'incomplete');
          this.api.LMSCommit('');
        }
      }
      return this.initialized;
    }
    return false;
  }

  public isConnected(): boolean {
    return this.initialized && this.api !== null;
  }

  /** Nombre del estudiante que provee el LMS (cmi.core.student_name, formato "Apellido, Nombre"). */
  public getStudentName(): string | null {
    if (!this.api || !this.initialized) this.initialize();
    if (!this.api || !this.initialized) return null;
    const raw = this.api.LMSGetValue('cmi.core.student_name');
    if (!raw) return null;
    const [last, first] = raw.split(',').map((p) => p.trim());
    return first ? `${first} ${last}` : last;
  }

  /**
   * Envía al LMS solo los campos indicados. La ubicación se puede actualizar sin tocar la nota
   * ni el estado, para que navegar entre módulos nunca sobrescriba un "passed" o "failed".
   */
  public syncProgress(params: {
    scoreRaw?: number;
    lessonStatus?: 'incomplete' | 'completed' | 'passed' | 'failed';
    lessonLocation?: string;
    suspendDataJson?: string;
  }): boolean {
    if (!this.api || !this.initialized) {
      this.initialize();
    }
    if (!this.api || !this.initialized) return false;

    if (params.scoreRaw !== undefined) {
      const clampedScore = Math.max(0, Math.min(100, Math.round(params.scoreRaw)));
      this.api.LMSSetValue('cmi.core.score.min', '0');
      this.api.LMSSetValue('cmi.core.score.max', '100');
      this.api.LMSSetValue('cmi.core.score.raw', String(clampedScore));
    }
    if (params.lessonStatus) {
      this.api.LMSSetValue('cmi.core.lesson_status', params.lessonStatus);
    }
    if (params.lessonLocation) {
      this.api.LMSSetValue('cmi.core.lesson_location', params.lessonLocation);
    }
    if (params.suspendDataJson && params.suspendDataJson.length <= 4096) {
      this.api.LMSSetValue('cmi.suspend_data', params.suspendDataJson);
    }
    return this.api.LMSCommit('') === 'true';
  }

  /** Tiempo de sesión en formato SCORM 1.2 (HHHH:MM:SS.SS). */
  private sessionTime(): string {
    const totalSec = Math.max(0, (Date.now() - this.startedAt) / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const sec = totalSec % 60;
    const pad = (n: number, w: number) => String(n).padStart(w, '0');
    return `${pad(h, 4)}:${pad(m, 2)}:${sec.toFixed(2).padStart(5, '0')}`;
  }

  public finish(): boolean {
    if (this.api && this.initialized) {
      this.api.LMSSetValue('cmi.core.session_time', this.sessionTime());
      const status = this.api.LMSGetValue('cmi.core.lesson_status');
      // Si el curso no ha terminado, se suspende para que el LMS retome el intento.
      this.api.LMSSetValue('cmi.core.exit', status === 'passed' || status === 'failed' ? '' : 'suspend');
      this.api.LMSCommit('');
      const res = this.api.LMSFinish('');
      this.initialized = false;
      return res === 'true';
    }
    return false;
  }
}

export const scormAdapter = new ScormService();
