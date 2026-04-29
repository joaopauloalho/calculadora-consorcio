export type AtendimentoStepId = 'objetivo' | 'prazo' | 'contexto' | 'capacidade' | 'dor' | 'consorcio';
export type RadarBlockId =
  | 'objetivo'
  | 'prazo'
  | 'contexto'
  | 'capacidade'
  | 'perfil'
  | 'conhecimento'
  | 'objecoes';
export type RadarStatus = 'pendente' | 'parcial' | 'completo';
export type Objetivo = 'imovel' | 'veiculo' | 'investimento';
export type Prazo = 'urgente' | 'curto' | 'medio' | 'flexivel';
export type Moradia = 'aluguel' | 'proprio' | 'familia';
export type CarroStatus = 'tem' | 'nao-tem' | 'quer-trocar';
export type Renda = 'fixa' | 'variavel' | 'mista';
export type Capacidade = 'ate-1500' | '1500-3000' | '3000-6000' | '6000-plus';
export type Dor = 'aluguel' | 'juros' | 'sem-entrada' | 'inseguranca' | 'patrimonio' | 'prazo';
export type ConhecimentoConsorcio = 'nao-conhece' | 'tem-duvidas' | 'medo-contemplacao' | 'ja-entende';
export type PerfilCliente = 'Construtor de patrimonio' | 'Comprador pragmatica' | 'Investidor paciente' | 'Cliente sensivel a prazo';
export type RecommendedTool = 'quickcalc' | 'lance' | 1 | 2 | 3 | 4 | 5 | 6;

export interface AtendimentoAnswers {
  objetivo?: Objetivo;
  prazo?: Prazo;
  moradia?: Moradia;
  carro?: CarroStatus;
  renda?: Renda;
  capacidade?: Capacidade;
  dor?: Dor;
  consorcio?: ConhecimentoConsorcio;
  notes: Partial<Record<AtendimentoStepId, string>>;
}

export interface ConversationOption<T extends string = string> {
  value: T;
  label: string;
  sub?: string;
}

export interface AtendimentoStep {
  id: AtendimentoStepId;
  title: string;
  question: string;
  humanizedPrompt: string;
}

export interface Suggestion {
  id: string;
  title: string;
  body: string;
  tone: 'gold' | 'teal' | 'neutral';
}

export interface FinalRecommendation {
  perfil: PerfilCliente;
  abordagem: string;
  proximoPasso: string;
  ferramenta: RecommendedTool;
  ferramentaLabel: string;
}

export interface RadarBlock {
  id: RadarBlockId;
  label: string;
}

export const ATENDIMENTO_STEPS: AtendimentoStep[] = [
  {
    id: 'objetivo',
    title: 'Objetivo',
    question: 'O que voce pretende conquistar agora?',
    humanizedPrompt: 'Me conta o que esta mais importante agora: comprar um imovel, trocar de veiculo ou montar uma estrategia de investimento?',
  },
  {
    id: 'prazo',
    title: 'Prazo',
    question: 'Pra quando voce imagina isso?',
    humanizedPrompt: 'Pensando sem compromisso: isso e algo para resolver logo ou voce toparia construir com mais calma se fizer sentido financeiramente?',
  },
  {
    id: 'contexto',
    title: 'Contexto',
    question: 'Qual e o contexto de hoje?',
    humanizedPrompt: 'Para eu nao te oferecer algo fora da realidade: hoje voce mora de aluguel ou proprio, tem carro e sua renda e mais fixa ou variavel?',
  },
  {
    id: 'capacidade',
    title: 'Capacidade',
    question: 'Hoje, qual parcela seria confortavel?',
    humanizedPrompt: 'Sem apertar seu caixa, qual faixa de parcela voce olharia e pensaria: isso eu consigo manter com tranquilidade?',
  },
  {
    id: 'dor',
    title: 'Dor',
    question: 'O que mais te incomoda nisso hoje?',
    humanizedPrompt: 'Qual e a parte que mais pesa hoje: aluguel, juros, falta de entrada, medo de esperar ou dificuldade de formar patrimonio?',
  },
  {
    id: 'consorcio',
    title: 'Consorcio',
    question: 'O que voce ja viu ou acha sobre consorcio?',
    humanizedPrompt: 'Antes de simular, quero entender sua visao: consorcio para voce ainda e confuso, gera alguma inseguranca ou ja faz sentido?',
  },
];

export const RADAR_BLOCKS: RadarBlock[] = [
  { id: 'objetivo', label: 'Objetivo' },
  { id: 'prazo', label: 'Prazo' },
  { id: 'contexto', label: 'Contexto' },
  { id: 'capacidade', label: 'Capacidade' },
  { id: 'perfil', label: 'Perfil' },
  { id: 'conhecimento', label: 'Conhecimento consorcio' },
  { id: 'objecoes', label: 'Objecoes' },
];

export const EMPTY_ATENDIMENTO: AtendimentoAnswers = {
  notes: {},
};

export const objetivoOptions: ConversationOption<Objetivo>[] = [
  { value: 'imovel', label: 'Imovel', sub: 'Morar, construir ou investir em patrimonio.' },
  { value: 'veiculo', label: 'Veiculo', sub: 'Comprar, trocar ou planejar frota.' },
  { value: 'investimento', label: 'Investimento', sub: 'Retorno, carta ou estrategia financeira.' },
];

export const prazoOptions: ConversationOption<Prazo>[] = [
  { value: 'urgente', label: 'O quanto antes', sub: 'Precisa de velocidade e clareza de plano.' },
  { value: 'curto', label: 'Ate 12 meses', sub: 'Tem alguma janela de decisao definida.' },
  { value: 'medio', label: '1 a 3 anos', sub: 'Pode construir a compra com metodo.' },
  { value: 'flexivel', label: 'Sem pressa', sub: 'Prioriza economia e estrategia.' },
];

export const moradiaOptions: ConversationOption<Moradia>[] = [
  { value: 'aluguel', label: 'Moro de aluguel' },
  { value: 'proprio', label: 'Tenho imovel proprio' },
  { value: 'familia', label: 'Moro com familia' },
];

export const carroOptions: ConversationOption<CarroStatus>[] = [
  { value: 'tem', label: 'Ja tenho carro' },
  { value: 'nao-tem', label: 'Nao tenho carro' },
  { value: 'quer-trocar', label: 'Quero trocar' },
];

export const rendaOptions: ConversationOption<Renda>[] = [
  { value: 'fixa', label: 'Renda fixa' },
  { value: 'variavel', label: 'Renda variavel' },
  { value: 'mista', label: 'Mista' },
];

export const capacidadeOptions: ConversationOption<Capacidade>[] = [
  { value: 'ate-1500', label: 'Ate R$ 1.500' },
  { value: '1500-3000', label: 'R$ 1.500 a R$ 3.000' },
  { value: '3000-6000', label: 'R$ 3.000 a R$ 6.000' },
  { value: '6000-plus', label: 'Acima de R$ 6.000' },
];

export const dorOptions: ConversationOption<Dor>[] = [
  { value: 'aluguel', label: 'Aluguel pesando' },
  { value: 'juros', label: 'Juros de financiamento' },
  { value: 'sem-entrada', label: 'Falta de entrada' },
  { value: 'inseguranca', label: 'Medo de errar' },
  { value: 'patrimonio', label: 'Nao formar patrimonio' },
  { value: 'prazo', label: 'Prazo de conquista' },
];

export const consorcioOptions: ConversationOption<ConhecimentoConsorcio>[] = [
  { value: 'nao-conhece', label: 'Nao conheco bem' },
  { value: 'tem-duvidas', label: 'Tenho duvidas' },
  { value: 'medo-contemplacao', label: 'Tenho medo da contemplacao' },
  { value: 'ja-entende', label: 'Ja entendo' },
];

export function getRadarStatus(answers: AtendimentoAnswers): Record<RadarBlockId, RadarStatus> {
  const contextCount = [answers.moradia, answers.carro, answers.renda].filter(Boolean).length;
  const hasPerfil = Boolean(answers.objetivo && (answers.prazo || answers.dor || answers.capacidade));
  const hasObjection = Boolean(answers.dor || answers.consorcio === 'medo-contemplacao' || answers.consorcio === 'tem-duvidas');

  return {
    objetivo: answers.objetivo ? 'completo' : 'pendente',
    prazo: answers.prazo ? 'completo' : 'pendente',
    contexto: contextCount === 0 ? 'pendente' : contextCount === 3 ? 'completo' : 'parcial',
    capacidade: answers.capacidade ? 'completo' : 'pendente',
    perfil: hasPerfil ? 'completo' : answers.objetivo ? 'parcial' : 'pendente',
    conhecimento: answers.consorcio ? 'completo' : 'pendente',
    objecoes: hasObjection ? 'completo' : answers.dor ? 'parcial' : 'pendente',
  };
}

export function getCompletionPercent(answers: AtendimentoAnswers): number {
  const statuses = Object.values(getRadarStatus(answers));
  const score = statuses.reduce((sum, status) => {
    if (status === 'completo') return sum + 1;
    if (status === 'parcial') return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((score / statuses.length) * 100);
}

export function mapPerfil(answers: AtendimentoAnswers): PerfilCliente {
  if (answers.prazo === 'urgente' || answers.dor === 'prazo') return 'Cliente sensivel a prazo';
  if (answers.objetivo === 'investimento' || answers.prazo === 'flexivel') return 'Investidor paciente';
  if (answers.objetivo === 'imovel' && (answers.moradia === 'aluguel' || answers.dor === 'patrimonio')) return 'Construtor de patrimonio';
  return 'Comprador pragmatica';
}

export function getAtendimentoSuggestions(answers: AtendimentoAnswers): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (!answers.consorcio || answers.consorcio === 'nao-conhece') {
    suggestions.push({
      id: 'explain-simple',
      title: 'Explique sem termos tecnicos',
      body: 'Mostre consorcio como compra planejada: parcela, grupo, credito e formas de contemplacao.',
      tone: 'teal',
    });
  }

  if (answers.consorcio === 'medo-contemplacao') {
    suggestions.push({
      id: 'deadline-or-economy',
      title: 'Separe prazo de economia',
      body: 'Pergunte: voce prioriza conquistar mais rapido ou pagar menos juros ao longo do caminho?',
      tone: 'gold',
    });
  }

  if (answers.moradia === 'aluguel' && answers.objetivo === 'imovel') {
    suggestions.push({
      id: 'patrimony',
      title: 'Abordagem de patrimonio',
      body: 'Conecte a parcela com sair do aluguel e transformar pagamento mensal em construcao de patrimonio.',
      tone: 'gold',
    });
  }

  if (answers.renda === 'variavel') {
    suggestions.push({
      id: 'variable-income',
      title: 'Proteja o caixa',
      body: 'Use faixas conservadoras de parcela e confirme sazonalidade antes de falar em lance.',
      tone: 'neutral',
    });
  }

  if (answers.dor === 'juros') {
    suggestions.push({
      id: 'financing-comparison',
      title: 'Compare com financiamento',
      body: 'Mostre custo total, juros e previsibilidade. Evite prometer velocidade sem validar recursos.',
      tone: 'teal',
    });
  }

  if (answers.objetivo === 'investimento') {
    suggestions.push({
      id: 'investment-frame',
      title: 'Fale em estrategia',
      body: 'Conduza para retorno esperado, liquidez, horizonte e tolerancia a esperar contemplacao.',
      tone: 'gold',
    });
  }

  return suggestions.slice(0, 4);
}

export function getFinalRecommendation(answers: AtendimentoAnswers): FinalRecommendation {
  const perfil = mapPerfil(answers);

  if (answers.dor === 'juros') {
    return {
      perfil,
      abordagem: 'Comparar financiamento contra consorcio e ancorar a conversa na economia total.',
      proximoPasso: 'Simular o saldo financiado, entrada disponivel e custo total estimado.',
      ferramenta: 5,
      ferramentaLabel: 'Quitacao de Financiamento',
    };
  }

  if (answers.objetivo === 'investimento') {
    return {
      perfil,
      abordagem: 'Tratar como tese de retorno, com paciencia para contemplacao e disciplina de caixa.',
      proximoPasso: 'Validar se faz mais sentido carta aplicada, giro de carta ou lance planejado.',
      ferramenta: 4,
      ferramentaLabel: 'Carta Aplicada',
    };
  }

  if (answers.consorcio === 'medo-contemplacao' || answers.dor === 'prazo') {
    return {
      perfil,
      abordagem: 'Dar visibilidade sobre lance e cenarios de antecipacao antes de falar em valor final.',
      proximoPasso: 'Simular lance livre ou embutido para reduzir incerteza.',
      ferramenta: 'lance',
      ferramentaLabel: 'Calculadora de Lance',
    };
  }

  if (answers.objetivo === 'imovel' && answers.moradia === 'aluguel') {
    return {
      perfil,
      abordagem: 'Conectar a decisao com saida do aluguel e formacao de patrimonio.',
      proximoPasso: 'Simular credito, parcela confortavel e mes de contemplacao provavel.',
      ferramenta: 3,
      ferramentaLabel: 'Aluguel com Consorcio',
    };
  }

  return {
    perfil,
    abordagem: 'Comecar com uma simulacao simples e depois aprofundar conforme a objecao principal.',
    proximoPasso: 'Transformar objetivo, prazo e parcela confortavel em proposta objetiva.',
    ferramenta: 'quickcalc',
    ferramentaLabel: 'Calculadora Expressa',
  };
}
