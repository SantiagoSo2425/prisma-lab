import React from 'react';
import { motion } from 'framer-motion';
import { ActiveTabId } from '../../types/prisma';
import { usePrismaStore } from '../../store/usePrismaStore';
import { useOvaProgress } from '../../core/ovaProgress';
import {
  ClipboardList,
  Scale,
  Calculator,
  GitMerge,
  CheckSquare,
  Award,
  Check,
} from 'lucide-react';

const NAV_STEPS: Array<{
  id: ActiveTabId;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'pretest', title: 'Diagnóstico', icon: ClipboardList },
  { id: 'module1', title: 'Fundamentos', icon: Scale },
  { id: 'module2', title: 'Flujo', icon: Calculator },
  { id: 'module3', title: 'Sesgo y GRADE', icon: GitMerge },
  { id: 'module4', title: 'Auditoría', icon: CheckSquare },
  { id: 'posttest_lori', title: 'Evaluación', icon: Award },
];

export const SidebarStepper: React.FC = () => {
  const { activeTab, setActiveTab } = usePrismaStore();
  const { stepCompleted } = useOvaProgress();

  return (
    <nav
      aria-label="Ruta de aprendizaje de PRISMA-Lab"
      className="sticky top-14 z-30 bg-[#f5f5f7]/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-5 py-3 overflow-x-auto no-scrollbar">
        <div className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] p-1 min-w-max">
          {NAV_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeTab === step.id;
            const isDone = stepCompleted[step.id];
            return (
              <button
                key={step.id}
                type="button"
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Paso ${idx}: ${step.title}${isDone ? ' (completado)' : ''}`}
                onClick={() => {
                  setActiveTab(step.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="segmented-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {isDone ? (
                    <span className="w-4 h-4 rounded-full bg-[#34c759] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span
                      className={`text-[11px] tabular-nums ${
                        isActive ? 'text-[#0071e3]' : 'text-neutral-400'
                      }`}
                    >
                      {idx}
                    </span>
                  )}
                  <Icon className="w-4 h-4" />
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
