import { MapPin } from 'lucide-react';
import { localListingTasks } from '../lib/localListings.js';
import styles from './LocalListings.module.css';

// Local businesses: where to get listed or featured, from the sources the AI
// actually used for this question.
export default function LocalListings({ sources, url }) {
  const { profiles, features } = localListingTasks(sources, url);
  if (!profiles.length && !features.length) return null;
  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.head}>
        <MapPin size={16} aria-hidden="true" />
        <div>
          <h3 className={styles.title}>Get listed where the AI looked</h3>
          <p className={styles.sub}>
            For this question the AI leaned on these sites. Being on them, with the same name, address and phone as your
            website, is one of the most direct ways to start being named for local questions.
          </p>
        </div>
      </div>
      {profiles.length > 0 && (
        <>
          <div className={styles.group}>Claim or update your profile</div>
          <ul className={styles.list}>
            {profiles.map(p => (
              <li key={p.name}>
                <span className={styles.box} aria-hidden="true" />
                <span><strong>{p.name}</strong>: make sure you have a profile, it is complete, and your details match your website.</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {features.length > 0 && (
        <>
          <div className={styles.group}>Ask to be featured</div>
          <ul className={styles.list}>
            {features.slice(0, 6).map(f => (
              <li key={f.domain}>
                <span className={styles.box} aria-hidden="true" />
                <span>
                  <strong>{f.domain}</strong>{f.title ? `: “${f.title}”` : ''}. Local lists, news and guides like this are worth a short email asking to be included.
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
