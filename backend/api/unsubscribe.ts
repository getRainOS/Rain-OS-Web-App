// api/unsubscribe.ts — GET shows a one-button page (email scanners follow
// links, so a GET never unsubscribes); POST turns the emails off. POST also
// serves mail apps' built-in "Unsubscribe" (RFC 8058 List-Unsubscribe-Post).
import express from 'express';
import { pool } from '../services/db';
import { verifyUnsubscribe } from '../services/unsubscribe';
import { escapeHtml, getAppUrl } from '../services/emailService';

const page = (body: string) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>rain OS emails</title></head>
<body style="font-family: sans-serif; max-width: 420px; margin: 64px auto; padding: 0 16px; color: #111;">${body}</body></html>`;

const params = (req: express.Request) => ({
  u: String(req.query.u ?? req.body?.u ?? ''),
  t: String(req.query.t ?? req.body?.t ?? ''),
});

export function unsubscribePageHandler(req: express.Request, res: express.Response) {
  const { u, t } = params(req);
  if (!verifyUnsubscribe(u, t)) return res.status(400).type('html').send(page('<h1 style="font-size:20px;">This link has expired or is incomplete.</h1><p>You can turn emails off in Settings.</p>'));
  return res.type('html').send(page(`
    <h1 style="font-size:20px;">Stop rain OS emails?</h1>
    <p>You'll no longer get the weekly summary or citation alerts. Your tracked questions keep running.</p>
    <form method="post" action="/api/email/unsubscribe?u=${encodeURIComponent(u)}&t=${encodeURIComponent(t)}">
      <button type="submit" style="padding:10px 18px; background:#2B8FE3; color:#fff; border:0; border-radius:6px; font-size:15px; cursor:pointer;">Unsubscribe</button>
    </form>`));
}

export async function unsubscribeHandler(req: express.Request, res: express.Response) {
  const { u, t } = params(req);
  if (!verifyUnsubscribe(u, t)) return res.status(400).type('html').send(page('<h1 style="font-size:20px;">This link has expired or is incomplete.</h1>'));
  await pool.query('UPDATE users SET citation_alerts = FALSE WHERE id = $1', [u]);
  return res.type('html').send(page(`
    <h1 style="font-size:20px;">You're unsubscribed.</h1>
    <p>You won't get rain OS summaries or alerts any more. Changed your mind? Turn them back on in <a href="${escapeHtml(getAppUrl())}/settings">Settings</a>.</p>`));
}
