// Error tracking for the app with Sentry. Inert until VITE_SENTRY_DSN is set at
// build time, so local runs and previews never send anything. Request bodies
// and cookies are never sent.
import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

export function initMonitoring() {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend(event) {
      delete event.request?.data;
      delete event.request?.cookies;
      return event;
    },
  });
}

export function captureFrontendError(error, info) {
  if (!dsn) return;
  Sentry.captureException(error, { extra: { componentStack: info?.componentStack } });
}
