// Supabase Edge Function — runs on Deno
// Deploy with: supabase functions deploy send-confirmation
// Requires: RESEND_API_KEY secret set via `supabase secrets set RESEND_API_KEY=...`

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

interface SubmittedApp {
  university_name: string;
  first_choice: string | null;
  second_choice: string | null;
  reference_number: string;
}

interface RequestBody {
  email: string;
  firstName: string;
  submissionDate: string;
  applications: SubmittedApp[];
}

function buildEmailHtml(body: RequestBody): string {
  const date = new Date(body.submissionDate).toLocaleDateString('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const appRows = body.applications
    .map(
      (a) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">${a.university_name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">${a.first_choice ?? '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">${a.second_choice ?? '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;font-family:monospace;">${a.reference_number}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0b4f6c;padding:28px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">ApplyWise</p>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.65);">Your application confirmation</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111827;">
              Hi ${body.firstName}, you&rsquo;re all done! 🎉
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
              We submitted ${body.applications.length} university application${body.applications.length !== 1 ? 's' : ''} on your behalf on <strong>${date}</strong>.
              Keep the reference numbers below safe &mdash; you&rsquo;ll need them to track your applications.
            </p>

            <!-- Applications table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
              <thead>
                <tr style="background:#f9fafb;">
                  <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">University</th>
                  <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">1st Choice</th>
                  <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">2nd Choice</th>
                  <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Reference</th>
                </tr>
              </thead>
              <tbody>${appRows}</tbody>
            </table>

            <!-- Next steps -->
            <div style="background:#f0f7fb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0b4f6c;">What happens next?</p>
              <ul style="margin:0;padding-left:16px;font-size:13px;color:#374151;line-height:1.8;">
                <li>Each university will review your application independently.</li>
                <li>Watch your email for acknowledgement letters from each institution.</li>
                <li>Keep your school report and ID document handy &mdash; universities may request certified copies.</li>
                <li>Log in to ApplyWise anytime to track your application statuses.</li>
              </ul>
            </div>

            <p style="margin:0;font-size:14px;color:#374151;">
              Good luck &mdash; you&rsquo;ve got this! 💪
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              ApplyWise &mdash; Helping South African learners apply to university.<br>
              This email was sent because you submitted applications through ApplyWise.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const body: RequestBody = await req.json();

  if (!body.email || !body.applications?.length) {
    return new Response('Missing required fields', { status: 400 });
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    return new Response('RESEND_API_KEY not configured', { status: 500 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    'ApplyWise <noreply@applywise.co.za>',
      to:      [body.email],
      subject: `✅ Your ${body.applications.length} application${body.applications.length !== 1 ? 's have' : ' has'} been submitted — ApplyWise`,
      html:    buildEmailHtml(body),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend error:', text);
    return new Response('Email failed', { status: 500 });
  }

  return new Response('OK', { status: 200 });
});
