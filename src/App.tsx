import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PurposeScreen, { type Purpose } from './screens/PurposeScreen';
import MatrixScreen from './screens/MatrixScreen';
import CompraeConstrucao from './tools/CompraeConstrucao';
import VendaDaCartaContemplada from './tools/VendaDaCartaContemplada';
import AluguelConsorcio from './tools/AluguelConsorcio';
import CartaAplicada from './tools/CartaAplicada';
import QuitacaoFinanciamento from './tools/QuitacaoFinanciamento';
import QuickCalc from './tools/QuickCalc';
import SimuladorLance from './tools/SimuladorLance';

type View = 'purpose' | 'matrix' | 'tool' | 'quickcalc';
type Path = 'acquisition' | 'return';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

export default function App() {
  const [view, setView] = useState<View>('purpose');
  const [path, setPath] = useState<Path>('acquisition');
  const [tool, setTool] = useState<number | null>(null);

  const handlePurposeSelect = (purpose: Purpose) => {
    if (purpose === 'quickcalc') {
      setView('quickcalc');
    } else {
      setPath(purpose);
      setView('matrix');
    }
  };

  const handleToolSelect = (t: number) => {
    setTool(t);
    setView('tool');
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'purpose' && (
        <motion.div key="purpose" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <PurposeScreen onSelect={handlePurposeSelect} />
        </motion.div>
      )}

      {view === 'quickcalc' && (
        <motion.div key="quickcalc" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <QuickCalc onBack={() => setView('purpose')} />
        </motion.div>
      )}

      {view === 'matrix' && (
        <motion.div key="matrix" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <MatrixScreen
            path={path}
            onSelect={handleToolSelect}
            onBack={() => setView('purpose')}
          />
        </motion.div>
      )}

      {view === 'tool' && tool === 1 && (
        <motion.div key="tool-1" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <CompraeConstrucao onBack={() => setView('matrix')} />
        </motion.div>
      )}

      {view === 'tool' && tool === 2 && (
        <motion.div key="tool-2" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <VendaDaCartaContemplada onBack={() => setView('matrix')} />
        </motion.div>
      )}

      {view === 'tool' && tool === 3 && (
        <motion.div key="tool-3" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <AluguelConsorcio onBack={() => setView('matrix')} />
        </motion.div>
      )}

      {view === 'tool' && tool === 4 && (
        <motion.div key="tool-4" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <CartaAplicada onBack={() => setView('matrix')} />
        </motion.div>
      )}

      {view === 'tool' && tool === 5 && (
        <motion.div key="tool-5" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <QuitacaoFinanciamento onBack={() => setView('matrix')} />
        </motion.div>
      )}

      {view === 'tool' && tool === 6 && (
        <motion.div key="tool-6" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <SimuladorLance onBack={() => setView('matrix')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
