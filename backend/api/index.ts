// api/index.ts
import express from 'express';
import cors from 'cors';
import { setupDatabase } from '../services/dbSetup';
import process from 'process';
// ─── Route handlers ───────────────────────────────────────────────────────────
// Phase 2: new analyze controller (replaces inline analyzeHandler)
import { handleAnalyze, handleCapabilities } from '../services/analyzeController';
import urlScanHandler from './url-scan';
import citationCheckHandler, {
  listHandler as citationChecksListHandler,
  deleteHandler as citationCheckDeleteHandler,
  bulkDeleteHandler as citationChecksBulkDeleteHandler,
} from './citation-check';
import { listHandler as historyListHandler, deleteHandler as historyDeleteHandler } from './history';
import brandVisibilityHandler, { brandVisHistoryHandler, brandVisDeleteHandler } from './brand-visibility';
import { sovHandler, sovHistoryHandler, sovDeleteHandler } from './share-of-voice';
// Auth
import googleAuthHandler from './auth/google';
import googleRedirectHandler from './auth/google-redirect';
import googleCallbackHandler from './auth/google-callback';
import loginHandler from './auth/login';
import passwordResetRequestHandler from './auth/password-reset/request';
import passwordResetSubmitHandler from './auth/password-reset/submit';
import signupHandler from './auth/signup';
import syncHandler from './auth/sync';
// Users
import usersMeHandler from './users/me';
import regenerateKeyHandler from './users/me/regenerate-key';
// Stripe
import createCheckoutSessionHandler from './stripe/create-checkout-session';
import createPortalSessionHandler from './stripe/create-portal-session';
import stripeWebhookHandler from './stripe/webhook';
// Cron
import cronResetUsageHandler from './cron/reset-usage';
// Plugin / AI readiness
import pluginHealthHandler from './plugin/health';
import pluginContentAnalysisHandler from './plugin/content-analysis';
import aiSiteLlmsHandler from './ai/site-llms';
import aiNormalizeHandler from './ai/normalize';
import aiContentHandler from './ai/content';
import aiDiagnosticsHandler from './ai/diagnostics';
// GitHub OAuth + Repo Analysis
import githubOauthHandler from './github/oauth';
import githubCallbackHandler from './github/callback';
import { listReposHandler, analyzeRepoHandler, disconnectGithubHandler } from './github/repos';
import githubPreviewFixesHandler from './github/preview-fixes';
import githubPushFixesHandler from './github/push-fixes';
import rewriteHandler from './rewrite';
// ─── CORS configuration ───────────────────────────────────────────────────────
// IMPORTANT: Keep origin: '*' so the WordPress plugin works from any site.
// Restricting origin here would 403 every WP install that has the plugin.
// The web app (app.getrainos.com) works fine with wildcard origin.
// If you need credentials: true for a specific frontend route in the future,
// add a separate router with a scoped CORS config — do not change this globalone.
const corsOptions: cors.CorsOptions = {
origin: '*',
methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization'],
exposedHeaders: ['X-Usage-Info'],
};
const startServer = async () => {
await setupDatabase();
const app = express();
const port = process.env.PORT || 3001;
app.set('trust proxy', 1);
// Stripe webhook needs raw body — register before the JSON parser
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }),
stripeWebhookHandler);
app.use(cors(corsOptions));
app.use(express.json());
// ─── Health ────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok',
timestamp: new Date().toISOString() }));
app.get('/v1/api/health', (_req, res) => res.status(200).json({ status: 'ok',
timestamp: new Date().toISOString() }));
// ─── Capabilities (new in v2.3) ────────────────────────────────────────────
app.get('/api/capabilities', handleCapabilities);
app.get('/v1/api/capabilities', handleCapabilities);
// ─── Analyze (Phase 2 controller — replaces old analyzeHandler) ───────────
app.post('/api/analyze', handleAnalyze);
app.post('/v1/api/analyze', handleAnalyze);
app.post('/v1/analyze', handleAnalyze);
app.post('/analyze', handleAnalyze);



// ─── Document Rewrite for AI ──────────────────────────────────────────────
app.post('/api/rewrite', rewriteHandler);
app.post('/v1/api/rewrite', rewriteHandler);
// ─── URL Scan (new in v2.3) ────────────────────────────────────────────────
app.post('/api/url-scan', urlScanHandler);
app.post('/v1/api/url-scan', urlScanHandler);
// ─── AI Brand Visibility (new in v2.5) ────────────────────────────────────
app.post('/api/brand-visibility', brandVisibilityHandler);
app.post('/v1/api/brand-visibility', brandVisibilityHandler);
app.get('/api/brand-visibility', brandVisHistoryHandler);
app.get('/v1/api/brand-visibility', brandVisHistoryHandler);
app.delete('/api/brand-visibility', brandVisDeleteHandler);
app.delete('/v1/api/brand-visibility', brandVisDeleteHandler);
// ─── Share of Voice (new in v2.6) ─────────────────────────────────────────
app.post('/api/sov', sovHandler);
app.post('/v1/api/sov', sovHandler);
app.get('/api/sov', sovHistoryHandler);
app.get('/v1/api/sov', sovHistoryHandler);
app.delete('/api/sov', sovDeleteHandler);
app.delete('/v1/api/sov', sovDeleteHandler);
// ─── Citation Monitor (new in v2.4) ────────────────────────────────────────
app.post('/api/citation-check', citationCheckHandler);
app.post('/v1/api/citation-check', citationCheckHandler);
app.get('/api/citation-checks', citationChecksListHandler);
app.get('/v1/api/citation-checks', citationChecksListHandler);
app.delete('/api/citation-checks', citationChecksBulkDeleteHandler);
app.delete('/v1/api/citation-checks', citationChecksBulkDeleteHandler);
app.delete('/api/citation-checks/:id', citationCheckDeleteHandler);
app.delete('/v1/api/citation-checks/:id', citationCheckDeleteHandler);
// ─── Content analysis history ───────────────────────────────────────────────
app.get('/api/history', historyListHandler);
app.get('/v1/api/history', historyListHandler);
app.delete('/api/history/:id', historyDeleteHandler);
app.delete('/v1/api/history/:id', historyDeleteHandler);
// ─── Auth ──────────────────────────────────────────────────────────────────
app.post('/api/auth/google', googleAuthHandler);
app.get( '/api/auth/google', googleRedirectHandler);
app.get( '/api/auth/google/callback', googleCallbackHandler);
app.post('/api/auth/login', loginHandler);
app.post('/api/auth/password-reset/request', passwordResetRequestHandler);
app.post('/api/auth/password-reset/submit', passwordResetSubmitHandler);
app.post('/api/auth/signup', signupHandler);
app.post('/api/auth/sync', syncHandler);
// ─── Users ─────────────────────────────────────────────────────────────────
app.get( '/api/users/me', usersMeHandler);
app.post('/api/users/me/regenerate-key', regenerateKeyHandler);
// ─── Stripe ────────────────────────────────────────────────────────────────
app.post('/api/stripe/create-checkout-session', createCheckoutSessionHandler);
app.post('/api/stripe/create-portal-session', createPortalSessionHandler);
// ─── Cron ──────────────────────────────────────────────────────────────────
app.post('/api/cron/reset-usage', cronResetUsageHandler);
// ─── GitHub OAuth + Repo Analysis ─────────────────────────────────────────
app.post('/api/github/oauth/init', githubOauthHandler);
app.get('/api/github/oauth/callback', githubCallbackHandler);
app.get('/api/github/repos', listReposHandler);
app.post('/api/github/analyze', analyzeRepoHandler);
app.delete('/api/github/disconnect', disconnectGithubHandler);
app.post('/api/github/preview-fixes', githubPreviewFixesHandler);
app.post('/api/github/push-fixes', githubPushFixesHandler);
// ─── Plugin-facing endpoints ───────────────────────────────────────────────
app.get('/api/plugin/health', pluginHealthHandler);
app.get('/api/plugin/content/:contentId/analysis',
pluginContentAnalysisHandler);
app.get('/v1/api/plugin/health', pluginHealthHandler);
app.get('/v1/api/plugin/content/:contentId/analysis',
pluginContentAnalysisHandler);
// ─── AI Readiness endpoints ────────────────────────────────────────────────
app.get( '/ai/site/llms', aiSiteLlmsHandler);
app.post('/ai/normalize', aiNormalizeHandler);
app.get( '/ai/content/:contentId', aiContentHandler);
app.get( '/ai/diagnostics/:contentId', aiDiagnosticsHandler);
app.get( '/v1/ai/site/llms', aiSiteLlmsHandler);
app.post('/v1/ai/normalize', aiNormalizeHandler);
app.get( '/v1/ai/content/:contentId', aiContentHandler);
app.get( '/v1/ai/diagnostics/:contentId', aiDiagnosticsHandler);
// Note: /v1/v1/* paths removed — they were duplicates from a copy-paste error
// in the original index.ts and had no legitimate callers.
app.listen(port, () => {
console.log(`Rain OS backend listening on port ${port}`);
});
};
startServer().catch((err) => {



console.error('Failed to start server:', err);
process.exit(1);
});