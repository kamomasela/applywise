import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/send-confirmation
 *
 * Calls the Supabase Edge Function that sends a confirmation email.
 * Auth check ensures only the logged-in user can trigger an email for their own account.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-confirmation`;

  try {
    const res = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ ...body, email: user.email }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[send-confirmation] Edge function error:', text);
      return NextResponse.json({ error: 'Email failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[send-confirmation] Fetch error:', err);
    return NextResponse.json({ error: 'Network error' }, { status: 500 });
  }
}
