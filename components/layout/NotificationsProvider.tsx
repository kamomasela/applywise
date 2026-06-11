'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useNotificationsStore } from '@/lib/stores/notifications';

interface Props {
  initialCount: number;
  userId: string | null;
  children: React.ReactNode;
}

export default function NotificationsProvider({ initialCount, userId, children }: Props) {
  const { setUnreadCount, increment } = useNotificationsStore();

  // Seed store from server-rendered count
  useEffect(() => {
    setUnreadCount(initialCount);
  }, [initialCount, setUnreadCount]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${userId}`,
        },
        (payload) => {
          // Only count if it comes in as unread
          if (!payload.new?.is_read) increment();
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${userId}`,
        },
        () => {
          // Re-query count on any update (mark-read etc.)
          supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('profile_id', userId)
            .eq('is_read', false)
            .then(({ count }) => setUnreadCount(count ?? 0));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, increment, setUnreadCount]);

  return <>{children}</>;
}
