import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sub = await req.json() as {
    endpoint: string;
    keys?: { p256dh?: string; auth?: string };
  };

  await supabase.from('push_subscriptions').upsert(
    {
      profile_id: user.id,
      endpoint:   sub.endpoint,
      p256dh:     sub.keys?.p256dh  ?? null,
      auth_key:   sub.keys?.auth    ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  );

  return NextResponse.json({ ok: true });
}
