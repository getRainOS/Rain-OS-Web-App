import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import Select from './Select.jsx';
import { COUNTRIES, US_STATES } from '../lib/usStates.js';
import { engineName } from '../lib/engines.js';

// Which AI engine to ask, and (for engines that take one) from where.
// value: { engine, country, state }. Shows nothing until a second engine is on.
export default function EnginePicker({ value, onChange, labelClass, hintClass }) {
  const { user } = useApp();
  const [engines, setEngines] = useState([]);
  useEffect(() => {
    api.engines().then(({ data }) => setEngines((data?.engines || []).filter(e => !e.locked))).catch(() => {});
  }, []);
  useEffect(() => {
    if (user && value.state === undefined) onChange({ ...value, state: user.locationState || '' });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  if (engines.length < 2) return null;
  const current = engines.find(e => e.id === value.engine);
  const set = patch => onChange({ ...value, ...patch });
  return (
    <div>
      <span className={labelClass}>AI engine</span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
        <Select
          value={value.engine}
          onChange={engine => set({ engine })}
          ariaLabel="AI engine to ask"
          options={engines.map(e => ({ value: e.id, label: engineName(e.id) }))}
        />
        {current?.location === 'state' && (
          <>
            <Select value={value.country} onChange={country => set({ country })} ariaLabel="Country to ask from"
              options={COUNTRIES.map(([v, l]) => ({ value: v, label: l }))} />
            {value.country === 'US' && (
              <Select value={value.state ?? ''} onChange={state => set({ state })} ariaLabel="US state to ask from"
                options={[{ value: '', label: 'Anywhere in the US' }, ...US_STATES.map(([v, l]) => ({ value: v, label: l }))]} />
            )}
          </>
        )}
      </div>
      {hintClass && current && current.id !== 'gemini' && (
        <p className={hintClass}>{engineName(current.id)} answers can take up to a minute.</p>
      )}
    </div>
  );
}

export const DEFAULT_ENGINE = { engine: 'gemini', country: 'US', state: undefined };
export const engineBody = v => (v.engine === 'gemini' ? {} : { engine: v.engine, country: v.country, state: v.country === 'US' ? (v.state || null) : null });
