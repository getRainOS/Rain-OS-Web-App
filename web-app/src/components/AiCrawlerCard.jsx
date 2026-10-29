import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import styles from '../pages/Dashboard.module.css';

// The snippet a site owner adds to their server. It counts only AI crawler
// visits and sends them in small batches. Optional: nothing changes on the site.
const SNIPPET = `// Rain OS: counts visits from AI crawlers (optional).
const RAIN_KEY = 'PASTE_YOUR_API_KEY_FROM_SETTINGS';
const SITE = 'yoursite.com';
const AI_BOT = /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-User|PerplexityBot|meta-externalagent|Google-Extended|CCBot/i;
let queue = [];
function flush() {
  if (!queue.length) return;
  const hits = queue.splice(0);
  fetch('https://api.getrainos.com/api/bot-visits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + RAIN_KEY },
    body: JSON.stringify({ site: SITE, hits }),
  }).catch(() => {});
}
setInterval(flush, 60000);
app.use((req, res, next) => {
  const ua = req.get('user-agent') || '';
  if (AI_BOT.test(ua)) {
    queue.push({ userAgent: ua, path: req.originalUrl });
    if (queue.length >= 10) flush();
  }
  next();
});`;

export default function AiCrawlerCard({ cardClass, titleClass, subClass }) {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.botVisits(7)
      .then(({ data }) => setData(data?.data ?? null))
      .catch(() => setData(null));
  }, []);

  const copy = async () => {
    try { await navigator.clipboard.writeText(SNIPPET); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ }
  };

  const hasData = data && data.total > 0;
  return (
    <div className={cardClass} style={{ marginBottom: 12 }}>
      <h2 className={titleClass}>AI crawlers reading your site</h2>
      <p className={subClass}>
        {hasData
          ? `${data.total} visit${data.total === 1 ? '' : 's'} from AI crawlers in the last 7 days. Counts are a floor: some AI tools fetch pages only when someone asks.`
          : 'Shows whether AI crawlers such as ChatGPT, Claude and Perplexity are reading your pages. Optional: add the snippet below to your server to start counting.'}
      </p>
      {hasData && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: 8 }}>
          {data.byBot.map(b => (
            <li key={b.bot} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>{b.bot}</span><span>{b.visits}</span>
            </li>
          ))}
        </ul>
      )}
      <details style={{ marginTop: 14 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13 }}>Add the counter to your site</summary>
        <p style={{ fontSize: 13, margin: '10px 0' }}>
          Paste this into the server code of your site, replace the two values at the top, and deploy. Your API key is on the Settings page. Keep it private.
        </p>
        <pre style={{ fontSize: 12, overflow: 'auto', padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>{SNIPPET}</pre>
        <button type="button" onClick={copy} className={styles.improveBtn} style={{ marginTop: 8 }}>{copied ? 'Copied' : 'Copy snippet'}</button>
      </details>
    </div>
  );
}
