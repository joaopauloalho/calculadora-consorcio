import { motion } from 'framer-motion';
import { contemplationProbability } from '../lib/calculations';

interface Props {
  prazoTotal: number;
  mesContemplacao: number;
  saudeGrupo: number;
  pontualidade: number;
  onChangeMes: (v: number) => void;
  onChangeSaude: (v: number) => void;
  onChangePontualidade: (v: number) => void;
}

export default function FunilContemplacao({
  prazoTotal, mesContemplacao, saudeGrupo, pontualidade,
  onChangeMes, onChangeSaude, onChangePontualidade,
}: Props) {
  const points = Array.from({ length: prazoTotal }, (_, i) => i + 1);
  const probs = points.map((m) => contemplationProbability(m, prazoTotal, saudeGrupo, pontualidade));

  // SVG path
  const W = 400;
  const H = 100;
  const pathD = probs
    .map((p, i) => {
      const x = (i / (probs.length - 1)) * W;
      const y = H - p * H;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const probAtMes = contemplationProbability(mesContemplacao, prazoTotal, saudeGrupo, pontualidade);
  const xMes = ((mesContemplacao - 1) / (prazoTotal - 1)) * W;
  const yMes = H - probAtMes * H;

  const p50 = points.find((m) => contemplationProbability(m, prazoTotal, saudeGrupo, pontualidade) >= 0.5) ?? '-';
  const p90 = points.find((m) => contemplationProbability(m, prazoTotal, saudeGrupo, pontualidade) >= 0.9) ?? '-';

  return (
    <div className="p-6 rounded-2xl border space-y-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
        Curva de Probabilidade de Contemplação
      </p>

      {/* SVG Curve */}
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H + 10}`} className="w-full" style={{ height: 120 }}>
          {/* Area */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C1B176" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#C1B176" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${pathD} L ${W} ${H} L 0 ${H} Z`}
            fill="url(#areaGrad)"
          />
          <motion.path
            d={pathD}
            fill="none"
            stroke="#C1B176"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          {/* Marker */}
          <line x1={xMes} y1={0} x2={xMes} y2={H} stroke="rgba(193,177,118,0.4)" strokeWidth="1" strokeDasharray="4 3" />
          <circle cx={xMes} cy={yMes} r="5" fill="#C1B176" />
          <text x={xMes + 8} y={yMes - 4} fill="#C1B176" fontSize="10" fontWeight="bold" fontFamily="Montserrat">
            {(probAtMes * 100).toFixed(0)}%
          </text>
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(193,177,118,0.08)' }}>
          <p className="text-[10px] font-black uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>50% de chance até</p>
          <p className="font-black text-white" style={{ fontFamily: 'Montserrat' }}>Mês {p50}</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(193,177,118,0.08)' }}>
          <p className="text-[10px] font-black uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>90% de chance até</p>
          <p className="font-black text-white" style={{ fontFamily: 'Montserrat' }}>Mês {p90}</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(193,177,118,0.12)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] font-black uppercase mb-1" style={{ color: 'var(--gold)' }}>Mês selecionado</p>
          <p className="font-black" style={{ color: 'var(--gold)', fontFamily: 'Montserrat' }}>
            Mês {mesContemplacao} — {(probAtMes * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Mês estimado de contemplação
            </label>
            <span className="text-xs font-black" style={{ color: 'var(--gold)' }}>Mês {mesContemplacao}</span>
          </div>
          <input type="range" min={1} max={prazoTotal} value={mesContemplacao} onChange={(e) => onChangeMes(Number(e.target.value))} className="w-full" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Saúde do grupo
            </label>
            <span className="text-xs font-black" style={{ color: 'var(--gold)' }}>{(saudeGrupo * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min={0.5} max={1} step={0.01} value={saudeGrupo} onChange={(e) => onChangeSaude(Number(e.target.value))} className="w-full" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Sua pontualidade
            </label>
            <span className="text-xs font-black" style={{ color: 'var(--gold)' }}>{(pontualidade * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min={0.5} max={1} step={0.01} value={pontualidade} onChange={(e) => onChangePontualidade(Number(e.target.value))} className="w-full" />
        </div>
      </div>
    </div>
  );
}
