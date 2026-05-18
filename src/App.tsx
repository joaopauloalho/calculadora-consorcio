import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ClienteAuthScreen } from './pages/cartas/ClienteAuthScreen';
import { CartasPortalPage } from './pages/cartas/CartasPortalPage';
import { ClienteDashboardPage } from './pages/cartas/ClienteDashboardPage';
import { AdminCartasPage } from './pages/admin/AdminCartasPage';
import PurposeScreen, { type Purpose } from './screens/PurposeScreen';
import MatrixScreen from './screens/MatrixScreen';
import DiagnosticoScreen from './screens/DiagnosticoScreen';
import AtendimentoScreen from './screens/AtendimentoScreen';
import CompraeConstrucao from './tools/CompraeConstrucao';
import VendaDaCartaContemplada from './tools/VendaDaCartaContemplada';
import AluguelConsorcio from './tools/AluguelConsorcio';
import CartaAplicada from './tools/CartaAplicada';
import QuitacaoFinanciamento from './tools/QuitacaoFinanciamento';
import QuickCalc from './tools/QuickCalc';
import SimuladorLance from './tools/SimuladorLance';
import CalculadoraLance from './tools/CalculadoraLance';
import ComissaoVendedor from './tools/ComissaoVendedor';
import AtacadoImobiliario from './tools/AtacadoImobiliario';

type View = 'purpose' | 'matrix' | 'tool' | 'quickcalc' | 'lance' | 'sorteio' | 'diagnostico' | 'atendimento' | 'comissao' | 'atacado';
type Path = 'acquisition' | 'return';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

function CockpitApp() {
  const [view, setView] = useState<View>('purpose');
  const [path, setPath] = useState<Path>('acquisition');
  const [tool, setTool] = useState<number | null>(null);

  const handlePurposeSelect = (purpose: Purpose) => {
    if (purpose === 'quickcalc') {
      setView('quickcalc');
    } else if (purpose === 'lance') {
      setView('lance');
    } else if (purpose === 'sorteio') {
      setView('sorteio');
    } else if (purpose === 'diagnostico') {
      setView('diagnostico');
    } else if (purpose === 'atendimento') {
      setView('atendimento');
    } else if (purpose === 'comissao') {
      setView('comissao');
    } else if (purpose === 'atacado') {
      setView('atacado');
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

      {view === 'diagnostico' && (
        <motion.div key="diagnostico" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <DiagnosticoScreen
            onBack={() => setView('purpose')}
            onSelect={(t) => {
              if (t === 'quickcalc') {
                setView('quickcalc');
              } else if (t === 'lance') {
                setView('lance');
              } else {
                setTool(t);
                setView('tool');
              }
            }}
          />
        </motion.div>
      )}

      {view === 'atendimento' && (
        <motion.div key="atendimento" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <AtendimentoScreen
            onBack={() => setView('purpose')}
            onSelect={(t) => {
              if (t === 'quickcalc') {
                setView('quickcalc');
              } else if (t === 'lance') {
                setView('lance');
              } else {
                setTool(t);
                setView('tool');
              }
            }}
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

      {view === 'lance' && (
        <motion.div key="lance" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <CalculadoraLance onBack={() => setView('purpose')} />
        </motion.div>
      )}

      {view === 'sorteio' && (
        <motion.div key="sorteio" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <SimuladorLance onBack={() => setView('purpose')} />
        </motion.div>
      )}

      {view === 'comissao' && (
        <motion.div key="comissao" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <ComissaoVendedor onBack={() => setView('purpose')} />
        </motion.div>
      )}

      {view === 'atacado' && (
        <motion.div key="atacado" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
          <AtacadoImobiliario onBack={() => setView('purpose')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cartas" element={<ClienteAuthScreen />} />
        <Route
          path="/cartas/portal"
          element={
            <ProtectedRoute role="cliente">
              <CartasPortalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cartas/dashboard"
          element={
            <ProtectedRoute role="cliente">
              <ClienteDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cartas"
          element={
            <ProtectedRoute role="admin">
              <AdminCartasPage />
            </ProtectedRoute>
          }
        />
        <Route path="/*" element={<CockpitApp />} />
      </Routes>
    </BrowserRouter>
  );
}
