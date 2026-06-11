import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPayFastSignature } from '@/lib/utils/payfast';

const PASSPHRASE = process.env.PAYFAST_PASSPHRASE ?? '';

function generateReference(): string {
  const year = new Date().getFullYear();
  const digits = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
  return `AW-${year}-${digits}`;
}

/**
 * POST /api/payfast/notify
 *
 * PayFast Instant Transaction Notification (ITN) handler.
 * Called server-to-server by PayFast after a successful payment.
 * Marks all of the payer's draft applications as submitted.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  // Verify the signature to ensure the request is genuinely from PayFast
  if (!verifyPayFastSignature(params, PASSPHRASE)) {
    console.error('[PayFast ITN] Invalid signature');
    return new NextResponse('Invalid signature', { status: 400 });
  }

  // Only process fully completed payments
  if (params.payment_status !== 'COMPLETE') {
    return new NextResponse('OK', { status: 200 });
  }

  const userId = params.custom_str1;
  if (!userId) {
    console.error('[PayFast ITN] Missing user ID in custom_str1');
    return new NextResponse('Missing user ID', { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch all remaining draft applications for this user
  const { data: drafts } = await supabase
    .from('applications')
    .select('id')
    .eq('profile_id', userId)
    .eq('status', 'draft');

  if (drafts && drafts.length > 0) {
    const now = new Date().toISOString();
    await Promise.all(
      drafts.map((app) =>
        supabase
          .from('applications')
          .update({
            status:           'submitted',
            submission_date:  now,
            reference_number: generateReference(),
          })
          .eq('id', app.id)
          .eq('status', 'draft')
      )
    );
  }

  return new NextResponse('OK', { status: 200 });
}
