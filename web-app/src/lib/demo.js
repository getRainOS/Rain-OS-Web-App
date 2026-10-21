// Live demo mode: on for this browser tab only (sessionStorage), so a real
// account in another tab is never affected.
const KEY = 'rain_os_demo';

export function isDemo() {
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}

export function startDemo() {
  try {
    sessionStorage.setItem(KEY, '1');
    if (!localStorage.getItem('rain_os_user_lane')) localStorage.setItem('rain_os_user_lane', 'local_business');
  } catch { /* storage blocked: the demo can't start */ }
}

export function exitDemo() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}
