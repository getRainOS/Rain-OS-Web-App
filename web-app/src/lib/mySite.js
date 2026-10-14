// Remembers the user's website on this device so every check knows their
// domain (without it we cannot tell where they rank among cited sources).
const KEY = 'rain_os_my_site';

export function getMySite() {
  try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
}

export function setMySite(value) {
  try {
    if (typeof value === 'string' && value.trim()) localStorage.setItem(KEY, value.trim());
  } catch { /* storage unavailable: the field simply is not remembered */ }
}
