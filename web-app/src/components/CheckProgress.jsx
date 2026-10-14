import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import styles from './CheckProgress.module.css';

// Live progress for slow checks: the steps the check works through plus a
// skeleton in the shape of the result. The server answers once at the end,
// so steps advance on typical timings and the last one stays "in progress"
// until the real result arrives. It never shows done before it is.
export default function CheckProgress({ title, steps, skeleton = 'sources', compact = false }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => setElapsed(Date.now() - start), 250);
    return () => clearInterval(t);
  }, []);

  let acc = 0;
  let active = steps.length - 1;
  for (let i = 0; i < steps.length - 1; i++) {
    acc += steps[i].ms;
    if (elapsed < acc) { active = i; break; }
  }
  const seconds = Math.floor(elapsed / 1000);

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ''}`} role="status" aria-live="polite">
      <div className={styles.head}>
        <span className={styles.title}>{title}</span>
        <span className={styles.timer}>{seconds}s</span>
      </div>
      <ol className={styles.steps}>
        {steps.map((s, i) => {
          const state = i < active ? 'done' : i === active ? 'active' : 'todo';
          return (
            <li key={s.label} className={styles.step} data-state={state}>
              <span className={styles.marker} aria-hidden="true">
                {state === 'done' ? <Check size={11} strokeWidth={3} /> : state === 'active' ? <span className={styles.pulse} /> : null}
              </span>
              <span className={styles.label}>{s.label}</span>
            </li>
          );
        })}
      </ol>
      {skeleton && <Skeleton kind={skeleton} />}
      <span className={styles.srOnly}>{steps[active]?.label}</span>
    </div>
  );
}

function Bar({ w, h = 10 }) {
  return <span className={styles.bar} style={{ width: w, height: h }} />;
}

function Skeleton({ kind }) {
  if (kind === 'cards') {
    return (
      <div className={styles.skelCards} aria-hidden="true">
        {[0, 1, 2].map(i => (
          <div key={i} className={styles.skelCard}>
            <Bar w="60%" /><Bar w="90%" h={8} /><Bar w="75%" h={8} /><Bar w="40%" h={18} />
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'list') {
    return (
      <div className={styles.skelList} aria-hidden="true">
        {[88, 72, 80, 64].map((w, i) => (
          <div key={i} className={styles.skelRow}><Bar w={48} h={8} /><Bar w={`${w}%`} /></div>
        ))}
      </div>
    );
  }
  if (kind === 'report') {
    return (
      <div className={styles.skelReport} aria-hidden="true">
        <div className={styles.skelScore}><Bar w={64} h={40} /><Bar w="70%" h={8} /></div>
        <div className={styles.skelList}>
          {[85, 70, 92, 60, 78].map((w, i) => (
            <div key={i} className={styles.skelRow}><Bar w={14} h={14} /><Bar w={`${w}%`} /></div>
          ))}
        </div>
      </div>
    );
  }
  // 'sources': question bar, your position, ranked source rows.
  return (
    <div className={styles.skelSources} aria-hidden="true">
      <Bar w="80%" h={14} />
      <div className={styles.skelPosition}><Bar w={40} h={32} /><Bar w="45%" h={8} /></div>
      {[90, 76, 84, 68, 72].map((w, i) => (
        <div key={i} className={styles.skelRow}>
          <span className={styles.skelRank}>{i + 1}</span>
          <Bar w={16} h={16} />
          <Bar w={`${w}%`} />
        </div>
      ))}
    </div>
  );
}
