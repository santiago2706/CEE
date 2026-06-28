// Supabase Edge Function — check-enrollment
// Cron diario (8 AM) que detecta cursos con bajo cupo y envía alertas.
// Deploy: supabase functions deploy check-enrollment

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')              ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')            ?? '';
const SECRETARY_EMAIL           = Deno.env.get('SECRETARY_EMAIL')           ?? '';
const ADMIN_URL                 = Deno.env.get('ADMIN_URL')                 ?? 'http://localhost:5174';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const dateFmt = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric', month: 'long', year: 'numeric',
});

function fmtDate(iso: string): string {
  return dateFmt.format(new Date(`${iso}T00:00:00`));
}

function buildEmailHtml(params: {
  courseTitle: string;
  startDateLabel: string;
  enrolled: number;
  minStudents: number;
  adminUrl: string;
  headerColor?: string;  // default: guinda #682222
  headerTitle?: string;  // default: "⚠️ Alerta de bajo cupo"
}): string {
  const {
    courseTitle, startDateLabel, enrolled, minStudents, adminUrl,
    headerColor = '#682222',
    headerTitle = '⚠️ Alerta de bajo cupo',
  } = params;
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5">
  <div style="max-width:600px;margin:0 auto;background:#ffffff">
    <div style="background:${headerColor};padding:24px;text-align:center">
      <h1 style="color:#ffffff;margin:0;font-size:20px">${headerTitle}</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">CEE-FIIS · Centro de Especialización Ejecutiva</p>
    </div>
    <div style="padding:28px">
      <h2 style="color:#682222;margin:0 0 12px;font-size:18px">${courseTitle}</h2>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 20px">
        El curso <strong>"${courseTitle}"</strong> inicia el <strong>${startDateLabel}</strong>
        y tiene <strong style="color:#682222">${enrolled} inscritos</strong>
        de un mínimo requerido de <strong>${minStudents}</strong> para realizarse.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
        <tr>
          <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:bold;width:50%">Fecha de inicio</td>
          <td style="padding:10px;border:1px solid #e0e0e0">${startDateLabel}</td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:bold">Inscritos actuales</td>
          <td style="padding:10px;border:1px solid #e0e0e0;color:#682222;font-weight:bold">${enrolled}</td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:bold">Mínimo requerido</td>
          <td style="padding:10px;border:1px solid #e0e0e0">${minStudents}</td>
        </tr>
      </table>
      <a href="${adminUrl}/ventas"
         style="display:inline-block;background:#682222;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px">
        Ver inscripciones en el panel
      </a>
    </div>
    <div style="padding:16px;text-align:center;color:#999;font-size:12px;border-top:1px solid #f0f0f0">
      CEE-FIIS — Centro de Especialización Ejecutiva · Universidad Nacional de Ingeniería
    </div>
  </div>
</body>
</html>`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date().toISOString().slice(0, 10);

    // 1. Get all published courses that have min_students and start_date configured
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, start_date, min_students, alert_days_before, status')
      .eq('status', 'published')
      .not('start_date', 'is', null)
      .not('min_students', 'is', null);

    if (coursesError) throw new Error(`Error al obtener cursos: ${coursesError.message}`);

    // 2. Filter: start_date is between today and today + alert_days_before
    const coursesToCheck = (courses ?? []).filter((course) => {
      if (!course.start_date || !course.min_students) return false;
      const alertDays = course.alert_days_before ?? 7;
      const alertCutoff = new Date();
      alertCutoff.setDate(alertCutoff.getDate() + alertDays);
      const startDate = new Date(`${course.start_date}T00:00:00`);
      return startDate >= new Date(today) && startDate <= alertCutoff;
    });

    const notified: string[] = [];

    for (const course of coursesToCheck) {
      // 3. Count completed sales for this course
      const { count: salesCount } = await supabase
        .from('sales')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', course.id)
        .eq('status', 'completed');

      const enrolled = salesCount ?? 0;

      // Skip if already at or above minimum
      if (enrolled >= course.min_students) continue;

      // 4. Avoid duplicates: check for existing notification in last 24h
      const since24h = new Date(Date.now() - 24 * 3_600_000).toISOString();
      const { count: existingCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'low_enrollment')
        .eq('course_id', course.id)
        .gte('created_at', since24h);

      if ((existingCount ?? 0) > 0) continue;

      const startDateLabel = fmtDate(course.start_date);
      const title   = `Bajo cupo — ${course.title}`;
      const message =
        `El curso "${course.title}" inicia el ${startDateLabel} y solo tiene ` +
        `${enrolled} de ${course.min_students} inscritos mínimos requeridos.`;

      // 5. Insert notification in DB
      const { error: insertError } = await supabase.from('notifications').insert({
        type:      'low_enrollment',
        title,
        message,
        course_id: course.id,
        is_read:   false,
      });

      if (insertError) {
        console.error(`Error al insertar notificación para ${course.title}:`, insertError.message);
        continue;
      }

      // 6. Send email via Resend (only if configured)
      if (RESEND_API_KEY && SECRETARY_EMAIL) {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization:  `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from:    'CEE-FIIS <notificaciones@cee-fiis.edu.pe>',
            to:      [SECRETARY_EMAIL],
            subject: `⚠️ Bajo cupo — ${course.title}`,
            html:    buildEmailHtml({
              courseTitle:    course.title,
              startDateLabel,
              enrolled,
              minStudents:    course.min_students,
              adminUrl:       ADMIN_URL,
            }),
          }),
        });
        if (!emailRes.ok) {
          console.error(`Error Resend para ${course.title}:`, await emailRes.text());
        }
      }

      notified.push(course.title);
    }

    // ── Check 2: Course confirmed (starts today with enough students) ─────────
    const confirmed: string[] = [];
    const coursesStartingToday = (courses ?? []).filter(
      (c) => c.start_date === today && c.min_students,
    );

    for (const course of coursesStartingToday) {
      const { count: salesCount } = await supabase
        .from('sales')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', course.id)
        .eq('status', 'completed');

      const enrolled = salesCount ?? 0;
      if (enrolled < course.min_students) continue;

      // Avoid duplicate in last 24h
      const since24h = new Date(Date.now() - 24 * 3_600_000).toISOString();
      const { count: existingCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'course_confirmed')
        .eq('course_id', course.id)
        .gte('created_at', since24h);

      if ((existingCount ?? 0) > 0) continue;

      const startDateLabel = fmtDate(course.start_date);
      const title   = `Curso confirmado — ${course.title}`;
      const message = `El curso "${course.title}" inicia hoy con ${enrolled} alumnos inscritos. El mínimo requerido era ${course.min_students}.`;

      const { error: insertError } = await supabase.from('notifications').insert({
        type:      'course_confirmed',
        title,
        message,
        course_id: course.id,
        is_read:   false,
      });

      if (insertError) {
        console.error(`Error al insertar notificación confirmada para ${course.title}:`, insertError.message);
        continue;
      }

      if (RESEND_API_KEY && SECRETARY_EMAIL) {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization:  `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from:    'CEE-FIIS <notificaciones@cee-fiis.edu.pe>',
            to:      [SECRETARY_EMAIL],
            subject: `✅ Curso confirmado — ${course.title}`,
            html:    buildEmailHtml({
              courseTitle:    course.title,
              startDateLabel,
              enrolled,
              minStudents:    course.min_students,
              adminUrl:       ADMIN_URL,
              headerColor:    '#1a6b35',  // verde — indica confirmación
              headerTitle:    '✅ Curso confirmado',
            }),
          }),
        });
        if (!emailRes.ok) {
          console.error(`Error Resend (confirmado) para ${course.title}:`, await emailRes.text());
        }
      }

      confirmed.push(course.title);
    }

    return new Response(
      JSON.stringify({ ok: true, checked: coursesToCheck.length, notified, confirmed }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('check-enrollment error:', message);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
