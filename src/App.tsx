import { useState } from 'react';
import {
  Building2,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Info,
  Calculator,
  GanttChartSquare,
  DollarSign,
  LineChart,
  CheckCircle2,
  PieChart,
  UserPlus,
  Clock,
  AlertCircle,
  CalendarDays,
  Wallet,
  ArrowDownCircle,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

const App = () => {
  const [step, setStep] = useState(0);

  const [data, setData] = useState({
    valorTerreno: 200000,
    valorConstrucao: 800000,
    prazoTotal: 220,
    taxaAdm: 0.23,
    mesContemplacao: 30,
    seguroMensalPercent: 0.000555,
    mesesObra: 12,
    valorVendaMercado: 1700000,
    entradaVenda: 800000
  });

  const totalCredito = Number(data.valorTerreno) + Number(data.valorConstrucao);
  const totalComTaxa = totalCredito * (1 + data.taxaAdm);
  const parcelaCheiaOriginal = totalComTaxa / data.prazoTotal;
  const meiaParcela = parcelaCheiaOriginal / 2;

  const valorInvestidoAteContemplacao = data.mesContemplacao * meiaParcela;
  const saldoDevedorNaContemplacao = totalComTaxa - valorInvestidoAteContemplacao;
  const parcelaComSeguro = parcelaCheiaOriginal + (saldoDevedorNaContemplacao * data.seguroMensalPercent);

  const totalPagoNaObra = data.mesesObra * parcelaComSeguro;
  const saldoDevedorPosObra = Math.max(0, saldoDevedorNaContemplacao - (data.mesesObra * parcelaCheiaOriginal));

  const totalDesembolsado = valorInvestidoAteContemplacao + totalPagoNaObra;
  const totalMesesInvestindo = Number(data.mesContemplacao) + Number(data.mesesObra);
  const mediaParcelaInvestida = totalDesembolsado / totalMesesInvestindo;

  const parcelasRestantes = Math.max(0, data.prazoTotal - data.mesContemplacao - data.mesesObra);
  const valorFinanciadoBanco = Math.max(0, Number(data.valorVendaMercado) - Number(data.entradaVenda));

  const amortizacaoMensal = valorFinanciadoBanco / 360;
  const jurosMensaisIniciais = valorFinanciadoBanco * 0.0087;
  const taxasAdministrativas = 450;
  const parcelaEstimadaBanco = valorFinanciadoBanco > 0 ? (amortizacaoMensal + jurosMensaisIniciais + taxasAdministrativas) : 0;

  const totalEstimadoPagoBanco = valorFinanciadoBanco * 2.85;
  const custoTotalAquisicaoConsorcio = Number(data.entradaVenda) + saldoDevedorPosObra;

  const lucroTotal = Number(data.entradaVenda) - totalDesembolsado;
  const lucroMensalMedio = lucroTotal / totalMesesInvestindo;

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const Intro = () => (
    <div className="space-y-6 text-center max-w-2xl mx-auto">
      <div className="inline-flex p-3 bg-blue-100 rounded-2xl text-blue-600 mb-4">
        <LineChart size={40} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800">Como funciona a Alavancagem?</h2>
      <p className="text-slate-600 leading-relaxed text-lg">
        Utilizamos o consórcio como uma ferramenta de crédito barato para construir um ativo de alto valor.
        O segredo está no <strong>ágio da carta contemplada</strong> somado à <strong>valorização do imóvel pronto</strong>.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-medium">
        <div className="p-4 border rounded-xl bg-white">Alavancagem com meia parcela</div>
        <div className="p-4 border rounded-xl bg-white">Construção com custo de obra</div>
        <div className="p-4 border rounded-xl bg-white">Venda com lucro sobre o crédito</div>
      </div>
      <button onClick={nextStep} className="mt-8 bg-blue-600 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-blue-700 transition-all">
        Iniciar Simulação <ArrowRight size={20} />
      </button>
    </div>
  );

  const Step1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">1. Definição do Projeto</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 uppercase">Valor do Terreno</label>
          <input
            type="number"
            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none text-xl font-bold"
            value={data.valorTerreno}
            onChange={(e) => setData({...data, valorTerreno: Number(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 uppercase">Valor da Construção</label>
          <input
            type="number"
            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none text-xl font-bold"
            value={data.valorConstrucao}
            onChange={(e) => setData({...data, valorConstrucao: Number(e.target.value)})}
          />
        </div>
      </div>
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex justify-between items-center">
        <span className="font-bold text-blue-900">Crédito Total Necessário:</span>
        <span className="text-2xl font-black text-blue-600">{formatCurrency(totalCredito)}</span>
      </div>
    </div>
  );

  const Step2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">2. Dados do Consórcio</h2>
      <div className="bg-white p-8 border rounded-3xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Prazo</p>
            <p className="text-xl font-bold">{data.prazoTotal} Meses</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Taxa Adm Total</p>
            <p className="text-xl font-bold">{(data.taxaAdm * 100).toFixed(0)}%</p>
          </div>
        </div>
        <div className="h-px bg-slate-100" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
            <p className="text-orange-600 text-xs uppercase font-bold mb-1">Meia Parcela (Até contemplar)</p>
            <p className="text-2xl font-black text-orange-700">{formatCurrency(meiaParcela)}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-green-600 text-xs uppercase font-bold mb-1">Parcela Cheia (Pós contemplação)</p>
            <p className="text-2xl font-black text-green-700">{formatCurrency(parcelaCheiaOriginal)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">3. Momento da Contemplação</h2>
      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-500 uppercase tracking-tight italic">Mês estimado para contemplar (Máx {data.prazoTotal}):</label>
        <input
          type="range" min="1" max={data.prazoTotal}
          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          value={data.mesContemplacao}
          onChange={(e) => setData({...data, mesContemplacao: Number(e.target.value)})}
        />
        <div className="text-center font-black text-3xl text-blue-600">{data.mesContemplacao}º Mês</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-slate-50 rounded-2xl border">
          <p className="text-slate-500 text-sm font-bold uppercase mb-2">Valor Total Investido</p>
          <p className="text-2xl font-bold">{formatCurrency(valorInvestidoAteContemplacao)}</p>
        </div>
        <div className="p-6 bg-slate-50 rounded-2xl border">
          <p className="text-slate-500 text-sm font-bold uppercase mb-2">Saldo Devedor Atual</p>
          <p className="text-2xl font-bold">{formatCurrency(saldoDevedorNaContemplacao)}</p>
        </div>
        <div className="md:col-span-2 p-6 bg-blue-900 text-white rounded-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-300 text-xs uppercase font-bold mb-1 leading-tight">Nova Parcela (Com Seguro de Vida 0.0555%)</p>
              <p className="text-3xl font-black">{formatCurrency(parcelaComSeguro)}</p>
            </div>
            <Info className="text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">4. Período da Obra</h2>
      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-500 uppercase">Tempo estimado de construção (Meses)</label>
        <input
          type="number"
          className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none text-xl font-bold"
          value={data.mesesObra}
          onChange={(e) => setData({...data, mesesObra: Number(e.target.value)})}
        />
      </div>
      <div className="p-8 bg-white border rounded-3xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-600 font-medium">Custo total de parcelas na obra:</span>
          <span className="font-bold text-lg">{formatCurrency(totalPagoNaObra)}</span>
        </div>
        <div className="h-px bg-slate-100" />
        <div className="flex justify-between items-center text-blue-600">
          <span className="font-bold">Saldo Devedor Pós Obra (Pronto p/ Venda):</span>
          <span className="font-black text-2xl">{formatCurrency(saldoDevedorPosObra)}</span>
        </div>
      </div>
    </div>
  );

  const Step5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">5. Resumo do Desembolso</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Aportes Pré-Contemplação</p>
          <p className="text-xl font-bold text-slate-700">{formatCurrency(valorInvestidoAteContemplacao)}</p>
          <p className="text-slate-400 text-xs mt-1 italic">{data.mesContemplacao} meses pagos</p>
        </div>
        <div className="p-6 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Aportes Durante a Obra</p>
          <p className="text-xl font-bold text-slate-700">{formatCurrency(totalPagoNaObra)}</p>
          <p className="text-slate-400 text-xs mt-1 italic">{data.mesesObra} meses de construção</p>
        </div>
        <div className="md:col-span-2 bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-visible">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <PieChart size={100} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-1">
              <h3 className="text-blue-400 text-xs font-black uppercase tracking-widest">Total Real Saído do Bolso</h3>
              <p className="text-5xl font-black text-white break-words">{formatCurrency(totalDesembolsado)}</p>
            </div>
            <div className="grid grid-cols-2 gap-8 border-l border-slate-700 pl-8">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter mb-1 leading-none">Período Total</p>
                <div className="flex items-center gap-2">
                   <CalendarDays size={16} className="text-blue-500" />
                   <span className="text-xl font-bold">{totalMesesInvestindo} Meses</span>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter mb-1 leading-none">Média Mensal</p>
                <div className="flex items-center gap-2">
                   <TrendingUp size={16} className="text-green-500" />
                   <span className="text-xl font-bold">{formatCurrency(mediaParcelaInvestida)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Step6 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">6. Comparativo de Vantagens</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50 border border-blue-100 rounded-3xl mb-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider block">Valor Total do Imóvel (Pronto)</label>
          <input
            type="number"
            className="w-full p-4 border-2 border-white rounded-xl outline-none font-bold text-blue-900 shadow-sm text-lg"
            value={data.valorVendaMercado}
            onChange={(e) => setData({...data, valorVendaMercado: Number(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider block">Valor de Entrada (Ágio que ele te paga)</label>
          <input
            type="number"
            className="w-full p-4 border-2 border-white rounded-xl outline-none font-bold text-green-600 shadow-sm text-lg"
            value={data.entradaVenda}
            onChange={(e) => setData({...data, entradaVenda: Number(e.target.value)})}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch mt-10">
        <div className="relative p-8 bg-green-50 border-2 border-green-200 rounded-[2.5rem] flex flex-col shadow-md min-h-full">
          <div className="absolute -top-4 left-8 bg-green-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg z-10 whitespace-nowrap">
            Sua Oferta (Consórcio)
          </div>
          <div className="flex items-center gap-2 text-green-700 font-bold pt-2 border-b border-green-100 pb-4 mb-6">
            <CheckCircle2 size={24} /> Transferência de Carta
          </div>
          <div className="flex-grow space-y-6">
            <div className="p-5 bg-white rounded-2xl border border-green-100 shadow-sm">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase mb-1">
                <Clock size={12} className="text-green-600" /> Saldo Devedor Assumido:
              </div>
              <span className="text-2xl font-black text-slate-800 tracking-tighter break-words block">{formatCurrency(saldoDevedorPosObra)}</span>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">{parcelasRestantes} Meses restantes</p>
            </div>
            <div className="p-6 bg-green-600 rounded-2xl shadow-xl shadow-green-100">
              <div className="flex items-center gap-2 text-green-100 text-[10px] font-black uppercase mb-1 leading-none">
                <DollarSign size={12} className="text-white" /> Parcela Mensal Fixa:
              </div>
              <span className="text-3xl font-black text-white tracking-tighter break-words block mt-1">~ {formatCurrency(6100)}</span>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-green-200">
            <p className="text-green-800 text-[10px] font-black uppercase tracking-tight opacity-70 leading-tight mb-2">Valor Final Desembolsado (Entrada + Saldo)</p>
            <p className="text-2xl font-black text-green-900 break-words">{formatCurrency(custoTotalAquisicaoConsorcio)}</p>
          </div>
        </div>
        <div className="relative p-8 bg-red-50 border-2 border-red-100 rounded-[2.5rem] flex flex-col shadow-md min-h-full opacity-95">
          <div className="absolute -top-4 left-8 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg z-10 whitespace-nowrap">
            Mercado (Banco)
          </div>
          <div className="flex items-center gap-2 text-red-700 font-bold pt-2 border-b border-red-100 pb-4 mb-6">
            <AlertCircle size={24} /> Financiamento Imobiliário
          </div>
          <div className="flex-grow space-y-6">
            <div className="p-5 bg-white/60 rounded-2xl border border-red-100">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase mb-1">
                <Clock size={12} className="text-red-600" /> Valor Financiado:
              </div>
              <span className="text-2xl font-black text-slate-800 tracking-tighter break-words block">{formatCurrency(valorFinanciadoBanco)}</span>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Prazo de 360 Meses</p>
            </div>
            <div className="p-6 bg-red-100 rounded-2xl border-2 border-red-200 animate-pulse">
              <div className="flex items-center gap-2 text-red-800 text-[10px] font-black uppercase mb-1 leading-none">
                <DollarSign size={12} className="text-red-700" /> Parcela Inicial (SAC):
              </div>
              <span className="text-3xl font-black text-red-700 tracking-tighter break-words block mt-1">{formatCurrency(parcelaEstimadaBanco)}</span>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-red-200">
            <p className="text-red-800 text-[10px] font-black uppercase tracking-tight opacity-70 leading-tight mb-2">Valor Final Financiado (Total Pago ao Banco)</p>
            <p className="text-2xl font-black text-red-900 break-words">{formatCurrency(totalEstimadoPagoBanco)}</p>
          </div>
        </div>
      </div>
      <div className="bg-slate-900 text-white p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl mt-10 border border-slate-800">
        <div className="flex items-center gap-4 flex-1">
          <div className="p-4 bg-green-500/20 rounded-full text-green-400 flex-shrink-0">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">Economia de Custo Final</p>
            <h4 className="text-2xl font-black text-white tracking-tight break-words text-wrap">O Cliente Poupa <span className="text-green-400">{formatCurrency(totalEstimadoPagoBanco - custoTotalAquisicaoConsorcio)}</span></h4>
          </div>
        </div>
        <div className="h-16 w-px bg-slate-800 hidden md:block mx-4" />
        <div className="text-center md:text-right flex-shrink-0">
          <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1 leading-none text-wrap">Diferença de Fluxo</p>
          <h4 className="text-xl font-bold break-words">-{formatCurrency(parcelaEstimadaBanco - 6100)} mensais</h4>
        </div>
      </div>
    </div>
  );

  const Step7 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">7. Fechamento e Lucro</h2>
      <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-lg border border-blue-700/50 mb-8 overflow-visible">
        <div className="flex items-center gap-3 mb-4 border-b border-blue-800 pb-3">
          <RefreshCw className="text-blue-400 w-5 h-5" />
          <h3 className="font-black text-xs uppercase tracking-widest">Simulador de Sensibilidade (Até {data.prazoTotal} Meses)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-300">Alterar Mês da Contemplação</label>
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-black">{data.mesContemplacao}º Mês</span>
            </div>
            <input
              type="range" min="1" max={data.prazoTotal}
              className="w-full h-2 bg-blue-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
              value={data.mesContemplacao}
              onChange={(e) => setData({...data, mesContemplacao: Number(e.target.value)})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 bg-blue-800/50 rounded-xl border border-blue-700 overflow-hidden">
                <p className="text-blue-400 text-[8px] font-black uppercase mb-1 leading-tight tracking-tighter">Investimento Total</p>
                <p className="text-sm font-bold truncate">{formatCurrency(totalDesembolsado)}</p>
             </div>
             <div className="p-3 bg-blue-800/50 rounded-xl border border-blue-700 overflow-hidden">
                <p className="text-blue-400 text-[8px] font-black uppercase mb-1 leading-tight tracking-tighter">Margem sobre Invest.</p>
                <p className="text-sm font-bold truncate text-green-400">{((lucroTotal / totalDesembolsado) * 100).toFixed(0)}%</p>
             </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-visible mt-4 border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <PieChart size={120} />
        </div>
        <div className="relative z-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-800 pb-10">
            <div className="space-y-1">
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-none">Total Desembolsado</p>
              <p className="text-3xl font-black break-words text-white">{formatCurrency(totalDesembolsado)}</p>
              <div className="flex items-center gap-2 pt-2">
                <TrendingDown size={14} className="text-red-400" />
                <span className="text-xs text-slate-500 font-bold italic tracking-tighter leading-tight">Custo médio mensal: {formatCurrency(mediaParcelaInvestida)}</span>
              </div>
            </div>
            <div className="md:text-right space-y-1">
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-none">Entrada Recebida (Ágio)</p>
              <p className="text-3xl font-black text-green-400 break-words">{formatCurrency(Number(data.entradaVenda))}</p>
              <div className="flex items-center md:justify-end gap-2 pt-2">
                <TrendingUp size={14} className="text-green-400" />
                <span className="text-xs text-slate-500 font-bold italic tracking-tighter leading-tight">Lucro médio mensal: {formatCurrency(lucroMensalMedio)}</span>
              </div>
            </div>
          </div>
          <div className="text-center pt-4">
            <h3 className="text-blue-400 text-sm font-black uppercase tracking-widest mb-2 leading-none text-wrap">LUCRO LÍQUIDO NA OPERAÇÃO</h3>
            <p className="text-5xl md:text-7xl font-black text-green-400 drop-shadow-md break-words tracking-tighter">{formatCurrency(lucroTotal)}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <div className="bg-slate-800 px-6 py-2 rounded-full text-xs font-black border border-slate-700 shadow-inner flex items-center gap-2 transition-all">
                <span className="text-blue-400">ROI:</span> {((lucroTotal / totalDesembolsado) * 100).toFixed(0)}%
              </div>
              <div className="bg-slate-800 px-6 py-2 rounded-full text-xs font-black border border-slate-700 shadow-inner flex items-center gap-2 transition-all">
                <span className="text-blue-400">Tempo de Ativo:</span> {totalMesesInvestindo} Meses
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-20 selection:bg-blue-100">
      <nav className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-black text-xl flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white"><Calculator size={18}/></div>
            Simulador<span className="text-blue-600">Invest</span>
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Etapa {step + 1} de 8
          </div>
        </div>
        <div className="h-1 bg-slate-100 w-full">
          <div
            className="h-full bg-blue-600 transition-all duration-700 ease-out"
            style={{ width: `${((step + 1) / 8) * 100}%` }}
          />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4 md:p-6 mt-6">
        <div className="bg-white rounded-[2.5rem] p-6 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-200/60">
          {step === 0 && <Intro />}
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
          {step === 5 && <Step5 />}
          {step === 6 && <Step6 />}
          {step === 7 && <Step7 />}

          {step > 0 && (
            <div className="mt-12 flex justify-between items-center pt-10 border-t border-slate-100">
              <button
                onClick={prevStep}
                className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-800 transition-all duration-300"
              >
                <ArrowLeft size={16} /> Anterior
              </button>
              {step < 7 ? (
                <button
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Próximo <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setStep(0)}
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all duration-300"
                >
                  Reiniciar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 active:scale-90 shadow-green-200 border-4 border-white">
          <UserPlus size={24} />
        </button>
      </div>
    </div>
  );
};

export default App;
