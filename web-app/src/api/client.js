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
  me: () => request('GET', '/api/users/me'),
  analyze: (body) => request('POST', '/api/analyze', body),
  history: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/api/history${qs}`);
  },
  scanUrl: (url) => request('POST', '/api/scan', { url }),
};
