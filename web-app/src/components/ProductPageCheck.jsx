import { CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import styles from './LocalPageCheck.module.css';

// URL Scanner, Product Sellers: what AI shopping answers can read off this
// page, measured exactly from the page and its schema (and, for Shopify, the
// store's variant data). Not part of the score.
export default function ProductPageCheck({ check }) {
  if (!check) return null;
  const failing = check.items.filter(i => !i.pass);
  const passing = check.items.filter(i => i.pass);
  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.head}>
        <ShoppingBag size={16} aria-hidden="true" />
        <div>
          <h3 className={styles.title}>Ready for AI shopping answers?{check.productName ? ` · ${check.productName}` : ''}</h3>
          <p className={styles.sub}>
            <strong>{check.passed} of {check.total}</strong> product checks pass. Exact checks of this page and its product schema,
            the facts ChatGPT, Google and Perplexity use to compare and recommend products.
          </p>
        </div>
      </div>
      <ul className={styles.list}>
        {[...failing, ...passing].map(i => (
          <li key={i.id} className={styles.row}>
            {i.pass
              ? <CheckCircle2 size={15} className={styles.ok} aria-label="Pass" />
              : <AlertCircle size={15} className={styles.bad} aria-label="Needs work" />}
            <div>
              <div className={styles.label}>{i.label}</div>
              <div className={styles.detail}>{i.detail}</div>
              {i.fix && <div className={styles.fix}>{i.fix}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
