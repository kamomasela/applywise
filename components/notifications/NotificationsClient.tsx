'use client';

import { useState, useCallback } from 'react';
import { Bell, Calendar, RefreshCw, AlertTriangle, Star, Info } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { Notification, NotificationType } from '@/types';
import { useNotificationsStore } from '@/lib/stores/notifications';

// ── Time-ago ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60_000);
  const hr   = Math.floor(diff / 3_600_000);
  const day  = Math.floor(diff / 86_400_000);

  if (min < 1)  return 'Just now';
  if (min < 60) return `${min} min ago`;
  if (hr  < 24) return `${hr} hr ago`;
  if (day < 7)  return `${day} day${day !== 1 ? 's' : ''} ago`;
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth()    === n.getMonth()    &&
    d.getDate()     === n.getDate()
  );
}

// ── Icon / style config ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = React.ComponentType<any>;

const TYPE_CONFIG: Record<NotificationType, { Icon: IconComponent; bg: string; color: string }> = {
  deadline:      { Icon: Calendar,      bg: 'bg-amber-100',      color: 'text-amber-600'  },
  status_update: { Icon: RefreshCw,     bg: 'bg-[#0b4f6c]/10',  color: 'text-[#0b4f6c]' },
  missing_info:  { Icon: AlertTriangle, bg: 'bg-red-100',        color: 'text-red-600'    },
  offer:         { Icon: Star,          bg: 'bg-[#1ec97e]/15',   color: 'text-[#0a8a54]' },
  general:       { Icon: Info,          bg: 'bg-gray-100',       color: 'text-gray-500'   },
};

// ── NotificationRow ───────────────────────────────────────────────────────────

function NotificationRow({
  n,
  onMarkRead,
}: {
  n: Notification;
  onMarkRead: (id: string) => void;
}) {
  const cfg  = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
  const Icon = cfg.Icon;

  return (
    <button
      onClick={() => !n.is_read && onMarkRead(n.id)}
      className={[
        'w-full text-left rounded-xl border px-4 py-3.5 flex items-start gap-3 transition-colors',
        n.is_read
          ? 'border-gray-200 bg-white'
          : 'border-[#0b4f6c]/20 bg-[#f0f7fb]',
      ].join(' ')}
    >
      {/* Icon */}
      <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-full ${cfg.bg}`}>
        <Icon size={15} className={cfg.color} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-snug ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
            {n.title}
          </p>
          {!n.is_read && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0b4f6c]" aria-label="Unread" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{n.message}</p>
        <p className="mt-1 text-[10px] text-gray-400">{timeAgo(n.created_at)}</p>
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  initialNotifications: Notification[];
  userId: string;
}

export default function NotificationsClient({ initialNotifications, userId }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const { setUnreadCount }                = useNotificationsStore();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const recount = useCallback(async () => {
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', userId)
      .eq('is_read', false);
    setUnreadCount(count ?? 0);
  }, [supabase, userId, setUnreadCount]);

  const markRead = useCallback(async (id: string) => {
    // Optimistic
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('profile_id', userId);
    await recount();
  }, [supabase, userId, recount]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('profile_id', userId)
      .eq('is_read', false);
    setUnreadCount(0);
  }, [supabase, userId, setUnreadCount]);

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (notifications.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        <div className="rounded-2xl border border-gray-200 bg-white py-16 px-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Bell size={28} className="text-gray-300" />
          </div>
          <p className="text-base font-semibold text-gray-700">You are all caught up</p>
          <p className="mt-1 text-sm text-gray-400">No notifications yet. Check back later.</p>
        </div>
      </div>
    );
  }

  // ── Grouped list ────────────────────────────────────────────────────────────

  const hasUnread = notifications.some((n) => !n.is_read);
  const today     = notifications.filter((n) => isToday(n.created_at));
  const earlier   = notifications.filter((n) => !isToday(n.created_at));

  function Group({ label, items }: { label: string; items: Notification[] }) {
    if (items.length === 0) return null;
    return (
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">
          {label}
        </h2>
        <div className="space-y-2">
          {items.map((n) => (
            <NotificationRow key={n.id} n={n} onMarkRead={markRead} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        {hasUnread && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-[#0b4f6c] hover:underline underline-offset-2"
          >
            Mark all read
          </button>
        )}
      </div>

      <Group label="Today"   items={today}   />
      <Group label="Earlier" items={earlier} />
    </div>
  );
}
