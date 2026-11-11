import React, { useState } from 'react';
import { usePrismaStore } from '../../store/usePrismaStore';
import { validatePrismaFlow } from '../../core/flowValidator';
import { scormAdapter } from '../../core/scormAdapter';
import { useOvaProgress } from '../../core/ovaProgress';
import { PrismLogo } from '../landing/Landing';
import { DidacticGuideModal } from './DidacticGuideModal';
import { ChevronLeft, Contrast, GraduationCap } from 'lucide-react';

interface HeaderProps {
  onHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHome }) => {
  const { session, highContrastMode, toggleHighContrast, loadPreset } = usePrismaStore();
  // La primera vez que se entra al laboratorio se muestra la guía (prerrequisitos e instrucciones).
  const [guideOpen, setGuideOpen] = useState(() => {
    try {
      return localStorage.getItem('prisma-lab-guide-seen') !== '1';
    } catch {
      return false;
    }
  });
  const closeGuide = () => {
    setGuideOpen(false);
    try {
      localStorage.setItem('prisma-lab-guide-seen', '1');
    } catch {
      /* almacenamiento no disponible: se ignora */
    }
  };

  const validation = validatePrismaFlow(session.flowCounts);
  const scormConnected = scormAdapter.isConnected();
  const progress = useOvaProgress();

  const presetValue = session.id.includes('segress')
    ? 'segress'
    : session.id.includes('clinical')
    ? 'clinical'
    : 'broken';

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/75 border-b border-black/5">
        <div className="max-w-7xl mx-auto h-14 px-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onHome}
              className="inline-flex items-center gap-1 text-[13px] text-[#0071e3] hover:underline"
            >
              <ChevronLeft className="w-4 h-4" />
              Inicio
            </button>
            <span className="w-px h-5 bg-black/10" />
            <div className="flex items-center gap-2">
              <PrismLogo className="w-5 h-5" />
              <span className="font-semibold text-neutral-900 tracking-tight">PRISMA-Lab</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón de Guía Didáctica OVA */}
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3]/10 hover:bg-[#0071e3]/15 text-[#0071e3] px-3.5 py-1.5 text-[13px] font-semibold transition"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Guía OVA</span>
              <span className="hidden sm:inline text-[11px] opacity-75">
                ({progress.completedStepsCount}/6)
              </span>
            </button>

            <select
              value={presetValue}
              onChange={(e) => loadPreset(e.target.value as 'segress' | 'clinical' | 'broken')}
              aria-label="Seleccionar caso de estudio"
              className="rounded-full bg-black/[0.04] hover:bg-black/[0.07] px-3.5 py-1.5 text-[13px] font-medium text-neutral-800 focus:outline-none cursor-pointer transition"
            >
              <option value="segress">💻 Ingeniería de Software</option>
              <option value="clinical">🫀 Ciencias de la Salud</option>
              <option value="broken">⚠️ Reto: flujo roto</option>
            </select>

            <span
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium ${
                validation.canExport ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  validation.canExport ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                }`}
              />
              {validation.canExport ? 'Cuadra' : 'No cuadra'}
            </span>

            <span
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-neutral-500 bg-black/[0.03]"
              title="Adaptador SCORM 1.2"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  scormConnected ? 'bg-emerald-500' : 'bg-neutral-300'
                }`}
              />
              SCORM
            </span>

            <button
              type="button"
              onClick={toggleHighContrast}
              title="Alto contraste (WCAG 2.1 / NTC 5854)"
              aria-label="Activar o desactivar alto contraste"
              aria-pressed={highContrastMode}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                highContrastMode
                  ? 'bg-neutral-900 text-white'
                  : 'bg-black/[0.04] text-neutral-700 hover:bg-black/[0.08]'
              }`}
            >
              <Contrast className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <DidacticGuideModal open={guideOpen} onClose={closeGuide} />
    </>
  );
};
