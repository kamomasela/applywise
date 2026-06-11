import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function generateReference(): string {
  const year = new Date().getFullYear();
  const digits = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
  return `AW-${year}-${digits}`;
}

/**
 * POST /api/applications/[id]/submit
 *
 * Atomically transitions a single application from 'draft' → 'submitted'.
 * Idempotent: if the application is already submitted, returns the existing
 * reference number without error.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check current state first (handles idempotency)
  const { data: existing } = await supabase
    .from('applications')
    .select('status, reference_number')
    .eq('id', params.id)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  if (existing.status === 'submitted' && existing.reference_number) {
    return NextResponse.json({ reference_number: existing.reference_number });
  }

  const refNumber = generateReference();

  const { error } = await supabase
    .from('applications')
    .update({
      status:           'submitted',
      submission_date:  new Date().toISOString(),
      reference_number: refNumber,
    })
    .eq('id', params.id)
    .eq('profile_id', user.id)
    .eq('status', 'draft');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reference_number: refNumber });
}
