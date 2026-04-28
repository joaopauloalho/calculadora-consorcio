import { useState } from 'react';
import { IMOVEL_PRAZOS, VEICULO_PRAZOS } from '../lib/constants';

type AssetType = 'imovel' | 'veiculo';

interface BaseConsorcioData {
  assetType: AssetType;
  prazoTotal: number;
  mesContemplacao: number;
  paymentMode: 'meia' | 'cheia';
  comSeguro: boolean;
}

type ExtraUpdates<T> = (prazo: number, newMesContemp: number, prev: T) => Partial<T>;

export function useConsorcioInputData<T extends BaseConsorcioData>(
  initialData: T,
  extraUpdates?: ExtraUpdates<T>,
) {
  const [data, setData] = useState<T>(initialData);
  const [customPrazoStr, setCustomPrazoStr] = useState('');

  const set = <K extends keyof T>(key: K) =>
    (v: T[K]) => setData((d) => ({ ...d, [key]: v } as T));

  const setAssetType = (type: AssetType) => {
    const defaultPrazo = type === 'imovel' ? 220 : 48;
    setCustomPrazoStr('');
    setData((d) => {
      const newMesContemp = Math.min(d.mesContemplacao, defaultPrazo - 1);
      return {
        ...d,
        assetType: type,
        prazoTotal: defaultPrazo,
        mesContemplacao: newMesContemp,
        ...(extraUpdates ? extraUpdates(defaultPrazo, newMesContemp, d) : {}),
      } as T;
    });
  };

  const setPrazo = (prazo: number) => {
    setCustomPrazoStr('');
    setData((d) => {
      const newMesContemp = Math.min(d.mesContemplacao, prazo - 1);
      return {
        ...d,
        prazoTotal: prazo,
        mesContemplacao: newMesContemp,
        ...(extraUpdates ? extraUpdates(prazo, newMesContemp, d) : {}),
      } as T;
    });
  };

  const handleCustomPrazo = (val: string) => {
    setCustomPrazoStr(val);
    const n = parseInt(val);
    if (n > 0) {
      const maxPrazo = data.assetType === 'imovel' ? 220 : 120;
      const clamped = Math.min(n, maxPrazo);
      setCustomPrazoStr(String(clamped));
      setData((d) => {
        const newMesContemp = Math.min(d.mesContemplacao, clamped - 1);
        return {
          ...d,
          prazoTotal: clamped,
          mesContemplacao: newMesContemp,
          ...(extraUpdates ? extraUpdates(clamped, newMesContemp, d) : {}),
        } as T;
      });
    }
  };

  const prazos = data.assetType === 'imovel' ? IMOVEL_PRAZOS : VEICULO_PRAZOS;

  return { data, setData, set, customPrazoStr, setAssetType, setPrazo, handleCustomPrazo, prazos };
}
