import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export function useProfile() {
  const { user } = useAuth();

  useEffect(() => {
    async function createProfile() {
      if (!user) return;

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: user.id,
          username: user.email?.split('@')[0] || 'anonymous',
        });
      }
    }

    createProfile();
  }, [user]);

  return null;
}