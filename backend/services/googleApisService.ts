// services/googleApisService.ts — Google API integrations for real data
// Provides: PageSpeed Insights, Google Search Console, Google Business Profile
// These APIs require real credentials and return actual (non-theoretical) data.
//
// PageSpeed Insights: free, API key only — real Core Web Vitals for any URL
// Search Console: OAuth + site verification required — real indexing/click data
// Business Profile: OAuth + GBP manager access — real reviews, ratings, hours
//
// To enable: set GOOGLE_API_KEY (PageSpeed), plus GSC/GBP OAuth for those features.

import fetch from 'node-fetch';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const PAGESPEED_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   PageSpeed Insights — Real Core Web Vitals
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

export interface PageSpeedResult {
  url: string;
  strategy: 'mobile' | 'desktop';
  performanceScore: number;          // 0–100 Lighthouse performance
  largestContentfulPaint: number;  // seconds (LCP — perceived load speed)
  firstInputDelay: number;         // ms (FID — interactivity, now INP)
  cumulativeLayoutShift: number;   // score (CLS — visual stability)
  totalBlockingTime: number;       // ms (TBT — main-thread blocking)
  speedIndex: number;              // seconds
  serverResponseTime: number;      // ms (TTFB)
  pageSize: number;                // bytes
  resourceCounts: { images: number; scripts: number; stylesheets: number; fonts: number; total: number };
  passesCoreWebVitals: boolean;    // true if all three CWV pass thresholds
  opportunities: { title: string; savings: string; priority: 'high'|'medium'|'low' }[];
}

function msToSec(ms: number): number {
  return Math.round((ms / 1000) * 100) / 100;
}

export async function runPageSpeed(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResult> {
  if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY environment variable is not set. PageSpeed Insights requires a Google Cloud API key.');
  }

  const apiUrl = `${PAGESPEED_ENDPOINT}?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${GOOGLE_API_KEY}&category=PERFORMANCE`;
  const res = await fetch(apiUrl, { timeout: 20000 } as any);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PageSpeed API error: ${res.status} — ${err.slice(0, 200)}`);
  }

  const data = await res.json() as any;
  const lighthouse = data?.lighthouseResult;
  if (!lighthouse) {
    throw new Error('PageSpeed API returned no Lighthouse data');
  }

  const audits = lighthouse.audits || {};
  const categories = lighthouse.categories || {};

  const lcpMs = audits['largest-contentful-paint']?.numericValue ?? 0;
  const fidMs = audits['max-potential-fid']?.numericValue ?? 0;
  const cls = audits['cumulative-layout-shift']?.numericValue ?? 0;
  const tbtMs = audits['total-blocking-time']?.numericValue ?? 0;
  const siMs = audits['speed-index']?.numericValue ?? 0;
  const ttfbMs = audits['server-response-time']?.numericValue ?? 0;
  const pageSize = audits['total-byte-weight']?.numericValue ?? 0;

  const resourceSummary = audits['resource-summary']?.details?.items || [];
  const counts = { images: 0, scripts: 0, stylesheets: 0, fonts: 0, total: 0 };
  for (const item of resourceSummary) {
    counts.total += item.requestCount || 0;
    const type = item.resourceType || '';
    if (type.includes('image')) counts.images += item.requestCount || 0;
    if (type.includes('script')) counts.scripts += item.requestCount || 0;
    if (type.includes('stylesheet')) counts.stylesheets += item.requestCount || 0;
    if (type.includes('font')) counts.fonts += item.requestCount || 0;
  }

  // Core Web Vitals thresholds (2024)
  // LCP < 2.5s, CLS < 0.1, INP < 200ms (FID is deprecated, use TBT as proxy)
  const passesLCP = lcpMs < 2500;
  const passesCLS = cls < 0.1;
  const passesTBT = tbtMs < 200;

  // Build opportunities list from Lighthouse audit results
  const opportunities: PageSpeedResult['opportunities'] = [];
  const oppAudits = [
    { key: 'unused-css-rules', title: 'Remove unused CSS' },
    { key: 'unused-javascript', title: 'Remove unused JavaScript' },
    { key: 'modern-image-formats', title: 'Use modern image formats (WebP/AVIF)' },
    { key: 'efficiently-encode-images', title: 'Efficiently encode images' },
    { key: 'render-blocking-resources', title: 'Eliminate render-blocking resources' },
    { key: 'uses-text-compression', title: 'Enable text compression' },
    { key: 'uses-responsive-images', title: 'Use responsive images' },
    { key: 'server-response-time', title: 'Reduce server response time' },
  ];

  for (const o of oppAudits) {
    const audit = audits[o.key];
    if (audit && audit.score !== null && audit.score < 1) {
      const savings = audit.details?.overallSavingsMs
        ? `${Math.round(audit.details.overallSavingsMs / 1000 * 10) / 10}s`
        : (audit.details?.overallSavingsBytes
          ? `${Math.round(audit.details.overallSavingsBytes / 1024)}KB`
          : '');
      opportunities.push({
        title: o.title,
        savings,
        priority: audit.score < 0.5 ? 'high' : audit.score < 0.9 ? 'medium' : 'low',
      });
    }
  }

  return {
    url,
    strategy,
    performanceScore: Math.round((categories.performance?.score ?? 0) * 100),
    largestContentfulPaint: msToSec(lcpMs),
    firstInputDelay: Math.round(fidMs),
    cumulativeLayoutShift: Math.round(cls * 1000) / 1000,
    totalBlockingTime: Math.round(tbtMs),
    speedIndex: msToSec(siMs),
    serverResponseTime: Math.round(ttfbMs),
    pageSize,
    resourceCounts: counts,
    passesCoreWebVitals: passesLCP && passesCLS && passesTBT,
    opportunities,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Google Search Console — Real indexing & click data
   ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

export interface GscSiteMetrics {
  siteUrl: string;
  clicks: number;
  impressions: number;
  ctr: number;        // 0–1
  position: number;   // average position
  indexedPages: number;
  nonIndexedPages: number;
  topQueries: { query: string; clicks: number; impressions: number }[];
  topPages: { page: string; clicks: number; impressions: number }[];
}

/** Placeholder: GSC requires OAuth 2.0 + site verification. Not enabled by default. */
export async function fetchGscMetrics(siteUrl: string, accessToken: string): Promise<GscSiteMetrics> {
  // In production this would call https://www.googleapis.com/webmasters/v3/sites/.../searchAnalytics/query
  // and https://www.googleapis.com/webmasters/v3/sites/.../index/inspect
  // Requires OAuth flow with scope: https://www.googleapis.com/auth/webmasters.readonly
  throw new Error(
    'Google Search Console requires OAuth setup. Connect your GSC account in Settings to enable real indexing data.'
  );
}

/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Google Business Profile — Real reviews, ratings, hours
   ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

export interface GbpBusinessData {
  name: string;
  rating: number;       // 0–5
  reviewCount: number;
  address: string;
  phone?: string;
  website?: string;
  hours: { day: string; open: string; close: string }[];
  photos: number;
  posts: number;
  categories: string[];
}

/** Placeholder: GBP requires OAuth 2.0 + GBP manager access. Not enabled by default. */
export async function fetchGbpData(businessName: string, accessToken: string): Promise<GbpBusinessData> {
  // In production this would call the Business Profile API
  // https://developers.google.com/my-business/reference/rest
  // Requires OAuth with scope: https://www.googleapis.com/auth/business.manage
  throw new Error(
    'Google Business Profile requires OAuth setup. Connect your GBP account in Settings to enable real local business data.'
  );
}

/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Helper: is Google API key configured?
   ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

export function isGoogleApiConfigured(): boolean {
  return !!GOOGLE_API_KEY;
}
