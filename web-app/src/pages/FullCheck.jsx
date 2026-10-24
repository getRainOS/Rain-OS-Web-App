import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, ScanSearch } from 'lucide-react';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import CheckProgress from '../components/CheckProgress.jsx';
import ImproveCta from '../components/ImproveCta.jsx';
import { SubTabs, TabEmpty } from '../components/MonitorTabs.jsx';
import { improveLink } from '../lib/improveLink.js';
import { getMySite, setMySite } from '../lib/mySite.js';
import { PLANS, SOV_COST, costOf, siteFromUrl, guessBrand } from '../lib/fullCheck.js';
import { isSharedPlatform } from '../lib/sharedPlatforms.js';
import SiteNote from '../components/SiteNote.jsx';
import RecentPicker from '../components/RecentPicker.jsx';
import styles from './FullCheck.module.css';

const MODULE_LANES = ['product_sellers', 'developers', 'local_business', 'vibe_coders'];

export default function FullCheck() {
  const { user, userLane, refreshUser } = useApp();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('setup'); // setup | questions | running | done
  // The dashboard's "Run full check for <brand>" passes ?brand= and ?url=.
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(() => searchParams.get('url') || getMySite());
  const [brand, setBrand] = useState(() => searchParams.get('brand') || '');
  const [plan, setPlan] = useState('full');
  const [suggestions, setSuggestions] = useState([]);
  const [picked, setPicked] = useState([]);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState([]);
  const [states, setStates] = useState([]);
  const [report, setReport] = useState(null);

  const domain = siteFromUrl(url.trim());
  const maxQuestions = PLANS[plan].questions;
  const remaining = user?.usage ? Math.max(0, (user.usage.limit ?? 0) - (user.usage.count ?? 0)) : null;
  const cost = costOf(plan, picked.length);
  const tooCostly = remaining !== null && cost > remaining;

  async function findQuestions(e) {
    e.preventDefault();
    if (!domain) { setError('Enter your website, like yourdomain.com.'); return; }
    if (isSharedPlatform(domain)) {
      setError(`That’s a page on ${domain}, which many businesses share, so we can’t tell whether a cited page is yours. Use your own website, or run Brand Sentiment to see whether AI names your business.`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.suggestPrompts({ url: url.trim(), lane: userLane || 'general' });
      const list = (data?.suggestions || []).map(s => s.question);
      setSuggestions(list);
      setPicked(list.slice(0, maxQuestions));
    } catch (err) {
      // Questions are the only thing this step adds, so let them type their own.
      setSuggestions([]);
      setPicked([]);
      setError(err.message ? `${err.message} You can type your own question below.` : 'Could not suggest questions. Type your own below.');
    } finally {
      setLoading(false);
      if (!brand.trim()) setBrand(guessBrand(domain));
      setPhase('questions');
    }
  }

  function toggle(q) {
    setPicked(p => (p.includes(q) ? p.filter(x => x !== q) : p.length < maxQuestions ? [...p, q] : p));
  }

  function addCustom() {
    const q = custom.trim();
    if (q.length < 8 || picked.includes(q) || picked.length >= maxQuestions) return;
    if (!suggestions.includes(q)) setSuggestions(s => [q, ...s]);
    setPicked(p => [...p, q]);
    setCustom('');
  }

  function changePlan(next) {
    setPlan(next);
    setPicked(p => p.slice(0, PLANS[next].questions));
  }

  async function run() {
    const questions = picked;
    const brandName = brand.trim() || guessBrand(domain);
    const target = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    const full = PLANS[plan].shareOfVoice;
    const labels = [
      'Scanning your page',
      ...questions.map(q => `Checking “${q.length > 48 ? `${q.slice(0, 45)}…` : q}”`),
      ...(full ? [`Asking Gemini 3 different ways about ${brandName}`] : []),
      `Checking what AI says about ${brandName}`,
    ];
    setSteps(labels.map(label => ({ label })));
    const st = labels.map(() => 'todo');
    const mark = (i, v) => { st[i] = v; setStates([...st]); };
    setStates([...st]);
    setPhase('running');
    setError('');
    setMySite(url);

    const out = { domain, brand: brandName, plan, questions: [], scan: null, sov: null, bv: null, used: 0 };
    const attempt = async (idx, fn, onOk, uses = 1) => {
      mark(idx, 'active');
      try { onOk(await fn()); mark(idx, 'done'); out.used += uses; }
      catch (err) { mark(idx, 'error'); return err.message || 'Something went wrong.'; }
      return null;
    };

    // 1) Page scan.
    const lane = MODULE_LANES.includes(userLane) ? userLane : 'general';
    out.scanError = await attempt(0, async () => (await api.scanUrl(target, { module: lane })).data, d => { out.scan = d; });

    // 2) Questions, in parallel.
    await Promise.all(questions.map(async (q, i) => {
      const item = { question: q, result: null, error: null };
      out.questions[i] = item;
      item.error = await attempt(1 + i,
        async () => (await api.citationCheck({ name: q.slice(0, 80), topic: q, url: target })).data,
        d => { item.result = d; });
    }));

    // 3) Brand checks, in parallel. Both use the first question as the topic.
    const topic = questions[0];
    const base = 1 + questions.length;
    await Promise.all([
      full ? attempt(base, async () => {
        const { data } = await api.shareOfVoice({ name: `${brandName} full check`, brand: brandName, topic, url: target });
        return data?.data ?? data;
      }, d => { out.sov = d; }, SOV_COST).then(e => { out.sovError = e; }) : null,
      attempt(base + (full ? 1 : 0), async () => {
        const { data } = await api.brandVisibility({ name: `${brandName} full check`, brand: brandName, topic, url: target });
        return data.data || data;
      }, d => { out.bv = d; }).then(e => { out.bvError = e; }),
    ]);

    refreshUser();
    setReport(out);
    setPhase('done');
  }

  function viewInDashboard() {
    try { localStorage.setItem('rain_os_dash_focus', `site:${domain}`); } catch { /* not remembered */ }
    navigate('/dashboard');
  }

  return (
    <div className={`${styles.page} fade-in`}>
      <PageHeader
        title="Full check"
        subtitle="Enter your website and we run the page scan and the AI visibility checks together, then show one report."
        about={[
          { heading: 'What runs', body: 'A scan of your page, then Citation Monitor on the questions your customers ask, plus Brand Sentiment, and on Full also Share of Voice. Each result is saved, so it shows up in the dashboard under your site.' },
          { heading: 'What it costs', body: 'Each tool run uses one analysis, the same as running it yourself, except Share of Voice, which asks the AI 3 questions and uses 3. You see the total before anything runs. Suggesting questions is free.' },
        ]}
      />

      {phase === 'setup' && (
        <form onSubmit={findQuestions} className={`card ${styles.form}`}>
          <label className={styles.label} htmlFor="fc-url">Your website</label>
          <input id="fc-url" className={styles.input} type="text" inputMode="url" spellCheck={false}
            placeholder="yourdomain.com" value={url} onChange={e => setUrl(e.target.value)} />
          <RecentPicker mode="site" onPick={setUrl} />
          <SiteNote url={url} />

          <label className={styles.label} htmlFor="fc-brand">Your business or brand name <span className={styles.opt}>Optional</span></label>
          <input id="fc-brand" className={styles.input} type="text" maxLength={120}
            placeholder={domain ? guessBrand(domain) : 'e.g. Acme Bakery'} value={brand} onChange={e => setBrand(e.target.value)} />
          <RecentPicker mode="brand" onPick={setBrand} />
          <p className={styles.hint}>As people write it publicly. We use it to see whether AI names you.</p>

          <div className={styles.label}>How thorough</div>
          <SubTabs label="Version" value={plan} onChange={changePlan}
            items={Object.entries(PLANS).map(([id, p]) => ({ id, label: p.label }))} />
          <p className={styles.hint}>{PLANS[plan].blurb}. Uses {costOf(plan, PLANS[plan].questions)} analyses.</p>

          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.primary} disabled={loading}>
            {loading ? 'Finding your questions…' : <>Continue <ArrowRight size={14} aria-hidden="true" /></>}
          </button>
        </form>
      )}

      {phase === 'questions' && (
        <div className={`card ${styles.form}`}>
          <h3 className={styles.title}>Which questions should we check for {domain}?</h3>
          <p className={styles.hint}>These are what your customers likely ask AI. Pick up to {maxQuestions}, or type your own.</p>
          {error && <p className={styles.error} role="alert">{error}</p>}

          <ul className={styles.qList}>
            {suggestions.map(q => {
              const on = picked.includes(q);
              return (
                <li key={q}>
                  <button type="button" className={`${styles.q} ${on ? styles.qOn : ''}`} onClick={() => toggle(q)} aria-pressed={on}
                    disabled={!on && picked.length >= maxQuestions}>
                    <span className={styles.box}>{on && <Check size={12} strokeWidth={3} aria-hidden="true" />}</span>
                    {q}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className={styles.addRow}>
            <input className={styles.input} type="text" maxLength={200} placeholder="Or type a question your customers ask"
              value={custom} onChange={e => setCustom(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }} aria-label="Your own question" />
            <button type="button" className={styles.secondary} onClick={addCustom} disabled={custom.trim().length < 8 || picked.length >= maxQuestions}>Add</button>
          </div>

          <div className={styles.costBar}>
            <span>
              <strong>{cost}</strong> {cost === 1 ? 'analysis' : 'analyses'} will be used
              {remaining !== null && <span className={tooCostly ? styles.bad : styles.muted}> · you have {remaining} left</span>}
            </span>
            <div className={styles.actionsRow}>
              <button type="button" className={styles.secondary} onClick={() => setPhase('setup')}>Back</button>
              <button type="button" className={styles.primary} onClick={run} disabled={!picked.length || tooCostly}>
                Run {PLANS[plan].label.toLowerCase()} check <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
          {tooCostly && (
            <p className={styles.error}>
              That needs {cost} analyses and you have {remaining}. Pick fewer questions or the Quick version, or <Link to="/upgrade" className={styles.link}>see plans</Link>.
            </p>
          )}
        </div>
      )}

      {phase === 'running' && (
        <CheckProgress title={`Checking ${domain}`} steps={steps} states={states} skeleton="report" />
      )}

      {phase === 'done' && report && <Report report={report} onDashboard={viewInDashboard} onAgain={() => { setPhase('setup'); setReport(null); }} />}
    </div>
  );
}

function Report({ report, onDashboard, onAgain }) {
  const { scan, questions, sov, bv, domain, brand, used } = report;
  const score = scan?.overallScore ?? scan?.overall_score;
  const recs = (scan?.technical_recommendations?.length ? scan.technical_recommendations : scan?.recommendations) || [];
  const recText = r => (typeof r === 'string' ? r : r?.recommendation || r?.text || r?.title || '');
  const ran = questions.filter(q => q.result).length;
  const citedCount = questions.filter(q => q.result?.cited).length;

  return (
    <div className={styles.report}>
      <div className={`card ${styles.reportHead} reveal`}>
        <div>
          <div className="eyebrow">Full check</div>
          <h2 className={styles.reportTitle}>{domain}</h2>
        </div>
        <span className={styles.used}>{used} {used === 1 ? 'analysis' : 'analyses'} used</span>
      </div>

      <section className={`card ${styles.sec} reveal`} style={{ '--i': 1 }}>
        <div className="eyebrow">Your page</div>
        {scan ? (
          <div className={styles.scoreRow}>
            <div className={styles.score}>{score != null ? Math.round(score) : '–'}<span>/100</span></div>
            <ul className={styles.fixes}>
              {recs.slice(0, 3).map((r, i) => <li key={i}>{recText(r)}</li>)}
              {!recs.length && <li>No fixes came back for this page.</li>}
            </ul>
          </div>
        ) : <p className={styles.fail}>The page scan didn’t run: {report.scanError}</p>}
        <Link to={`/url-scanner?url=${encodeURIComponent(domain)}`} className={styles.link}>Open the full scan <ArrowRight size={12} aria-hidden="true" /></Link>
      </section>

      <section className={`card ${styles.sec} reveal`} style={{ '--i': 2 }}>
        <div className="eyebrow">Your questions · cited in {citedCount} of {ran}</div>
        <ul className={styles.rows}>
          {questions.map((q, i) => {
            const r = q.result;
            const rank = r?.citedSourceIndex != null ? r.citedSourceIndex + 1 : null;
            const improve = r ? improveLink({ question: q.question, url: domain, mode: 'citation', sources: r.sources || [], competitors: r.competitorDomains || [] }) : null;
            return (
              <li key={i} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.rowQ}>{q.question}</div>
                  {r ? (
                    <span className={`${styles.badge} ${rank ? styles.good : styles.badBadge}`}>{rank ? `Cited · #${rank}` : 'Not cited'}</span>
                  ) : <span className={styles.fail}>Didn’t run: {q.error}</span>}
                </div>
                {r && rank !== 1 && (
                  <Link to={improve.to} state={improve.state} className={styles.link}>
                    Improve my chances <ArrowRight size={12} aria-hidden="true" />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`card ${styles.sec} reveal`} style={{ '--i': 3 }}>
        <div className="eyebrow">Your brand · {brand}</div>
        <ul className={styles.rows}>
          {report.plan === 'full' && (
            <li className={styles.row}>
              <div className={styles.rowMain}>
                <div className={styles.rowQ}>Named in AI answers</div>
                {sov ? <span className={styles.badge}>{sov.mentionedCount} of 3 asks</span> : <span className={styles.fail}>Didn’t run: {report.sovError}</span>}
              </div>
            </li>
          )}
          <li className={styles.row}>
            <div className={styles.rowMain}>
              <div className={styles.rowQ}>What AI says about you</div>
              {bv ? (
                <span className={styles.badge}>
                  {bv.mentionStatus === 'mentioned' ? `Mentioned · ${bv.sentiment || 'neutral'}` : 'Not mentioned'}
                </span>
              ) : <span className={styles.fail}>Didn’t run: {report.bvError}</span>}
            </div>
          </li>
        </ul>
        {(sov || bv) && !(sov?.mentionedCount === 3 && bv?.mentionStatus === 'mentioned') && (
          <ImproveCta
            title="See how to get named more often"
            body="We compare your page with the sources Gemini used and list the changes to make first."
            link={improveLink({ question: questions[0]?.question, url: domain, mode: 'share_of_voice', brand, sources: bv?.sources || [], competitors: bv?.competitors || sov?.competitors || [] })}
          />
        )}
      </section>

      <div className={`${styles.footer} reveal`} style={{ '--i': 4 }}>
        <button type="button" className={styles.primary} onClick={onDashboard}>See it all on the dashboard <ArrowRight size={14} aria-hidden="true" /></button>
        <button type="button" className={styles.secondary} onClick={onAgain}>Check another site</button>
      </div>
    </div>
  );
}
