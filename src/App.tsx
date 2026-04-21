import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WelcomeScreen from './screens/WelcomeScreen';
import MatrixScreen from './screens/MatrixScreen';
import CompraeConstrucao from './tools/CompraeConstrucao';
import VendaDaCartaContemplada from './tools/VendaDaCartaContemplada';
import AluguelConsorcio from './tools/AluguelConsorcio';

type View = 'welcome' | 'matrix' | 'tool';
type Path = 'acquisition' | 'return';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

export default function App() {
  const [view, setView] = useState<View>('welcome');
  const [path, setPath] = useState<Path>('acquisition');
  const [tool, setTool] = useState<number | null>(null);

  const handlePathSelect = (p: Path) => {
    setPath(p);
    setView('matrix');
  };

  const handleToolSelect = (t: number) => {
    setTool(t);
    setView('tool');
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'welcome' && (
        <motion.div key="welcome" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <WelcomeScreen onSelect={handlePathSelect} />
        </motion.div>
      )}

      {view === 'matrix' && (
        <motion.div key="matrix" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <MatrixScreen
            path={path}
            onSelect={handleToolSelect}
            onBack={() => setView('welcome')}
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
    </AnimatePresence>
  );
}
