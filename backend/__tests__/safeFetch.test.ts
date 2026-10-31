import { describe, it, expect, vi, afterEach } from 'vitest';
import dns from 'node:dns';
import { assertPublicHttpUrl, isPrivateAddress, safeFetch } from '../services/safeFetch';

describe('isPrivateAddress', () => {
  it.each([
    '127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1',
    '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '::1', '::', 'fd00::1', 'fe80::1',
    '::ffff:127.0.0.1', '::ffff:10.0.0.1',
  ])('blocks %s', ip => {
    expect(isPrivateAddress(ip)).toBe(true);
  });

  it.each(['93.184.216.34', '8.8.8.8', '172.32.0.1', '2606:4700:4700::1111'])('allows %s', ip => {
    expect(isPrivateAddress(ip)).toBe(false);
  });

  it('refuses anything that is not an address', () => {
    expect(isPrivateAddress('example.com')).toBe(true);
  });
});

describe('assertPublicHttpUrl', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    'http://127.0.0.1/admin',
    'http://169.254.169.254/latest/meta-data/',
    'http://10.0.0.5:8080/',
    'http://[::1]/',
    'http://localhost:3001/api/admin',
    'http://db.internal/',
    'file:///etc/passwd',
    'ftp://example.com/file',
    'not a url',
  ])('refuses %s', async url => {
    await expect(assertPublicHttpUrl(url)).rejects.toThrow();
  });

  it('accepts a public address', async () => {
    await expect(assertPublicHttpUrl('https://93.184.216.34/page')).resolves.toBeInstanceOf(URL);
  });

  it('refuses a public-looking name that resolves to a private address', async () => {
    vi.spyOn(dns.promises, 'lookup').mockResolvedValue([{ address: '10.0.0.7', family: 4 }] as any);
    await expect(assertPublicHttpUrl('https://looks-public.example/')).rejects.toThrow('not a public website');
  });

  it('accepts a name whose addresses are all public', async () => {
    vi.spyOn(dns.promises, 'lookup').mockResolvedValue([{ address: '93.184.216.34', family: 4 }] as any);
    await expect(assertPublicHttpUrl('https://example.com/')).resolves.toBeInstanceOf(URL);
  });
});

describe('safeFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does not fetch a private address at all', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(safeFetch('http://169.254.169.254/latest/meta-data/')).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses a redirect that leads to a private address', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(null, { status: 302, headers: { location: 'http://169.254.169.254/latest/' } })
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(safeFetch('https://93.184.216.34/start')).rejects.toThrow('not a public website');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('follows a redirect to another public address', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 301, headers: { location: '/moved' } }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await safeFetch('https://93.184.216.34/start');
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenLastCalledWith('https://93.184.216.34/moved', expect.objectContaining({ redirect: 'manual' }));
  });

  it('stops after too many redirects', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 302, headers: { location: 'https://93.184.216.34/again' } })));
    vi.stubGlobal('fetch', fetchMock);
    await expect(safeFetch('https://93.184.216.34/loop')).rejects.toThrow('Too many redirects');
  });
});
