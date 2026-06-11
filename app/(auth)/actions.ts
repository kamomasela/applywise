'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

type ActionError = { error: string };
type ActionRedirect = { redirectTo: string };
type ActionSuccess = { success: true };

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<ActionError | ActionRedirect> {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  return { redirectTo: '/profile/step-1' };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<ActionError | ActionRedirect> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { redirectTo: '/dashboard' };
}

export async function sendPasswordReset(
  email: string
): Promise<ActionError | ActionSuccess> {
  const supabase = createClient();
  const origin = headers().get('origin');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });
  if (error) return { error: error.message };
  return { success: true };
}
