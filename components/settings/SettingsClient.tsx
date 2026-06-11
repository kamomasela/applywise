'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Lock, ExternalLink,
  FileText, ShieldCheck, LogOut, ChevronRight,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

type NotifType = 'deadline' | 'status_update' | 'missing_info' | 'offer' | 'general';

const NOTIF_LABELS: Record<NotifType, string> = {
  deadline:      'Application deadlines',
  status_update: 'Status updates',
  missing_info:  'Missing documents alerts',
  offer:         'Offer notifications',
  general:       'General news',
};

const PREF_KEY = 'notif-prefs';

function loadPrefs(): Record<NotifType, boolean> {
  if (typeof window === 'undefined') return defaultPrefs();
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) return { ...defaultPrefs(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultPrefs();
}

function defaultPrefs(): Record<NotifType, boolean> {
  return { deadline: true, status_update: true, missing_info: true, offer: true, general: false };
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-50">
      {children}
    </div>
  );
}

function SettingsRow({
  Icon,
  label,
  sublabel,
  href,
  onClick,
  danger,
  trailing,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<any>;
  label: string;
  sublabel?: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  trailing?: React.ReactNode;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className={`shrink-0 h-8 w-8 flex items-center justify-center rounded-lg ${danger ? 'bg-red-50' : 'bg-gray-50'}`}>
        <Icon size={15} className={danger ? 'text-red-500' : 'text-gray-500'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-gray-800'}`}>{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      {trailing ?? <ChevronRight size={15} className="text-gray-300 shrink-0" />}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:bg-gray-50 transition-colors active:bg-gray-100">
        {inner}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="w-full text-left hover:bg-gray-50 transition-colors active:bg-gray-100">
      {inner}
    </button>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={[
        'relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus-visible:outline-none',
        on ? 'bg-[#0b4f6c]' : 'bg-gray-200',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          on ? 'translate-x-5' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  firstName: string;
  email: string;
  appVersion: string;
}

export default function SettingsClient({ firstName, email, appVersion }: Props) {
  const router                  = useRouter();
  const [prefs, setPrefs]       = useState<Record<NotifType, boolean>>(loadPrefs);
  const [loggingOut, setLoggingOut] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const togglePref = useCallback((type: NotifType, val: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [type]: val };
      localStorage.setItem(PREF_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Could not log out. Please try again.');
      setLoggingOut(false);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">{firstName} · {email}</p>
      </div>

      {/* ── Account ────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-1">
          Account
        </h2>
        <Section>
          <SettingsRow Icon={User}  label="Edit personal details" sublabel="Name, ID, contact info" href="/profile/step-1" />
          <SettingsRow Icon={Lock}  label="Change password"        sublabel="Update your login password" href="/forgot-password" />
        </Section>
      </div>

      {/* ── Notification preferences ────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-1">
          Notifications
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-50">
          {(Object.keys(NOTIF_LABELS) as NotifType[]).map((type) => (
            <div key={type} className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{NOTIF_LABELS[type]}</p>
              </div>
              <Toggle on={prefs[type]} onChange={(v) => togglePref(type, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Tools ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-1">
          Tools
        </h2>
        <Section>
          <SettingsRow
            Icon={ExternalLink}
            label="Check my APS score on APSWise"
            sublabel="apswise.co.za"
            onClick={() => window.open('https://apswise.co.za', '_blank', 'noopener,noreferrer')}
          />
        </Section>
      </div>

      {/* ── Legal ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-1">
          Legal
        </h2>
        <Section>
          <SettingsRow Icon={ShieldCheck} label="Privacy Policy"      href="/legal/privacy"  />
          <SettingsRow Icon={FileText}    label="Terms &amp; Conditions" href="/legal/terms"    />
        </Section>
      </div>

      {/* ── Log out ────────────────────────────────────────────────── */}
      <Section>
        <SettingsRow
          Icon={LogOut}
          label={loggingOut ? 'Logging out…' : 'Log out'}
          onClick={handleLogout}
          danger
          trailing={null}
        />
      </Section>

      {/* Version */}
      <p className="text-center text-xs text-gray-300 pb-2">
        ApplyWise v{appVersion}
      </p>
    </div>
  );
}
