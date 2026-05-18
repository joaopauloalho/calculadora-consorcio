import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Solicitacao } from '../lib/supabaseTypes';

export function useMinhasSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('solicitacoes')
      .select('*')
      .order('created_at', { ascending: false });
    setSolicitacoes(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { solicitacoes, loading, refetch: fetch };
}

export async function fetchTodasSolicitacoes(): Promise<Solicitacao[]> {
  const { data, error } = await supabase
    .from('solicitacoes')
    .select('*, clientes(*)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createSolicitacao(
  dados: Omit<Solicitacao, 'id' | 'created_at' | 'cliente_id' | 'status'>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { error } = await supabase.from('solicitacoes').insert({
    ...dados,
    cliente_id: user.id,
  });
  if (error) throw new Error(error.message);
}

export async function updateSolicitacaoStatus(
  id: string,
  status: 'pendente' | 'em_analise' | 'atendida'
): Promise<void> {
  const { error } = await supabase
    .from('solicitacoes')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
