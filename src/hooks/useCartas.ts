import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CartaContemplada, CartaFiltros } from '../lib/supabaseTypes';

export function useCartas(filtros?: CartaFiltros) {
  const [cartas, setCartas] = useState<CartaContemplada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('cartas_contempladas')
      .select('*')
      .eq('status', 'disponivel')
      .order('created_at', { ascending: false });

    if (filtros?.tipo) query = query.eq('tipo', filtros.tipo);
    if (filtros?.valorCreditoMin) query = query.gte('valor_credito', filtros.valorCreditoMin);
    if (filtros?.valorCreditoMax) query = query.lte('valor_credito', filtros.valorCreditoMax);
    if (filtros?.percentualMaximo) query = query.lte('percentual_compra', filtros.percentualMaximo);
    if (filtros?.prazoMaximo) query = query.lte('prazo_restante', filtros.prazoMaximo);

    const { data, error } = await query;
    if (error) setError(error.message);
    else setCartas(data ?? []);
    setLoading(false);
  }, [
    filtros?.tipo,
    filtros?.valorCreditoMin,
    filtros?.valorCreditoMax,
    filtros?.percentualMaximo,
    filtros?.prazoMaximo,
  ]);

  useEffect(() => { fetch(); }, [fetch]);

  return { cartas, loading, error, refetch: fetch };
}

export async function fetchAllCartasAdmin(): Promise<CartaContemplada[]> {
  const { data, error } = await supabase
    .from('cartas_contempladas')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCarta(
  carta: Omit<CartaContemplada, 'id' | 'created_at' | 'created_by' | 'valor_compra'>
): Promise<CartaContemplada> {
  const { data, error } = await supabase
    .from('cartas_contempladas')
    .insert(carta)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCarta(
  id: string,
  updates: Partial<Omit<CartaContemplada, 'id' | 'created_at' | 'created_by' | 'valor_compra'>>
): Promise<CartaContemplada> {
  const { data, error } = await supabase
    .from('cartas_contempladas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCarta(id: string): Promise<void> {
  const { error } = await supabase.from('cartas_contempladas').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
