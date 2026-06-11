import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import SettingsClient from '@/components/settings/SettingsClient';

export const metadata: Metadata = { title: 'Settings — ApplyWise' };

// Read from package.json at build time
const APP_VERSION = process.env.npm_package_version ?? '1.0.0';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', user.id)
    .maybeSingle();

  const firstName = profile?.first_name ?? 'there';
  const email     = user.email ?? '';

  return (
    <SettingsClient
      firstName={firstName}
      email={email}
      appVersion={APP_VERSION}
    />
  );
}
