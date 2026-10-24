import PastAnalyses from '../components/PastAnalyses.jsx';
import { US_STATES } from '../lib/usStates.js';
import ListingCheck from '../components/ListingCheck.jsx';
import MapsGridCard from '../components/MapsGridCard.jsx';
import BrandNameLine from '../components/BrandNameLine.jsx';
import ProductPageCheck from '../components/ProductPageCheck.jsx';
import LocalPageCheck, { LocalSteps } from '../components/LocalPageCheck.jsx';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CheckProgress from '../components/CheckProgress.jsx';
import Select from '../components/Select.jsx';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import PillarScores from '../components/PillarScores.jsx';
import ArtifactBlock from '../components/ArtifactBlock.jsx';
import CitationCrossPromo from '../components/CitationCrossPromo.jsx';
import GithubPushPanel from '../components/GithubPushPanel.jsx';
import { normalizeUrlInput, hasUrlBody } from '../lib/urlInput.js';
import RecentPicker from '../components/RecentPicker.jsx';
import { urlScannerLabel } from '../lib/laneLabels.js';
import { ShoppingBag, MapPin, Code2, Sparkles, ScanSearch, Wand2, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import styles from './UrlScanner.module.css';

// ─── GitHub push panel ───────────────────────────────────────────────────────

function UrlScannerGithubPushPanel({ result, scannedUrl }) {
  const fixableArtifacts = (result?.technical_recommendations || [])
    .filter((r) => r?.artifact)
    .map((r) => r.artifact);

  // Pre-fill the scanned URL on return so the page isn't blank after the
  // GitHub redirect round-trip — one click to re-run the scan and get the
  // push-fixes panel back, instead of retyping the URL.
  const returnTo = `/url-scanner${scannedUrl ? `?url=${encodeURIComponent(scannedUrl)}` : ''}`;

  return <GithubPushPanel fixableArtifacts={fixableArtifacts} scannedUrl={scannedUrl} returnTo={returnTo} />;
}


const TOP_FIXES = 3;

function RecoItem({ r, i }) {
  const isObj = typeof r === 'object' && r !== null;
  const text = isObj ? (r.recommendation || r.text) : r;
  const artifact = isObj ? r.artifact : null;
  const nonTechnicalFix = isObj ? r.nonTechnicalFix : null;
  const technicalFix = isObj ? r.technicalFix : null;
  return (
    <li className={styles.recoItem}>
      <span className={styles.recoNum}>{i + 1}</span>
      <div className={styles.recoContent}>
        <span className={styles.recoText}>{text}</span>
        {(nonTechnicalFix || technicalFix || artifact) && (
          <div className={styles.fixGroup}>
            {nonTechnicalFix && (
              <div className={styles.fixBlock}>
                <span className={`${styles.fixLabel} ${styles.fixLabelNonTechnical}`}>Do it yourself — no code</span>
                <p className={styles.fixText}>{nonTechnicalFix}</p>
              </div>
            )}
            {(technicalFix || artifact) && (
              <div className={styles.fixBlock}>
                <span className={`${styles.fixLabel} ${styles.fixLabelTechnical}`}>Technical fix</span>
                {technicalFix && <p className={styles.fixText}>{technicalFix}</p>}
                {artifact && <ArtifactBlock artifact={artifact} />}
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function SignalRow({ s }) {
  return (
    <li className={styles.signalRow}>
      <span className={styles.signalDot} style={{ background: s.pass ? 'var(--green)' : 'var(--red)' }} aria-hidden="true" />
      <div className={styles.signalText}>
        <div className={styles.signalName}>{s.label || s.name}</div>
        {s.detail && <div className={styles.signalDetail}>{s.detail}</div>}
      </div>
      <span className={s.pass ? styles.statusPass : styles.statusFix}>{s.pass ? 'Pass' : 'Fix'}</span>
    </li>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

const PLATFORM_DISPLAY_NAME = {
  wordpress: 'WordPress',
  shopify: 'Shopify',
  wix: 'Wix',
  squarespace: 'Squarespace',
};

const PLATFORMS = [
  { value: 'bolt', label: 'Bolt' },
  { value: 'lovable', label: 'Lovable' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'v0', label: 'v0 by Vercel' },
  { value: 'replit', label: 'Replit' },
  { value: 'windsurf', label: 'Windsurf' },
  { value: 'base44', label: 'Base44' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'framer', label: 'Framer' },
  { value: 'webflow', label: 'Webflow' },
  { value: 'generic', label: 'Other / Generic' },
];

function buildFixPrompt(platform, recommendations, url, overallScore) {
  const platformName = PLATFORMS.find(p => p.value === platform)?.label || platform;

  const issues = (recommendations || []).map(r => {
    const isObj = typeof r === 'object' && r !== null;
    return isObj
      ? `- [${r.severity || 'medium'}] ${r.issue || r.recommendation} — ${r.recommendation}`
      : `- ${r}`;
  });
  const artifacts = (recommendations || [])
    .filter(r => typeof r === 'object' && r !== null && r.artifact)
    .map(r => `${r.artifact.filename || r.artifact.type}:\n${r.artifact.content}`);

  const scoreNote = overallScore ? `Current rain OS AI Readability Score: ${overallScore}/100.` : '';

  const prompt = `You are the AI assistant inside ${platformName}. I have a site at ${url || 'this URL'} that I built with your platform.

I ran an AI Readability scan and found the following issues that prevent ChatGPT, Gemini, and Perplexity from discovering and citing my site. Higher-severity items matter most:

${issues.join('\n') || '- No critical issues found — consider adding llms.txt and schema markup for better AI visibility'}
${scoreNote}

Please make only the specific changes listed below — don't refactor, restructure, or modify any other part of the project, and don't change existing functionality, styling, or content beyond what's needed for each fix.

Where you need to create new files, generate the content and tell me which files to create. Where existing files need edits, show me the exact changes to make.

${artifacts.length > 0 ? 'Here are file contents you can use:\n\n' + artifacts.join('\n\n') : ''}

Respond with:
1. A summary of what you're changing and why
2. File-by-file instructions (create / edit / replace)
3. Any code snippets I should paste directly`;

  return prompt;
}

function FixPromptGenerator({ recommendations, url, overallScore }) {
  const [platform, setPlatform] = useState('');
  const [copied, setCopied] = useState(false);

  const prompt = platform ? buildFixPrompt(platform, recommendations, url, overallScore) : '';

  function handleCopy() {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={`card ${styles.recoCard}`}>
      <h3 className={styles.sectionTitle}>
        <Wand2 size={16} style={{ marginRight: 8, verticalAlign: '-2px' }} aria-hidden="true" /> Fix with AI
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>
        Pick your vibe platform and get a prompt you can paste straight into its AI assistant. It will fix the exact issues we found — no manual editing required.
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Select
          className={styles.platformSelect}
          value={platform}
          onChange={v => { setPlatform(v); setCopied(false); }}
          placeholder="Select your platform..."
          ariaLabel="Your platform"
          options={PLATFORMS.map(p => ({ value: p.value, label: p.label }))}
        />
        <button
          className="btn btn-primary"
          disabled={!prompt}
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy prompt'}
        </button>
      </div>

      {platform && (
        <pre style={{
          marginTop: '12px',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          maxHeight: '320px',
          overflowY: 'auto',
        }}>{prompt}</pre>
      )}
    </div>
  );
}

function heroSeenKey(lane) {
  return `rain_os_url_scanner_hero_seen_${lane || 'general'}`;
}

export default function UrlScanner() {
  const { refreshUser, userLane, user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(() => normalizeUrlInput(searchParams.get('url') || ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [result, setResult] = useState(null);
  const [scannedUrl, setScannedUrl] = useState('');
  const [city, setCity] = useState(() => searchParams.get('city') || '');
  // The name Citation Monitor, Brand Sentiment and Share of Voice use for this site.
  const [brandName, setBrandName] = useState('');
  const [showCity, setShowCity] = useState(() => !!searchParams.get('city'));
  const [cityState, setCityState] = useState(null);
  const [listings, setListings] = useState('off');
  useEffect(() => { api.engines().then(({ data }) => setListings(data?.features?.localListings || 'off')).catch(() => {}); }, []);
  useEffect(() => { if (user) setCityState(s => s ?? (user.locationState || '')); }, [user]);
  const [heroSeen, setHeroSeen] = useState(() => {
    try {
      return localStorage.getItem(heroSeenKey(userLane)) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      setHeroSeen(localStorage.getItem(heroSeenKey(userLane)) === '1');
    } catch {
      // ignore
    }
  }, [userLane]);

  async function handleScan(e) {
    e.preventDefault();
    if (!hasUrlBody(url)) return;
    setLoading(true);
    setError('');
    setErrorCode('');
    setResult(null);
    try {
      const analysisModule = ['product_sellers', 'developers', 'local_business', 'vibe_coders'].includes(userLane) ? userLane : 'general';
      const target = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
      const { data } = await api.scanUrl(target, { module: analysisModule, brand: brandName.trim() || undefined, ...((userLane === 'local_business' || showCity) && (city.trim() || cityState) ? { targetCity: city.trim(), targetState: cityState || undefined } : {}) });
      setResult(data);
      setScannedUrl(url.trim());
      refreshUser();
      try {
        localStorage.setItem(heroSeenKey(userLane), '1');
      } catch {
        // best-effort only
      }
      setHeroSeen(true);
    } catch (err) {
      setError(err.message || 'Scan failed. Please try again.');
      setErrorCode(err.code || '');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError('');
    setScannedUrl('');
  }

  const techRecs = result?.technical_recommendations;
  const geminiRecs = result?.recommendations;
  const recommendations = (Array.isArray(techRecs) && techRecs.length > 0)
    ? techRecs
    : (Array.isArray(geminiRecs) && geminiRecs.length > 0)
      ? geminiRecs
      : [];

  const signalList = Array.isArray(result?.signals) ? result.signals
    : Array.isArray(result?.technical_signals) ? result.technical_signals : [];
  const failing = signalList.filter(s => !s.pass);
  const passing = signalList.filter(s => s.pass);
  const overall = result?.overallScore ?? result?.overall_score ?? result?.rain_score;

  const pageSub = userLane === 'product_sellers'
    ? 'Scan your product page to see if AI shopping assistants can find your pricing, availability, and details'
    : userLane === 'local_business'
    ? 'Scan a page from your site to see if AI assistants can find your name, address, phone, and hours'
    : 'Scan any URL to analyze its AI readability and AEO performance';

  const heroCopy = userLane === 'product_sellers'
    ? { Icon: ShoppingBag, title: "Scan your product page and see exactly what's missing", sub: "We'll check whether AI shopping assistants like ChatGPT and Perplexity can actually read your pricing, availability, specs, and reviews — then tell you precisely what to fix." }
    : userLane === 'local_business'
    ? { Icon: MapPin, title: 'Scan your site and see if AI can find your business', sub: "We'll check whether AI assistants can surface your name, address, phone, hours, and reviews when someone nearby asks — then tell you precisely what to fix." }
    : userLane === 'developers'
    ? { Icon: Code2, title: 'Scan your app and see what AI tools can actually parse', sub: "We'll check whether AI coding assistants and crawlers can read your rendered markup, metadata, and structured data — then tell you precisely what to fix." }
    : userLane === 'vibe_coders'
    ? { Icon: Sparkles, title: 'Scan your build before you ship it', sub: "We'll check whether AI assistants can read your landing page or app copy — then tell you precisely what to fix before launch." }
    : { Icon: ScanSearch, title: 'Scan any page and see what AI actually sees', sub: "We'll check whether AI assistants can extract, cite, and trust what's on this page — then tell you precisely what to fix." };

  return (
    <div className={`${styles.root} fade-in`}>
      <PageHeader title={urlScannerLabel(userLane)} subtitle={pageSub} />

      {!heroSeen && (
        <div className={styles.hero}>
          <div className={styles.heroIcon}><heroCopy.Icon size={20} aria-hidden="true" /></div>
          <div>
            <div className={styles.heroTitle}>{heroCopy.title}</div>
            <div className={styles.heroSub}>{heroCopy.sub}</div>
          </div>
        </div>
      )}

      {userLane === 'vibe_coders' ? (
        <details style={{
          marginBottom: '18px',
          fontSize: '13px',
          color: 'var(--text-dim)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
        }}>
          <summary style={{ cursor: 'pointer', color: 'var(--text)', fontWeight: 600 }}>
            Don't have a URL yet? Your app is probably already running somewhere — here's where to find the link →
          </summary>
          <ul style={{ marginTop: '10px', paddingLeft: '18px', lineHeight: 1.7 }}>
            <li><strong>Bolt.new:</strong> look for a small arrow icon at the top of your preview (right side of the screen). Click it to open your app in its own browser tab, then copy the address from that tab.</li>
            <li><strong>Lovable:</strong> your preview is already running in the panel on the right. Look at the top of that panel — there's an address bar. Copy the link shown there.</li>
            <li><strong>v0 by Vercel:</strong> click the "···" (three dots) near the top of your preview, then choose "Open in new tab." Copy the address from the new tab.</li>
            <li><strong>Replit:</strong> while your app is running, a "Webview" tab opens automatically — copy the address shown at the top of it.</li>
            <li><strong>Framer / Webflow:</strong> click "Preview" or "Share" near the top-right of your project. It'll give you a link you can copy directly.</li>
          </ul>
          <div style={{ marginTop: '10px' }}>
            Once you've got the link, paste it into the box below and click <strong>Scan URL</strong>.
          </div>
        </details>
      ) : (
        <details style={{
          marginBottom: '16px',
          fontSize: '13px',
          color: 'var(--text-dim)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
        }}>
          <summary style={{ cursor: 'pointer', color: 'var(--text)', fontWeight: 500 }}>
            Don't have a URL yet? Find your preview link →
          </summary>
          <div style={{ marginTop: '10px', lineHeight: 1.6 }}>
            Most page builders already have a live preview URL, even before you deploy:
            <ul style={{ marginTop: '6px', paddingLeft: '18px' }}>
              <li><strong>Bolt / StackBlitz:</strong> right-click the preview pane → "Open in new tab", or use the Share button.</li>
              <li><strong>Lovable:</strong> copy the preview URL from the address bar, or click Publish for a permanent link.</li>
              <li><strong>v0:</strong> open the preview's "..." menu → "Open in new tab" for a live Vercel URL.</li>
              <li><strong>Replit:</strong> your app is live at yourrepl.username.repl.co (or .replit.dev) while the dev server is running.</li>
              <li><strong>Framer / Webflow:</strong> use the Staging or Preview link from your project's Share settings.</li>
            </ul>
          </div>
        </details>
      )}

      <form onSubmit={handleScan} className={styles.form}>
        <div className={styles.inputRow}>
          <input
            type="text"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
            className={styles.urlInput}
            placeholder="https://yourstore.com/product"
            value={url}
            onChange={e => setUrl(normalizeUrlInput(e.target.value))}
            onFocus={e => { const el = e.target; setTimeout(() => el.setSelectionRange(el.value.length, el.value.length), 0); }}
            
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !hasUrlBody(url)}
          >
            {loading ? 'Scanning…' : '◎ Scan URL'}
          </button>
        </div>
        <RecentPicker mode="page" onPick={v => setUrl(normalizeUrlInput(v))} />
        <div className={styles.cityRow}>
          <label htmlFor="us-brand" className={styles.cityLabel}>Business or brand name <span>Optional</span></label>
          <input id="us-brand" type="text" className={styles.cityInput} placeholder="Leave empty to use the name on your page" value={brandName}
            onChange={e => setBrandName(e.target.value)} maxLength={120} />
        </div>
        {userLane === 'local_business' || showCity ? (
          <div className={styles.cityRow}>
            <label htmlFor="us-city" className={styles.cityLabel}>Where you want to be found <span>Optional</span></label>
            <div className={styles.cityFields}>
              <input id="us-city" type="text" className={styles.cityInput} placeholder="City, e.g. Austin" value={city}
                onChange={e => setCity(e.target.value)} maxLength={80} />
              <Select
                value={cityState ?? ''}
                onChange={setCityState}
                ariaLabel="State you want to be found in"
                options={[{ value: '', label: 'No state' }, ...US_STATES.map(([v, l]) => ({ value: v, label: l }))]}
              />
            </div>
            <p className={styles.cityHint}>
              We'll check whether this page clearly serves that place: title, headings, service area, schema, and matching name,
              address and phone. Add the state to catch a schema in the wrong one (Portland, OR vs Portland, ME), or leave the
              city empty if you serve a whole state.
            </p>
          </div>
        ) : (
          <button type="button" className={styles.cityToggle} onClick={() => setShowCity(true)}>+ Check for a city</button>
        )}
        {error && (
          <p className={styles.error}>
            {error}
            {errorCode === 'insufficient_content' && (
              <> <Link to="/repo-analysis" className={styles.inlineLink}>Go to Repo Analysis →</Link></>
            )}
          </p>
        )}
      </form>

      {loading && (
        <div style={{ marginTop: 20 }}>
          <CheckProgress
            title="Scanning your page"
            skeleton="report"
            steps={[
              { label: 'Fetching the page', ms: 3000 },
              { label: 'Checking structure, schema and AI crawler access', ms: 4000 },
              { label: 'Scoring each pillar', ms: 8000 },
              { label: 'Writing your fixes' },
            ]}
          />
        </div>
      )}

      {result && (
        <div className={`${styles.results} fade-in`}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>Scan Results</h2>
              <p className={styles.resultsUrl}>{result.url || url}</p>
            </div>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I scanned ${result.url || url} on rain OS and scored ${overall ?? '—'}/100 for AI readability.`)}
&url=${encodeURIComponent(window.location.origin + '/url-scanner')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share
            </a>
            <button onClick={handleReset} className="btn btn-ghost">
              ← New Scan
            </button>
          </div>

          {(result.technical_signals?.isJsRendered || result.signals?.isJsRendered) && (
            <div className={styles.jsWarningBanner}>
              <div className={styles.jsWarningIcon}><AlertTriangle size={18} aria-hidden="true" /></div>
              <div className={styles.jsWarningBody}>
                <strong className={styles.jsWarningTitle}>JavaScript-rendered site detected</strong>
                <p className={styles.jsWarningText}>
                  AI crawlers (ChatGPT, Perplexity, Claude) see an empty page — they don't execute JavaScript.
                  The scores below reflect what they actually see, not your full app.
                </p>
                <button
                  className={styles.jsWarningCta}
                  onClick={() => navigate('/repo-analysis')}
                >
                  Analyze source code instead →
                </button>
              </div>
            </div>
          )}

          {signalList.length > 0 && (
            <div className={`card ${styles.verdict}`}>
              <p className={styles.verdictText}>
                <strong>{passing.length} of {signalList.length}</strong> technical checks pass.{' '}
                {failing.length > 0 ? `${failing.length} need fixing, listed below the scores.` : 'Nothing technical is holding you back.'}
              </p>
            </div>
          )}

          <BrandNameLine key={result.analysisId || result.url_scanned} analysisId={result.analysisId} brand={result.brand} fromPage={result.brandFromPage} />
          <PillarScores result={result} lane={userLane} />

          {result.product_page_check && <ProductPageCheck check={result.product_page_check} />}

          {result.local_page_check
            ? <>
                <LocalPageCheck check={result.local_page_check} hideSteps={listings === 'on'} />
                {listings !== 'off' && <ListingCheck mode={listings} nap={result.local_page_check.nap} url={result.url || scannedUrl} />}
                <MapsGridCard mode={listings} defaults={{ name: result.local_page_check.nap?.name, city: result.local_page_check.nap?.city, state: result.local_page_check.nap?.state, url: result.url || scannedUrl }} />
              </>
            : userLane === 'local_business' && (
              <div className="card" style={{ padding: '20px 22px', marginTop: 12 }}><LocalSteps city="" /></div>
            )}

          {signalList.length > 0 && (
            <div className={`card ${styles.signalsCard}`}>
              <h3 className={styles.sectionTitle}>Technical checks</h3>
              {failing.length > 0 ? (
                <ul className={styles.signalList}>
                  {failing.map((s, i) => <SignalRow key={s.label || s.name || i} s={s} />)}
                </ul>
              ) : (
                <p className={styles.allPass}>Every technical check passed.</p>
              )}
              {passing.length > 0 && (
                <details className={styles.passDetails}>
                  <summary>Passing checks ({passing.length})</summary>
                  <ul className={styles.signalList}>
                    {passing.map((s, i) => <SignalRow key={s.label || s.name || i} s={s} />)}
                  </ul>
                </details>
              )}
            </div>
          )}

          {recommendations.length > 0 && (
            <div className={`card ${styles.recoCard}`}>
              <h3 className={styles.sectionTitle}>Recommendations</h3>
              {result?.detected_platform && result.detected_platform !== 'custom' && (
                <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: -8, marginBottom: 14 }}>
                  Detected platform: {PLATFORM_DISPLAY_NAME[result.detected_platform] || result.detected_platform} — guidance below is tailored to it where possible.
                </p>
              )}
              <ul className={styles.recoList}>
                {recommendations.slice(0, TOP_FIXES).map((r, i) => <RecoItem key={i} r={r} i={i} />)}
              </ul>
              {recommendations.length > TOP_FIXES && (
                <details className={styles.moreFixes}>
                  <summary>{recommendations.length - TOP_FIXES} more fixes</summary>
                  <ul className={styles.recoList}>
                    {recommendations.slice(TOP_FIXES).map((r, i) => <RecoItem key={i} r={r} i={i + TOP_FIXES} />)}
                  </ul>
                </details>
              )}
            </div>
          )}

          {recommendations.length > 0 && (
            <FixPromptGenerator
              recommendations={recommendations}
              url={scannedUrl}
              overallScore={result?.overallScore}
            />
          )}

          <UrlScannerGithubPushPanel result={result} scannedUrl={scannedUrl} />

          <CitationCrossPromo
            title="Scan done? Now check if AI actually cites this URL."
            sub="Citation Monitor gives you a real-time snapshot — run it before and after making fixes to track whether AI citations improve."
          />
        </div>
      )}
      <PastAnalyses kind="url" refreshKey={result} />
    </div>
  );
}
