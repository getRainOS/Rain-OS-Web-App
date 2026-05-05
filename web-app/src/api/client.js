import { DEMO_KEY, DEMO_USER, DEMO_HISTORY, DEMO_ANALYSIS, DEMO_SCAN, DEMO_CITATION, DEMO_CITATION_HISTORY } from '../demo/demoData.js';

const BASE = 'https://api.getrainos.com';
const KEY_STORAGE = 'rain_os_api_key';

export function getApiKey() {
  return localStorage.getItem(KEY_STORAGE) || '';
}

export function setApiKey(key) {
  localStorage.setItem(KEY_STORAGE, key);
}

export function clearApiKey() {
  localStorage.removeItem(KEY_STORAGE);
}

export function isDemo() {
  return getApiKey() === DEMO_KEY;
}

function demoDelay(data) {
  return new Promise(resolve => setTimeout(() => resolve({ data, usage: null }), 400));
}

async function request(method, path, body) {
  const key = getApiKey();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (key) headers['Authorization'] = `Bearer ${key}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const usageHeader = res.headers.get('x-usage-info');
  let usage = null;
  if (usageHeader) {
    try { usage = JSON.parse(usageHeader); } catch (_) { usage = usageHeader; }
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch (_) {}
    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  return { data, usage };
}

export const api = {
  me: () => isDemo() ? demoDelay(DEMO_USER) : request('GET', '/api/users/me'),
  analyze: (body) => isDemo() ? demoDelay(DEMO_ANALYSIS) : request('POST', '/api/analyze', body),
  history: (params) => {
    if (isDemo()) return demoDelay(DEMO_HISTORY);
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/api/history${qs}`);
  },
  scanUrl: (url) => isDemo() ? demoDelay(DEMO_SCAN) : request('POST', '/api/url-scan', { url }),
  citationCheck: ({ topic, url }) => isDemo()
    ? demoDelay({
        ...DEMO_CITATION,
        topic,
        url: url || null,
        history: DEMO_CITATION_HISTORY,
      })
    : request('POST', '/api/citation-check', { topic, url }),
  citationHistory: (params) => {
    if (isDemo()) return demoDelay(DEMO_CITATION_HISTORY);
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/api/citation-checks${qs}`);
  },
  deleteCitationCheck: (id) => isDemo()
    ? demoDelay({ success: true })
    : request('DELETE', `/api/citation-checks/${id}`),
  deleteAnalysis: (id) => isDemo()
    ? demoDelay({ success: true })
    : request('DELETE', `/api/history/${id}`),
  clearCitationHistory: (params) => {
    if (isDemo()) return demoDelay({ success: true, deleted: 5 });
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('DELETE', `/api/citation-checks${qs}`);
  },
  usage: () => isDemo() ? demoDelay({ count: 42, limit: 500 }) : request('GET', '/api/usage'),
  createCheckoutSession: (priceId, successUrl, cancelUrl) =>
    isDemo()
      ? Promise.resolve({ data: { url: null }, usage: null })
      : request('POST', '/api/stripe/create-checkout-session', { priceId, successUrl, cancelUrl }),
  createBillingPortal: (returnUrl) =>
    isDemo()
      ? Promise.resolve({ data: { url: null }, usage: null })
      : request('POST', '/api/stripe/create-portal-session', { returnUrl }),
  github: {
    connect: () => request('POST', '/api/github/oauth/init'),
    repos: () => request('GET', '/api/github/repos'),
    analyze: (repoUrl) => request('POST', '/api/github/analyze', { repoUrl }),
    disconnect: () => request('DELETE', '/api/github/disconnect'),
  },
};
