import { useState } from 'react';
import { api } from '../api/client.js';

// "Brand name: Bright Smile Dental (from your page) · Edit" under a URL Scanner
// result. It's the name Citation Monitor, Brand Sentiment and Share of Voice
// look for in AI answers; editing saves it on this analysis.
export default function BrandNameLine({ analysisId, brand, fromPage }) {
  const [value, setValue] = useState(brand || '');
  const [saved, setSaved] = useState(brand || '');
  const [auto, setAuto] = useState(!!fromPage);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save(e) {
    e.preventDefault();
    if (!analysisId) return;
    setBusy(true); setError('');
    try {
      await api.setAnalysisBrand(analysisId, value.trim());
      setSaved(value.trim()); setAuto(false); setEditing(false);
    } catch (err) {
      setError(err.message || 'Could not save the name.');
    } finally {
      setBusy(false);
    }
  }

  const box = { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px' };
  if (editing) {
    return (
      <form onSubmit={save} style={box}>
        <span>Brand name</span>
        <input autoFocus value={value} onChange={e => setValue(e.target.value)} maxLength={120} placeholder="As people write it"
          style={{ padding: '6px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 13, minWidth: 220 }} />
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ padding: '6px 12px', fontSize: 13 }}>{busy ? 'Saving…' : 'Save'}</button>
        <button type="button" className="btn btn-ghost" onClick={() => { setValue(saved); setEditing(false); }} style={{ padding: '6px 12px', fontSize: 13 }}>Cancel</button>
        {error && <span style={{ color: 'var(--orange)' }}>{error}</span>}
      </form>
    );
  }
  return (
    <p style={box}>
      {saved
        ? <>Brand name: <strong style={{ color: 'var(--text)', fontWeight: 500 }}>{saved}</strong>{auto && <span>(from your page)</span>}</>
        : <>No brand name found on this page.</>}
      <span style={{ color: 'var(--text-dim)' }}>· used to check whether AI names you</span>
      {analysisId && (
        <button type="button" onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 0, fontSize: 13 }}>
          {saved ? 'Edit' : 'Add one'}
        </button>
      )}
    </p>
  );
}
