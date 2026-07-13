'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useEditorStore } from '@/store/useEditorStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const loadSchema = useEditorStore((state) => state.loadSchema);
  const resetSchema = useEditorStore((state) => state.reset);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        loadSchema();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (_event === 'SIGNED_IN' && session?.user) {
        loadSchema();
      }
      
      if (_event === 'SIGNED_OUT') {
        resetSchema();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, loadSchema, resetSchema]);

  return <>{children}</>;
}
