// services/monitoring.ts — error tracking with Sentry. Inert until SENTRY_DSN is
// set, so local runs and tests never send anything.
import * as Sentry from '@sentry/node';

const dsn = process.env.SENTRY_DSN;
export const monitoringEnabled = !!dsn;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.RAILWAY_ENVIRONMENT_NAME || process.env.NODE_ENV || 'development',
    tracesSampleRate: 0,
    // Never send request bodies or headers: they can hold API keys and passwords.
    sendDefaultPii: false,
    beforeSend(event) {
      delete event.request?.data;
      delete event.request?.headers;
      delete event.request?.cookies;
      return event;
    },
  });
  process.on('unhandledRejection', err => Sentry.captureException(err));
  // After an uncaught exception the process is in an unknown state. Report it,
  // then exit so the host restarts a clean process.
  process.on('uncaughtException', err => {
    Sentry.captureException(err);
    console.error('uncaught exception:', err);
    Sentry.flush(2000).finally(() => process.exit(1));
  });
}

export function captureError(err: unknown, context?: Record<string, string>): void {
  if (!dsn) return;
  Sentry.captureException(err, context ? { tags: context } : undefined);
}

export { Sentry };
