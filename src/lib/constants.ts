export const IMOVEL_PRAZOS = [220] as const;
export const VEICULO_PRAZOS = [48, 100, 120] as const;

export type TipoSorteioId = 'comum' | 'sem-carencia' | 'bronze' | 'prata' | 'ouro' | 'diamante';

export const TIPOS_SORTEIO = [
  {
    id: 'comum',
    nome: 'Sorteio Comum',
    carencia: 0,
    reducaoCreditoPercent: 0,
    cor: '#5EB9AA',
    descricao: 'Contemplação por sorteio tradicional. Não reduz o crédito.',
  },
  {
    id: 'sem-carencia',
    nome: 'Ello Sem Carência',
    carencia: 0,
    reducaoCreditoPercent: 29,
    cor: '#C9A84C',
    descricao: 'Disponível imediatamente, com redução de crédito pela regra da modalidade.',
  },
  {
    id: 'bronze',
    nome: 'Ello Bronze',
    carencia: 6,
    reducaoCreditoPercent: 29,
    cor: '#CD7F32',
    descricao: '6 parcelas consecutivas pagas no prazo.',
  },
  {
    id: 'prata',
    nome: 'Ello Prata',
    carencia: 12,
    reducaoCreditoPercent: 26,
    cor: '#C0C0C0',
    descricao: '12 parcelas consecutivas pagas no prazo.',
  },
  {
    id: 'ouro',
    nome: 'Ello Ouro',
    carencia: 24,
    reducaoCreditoPercent: 23,
    cor: '#C9A84C',
    descricao: '24 parcelas consecutivas pagas no prazo.',
  },
  {
    id: 'diamante',
    nome: 'Ello Diamante',
    carencia: 36,
    reducaoCreditoPercent: 0,
    cor: '#B9F2FF',
    descricao: '36 parcelas em dia. Contemplação sem redução de crédito.',
  },
] as const satisfies ReadonlyArray<{
  id: TipoSorteioId;
  nome: string;
  carencia: number;
  reducaoCreditoPercent: number;
  cor: string;
  descricao: string;
}>;

export function getTipoSorteio(id?: TipoSorteioId) {
  return TIPOS_SORTEIO.find((tipo) => tipo.id === id) ?? TIPOS_SORTEIO[0];
}

export function aplicarReducaoTipoSorteio(valor: number, tipoSorteio?: TipoSorteioId): number {
  const tipo = getTipoSorteio(tipoSorteio);
  return valor * (1 - tipo.reducaoCreditoPercent / 100);
}
