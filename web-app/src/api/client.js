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
    let code;
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
      code = err.error;
    } catch (_) {}
    const error = new Error(msg);
    error.status = res.status;
    error.code = code;
    throw error;
  }

  const data = await res.json();
  return { data, usage };
}

export const api = {
  me: () => request('GET', '/api/users/me'),
  updateName: (name) => request('POST', '/api/users/me/update-name', { name }),
  analyze: (body) => request('POST', '/api/analyze', body),
  quickTool: (body) => request('POST', '/api/quick-tool', body),
  history: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/api/history${qs}`);
  },
  getAnalysisById: (id) => request('GET', `/api/history/${id}`),
  scanUrl: (url, opts = {}) => request('POST', '/api/url-scan', { url, ...opts }),
  citationCheck: ({ name, topic, url }) => request('POST', '/api/citation-check', { name, topic, url }),
  citationHistory: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/api/citation-checks${qs}`);
  },
  deleteCitationCheck: (id) => request('DELETE', `/api/citation-checks/${id}`),
  deleteCitationHistory: () => request('DELETE', '/api/citation-checks'),
  resolveDomainCountries: (domains) => request('POST', '/api/citation-checks/regions', { domains }),
  brandVisibility: ({ name, brand, topic, url }) => request('POST', '/api/brand-visibility', { name, brand, topic, url }),
  brandVisHistory: () => request('GET', '/api/brand-visibility'),
  clearBrandVisHistory: () => request('DELETE', '/api/brand-visibility'),
  shareOfVoice: ({ name, brand, topic, url }) => request('POST', '/api/sov', { name, brand, topic, url }),
  sovHistory: () => request('GET', '/api/sov'),
  clearSovHistory: () => request('DELETE', '/api/sov'),
  rewrite: ({ content, module }) => request('POST', '/api/rewrite', { content, module }),
  deleteAnalysis: (id) => request('DELETE', `/api/history/${id}`),
  clearCitationHistory: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('DELETE', `/api/citation-checks${qs}`);
  },
  usage: () => request('GET', '/api/usage'),
  createCheckoutSession: (priceId, successUrl, cancelUrl) =>
    request('POST', '/api/stripe/create-checkout-session', { priceId, successUrl, cancelUrl }),
  createBillingPortal: (returnUrl) =>
    request('POST', '/api/stripe/create-portal-session', { returnUrl }),
  github: {
    connect: (returnTo) => request('POST', '/api/github/oauth/init', returnTo ? { returnTo } : undefined),
    repos: () => request('GET', '/api/github/repos'),
    analyze: (repoUrl, opts = {}) => request('POST', '/api/github/analyze', { repoUrl, ...opts }),
    disconnect: () => request('DELETE', '/api/github/disconnect'),
    previewFixes: ({ url, repoFullName, artifacts }) =>
      request('POST', '/api/github/preview-fixes', { url, repoFullName, artifacts }),
    pushFixes: ({ repoFullName, approvedIds, artifacts, scannedUrl }) =>
      request('POST', '/api/github/push-fixes', { repoFullName, approvedIds, artifacts, scannedUrl }),
  },
};
