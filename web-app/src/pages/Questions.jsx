import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radar, BarChart2, Eye, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import PromptSuggestions from '../components/PromptSuggestions.jsx';
import TrackedQueriesPanel, { useTrackedQueries } from '../components/TrackedQueries.jsx';
import styles from './Questions.module.css';

const CHECKS = [
  { to: '/citation-monitor', label: 'Citations',      Icon: Radar,     hint: 'Does AI cite your site?' },
  { to: '/share-of-voice',   label: 'Share of voice', Icon: BarChart2, hint: 'How often does AI mention you?' },
  { to: '/brand-visibility', label: 'Sentiment',      Icon: Eye,       hint: 'What does AI say about you?' },
];

function checkHref(to, question, site) {
  const params = new URLSearchParams({ q: question });
  if (site) params.set('url', site);
  return `${to}?${params}`;
}

function CheckLinks({ question, site }) {
  return (
    <span className={styles.checks}>
      {CHECKS.map(({ to, label, Icon, hint }) => (
        <Link key={to} to={checkHref(to, question, site)} className={styles.checkLink} title={hint}>
          <Icon size={13} aria-hidden="true" /> {label}
        </Link>
      ))}
    </span>
  );
}

export default function Questions() {
  const { userLane } = useApp();
  const tracking = useTrackedQueries();
  const [own, setOwn] = useState('');
  const question = own.trim();

  return (
    <div className={`${styles.page} fade-in`}>
      <PageHeader
        title="Questions"
        subtitle="Start with the questions your customers ask AI. Check any of them in one click, or track the important ones every week."
        about={[
          { heading: 'Why questions come first', body: 'People ask ChatGPT, Gemini and Google AI questions in plain language. Whether you show up depends on the exact question, so every check in Rain OS starts from one.' },
          { heading: 'Suggestions are free', body: 'Suggested questions do not use your analyses. Running a check on one does, the same as running it from the tool directly.' },
        ]}
      />

      <div className={styles.grid}>
        <div className={styles.main}>
          <PromptSuggestions
            lane={userLane || 'general'}
            tracking={tracking}
            title="Suggest questions for my business"
            renderUse={(q, site) => <CheckLinks question={q} site={site} />}
          />

          <section className={`card ${styles.ownCard}`} aria-labelledby="own-heading">
            <h3 id="own-heading" className={styles.ownTitle}>Already have a question?</h3>
            <input
              className={styles.ownInput}
              type="text"
              maxLength={500}
              placeholder="e.g. best bakery for wedding cakes near me"
              value={own}
              onChange={e => setOwn(e.target.value)}
              aria-label="Your question"
            />
            {question ? (
              <div className={styles.ownActions}>
                <span className={styles.ownLabel}>Check it for</span>
                <CheckLinks question={question} />
              </div>
            ) : (
              <p className={styles.ownHint}>Type it in, then choose what to check. <ArrowRight size={12} aria-hidden="true" /></p>
            )}
          </section>
        </div>

        <aside className={styles.side}>
          <TrackedQueriesPanel tracking={tracking} />
        </aside>
      </div>
    </div>
  );
}
