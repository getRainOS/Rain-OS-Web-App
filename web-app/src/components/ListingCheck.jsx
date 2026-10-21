import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Star } from 'lucide-react';
import { api } from '../api/client.js';
import styles from './LocalPageCheck.module.css';

const Match = ({ ok, label }) => (ok === null ? null : (
  <li className={styles.row}>
    {ok ? <CheckCircle2 size={15} className={styles.ok} aria-label="Matches" /> : <AlertCircle size={15} className={styles.bad} aria-label="Doesn't match" />}
    <div className={styles.label}>{label} {ok ? 'matches your website' : "doesn't match your website"}</div>
  </li>
));

// URL Scanner: the business's Google listing — profile, reviews that mention
// the city, and Google Maps position. mode: 'on' | 'locked'.
export default function ListingCheck({ mode, nap, url }) {
  const [name, setName] = useState(nap?.name || '');
  const [service, setService] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [r, setR] = useState(null);

  if (mode === 'locked') {
    return (
      <div className={`card ${styles.card}`}>
        <h3 className={styles.title}>Check your Google listing</h3>
        <p className={styles.sub}>Pro and Business check your Google Business Profile, reviews that mention {nap?.city || 'your city'}, and where you rank on Google Maps against competitors.</p>
        <Link to="/upgrade" className="btn btn-primary" style={{ marginTop: 12, display: 'inline-flex' }}>Upgrade</Link>
      </div>
    );
  }
  if (!nap?.city) return null;

  async function run(e) {
    e.preventDefault();
    setBusy(true); setError(''); setR(null);
    try {
      const { data } = await api.localListing({
        businessName: name.trim(), city: nap.city, state: nap.state || undefined, service: service.trim(), url,
        page: { name: nap.name, phone: nap.phone, street: nap.street },
      });
      setR(data?.data ?? data);
    } catch (err) {
      setError(err.message || 'The listing check failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const p = r?.profile;
  return (
    <div className={`card ${styles.card}`}>
      <h3 className={styles.title}>Check your Google listing in {nap.city}</h3>
      <p className={styles.sub}>Your Google Business Profile, reviews that mention {nap.city}, and where you rank on Google Maps.</p>
      <form onSubmit={run} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <input className={styles.input} style={{ flex: '1 1 200px' }} placeholder="Business name as on Google" value={name} onChange={e => setName(e.target.value)} maxLength={120} aria-label="Business name" />
        <input className={styles.input} style={{ flex: '1 1 200px' }} placeholder="Service, e.g. wedding cake bakery" value={service} onChange={e => setService(e.target.value)} maxLength={80} aria-label="Service for the Maps search" />
        <button type="submit" className="btn btn-primary" disabled={busy || name.trim().length < 2}>{busy ? 'Checking Google…' : 'Check my listing'}</button>
      </form>
      {busy && <p className={styles.detail} style={{ marginTop: 8 }}>Reading reviews can take up to a minute.</p>}
      {error && <p className={styles.fix} style={{ color: '#f5a623' }}>{error}</p>}

      {r && (
        <>
          {p ? (
            <div style={{ marginTop: 14 }}>
              <div className={styles.label}><strong>{p.name}</strong>{p.category ? ` · ${p.category}` : ''}</div>
              <div className={styles.detail}>
                {p.rating !== null && <><Star size={12} style={{ display: 'inline-block', verticalAlign: '-1px' }} /> {p.rating} from {p.reviewCount ?? 0} reviews · </>}
                {p.claimed === false ? 'Not claimed' : p.claimed ? 'Claimed' : ''}{p.address ? ` · ${p.address}` : ''}
              </div>
              <ul className={styles.list}>
                <Match ok={r.matches.phone} label="Phone" />
                <Match ok={r.matches.address} label="Address" />
                <Match ok={r.matches.website} label="Website link" />
                <Match ok={r.matches.name} label="Business name" />
              </ul>
            </div>
          ) : (
            <p className={styles.fix}>No Google Business Profile found under "{name}" in {nap.city}.</p>
          )}

          {r.reviews && (
            <div className={styles.steps}>
              <div className={styles.stepsTitle}>Reviews that mention {nap.city}</div>
              <p className={styles.stepsNote}>{r.reviews.mentionCity} of your last {r.reviews.checked} reviews.</p>
              {r.reviews.examples.map((x, i) => <p key={i} className={styles.detail}>"{x}"</p>)}
            </div>
          )}

          {r.maps && (
            <div className={styles.steps}>
              <div className={styles.stepsTitle}>Google Maps for "{r.maps.query}"</div>
              <p className={styles.stepsNote}>{r.maps.position ? `You're #${r.maps.position}.` : "You're not in the top 20."}</p>
              <ol className={styles.stepList}>
                {r.maps.top.map(t => (
                  <li key={`${t.position}-${t.name}`} style={t.isYou ? { color: 'var(--text)' } : undefined}>
                    {t.name}{t.isYou ? ' (you)' : ''}{t.rating !== null ? ` · ${t.rating}★ (${t.reviewCount ?? 0})` : ''}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {r.steps.length > 0 && (
            <div className={styles.steps}>
              <div className={styles.stepsTitle}>What to fix</div>
              <ol className={styles.stepList}>{r.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}
