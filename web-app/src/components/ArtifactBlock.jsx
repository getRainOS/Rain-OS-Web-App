import { useState } from 'react';
import styles from './ArtifactBlock.module.css';

export default function ArtifactBlock({ artifact }) {
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

  function handleCopy() {
    navigator.clipboard.writeText(artifact.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const labelMap = {
    'json-ld': 'JSON-LD',
    'llms-txt': 'llms.txt',
    'robots-txt': 'robots.txt',
    'html': 'HTML',
  };

  const label = artifact.filename || labelMap[artifact.type] || artifact.type;

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <button
          className={styles.copyBtn}
          onClick={handleCopy}
          type="button"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      <pre className={styles.code}><code>{artifact.content}</code></pre>
    </div>
  );
}
