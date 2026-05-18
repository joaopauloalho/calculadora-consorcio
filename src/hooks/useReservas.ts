import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Reserva } from '../lib/supabaseTypes';

export function useMinhasReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reservas')
      .select('*, cartas_contempladas(*)')
      .order('created_at', { ascending: false });
    setReservas(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { reservas, loading, refetch: fetch };
}

export async function fetchTodasReservas(): Promise<Reserva[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('*, cartas_contempladas(*), clientes(*)')
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createReserva(
  cartaId: string,
  mensagem: string | null
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { error } = await supabase.from('reservas').insert({
    carta_id: cartaId,
    cliente_id: user.id,
    mensagem,
  });
  if (error) throw new Error(error.message);
}

export async function updateReservaStatus(
  reservaId: string,
  status: 'aprovada' | 'recusada',
  cartaId?: string
): Promise<void> {
  const { error } = await supabase
    .from('reservas')
    .update({ status })
    .eq('id', reservaId);
  if (error) throw new Error(error.message);

  if (status === 'aprovada' && cartaId) {
    const { error: cartaError } = await supabase
      .from('cartas_contempladas')
      .update({ status: 'reservada' })
      .eq('id', cartaId);
    if (cartaError) throw new Error(cartaError.message);
  }
}
