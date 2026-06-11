import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/layout/BottomNav';
import NotificationsProvider from '@/components/layout/NotificationsProvider';
import OfflineBanner from '@/components/layout/OfflineBanner';
import InstallPrompt from '@/components/pwa/InstallPrompt';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  let unreadCount = 0;
  let userId: string | null = null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .eq('is_read', false);
      unreadCount = count ?? 0;
    }
  } catch {
    // Degrade gracefully — nav still renders without badge
  }

  return (
    <NotificationsProvider initialCount={unreadCount} userId={userId}>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <OfflineBanner />
        <main className="flex-1 px-4 pt-6 pb-24 sm:px-6 lg:px-8">{children}</main>
        <BottomNav />
        <InstallPrompt />
      </div>
    </NotificationsProvider>
  );
}
