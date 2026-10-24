import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import styles from './MapsGridCard.module.css';

// Where a local business shows up on Google Maps across its area: a grid of
// spots around the business, each showing its Maps position for one search.
// mode: 'on' runs it; 'locked' is the free-plan upgrade note; 'off' (Google
// data not connected yet) shows a labelled preview with sample positions.
const SAMPLE = [
  [null, 14, 9, 12, null],
  [11, 6, 3, 5, 13],
  [8, 2, 1, 2, 7],
  [12, 4, 2, 3, 9],
  [null, 10, 6, 11, null],
];

const tone = pos => (pos === null ? 'none' : pos <= 3 ? 'top' : pos <= 10 ? 'mid' : 'low');

function Grid({ rows, dim = false }) {
  const size = rows.length;
  return (
    <div className={`${styles.grid} ${dim ? styles.dim : ''}`} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }} role="img"
      aria-label="Grid of Google Maps positions around the business">
      {rows.flat().map((pos, i) => {
        const center = i === Math.floor((size * size) / 2);
        return (
          <span key={i} className={`${styles.dot} ${styles[tone(pos)]} ${center ? styles.center : ''}`} title={pos === null ? 'Not in the top 20' : `#${pos} on Google Maps`}>
            {pos === null ? '20+' : pos}
          </span>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <div className={styles.legend}>
      <span><i className={`${styles.key} ${styles.top}`} /> Top 3</span>
      <span><i className={`${styles.key} ${styles.mid}`} /> 4 to 10</span>
      <span><i className={`${styles.key} ${styles.low}`} /> 11 to 20</span>
      <span><i className={`${styles.key} ${styles.none}`} /> Not in top 20</span>
    </div>
  );
}

export default function MapsGridCard({ mode = 'off', defaults = {} }) {
  const [name, setName] = useState(defaults.name || '');
  const [city, setCity] = useState(defaults.city || '');
  const [state, setState] = useState(defaults.state || '');
  const [service, setService] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [r, setR] = useState(null);

  async function run(e) {
    e.preventDefault();
    setBusy(true); setError(''); setR(null);
    try {
      const { data } = await api.mapsGrid({ businessName: name.trim(), city: city.trim(), state: state || undefined, service: service.trim(), url: defaults.url || undefined });
      setR(data?.data ?? data);
    } catch (err) {
      setError(err.message || 'The Google Maps map failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const rows = r ? Array.from({ length: r.size }, (_, row) => r.points.filter(p => p.row === row).sort((a, b) => a.col - b.col).map(p => p.position)) : null;

  return (
    <section className={`card ${styles.card}`} aria-labelledby="maps-grid-heading">
      <div className={styles.head}>
        <div>
          <h3 id="maps-grid-heading" className={styles.title}>Where you show up on Google Maps</h3>
          <p className={styles.sub}>
            Each dot is a spot around your business. The number is where you rank on Google Maps when someone there searches for your service.
          </p>
        </div>
        {mode === 'off' && <span className={styles.badge}>Coming soon</span>}
      </div>

      {mode === 'off' && (
        <>
          <div className={styles.previewWrap}>
            <Grid rows={SAMPLE} dim />
            <p className={styles.previewNote}>Sample map. Your own map arrives when Google Maps data is connected.</p>
          </div>
          <Legend />
        </>
      )}

      {mode === 'locked' && (
        <>
          <div className={styles.previewWrap}><Grid rows={SAMPLE} dim /></div>
          <p className={styles.sub} style={{ marginTop: 12 }}>See your real Google Maps positions across your area on Pro and Business.</p>
          <Link to="/upgrade" className="btn btn-primary" style={{ marginTop: 10, display: 'inline-flex' }}>Upgrade</Link>
        </>
      )}

      {mode === 'on' && (
        <>
          <form onSubmit={run} className={styles.form}>
            <input className={styles.input} placeholder="Business name as on Google" value={name} onChange={e => setName(e.target.value)} maxLength={120} aria-label="Business name" />
            <input className={styles.input} placeholder="City" value={city} onChange={e => setCity(e.target.value)} maxLength={80} aria-label="City" />
            <input className={styles.input} style={{ maxWidth: 80 }} placeholder="State" value={state} onChange={e => setState(e.target.value.toUpperCase().slice(0, 2))} aria-label="State (two letters)" />
            <input className={styles.input} placeholder="What customers search, e.g. emergency plumber" value={service} onChange={e => setService(e.target.value)} maxLength={80} aria-label="Service customers search for" />
            <button type="submit" className="btn btn-primary" disabled={busy || name.trim().length < 2 || city.trim().length < 2 || service.trim().length < 2}>
              {busy ? 'Checking 25 spots… (up to a minute)' : 'Map my positions'}
            </button>
          </form>
          {error && <p className={styles.error}>{error}</p>}
          {r && rows && (
            <>
              <p className={styles.summary}>
                Top 3 in <strong>{r.summary.top3}</strong> of {r.summary.total} spots · in the top 10 in <strong>{r.summary.top10}</strong>
                {r.summary.averagePosition !== null && <> · average position <strong>{r.summary.averagePosition}</strong></>} for “{r.query}”
              </p>
              <Grid rows={rows} />
              <Legend />
            </>
          )}
        </>
      )}
    </section>
  );
}
