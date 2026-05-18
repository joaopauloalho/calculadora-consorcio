import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabaseTypes';

interface AuthState {
  session: Session | null;
  user: User | null;
  role: Profile['role'] | null;
  loading: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
      if (session?.user) fetchRole(session.user.id);
      else setState(prev => ({ ...prev, loading: false }));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
      if (session?.user) fetchRole(session.user.id);
      else setState(prev => ({ ...prev, role: null, loading: false }));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchRole(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Failed to fetch role:', error.message);
      setState(prev => ({ ...prev, role: null, loading: false }));
      return;
    }
    setState(prev => ({ ...prev, role: data?.role ?? 'cliente', loading: false }));
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp({ email, password, nome, telefone }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      const { error: clienteError } = await supabase.from('clientes').insert({
        id: data.user.id,
        nome,
        telefone: telefone ?? null,
      });
      if (clienteError) throw new Error(`Failed to create client record: ${clienteError.message}`);
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return { ...state, signIn, signUp, signOut };
}
