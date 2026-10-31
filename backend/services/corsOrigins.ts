// services/corsOrigins.ts — which browser origins may call the API.
// The web app is the only browser client. Requests with no Origin header
// (server-to-server, curl) are not browser requests and are unaffected.
export const DEFAULT_ALLOWED_ORIGINS = [
  'https://getrainos.com',
  'https://www.getrainos.com',
  'https://app.getrainos.com',
  'http://localhost:5000',
  'http://localhost:5173',
];

export function allowedOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const extra = (env.CORS_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return [...DEFAULT_ALLOWED_ORIGINS, ...extra];
}

export function isAllowedOrigin(origin: string | undefined, env: NodeJS.ProcessEnv = process.env): boolean {
  if (!origin) return true;
  return allowedOrigins(env).includes(origin);
}
