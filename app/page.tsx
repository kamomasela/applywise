import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Root route: redirect authenticated users to dashboard, others to login.
export default async function RootPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  redirect(user ? '/dashboard' : '/login');
}
