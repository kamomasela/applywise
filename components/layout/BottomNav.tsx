'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Building2, Bell } from 'lucide-react';
import { useNotificationsStore } from '@/lib/stores/notifications';

const NAV_ITEMS = [
  {
    href:      '/dashboard',
    label:     'Home',
    Icon:      Home,
    isActive:  (p: string) => p === '/dashboard',
    showBadge: false,
  },
  {
    href:      '/profile',
    label:     'Profile',
    Icon:      User,
    isActive:  (p: string) => p.startsWith('/profile') || p.startsWith('/settings'),
    showBadge: false,
  },
  {
    href:      '/universities',
    label:     'Universities',
    Icon:      Building2,
    isActive:  (p: string) => p.startsWith('/universities'),
    showBadge: false,
  },
  {
    href:      '/notifications',
    label:     'Alerts',
    Icon:      Bell,
    isActive:  (p: string) => p === '/notifications',
    showBadge: true,
  },
] as const;

export default function BottomNav() {
  const pathname    = usePathname();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm safe-area-pb"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, Icon, isActive, showBadge }) => {
          const active    = isActive(pathname);
          const hasBadge  = showBadge && unreadCount > 0;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex flex-col items-center gap-0.5 rounded-xl px-5 py-2 transition-colors',
                active ? 'text-[#0b4f6c]' : 'text-gray-400 hover:text-gray-600',
              ].join(' ')}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
                {hasBadge && (
                  <span
                    aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
                    className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#e63946]"
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-[#0b4f6c]' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
