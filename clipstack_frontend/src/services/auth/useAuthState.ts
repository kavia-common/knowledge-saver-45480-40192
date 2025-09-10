import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';

// PUBLIC_INTERFACE
export function useAuthState() {
  /** Observe Supabase session and expose state to gate navigation. */
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setInitializing(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, initializing };
}
