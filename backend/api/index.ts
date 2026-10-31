import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { costlyLimiter } from '../services/costlyLimiter';
import { isAllowedOrigin } from '../services/corsOrigins';
// api/index.ts
import express from 'express';
import { captureError } from '../services/monitoring';
import cors from 'cors';
import { setupDatabase } from '../services/dbSetup';
import process from 'process';
// ─── Route handlers ───────────────────────────────────────────────────────────
// Phase 2: new analyze controller (replaces inline analyzeHandler)
import { handleAnalyze, handleCapabilities, handleQuickTool } from '../services/analyzeController';
import urlScanHandler from './url-scan';
import citationCheckHandler, {
  listHandler as citationChecksListHandler,
  deleteHandler as citationCheckDeleteHandler,
  bulkDeleteHandler as citationChecksBulkDeleteHandler,
} from './citation-check';
import { regionsHandler as citationRegionsHandler } from './citation-regions';
import { listHandler as historyListHandler, deleteHandler as historyDeleteHandler, getByIdHandler as historyGetByIdHandler, setBrandHandler as historySetBrandHandler } from './history';
import brandVisibilityHandler, { brandVisHistoryHandler, brandVisDeleteHandler } from './brand-visibility';
import { sovHandler, sovHistoryHandler, sovDeleteHandler } from './share-of-voice';
// Auth
import loginHandler from './auth/login';
import passwordResetRequestHandler from './auth/password-reset/request';
import passwordResetSubmitHandler from './auth/password-reset/submit';
import signupHandler from './auth/signup';
import confirmHandler from './auth/confirm';
import syncHandler from './auth/sync';
// Users
import usersMeHandler from './users/me';
import regenerateKeyHandler from './users/me/regenerate-key';
import updateNameHandler from './users/me/update-name';
import deleteAccountHandler from './users/me/delete-account';
import locationHandler from './users/me/location';
import localListingHandler from './local-listing';
import mapsGridHandler from './maps-grid';
import laneStatsHandler from './lane-stats';
import { listHandler as productsListHandler, saveHandler as productsSaveHandler, deleteHandler as productsDeleteHandler, defaultsHandler as productsDefaultsHandler, importStoreHandler as productsImportStoreHandler, importPageHandler as productsImportPageHandler, draftHandler as productsDraftHandler } from './products';
import { enginesHandler, publicEnginesHandler, startHandler as engineCheckStartHandler, pollHandler as engineCheckPollHandler } from './engine-check';
// Stripe
import createCheckoutSessionHandler from './stripe/create-checkout-session';
import createPortalSessionHandler from './stripe/create-portal-session';
import stripeWebhookHandler from './stripe/webhook';
// AI readiness
// GitHub OAuth + Repo Analysis
import githubOauthHandler from './github/oauth';
import githubCallbackHandler from './github/callback';
import { listReposHandler, analyzeRepoHandler, disconnectGithubHandler } from './github/repos';
import githubPreviewFixesHandler from './github/preview-fixes';
import githubPushFixesHandler from './github/push-fixes';
import rewriteHandler from './rewrite';
import { fixesCheckHandler, fixesSummaryHandler } from './fixes';
import {
  listHandler as trackedListHandler,
  createHandler as trackedCreateHandler,
  updateHandler as trackedUpdateHandler,
  deleteHandler as trackedDeleteHandler,
  alertsHandler as citationAlertsHandler,
  digestScheduleHandler,
} from './tracked-queries';
import { startScheduler } from '../services/schedulerService';
import promptSuggestionsHandler from './prompt-suggestions';
import contentIdeasHandler from './content-ideas';
import { unsubscribePageHandler, unsubscribeHandler } from './unsubscribe';
import { groundingUsageHandler, testAccountStatusHandler, testAccountResetHandler, testAccountRetryHandler } from './admin';
import { questionsHandler as interviewQuestionsHandler, draftHandler as interviewDraftHandler } from './interview';
import { listHandler as brandLinksListHandler, saveHandler as brandLinksSaveHandler, deleteHandler as brandLinksDeleteHandler } from './brand-links';
import { optionsHandler as topicOptionsHandler, questionsHandler as topicQuestionsHandler } from './topic';
import questionGapHandler from './question-gap';
// ─── CORS configuration ───────────────────────────────────────────────────────
// The web app (app.getrainos.com) works fine with wildcard origin.
// If you need credentials: true for a specific frontend route in the future,
// add a separate router with a scoped CORS config — do not change this globalone.
const corsOptions: cors.CorsOptions = {
origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization', 'X-Rain-Lane'],
exposedHeaders: ['X-Usage-Info'],
};
const startServer = async () => {
await setupDatabase();
const app = express();
const port = process.env.PORT || 3001;
app.set('trust proxy', 1);
app.use(helmet());
// Stripe webhook needs raw body — register before the JSON parser
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }),
stripeWebhookHandler);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again shortly.' },
});
app.use('/api', apiLimiter);
app.use('/v1/api', apiLimiter);
// Paid AI and data-provider calls: a tighter limit per user (see services/costlyLimiter.ts).
app.use(['/api/analyze', '/v1/api/analyze', '/api/rewrite', '/v1/api/rewrite', '/api/url-scan', '/v1/api/url-scan', '/api/brand-visibility', '/v1/api/brand-visibility', '/api/sov', '/v1/api/sov', '/api/citation-check', '/v1/api/citation-check', '/api/prompt-suggestions', '/v1/api/prompt-suggestions', '/api/local-listing', '/v1/api/local-listing', '/api/maps-grid', '/v1/api/maps-grid', '/api/products/import-store', '/v1/api/products/import-store', '/api/products/import-page', '/v1/api/products/import-page'], costlyLimiter);
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
app.post('/api/quick-tool', handleQuickTool);
app.post('/v1/api/analyze', handleAnalyze);
app.post('/v1/analyze', handleAnalyze);
app.post('/analyze', handleAnalyze);



// ─── Document Rewrite for AI ──────────────────────────────────────────────
app.post('/api/rewrite', rewriteHandler);
app.post('/api/fixes/check', fixesCheckHandler);
app.get('/api/fixes/summary', fixesSummaryHandler);
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
app.post('/api/citation-checks/regions', citationRegionsHandler);
app.post('/v1/api/citation-checks/regions', citationRegionsHandler);
// ─── Weekly citation tracking ───────────────────────────────────────────────
app.get('/api/tracked-queries', trackedListHandler);
app.post('/api/tracked-queries', trackedCreateHandler);
app.patch('/api/tracked-queries/:id', trackedUpdateHandler);
app.delete('/api/tracked-queries/:id', trackedDeleteHandler);
app.patch('/api/citation-alerts', citationAlertsHandler);
app.patch('/api/email-schedule', digestScheduleHandler);
app.post('/api/prompt-suggestions', promptSuggestionsHandler);
app.post('/api/content-ideas', contentIdeasHandler);
app.get('/api/admin/grounding-usage', groundingUsageHandler);
app.get('/api/admin/test-account', testAccountStatusHandler);
app.post('/api/admin/test-account/reset', testAccountResetHandler);
app.post('/api/admin/test-account/retry', testAccountRetryHandler);
app.get('/api/email/unsubscribe', unsubscribePageHandler);
app.post('/api/email/unsubscribe', express.urlencoded({ extended: false }), unsubscribeHandler);
app.post('/api/interview/questions', interviewQuestionsHandler);
app.post('/api/interview/draft', interviewDraftHandler);
app.get('/api/brand-links', brandLinksListHandler);
app.post('/api/brand-links', brandLinksSaveHandler);
app.delete('/api/brand-links', brandLinksDeleteHandler);
app.post('/api/topic/options', topicOptionsHandler);
app.post('/api/topic/questions', topicQuestionsHandler);
app.post('/api/question-gap', questionGapHandler);
// ─── Content analysis history ───────────────────────────────────────────────
app.get('/api/history', historyListHandler);
app.get('/v1/api/history', historyListHandler);
app.get('/api/history/:id', historyGetByIdHandler);
app.delete('/api/history/:id', historyDeleteHandler);
app.post('/api/history/:id/brand', historySetBrandHandler);
app.delete('/v1/api/history/:id', historyDeleteHandler);
// ─── Auth ──────────────────────────────────────────────────────────────────
app.post('/api/auth/login', loginHandler);
app.post('/api/auth/password-reset/request', passwordResetRequestHandler);
app.post('/api/auth/password-reset/submit', passwordResetSubmitHandler);
app.post('/api/auth/signup', signupHandler);
app.post('/api/auth/confirm', confirmHandler);
app.post('/api/auth/sync', syncHandler);
// ─── Users ─────────────────────────────────────────────────────────────────
app.get( '/api/users/me', usersMeHandler);
app.post('/api/users/me/regenerate-key', regenerateKeyHandler);
app.post('/api/users/me/update-name', updateNameHandler);
app.post('/api/users/me/delete-account', deleteAccountHandler);
app.post('/api/users/me/location', locationHandler);
app.get('/api/engines', enginesHandler);
app.get('/api/public/engines', publicEnginesHandler);
app.post('/api/local-listing', localListingHandler);
app.post('/api/maps-grid', mapsGridHandler);
app.get('/api/lane-stats', laneStatsHandler);
app.get('/api/products', productsListHandler);
app.post('/api/products', productsSaveHandler);
app.post('/api/products/defaults', productsDefaultsHandler);
app.post('/api/products/import-store', productsImportStoreHandler);
app.post('/api/products/import-page', productsImportPageHandler);
app.post('/api/products/:id/draft', productsDraftHandler);
app.delete('/api/products/:id', productsDeleteHandler);
app.post('/api/citation-check/engine', engineCheckStartHandler);
app.get('/api/citation-check/engine/:id', engineCheckPollHandler);
// ─── Stripe ────────────────────────────────────────────────────────────────
app.post('/api/stripe/create-checkout-session', createCheckoutSessionHandler);
app.post('/api/stripe/create-portal-session', createPortalSessionHandler);
// ─── GitHub OAuth + Repo Analysis ─────────────────────────────────────────
app.post('/api/github/oauth/init', githubOauthHandler);
app.get('/api/github/oauth/callback', githubCallbackHandler);
app.get('/api/github/repos', listReposHandler);
app.post('/api/github/analyze', analyzeRepoHandler);
app.delete('/api/github/disconnect', disconnectGithubHandler);
app.post('/api/github/preview-fixes', githubPreviewFixesHandler);
app.post('/api/github/push-fixes', githubPushFixesHandler);
// ─── AI Readiness endpoints ────────────────────────────────────────────────
// Note: /v1/v1/* paths removed — they were duplicates from a copy-paste error
// in the original index.ts and had no legitimate callers.
// Last-resort handler: report the error, and never leak its details to the client.
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  captureError(err, { route: req.path, method: req.method });
  console.error('Unhandled request error:', err?.message || err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'internal_server_error', message: 'Something went wrong. Please try again.' });
});

app.listen(port, () => {
console.log(`rain OS backend listening on port ${port}`);
startScheduler();
});
};
startServer().catch((err) => {



captureError(err, { phase: 'startup' });
console.error('Failed to start server:', err);
process.exit(1);
});