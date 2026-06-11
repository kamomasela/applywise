// Supabase Edge Function — create-notifications
// Handles two triggers:
//   POST { type: 'deadline' }                                 — called by a daily cron / scheduler
//   POST { type: 'status_change', userId, universityName, newStatus } — called by the ITN handler

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ── Types ─────────────────────────────────────────────────────────────────────

interface University {
  id: string;
  name: string;
  application_closes: string | null;
}

interface StatusConfig {
  title: string;
  message: string;
  type: string;
}

// ── Entry point ───────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (body.type === 'deadline') {
      await handleDeadlines(supabase);
    } else if (body.type === 'status_change') {
      await handleStatusChange(supabase, body);
    } else {
      return new Response(JSON.stringify({ error: 'Unknown type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[create-notifications]', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ── Deadline notifications ────────────────────────────────────────────────────

// Send at 30 days, 7 days, and 1 day before application close.
const DEADLINE_THRESHOLDS = [30, 7, 1];

async function handleDeadlines(supabase: ReturnType<typeof createClient>) {
  const todaySAST = new Date();
  // SAST = UTC+2 (no DST)
  todaySAST.setUTCHours(todaySAST.getUTCHours() + 2);
  const todayKey = todaySAST.toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: universities, error } = await supabase
    .from('universities')
    .select('id, name, application_closes')
    .not('application_closes', 'is', null);

  if (error) throw error;

  for (const uni of (universities ?? []) as University[]) {
    if (!uni.application_closes) continue;

    const closeDate = new Date(uni.application_closes);
    const msPerDay  = 86_400_000;
    const daysLeft  = Math.round(
      (closeDate.getTime() - new Date(todayKey).getTime()) / msPerDay,
    );

    if (!DEADLINE_THRESHOLDS.includes(daysLeft)) continue;

    // Get distinct profile IDs that have applied to this university
    const { data: apps } = await supabase
      .from('applications')
      .select('profile_id')
      .eq('university_id', uni.id);

    const profileIds = [...new Set((apps ?? []).map((a: { profile_id: string }) => a.profile_id))];

    for (const profileId of profileIds) {
      // Idempotency: skip if we already sent this exact notification today
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('profile_id', profileId)
        .eq('type', 'deadline')
        .eq('related_university_id', uni.id)
        .gte('created_at', `${todayKey}T00:00:00.000Z`)
        .maybeSingle();

      if (existing) continue;

      const closedFormatted = closeDate.toLocaleDateString('en-ZA', {
        day: 'numeric', month: 'long',
      });

      const title   = daysLeft === 1
        ? `${uni.name} deadline is tomorrow`
        : `${daysLeft} days left — ${uni.name}`;
      const message = daysLeft === 1
        ? `The application window for ${uni.name} closes tomorrow (${closedFormatted}). Ensure your documents are uploaded.`
        : `The ${uni.name} application deadline is in ${daysLeft} days (${closedFormatted}). Log in to check your progress.`;

      await supabase.from('notifications').insert({
        profile_id:              profileId,
        title,
        message,
        type:                    'deadline',
        related_university_id:   uni.id,
        is_read:                 false,
      });
    }
  }
}

// ── Status-change notifications ───────────────────────────────────────────────

const STATUS_MESSAGES: Record<string, StatusConfig> = {
  submitted: {
    title:   'Application submitted',
    message: 'Your application to {uni} has been successfully submitted. Your reference number is on the application detail page.',
    type:    'status_update',
  },
  under_review: {
    title:   'Application under review',
    message: '{uni} is now reviewing your application. We will notify you of any updates.',
    type:    'status_update',
  },
  additional_docs_required: {
    title:   'Action required — documents needed',
    message: '{uni} has requested additional documents. Please check your application and upload the required files.',
    type:    'missing_info',
  },
  offer_received: {
    title:   'Offer received from {uni}',
    message: 'Congratulations! You have received an admission offer from {uni}. Log in to accept or decline before the deadline.',
    type:    'offer',
  },
  accepted: {
    title:   'Offer accepted',
    message: 'Your offer from {uni} has been confirmed. Best of luck with your studies!',
    type:    'offer',
  },
  unsuccessful: {
    title:   'Application outcome — {uni}',
    message: 'Your application to {uni} was unsuccessful this time. You still have other applications open — keep checking your dashboard.',
    type:    'status_update',
  },
};

async function handleStatusChange(
  supabase: ReturnType<typeof createClient>,
  body: { userId: string; universityName: string; newStatus: string },
) {
  const { userId, universityName, newStatus } = body;
  const cfg = STATUS_MESSAGES[newStatus];
  if (!cfg) return;

  const fill = (s: string) => s.replace(/\{uni\}/g, universityName);

  await supabase.from('notifications').insert({
    profile_id: userId,
    title:      fill(cfg.title),
    message:    fill(cfg.message),
    type:       cfg.type,
    is_read:    false,
  });
}
