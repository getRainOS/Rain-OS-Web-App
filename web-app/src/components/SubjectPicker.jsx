import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Select from './Select.jsx';
import { buildSubjects, subjectHint, getSubjectKey, setSubjectKey } from '../lib/subjects.js';
import styles from './SubjectPicker.module.css';

// The only way to choose what a monitoring tool checks: something you've
// already analyzed. Calls onChange(subject) with the chosen one (or null when
// there is nothing analyzed yet). `initialKey` picks one on arrival.
export default function SubjectPicker({ onChange, initialKey, label = 'What are you checking?', note }) {
  const [subjects, setSubjects] = useState(null);
  const [key, setKey] = useState(initialKey || getSubjectKey());

  useEffect(() => {
    api.history({ limit: 200 })
      .then(({ data }) => setSubjects(buildSubjects(Array.isArray(data) ? data : data?.items ?? data?.data ?? [])))
      .catch(() => setSubjects([]));
  }, []);

  const chosen = subjects?.find(s => s.key === key) || subjects?.[0] || null;
  useEffect(() => { if (subjects) onChange?.(chosen); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [subjects, chosen?.key]);

  if (subjects === null) return <div className={styles.loading}><span className="spinner" /></div>;
  if (subjects.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Analyze something first</p>
        <p className={styles.emptyText}>Monitoring checks the brand, website or content you've analyzed, so the scores and the AI results always line up. Start with your website or a piece of content.</p>
        <div className={styles.emptyActions}>
          <Link to="/url-scanner" className="btn btn-primary">Analyze your website</Link>
          <Link to="/analyze" className="btn btn-ghost">Analyze content</Link>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <Select
        value={chosen?.key || ''}
        onChange={k => { setKey(k); setSubjectKey(k); }}
        ariaLabel={label}
        options={subjects.map(s => ({ value: s.key, label: s.name, hint: subjectHint(s) }))}
      />
      <p className={styles.hint}>
        {note || 'From what you have analyzed.'} To add a new one, <Link to="/url-scanner">analyze a website</Link> or <Link to="/analyze">a piece of content</Link>.
      </p>
    </div>
  );
}
