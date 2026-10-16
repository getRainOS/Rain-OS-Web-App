import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { api } from '../api/client.js';
import CheckProgress from './CheckProgress.jsx';
import base from './PromptSuggestions.module.css';
import styles from './ContentIdeas.module.css';

const KINDS = [
  { id: 'any', label: 'Blog posts and articles' },
  { id: 'blog', label: 'Blog posts' },
  { id: 'article', label: 'In-depth articles' },
];

// Post and article ideas for a topic, or follow-ups to something you wrote.
export default function ContentIdeas() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [writing, setWriting] = useState('');
  const [kind, setKind] = useState('any');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function ask(e) {
    e?.preventDefault();
    if (!topic.trim() && writing.trim().length < 80) {
      setError('Add a topic, or paste something you wrote (a few sentences at least).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.contentIdeas({ topic: topic.trim() || undefined, writing: writing.trim() || undefined, kind });
      setIdeas(data?.ideas || []);
    } catch (err) {
      setError(err.message || 'Could not get ideas. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function write(idea) {
    navigate('/analyze', { state: { pendingTitle: idea.title, freshIdea: true, contentType: idea.format === 'article' ? 'article' : 'blog_post' } });
  }

  return (
    <div className={`card ${base.panel}`}>
      <div className={base.head}>
        <span className={base.iconWrap}><Lightbulb size={15} aria-hidden="true" /></span>
        <div>
          <h3 className={base.title}>Content ideas</h3>
          <p className={base.sub}>Get blog post and article ideas around your topic, each tied to a question people ask AI. Free, and it doesn't use your analyses.</p>
        </div>
      </div>

      <form onSubmit={ask} className={base.form}>
        <label className={base.label} htmlFor="ci-topic">Your topic or niche</label>
        <input
          id="ci-topic"
          className={base.input}
          type="text"
          maxLength={300}
          placeholder="e.g. small-batch sourdough baking"
          value={topic}
          onChange={e => setTopic(e.target.value)}
        />
        <label className={base.label} htmlFor="ci-kind">What kind</label>
        <div className={styles.kinds} role="radiogroup" aria-label="What kind of content">
          {KINDS.map(k => (
            <button
              key={k.id}
              type="button"
              role="radio"
              aria-checked={kind === k.id}
              className={`${styles.kind} ${kind === k.id ? styles.kindOn : ''}`}
              onClick={() => setKind(k.id)}
            >
              {k.label}
            </button>
          ))}
        </div>
        <label className={base.label} htmlFor="ci-writing">
          Or paste something you wrote <span className={base.optional}>(we'll suggest related pieces you haven't covered)</span>
        </label>
        <textarea
          id="ci-writing"
          className={styles.textarea}
          rows={5}
          maxLength={20000}
          placeholder="Paste a post or article here…"
          value={writing}
          onChange={e => setWriting(e.target.value)}
        />
        <button type="submit" className={base.btn} disabled={loading}>
          {loading ? 'Thinking…' : writing.trim().length >= 80 ? 'Suggest related pieces' : 'Suggest ideas'}
        </button>
      </form>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {loading && (
        <div style={{ marginTop: 16 }}>
          <CheckProgress
            title="Coming up with ideas"
            compact
            steps={[
              { label: writing.trim() ? 'Reading what you wrote' : 'Thinking through your topic', ms: 3000 },
              { label: 'Matching ideas to questions people ask' },
            ]}
          />
        </div>
      )}

      {!loading && ideas.length > 0 && (
        <ul className={styles.list}>
          {ideas.map((idea, i) => (
            <li key={`${idea.title}-${i}`} className={styles.item}>
              <div className={styles.itemMain}>
                <div className={styles.itemTop}>
                  <span className={styles.itemTitle}>{idea.title}</span>
                  <span className={styles.format}>{idea.format === 'article' ? 'Article' : 'Blog post'}</span>
                </div>
                {idea.angle && <p className={styles.angle}>{idea.angle}</p>}
                {idea.question && <p className={styles.question}>Answers: “{idea.question}”</p>}
              </div>
              <button type="button" className={styles.useBtn} onClick={() => write(idea)}>
                Write it <ArrowRight size={12} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
