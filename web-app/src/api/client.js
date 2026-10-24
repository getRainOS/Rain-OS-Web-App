import { isDemo } from '../lib/demo.js';

const BASE = 'https://api.getrainos.com';
const KEY_STORAGE = 'rain_os_api_key';

export function getApiKey() {
  if (isDemo()) return 'demo';
  return localStorage.getItem(KEY_STORAGE) || '';
}

export function setApiKey(key) {
  localStorage.setItem(KEY_STORAGE, key);
}

export function clearApiKey() {
  localStorage.removeItem(KEY_STORAGE);
}

async function request(method, path, body) {
  // Demo: answered in the browser from sample data, never sent to the API.
  if (isDemo()) return (await import('../lib/demoData.js')).demoRequest(method, path, body);
  const key = getApiKey();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (key) headers['Authorization'] = `Bearer ${key}`;
  // Every check and analysis is saved with the lane it was run in.
  try { const lane = localStorage.getItem('rain_os_user_lane'); if (lane) headers['X-Rain-Lane'] = lane; } catch { /* storage blocked */ }

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
  deleteAccount: (confirm) => request('POST', '/api/users/me/delete-account', { confirm }),
  analyze: (body) => request('POST', '/api/analyze', body),
  quickTool: (body) => request('POST', '/api/quick-tool', body),
  history: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/api/history${qs}`);
  },
  getAnalysisById: (id) => request('GET', `/api/history/${id}`),
  setAnalysisBrand: (id, brand) => request('POST', `/api/history/${id}/brand`, { brand }),
  scanUrl: (url, opts = {}) => request('POST', '/api/url-scan', { url, ...opts }),
  citationCheck: ({ name, topic, url, ...rest }) => request('POST', '/api/citation-check', { name, topic, url, ...rest }),
  citationHistory: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/api/citation-checks${qs}`);
  },
  engines: () => request('GET', '/api/engines'),
  laneStats: () => request('GET', '/api/lane-stats'),
  products: () => request('GET', '/api/products'),
  saveProduct: (body) => request('POST', '/api/products', body),
  deleteProduct: (id) => request('DELETE', `/api/products/${id}`),
  saveProductDefaults: (defaults) => request('POST', '/api/products/defaults', { defaults }),
  importStore: (storeUrl) => request('POST', '/api/products/import-store', { storeUrl }),
  importProductPage: (url) => request('POST', '/api/products/import-page', { url }),
  draftProduct: (id) => request('POST', `/api/products/${id}/draft`),
  localListing: (body) => request('POST', '/api/local-listing', body),
  mapsGrid: (body) => request('POST', '/api/maps-grid', body),
  startEngineCheck: (body) => request('POST', '/api/citation-check/engine', body),
  pollEngineCheck: (id) => request('GET', `/api/citation-check/engine/${id}`),
  setLocationState: (state) => request('POST', '/api/users/me/location', { state }),
  deleteCitationCheck: (id) => request('DELETE', `/api/citation-checks/${id}`),
  deleteCitationHistory: () => request('DELETE', '/api/citation-checks'),
  suggestPrompts: (body) => request('POST', '/api/prompt-suggestions', body),
  brandLinks: () => request('GET', '/api/brand-links'),
  saveBrandLink: (brand, site) => request('POST', '/api/brand-links', { brand, site }),
  deleteBrandLink: (brand, site) => request('DELETE', '/api/brand-links', { brand, site }),
  contentIdeas: (body) => request('POST', '/api/content-ideas', body),
  groundingUsage: () => request('GET', '/api/admin/grounding-usage'),
  interviewQuestions: (body) => request('POST', '/api/interview/questions', body),
  interviewDraft: (body) => request('POST', '/api/interview/draft', body),
  topicOptions: (body) => request('POST', '/api/topic/options', body),
  topicQuestions: (body) => request('POST', '/api/topic/questions', body),
  questionGap: (body) => request('POST', '/api/question-gap', body),
  trackedQueries: () => request('GET', '/api/tracked-queries'),
  trackQuery: (body) => request('POST', '/api/tracked-queries', body),
  setTrackedQueryPaused: (id, paused) => request('PATCH', `/api/tracked-queries/${id}`, { paused }),
  deleteTrackedQuery: (id) => request('DELETE', `/api/tracked-queries/${id}`),
  setCitationAlerts: (enabled) => request('PATCH', '/api/citation-alerts', { enabled }),
  resolveDomainCountries: (domains) => request('POST', '/api/citation-checks/regions', { domains }),
  brandVisibility: ({ name, brand, topic, url, ...rest }) => request('POST', '/api/brand-visibility', { name, brand, topic, url, ...rest }),
  brandVisHistory: () => request('GET', '/api/brand-visibility'),
  clearBrandVisHistory: () => request('DELETE', '/api/brand-visibility'),
  shareOfVoice: ({ name, brand, topic, url, ...rest }) => request('POST', '/api/sov', { name, brand, topic, url, ...rest }),
  sovHistory: () => request('GET', '/api/sov'),
  clearSovHistory: () => request('DELETE', '/api/sov'),
  rewrite: (body) => request('POST', '/api/rewrite', body),
  checkFixes: (body) => request('POST', '/api/fixes/check', body),
  getFixesSummary: () => request('GET', '/api/fixes/summary'),
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
    connect: (returnTo, switchAccount = false) =>
      request('POST', '/api/github/oauth/init', returnTo || switchAccount ? { returnTo, switchAccount } : undefined),
    repos: () => request('GET', '/api/github/repos'),
    analyze: (repoUrl, opts = {}) => request('POST', '/api/github/analyze', { repoUrl, ...opts }),
    disconnect: () => request('DELETE', '/api/github/disconnect'),
    previewFixes: ({ url, repoFullName, artifacts }) =>
      request('POST', '/api/github/preview-fixes', { url, repoFullName, artifacts }),
    pushFixes: ({ repoFullName, approvedIds, artifacts, scannedUrl }) =>
      request('POST', '/api/github/push-fixes', { repoFullName, approvedIds, artifacts, scannedUrl }),
  },
};
