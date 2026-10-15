// services/emailService.ts
// Thin wrapper around Resend's HTTP API. No SDK dependency — raw fetch() only,
// so there's no npm install step to risk failing on Railway's build.

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_ADDRESS = 'Rain OS <support@getrainos.com>';

const getAppUrl = () => process.env.APP_URL || 'https://getrainos.com';

const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set — skipping email send.');
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`Resend send failed (${res.status}) for ${to}: ${body}`);
    // Intentionally not throwing — a failed email should not block signup/login.
  }
};

// Combined welcome + confirmation email for password-based signups.
export const sendConfirmationEmail = async (to: string, token: string): Promise<void> => {
  const confirmLink = `${getAppUrl()}/confirm?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px;">Welcome to Rain OS</h1>
      <p>You're one click away from your account. Confirm your email to get started:</p>
      <p>
        <a href="${confirmLink}" style="display:inline-block; padding: 12px 20px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 6px;">
          Confirm your email
        </a>
      </p>
      <p style="color: #666; font-size: 13px;">Or paste this link into your browser: ${confirmLink}</p>
      <p style="color: #666; font-size: 13px;">If you didn't sign up for Rain OS, you can ignore this email.</p>
    </div>
  `;

  await sendEmail(to, 'Confirm your Rain OS account', html);
};

// Standalone welcome email for Google OAuth signups (no confirmation needed).
export const sendWelcomeEmail = async (to: string): Promise<void> => {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px;">Welcome to Rain OS</h1>
      <p>Your account is ready to go — head back to your dashboard to run your first analysis.</p>
      <p>
        <a href="${getAppUrl()}/dashboard" style="display:inline-block; padding: 12px 20px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 6px;">
          Go to your dashboard
        </a>
      </p>
    </div>
  `;

  await sendEmail(to, 'Welcome to Rain OS', html);
};

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Sent only when a tracked query flips between cited and not cited.
export const sendCitationStatusEmail = async (
  to: string,
  data: { name: string; topic: string; cited: boolean }
): Promise<void> => {
  const name = escapeHtml(data.name);
  const topic = escapeHtml(data.topic);
  const headline = data.cited
    ? `Gemini now cites you for "${topic}"`
    : `Gemini stopped citing you for "${topic}"`;
  const body = data.cited
    ? 'Your site appeared among the sources in two checks in a row, so this is a real change. Keep the page that earned it up to date.'
    : 'Your site was missing from the sources in two checks in a row, so this is a real change. Open Citation Monitor to see who was cited instead.';
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <p style="color: #666; font-size: 13px; margin: 0 0 8px;">Weekly tracking · ${name}</p>
      <h1 style="font-size: 20px;">${headline}</h1>
      <p>${body}</p>
      <p>
        <a href="${getAppUrl()}/citation-monitor" style="display:inline-block; padding: 12px 20px; background: #2B8FE3; color: #fff; text-decoration: none; border-radius: 6px;">
          Open Citation Monitor
        </a>
      </p>
      <p style="color: #666; font-size: 13px;">We only email when two checks in a row agree. <a href="${getAppUrl()}/settings" style="color:#666;">Turn these alerts off in Settings</a>.</p>
    </div>
  `;
  const subject = data.cited ? `Now cited: ${data.name}` : `No longer cited: ${data.name}`;
  await sendEmail(to, subject, html);
};
