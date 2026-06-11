import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { Notification } from '@/types';
import NotificationsClient from '@/components/notifications/NotificationsClient';

export const metadata: Metadata = { title: 'Notifications — ApplyWise' };

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-lg">
      <NotificationsClient
        initialNotifications={(data ?? []) as Notification[]}
        userId={user.id}
      />
    </div>
  );
}
