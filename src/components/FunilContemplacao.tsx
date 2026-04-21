import { motion } from 'framer-motion';

interface Props {
  prazoTotal: number;
  mesContemplacao: number;
  onChangeMes: (v: number) => void;
}

export default function FunilContemplacao({ prazoTotal, mesContemplacao, onChangeMes }: Props) {
  const W = 400;
  const H = 100;

  // Curva logarítmica simples: probabilidade acumulada cresce ao longo do prazo
  const prob = (m: number) => Math.min(0.99, m / prazoTotal);
  const points = Array.from({ length: prazoTotal }, (_, i) => i + 1);
  const pathD = points
    .map((m, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - prob(m) * H;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const probAtMes = prob(mesContemplacao);
  const xMes = ((mesContemplacao - 1) / (prazoTotal - 1)) * W;
  const yMes = H - probAtMes * H;

  const p25 = Math.round(prazoTotal * 0.25);
  const p50 = Math.round(prazoTotal * 0.5);
  const p75 = Math.round(prazoTotal * 0.75);

  return (
    <div className="p-6 rounded-2xl border space-y-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
        Distribuição de Contemplações ao Longo do Prazo
      </p>

      {/* SVG Curve */}
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H + 10}`} className="w-full" style={{ height: 110 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C1B176" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#C1B176" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${pathD} L ${W} ${H} L 0 ${H} Z`} fill="url(#areaGrad)" />
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
          {/* Marker do mês selecionado */}
          <line x1={xMes} y1={0} x2={xMes} y2={H} stroke="rgba(193,177,118,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
          <circle cx={xMes} cy={yMes} r="6" fill="#C1B176" />
          <text
            x={Math.min(xMes + 8, W - 60)}
            y={Math.max(yMes - 6, 14)}
            fill="#C1B176"
            fontSize="11"
            fontWeight="bold"
            fontFamily="Montserrat"
          >
            Mês {mesContemplacao}
          </text>
          {/* Eixo X: referências */}
          {[p25, p50, p75].map((m) => (
            <text
              key={m}
              x={((m - 1) / (prazoTotal - 1)) * W}
              y={H + 10}
              fill="rgba(160,160,160,0.5)"
              fontSize="9"
              textAnchor="middle"
              fontFamily="Montserrat"
            >
              {m}
            </text>
          ))}
        </svg>
      </div>

      {/* Slider principal */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Mês estimado de contemplação
          </label>
          <span className="text-sm font-black px-3 py-1 rounded-full" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
            Mês {mesContemplacao}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={prazoTotal}
          value={mesContemplacao}
          onChange={(e) => onChangeMes(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Mês 1</span>
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Mês {prazoTotal}</span>
        </div>
      </div>

      {/* Info contextual */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Início do grupo', mes: `Mês 1–${p25}`, cor: '#A0A0A0' },
          { label: 'Meio do grupo', mes: `Mês ${p25}–${p75}`, cor: 'var(--gold)' },
          { label: 'Final do grupo', mes: `Mês ${p75}–${prazoTotal}`, cor: '#00C864' },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-xl"
            style={{
              background: mesContemplacao <= p25 && item.label === 'Início do grupo'
                ? 'rgba(193,177,118,0.12)'
                : mesContemplacao > p25 && mesContemplacao <= p75 && item.label === 'Meio do grupo'
                  ? 'rgba(193,177,118,0.12)'
                  : mesContemplacao > p75 && item.label === 'Final do grupo'
                    ? 'rgba(193,177,118,0.12)'
                    : 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(193,177,118,0.1)',
            }}
          >
            <p className="text-[9px] font-black uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
            <p className="text-xs font-bold" style={{ color: item.cor }}>{item.mes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
