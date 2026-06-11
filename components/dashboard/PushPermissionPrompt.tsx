'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output  = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output.buffer as ArrayBuffer;
}

export default function PushPermissionPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (
      'Notification' in window &&
      Notification.permission === 'default' &&
      !localStorage.getItem('push-dismissed')
    ) {
      // Delay slightly so the dashboard renders first
      const t = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('push-dismissed', '1');
    setShow(false);
  };

  const enable = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (vapidKey && 'serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          });
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub),
          });
        } catch {
          // Push subscription failed — in-app notifications still work
        }
      }
    }
    dismiss();
  };

  if (!show) return null;

  return (
    <div className="rounded-xl border border-[#0b4f6c]/20 bg-[#f0f7fb] px-4 py-3 flex items-start gap-3">
      <div className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-[#0b4f6c]/10">
        <Bell size={15} className="text-[#0b4f6c]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Stay notified</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Get push alerts when your application status changes.
        </p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={enable}
            className="rounded-lg bg-[#0b4f6c] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#093d54] transition-colors"
          >
            Enable
          </button>
          <button
            onClick={dismiss}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>

      <button onClick={dismiss} className="shrink-0 text-gray-400 hover:text-gray-600 mt-0.5">
        <X size={14} />
      </button>
    </div>
  );
}
