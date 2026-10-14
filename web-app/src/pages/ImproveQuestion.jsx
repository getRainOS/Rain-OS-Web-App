import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Copy, ExternalLink, Globe, Layers, Target } from 'lucide-react';
import { api } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import CheckProgress from '../components/CheckProgress.jsx';
import { SubTabs, TabEmpty } from '../components/MonitorTabs.jsx';
import { PILLAR_COLORS } from '../lib/pillarColors.js';
import { getMySite, setMySite } from '../lib/mySite.js';
import SiteNote from '../components/SiteNote.jsx';
import styles from './ImproveQuestion.module.css';

const MODES = [
  { id: 'citation', label: 'Get cited' },
  { id: 'share_of_voice', label: 'Get mentioned' },
  { id: 'sentiment', label: 'Improve tone' },
];

const PILLAR_KEY = {
  'AI Readability': 'ai_readability',
  'Digital Authority': 'digital_authority',
  'Conversion Readiness': 'conversion_readiness',
  'Product Discoverability': 'product_discoverability',
  'RAG Readiness': 'rag_readiness',
  'Local Presence': 'local_presence',
};

const listOf = data => (Array.isArray(data) ? data : data?.items ?? []);

export default function ImproveQuestion() {
  const [params] = useSearchParams();
  const { state } = useLocation();
  const [question, setQuestion] = useState(params.get('q') || '');
  const [mode, setMode] = useState(MODES.some(m => m.id === params.get('mode')) ? params.get('mode') : 'citation');
  const [url, setUrl] = useState(params.get('url') || getMySite());
  const [brand] = useState(params.get('brand') || '');
  const [content, setContent] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [sources, setSources] = useState(state?.sources || []);
  const [competitors] = useState(state?.competitors || []);
  const [note] = useState(state?.note || '');
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Opened from Opportunities or a bookmark: load the latest saved check for
  // this question so the advice still compares against real cited sources.
  useEffect(() => {
    if (sources.length || !question.trim()) return;
    let cancelled = false;
    setSourcesLoading(true);
    api.citationHistory({ topic: question.trim() })
      .then(({ data }) => {
        if (cancelled) return;
        const latest = listOf(data)[0];
        if (latest?.sources?.length) {
          setSources(latest.sources.slice(0, 8).map(s => ({ domain: s.domain, title: s.title, snippet: s.snippet })));
          if (!url && latest.url) setUrl(latest.url);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setSourcesLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRun(e) {
    e.preventDefault();
    if (question.trim().length < 8) { setError('Type the question your customers ask AI.'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.questionGap({
        question: question.trim(), mode, url: url.trim() || undefined, brand: brand || undefined,
        content: content.trim() || undefined, sources, competitors, note: note || undefined,
      });
      setResult(data);
      setMySite(url);
    } catch (err) {
      setError(err.message || 'Could not put advice together. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(result.draftAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked: the text stays selectable */ }
  }

  const recheck = `/citation-monitor?q=${encodeURIComponent(question.trim())}${url.trim() ? `&url=${encodeURIComponent(url.trim())}` : ''}`;

  return (
    <div className={`${styles.page} fade-in`}>
      <PageHeader
        title="Improve a Question"
        subtitle="See what the pages Gemini cited do differently, and get the specific changes that give you the best shot at being chosen for one question."
        about={[
          { heading: 'How this differs from the Rain Score', body: 'The Rain Score rates a page in general. This looks at one question: the sources Gemini actually cited for it, and what yours would need to compete. Each step is tagged with the pillar it belongs to.' },
          { heading: 'What it can and cannot do', body: 'Nobody can promise a citation, because AI answers vary from run to run. This tells you what the cited pages have in common and what to change. Re-check the question afterwards to see whether it moved. It does not use your monthly analyses, and you can run it 20 times a day.' },
        ]}
      />

      <div className={styles.grid}>
        <form onSubmit={handleRun} className={`card ${styles.form}`}>
          <h3 className={styles.formTitle}>What do you want to improve?</h3>
          <SubTabs label="Goal" value={mode} onChange={setMode} items={MODES} />

          <label className={styles.label} htmlFor="iq-question">Question</label>
          <textarea
            id="iq-question"
            className={styles.textarea}
            rows={2}
            maxLength={300}
            placeholder="What would a customer ask AI? e.g. best bakery for wedding cakes near me"
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />

          <label className={styles.label} htmlFor="iq-url">Your website <span className={styles.opt}>Recommended</span></label>
          <input
            id="iq-url"
            className={styles.input}
            type="text"
            inputMode="url"
            spellCheck={false}
            placeholder="yourdomain.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <p className={styles.hint}>
            {url.trim()
              ? 'We read your page through Google and compare it with the cited sources.'
              : 'Without your website we cannot tell where you rank, so the advice is more general.'}
          </p>
          <SiteNote url={url} />

          <button type="button" className={styles.linkBtn} onClick={() => setShowPaste(s => !s)} aria-expanded={showPaste}>
            {showPaste ? 'Hide pasted page text' : 'Or paste your page text for a closer comparison'}
          </button>
          {showPaste && (
            <textarea
              className={styles.textarea}
              rows={6}
              maxLength={8000}
              placeholder="Paste the text of the page that should answer this question."
              value={content}
              onChange={e => setContent(e.target.value)}
              aria-label="Your page text"
            />
          )}

          <div className={styles.sourcesBox}>
            <div className="eyebrow">Compared against</div>
            {sourcesLoading ? (
              <p className={styles.hint}>Loading your last check for this question…</p>
            ) : sources.length ? (
              <ul className={styles.sourceList}>
                {sources.slice(0, 6).map((s, i) => (
                  <li key={`${s.domain}-${i}`}><span className={styles.rank}>{i + 1}</span>{s.domain}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.hint}>
                No cited sources yet. <Link to={`/citation-monitor?q=${encodeURIComponent(question.trim())}`} className={styles.inlineLink}>Check this question first</Link> so we can compare against real results.
              </p>
            )}
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Working…' : <>Show me what to change <ArrowRight size={14} aria-hidden="true" /></>}
          </button>
        </form>

        <div className={styles.output}>
          {loading ? (
            <CheckProgress
              title="Working out what to change"
              skeleton="list"
              steps={[
                { label: 'Reading the sources Gemini cited', ms: 3000 },
                { label: content.trim() ? 'Reading your page' : url.trim() ? 'Looking up your site on Google' : 'Thinking about your question', ms: 7000 },
                { label: 'Finding what is different', ms: 6000 },
                { label: 'Writing your steps' },
              ]}
            />
          ) : result ? (
            <Result result={result} copied={copied} onCopy={copyDraft} recheck={recheck} hasUrl={!!url.trim()} />
          ) : (
            <TabEmpty icon={Target} title="Your plan appears here">
              Pick what you want, check the question and your website, and we'll list the changes most likely to help, starting with the biggest.
            </TabEmpty>
          )}
        </div>
      </div>
    </div>
  );
}

function Result({ result, copied, onCopy, recheck, hasUrl }) {
  const status =
    result.siteShared ? { tone: 'muted', text: 'We can’t tell which page on that site is yours' }
    : result.cited === null ? { tone: 'muted', text: 'Add your website to see where you rank' }
    : result.cited ? { tone: 'good', text: result.rank ? `You are cited at #${result.rank}` : 'You are cited' }
    : { tone: 'bad', text: 'You are not cited yet' };

  return (
    <div className={styles.result}>
      <div className={`card ${styles.summary} reveal`}>
        <span className={`${styles.status} ${styles[`status_${status.tone}`]}`}>{status.text}</span>
        <p className={styles.headline}>{result.headline}</p>
        {hasUrl && !result.pageRead && (
          <p className={styles.hint}>We could not read your page, so these steps assume what is typical. Paste your page text for a closer comparison.</p>
        )}
      </div>

      {result.whatCitedPagesDo.length > 0 && (
        <div className={`card ${styles.block} reveal`} style={{ '--i': 1 }}>
          <div className="eyebrow">What the cited pages do</div>
          <ul className={styles.patterns}>
            {result.whatCitedPagesDo.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}

      <div className={`${styles.actions}`}>
        <div className="eyebrow">Do these, in order</div>
        {result.actions.map((a, i) => {
          const color = PILLAR_COLORS[PILLAR_KEY[a.pillar]] || '#94a3b8';
          return (
            <div key={i} className={`card ${styles.action} reveal`} style={{ '--i': i + 2 }}>
              <div className={styles.actionTop}>
                <span className={styles.step}>{i + 1}</span>
                <span className={styles.pillar} style={{ color, borderColor: `${color}55`, background: `${color}14` }}>{a.pillar}</span>
                <span className={styles.where}>
                  {a.where === 'off_site' ? <><Globe size={12} aria-hidden="true" /> Off your site</> : <><Layers size={12} aria-hidden="true" /> On your page</>}
                </span>
              </div>
              <h4 className={styles.actionTitle}>{a.title}</h4>
              {a.why && <p className={styles.why}>{a.why}</p>}
              <p className={styles.fix}>{a.fix}</p>
            </div>
          );
        })}
      </div>

      {result.draftAnswer && (
        <div className={`card ${styles.block} reveal`}>
          <div className={styles.draftHead}>
            <div className="eyebrow">A draft opening for your page</div>
            <button type="button" className={styles.copyBtn} onClick={onCopy}>
              {copied ? <><Check size={13} aria-hidden="true" /> Copied</> : <><Copy size={13} aria-hidden="true" /> Copy</>}
            </button>
          </div>
          <p className={styles.draft}>{result.draftAnswer}</p>
          <p className={styles.hint}>Replace anything in [brackets] with your real details. Only publish facts that are true for you.</p>
        </div>
      )}

      <div className={styles.next}>
        <span>After you make changes:</span>
        <Link to={recheck} className={styles.nextLink}>Re-check this question <ExternalLink size={12} aria-hidden="true" /></Link>
        <Link to="/analyze" className={styles.nextLink}>Score the updated page <ArrowRight size={12} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
