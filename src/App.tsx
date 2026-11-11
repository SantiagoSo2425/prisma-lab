import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrismaStore } from './store/usePrismaStore';
import ovaConfig from './data/ova.config.json';
import { scormAdapter } from './core/scormAdapter';
import { ActiveTabId } from './types/prisma';
import { Landing } from './components/landing/Landing';
import { Header } from './components/layout/Header';
import { SidebarStepper } from './components/layout/SidebarStepper';
import { PrePostAssessment } from './components/modules/PrePostAssessment';
import { Module1Epistemology } from './components/modules/Module1Epistemology';
import { Module2SearchFlow } from './components/modules/Module2SearchFlow';
import { Module3Synthesis } from './components/modules/Module3Synthesis';
import { Module4AuditOpenSci } from './components/modules/Module4AuditOpenSci';
import { QualityEvaluation } from './components/modules/QualityEvaluation';

export function App() {
  const { activeTab, highContrastMode, setActiveTab } = usePrismaStore();
  const [view, setView] = useState<'landing' | 'lab'>('landing');

  useEffect(() => {
    scormAdapter.initialize();
    const handleUnload = () => {
      scormAdapter.finish();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const enterLab = (tab?: ActiveTabId) => {
    if (tab) setActiveTab(tab);
    setView('lab');
    window.scrollTo({ top: 0 });
  };

  const goHome = () => {
    setView('landing');
    window.scrollTo({ top: 0 });
  };

  if (view === 'landing') {
    return <Landing onEnter={enterLab} />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#f5f5f7] text-neutral-900 ${
        highContrastMode ? 'high-contrast-ntc5854' : ''
      }`}
    >
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Header onHome={goHome} />
      <SidebarStepper />

      <main id="contenido" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-5 py-6 focus:outline-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {activeTab === 'pretest' && <PrePostAssessment phase="pre" />}
            {activeTab === 'module1' && <Module1Epistemology />}
            {activeTab === 'module2' && <Module2SearchFlow />}
            {activeTab === 'module3' && <Module3Synthesis />}
            {activeTab === 'module4' && <Module4AuditOpenSci />}
            {activeTab === 'posttest_lori' && <QualityEvaluation />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-8 px-5 text-xs text-neutral-400 text-center border-t border-black/5">
        {ovaConfig.shortTitle} v{ovaConfig.version} · {ovaConfig.authors.map((a) => a.name).join(', ')} ·{' '}
        {ovaConfig.institution.name} · {ovaConfig.license.spdx} · Créditos, prerrequisitos y privacidad en «Guía OVA»
      </footer>
    </div>
  );
}

export default App;
