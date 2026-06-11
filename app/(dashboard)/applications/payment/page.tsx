import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { University } from '@/types';
import { generatePayFastSignature } from '@/lib/utils/payfast';
import PaymentClient from '@/components/applications/PaymentClient';

export const metadata: Metadata = { title: 'Application fees — ApplyWise' };

const MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID  ?? 'test';
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY ?? 'test';
const PASSPHRASE   = process.env.PAYFAST_PASSPHRASE   ?? '';
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL  ?? 'http://localhost:3000';
const IS_SANDBOX   = process.env.NODE_ENV !== 'production';
const PAYFAST_URL  = IS_SANDBOX
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process';

export default async function PaymentPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Load draft applications + universities
  const { data: rawApps } = await supabase
    .from('applications')
    .select('id, university_id')
    .eq('profile_id', user.id)
    .eq('status', 'draft')
    .order('created_at');

  if (!rawApps || rawApps.length === 0) redirect('/universities');

  const universityIds = rawApps.map((a) => a.university_id);
  const { data: rawUnis } = await supabase
    .from('universities')
    .select('id, name, application_fee')
    .in('id', universityIds);

  const unis = (rawUnis ?? []) as Pick<University, 'id' | 'name' | 'application_fee'>[];
  const uniMap = new Map(unis.map((u) => [u.id, u]));

  const feeRows = rawApps
    .map((app) => {
      const uni = uniMap.get(app.university_id);
      return uni
        ? { university_id: uni.id, university_name: uni.name, fee: uni.application_fee ?? 0 }
        : null;
    })
    .filter(Boolean) as { university_id: string; university_name: string; fee: number }[];

  const totalFees = feeRows.reduce((sum, r) => sum + r.fee, 0);
  const freeCount = feeRows.filter((r) => r.fee === 0).length;

  // If all applications are free, skip this screen
  if (totalFees === 0) redirect('/applications/submitting');

  // Fetch learner name for PayFast
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .maybeSingle();

  // Build PayFast form parameters (order matters for signature)
  const amount = totalFees.toFixed(2);
  const payfastParams: Array<[string, string]> = [
    ['merchant_id',   MERCHANT_ID],
    ['merchant_key',  MERCHANT_KEY],
    ['return_url',    `${APP_URL}/applications/submitting?paid=true`],
    ['cancel_url',    `${APP_URL}/applications/payment`],
    ['notify_url',    `${APP_URL}/api/payfast/notify`],
    ['name_first',    profile?.first_name ?? 'Learner'],
    ['name_last',     profile?.last_name  ?? ''],
    ['email_address', user.email ?? ''],
    ['amount',        amount],
    ['item_name',     `ApplyWise university applications (${rawApps.length})`],
    ['custom_str1',   user.id],
  ];

  const signature = generatePayFastSignature(payfastParams, PASSPHRASE);
  const payfastFields = [
    ...payfastParams.map(([name, value]) => ({ name, value })),
    { name: 'signature', value: signature },
  ];

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/applications/review"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0b4f6c] hover:underline underline-offset-2 mb-6"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to review
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Application fees</h1>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          Some universities charge an application fee. Here is what you owe. Free applications
          will be submitted straight away.
        </p>
      </div>

      <PaymentClient
        feeRows={feeRows}
        totalFees={totalFees}
        freeCount={freeCount}
        payfastUrl={PAYFAST_URL}
        payfastFields={payfastFields}
        hasFreeApps={freeCount > 0}
      />
    </div>
  );
}
