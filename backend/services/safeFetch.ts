// services/safeFetch.ts — fetches of user-supplied URLs.
// The scanner and importers fetch whatever address a user gives them. Without
// checks, that lets a user reach localhost, private networks and cloud
// metadata endpoints from our server. Every such fetch goes through here.
import dns from 'node:dns';
import net from 'node:net';

const MAX_REDIRECTS = 3;

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 ||                          // 0.0.0.0/8
    a === 10 ||                         // 10.0.0.0/8
    a === 127 ||                        // loopback
    (a === 169 && b === 254) ||         // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 192 && b === 0) ||           // IETF protocol assignments
    a >= 224                            // multicast and reserved
  );
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::' || lower === '::1') return true;
  if (lower.startsWith('::ffff:')) return isPrivateIPv4(lower.slice(7));
  return /^f[cd]/.test(lower) || /^fe[89ab]/.test(lower); // unique-local, link-local
}

export function isPrivateAddress(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return isPrivateIPv4(ip);
  if (family === 6) return isPrivateIPv6(ip);
  return true; // not an address at all: refuse
}

// Throws unless the URL is http(s) and every address its host resolves to is public.
export async function assertPublicHttpUrl(input: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Invalid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http and https addresses can be checked');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) {
    throw new Error('That address is not a public website');
  }
  if (net.isIP(host)) {
    if (isPrivateAddress(host)) throw new Error('That address is not a public website');
    return url;
  }
  let addresses: { address: string }[];
  try {
    addresses = await dns.promises.lookup(host, { all: true });
  } catch {
    throw new Error('That website could not be found');
  }
  if (addresses.length === 0 || addresses.some(a => isPrivateAddress(a.address))) {
    throw new Error('That address is not a public website');
  }
  return url;
}

// fetch() that refuses non-public targets, including any redirect that leads to one.
export async function safeFetch(input: string, init: RequestInit = {}): Promise<Response> {
  let current = input;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHttpUrl(current);
    const res = await fetch(current, { ...init, redirect: 'manual' });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      if (hop === MAX_REDIRECTS) throw new Error('Too many redirects');
      current = new URL(res.headers.get('location') as string, current).toString();
      continue;
    }
    return res;
  }
  throw new Error('Too many redirects');
}
