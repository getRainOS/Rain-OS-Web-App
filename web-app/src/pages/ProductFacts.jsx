import { useEffect, useState } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import { api } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import styles from './ProductFacts.module.css';

// Product fact sheets: the facts AI shopping answers compare products on,
// entered once per product. Content Optimizer's rewrite uses them as verified
// facts, and each sheet generates the product's structured data.
const EMPTY = {
  name: '', brand: '', url: '', sku: '', gtin: '', mpn: '', price: '', currency: 'USD', salePrice: '', variants: [],
  materials: '', dimensions: '', weight: '', specs: '', bestFor: '', notFor: '', comparedTo: '',
  shipping: '', returns: '', warranty: '', rating: '', reviewCount: '', reviewQuotes: [], image: '',
};

const SECTIONS = [
  { title: 'Identity', hint: 'How shopping engines tell your product apart.', fields: [
    ['name', 'Product name', 'EcoFlow Yoga Mat'], ['brand', 'Brand', 'EcoFlow'], ['url', 'Product page URL', 'https://yourstore.com/products/ecoflow-mat'],
    ['sku', 'SKU', 'EF-MAT-01'], ['gtin', 'Barcode (GTIN / UPC / EAN)', '0123456789012'], ['image', 'Main image URL', 'https://…/mat.jpg'],
  ] },
  { title: 'Price', hint: 'Exact numbers. "Contact us" or "a certain amount" costs points.', fields: [
    ['price', 'Price', '89.00'], ['currency', 'Currency', 'USD'], ['salePrice', 'Sale price (optional)', '79.00'],
  ] },
  { title: 'Specs', hint: 'Facts with units, not adjectives.', fields: [
    ['materials', 'Materials', 'Natural tree rubber, organic cotton top'], ['dimensions', 'Dimensions', '183 × 61 cm, 4 mm thick'],
    ['weight', 'Weight', '2.2 kg'], ['specs', 'Other specs', 'Latex-free; machine washable cover', true],
  ] },
  { title: 'Fit and comparison', hint: 'What AI uses to recommend you for a specific need.', fields: [
    ['bestFor', 'Best for', 'Hot yoga and travel'], ['notFor', 'Not ideal for (optional)', 'People with latex allergies'],
    ['comparedTo', 'Compared to alternatives', 'Grippier than Manduka eKO when wet; 1 kg lighter than Jade Harmony', true],
  ] },
  { title: 'Buying', hint: 'Shipping, returns and warranty answer the last questions before purchase.', fields: [
    ['shipping', 'Shipping', 'Free over $50; ships in 2 business days'], ['returns', 'Returns', '30-day free returns'], ['warranty', 'Warranty', '1-year warranty'],
  ] },
  { title: 'Reviews', hint: 'Only real numbers and real customer quotes.', fields: [
    ['rating', 'Average rating (out of 5)', '4.8'], ['reviewCount', 'Number of reviews', '212'],
  ] },
];

export default function ProductFacts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { id?, facts }
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const load = () => api.products().then(({ data }) => setItems(data?.items || [])).catch(() => setItems([])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const current = editing && items.find(i => i.id === editing.id);
  const set = (k, v) => setEditing(e => ({ ...e, facts: { ...e.facts, [k]: v } }));
  const setVariant = (n, k, v) => set('variants', editing.facts.variants.map((x, i) => (i === n ? { ...x, [k]: v } : x)));

  async function save() {
    setSaving(true); setMsg('');
    try {
      const { data } = await api.saveProduct({ id: editing.id, facts: editing.facts });
      setEditing({ id: data.item.id, facts: data.item.facts });
      await load();
      setMsg('Saved.');
    } catch (err) {
      setMsg(err.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try { await api.deleteProduct(id); setEditing(null); load(); } catch (err) { setMsg(err.message || 'Could not delete.'); }
  }

  function copySchema(schema) {
    navigator.clipboard?.writeText(`<script type="application/ld+json">\n${schema}\n</script>`)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Product Fact Sheets"
        subtitle="The facts AI shopping answers compare products on, entered once per product. The AI rewrite uses them as verified facts, and each sheet generates your product's structured data."
      />

      <div className={styles.layout}>
        <aside className={styles.list}>
          <button type="button" className="btn btn-primary" onClick={() => { setEditing({ facts: { ...EMPTY } }); setMsg(''); }}>
            <Plus size={14} /> New product
          </button>
          {loading ? <p className={styles.muted}>Loading…</p> : items.length === 0 ? (
            <p className={styles.muted}>No products yet. Add your best seller first.</p>
          ) : (
            <ul>
              {items.map(i => (
                <li key={i.id}>
                  <button type="button" className={editing?.id === i.id ? styles.active : ''} onClick={() => { setEditing({ id: i.id, facts: i.facts }); setMsg(''); }}>
                    <span>{i.facts.name}</span>
                    <span className={styles.muted}>{i.completeness.filled}/{i.completeness.total} facts</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className={styles.editor}>
          {!editing ? (
            <div className={`card ${styles.empty}`}>
              <h3>Why fact sheets?</h3>
              <p>AI shopping answers recommend the products whose facts they can read and compare: exact price, variants, specs, who it's for, shipping and returns. The AI rewrite won't invent these, so without them it can only list them as "Only you can add these". Enter them once here and every rewrite of that product can use them.</p>
            </div>
          ) : (
            <div className="card">
              {current && (
                <div className={styles.progress}>
                  <strong>{current.completeness.filled} of {current.completeness.total}</strong> facts filled
                  {current.completeness.missing.length > 0 && <span className={styles.muted}> · Missing: {current.completeness.missing.join(', ')}</span>}
                </div>
              )}
              {SECTIONS.map(sec => (
                <fieldset key={sec.title} className={styles.section}>
                  <legend>{sec.title}</legend>
                  <p className={styles.hint}>{sec.hint}</p>
                  <div className={styles.grid}>
                    {sec.fields.map(([k, label, ph, wide]) => (
                      <label key={k} className={wide ? styles.wide : ''}>
                        <span>{label}</span>
                        {wide
                          ? <textarea rows={2} value={editing.facts[k] || ''} placeholder={ph} onChange={e => set(k, e.target.value)} />
                          : <input type="text" value={editing.facts[k] || ''} placeholder={ph} onChange={e => set(k, e.target.value)} />}
                      </label>
                    ))}
                  </div>
                  {sec.title === 'Price' && (
                    <div className={styles.variants}>
                      <span className={styles.hint}>Variants (each size or color, with its own price and stock)</span>
                      {editing.facts.variants.map((v, n) => (
                        <div key={n} className={styles.variantRow}>
                          <input type="text" placeholder="183 cm, Sage" value={v.name} onChange={e => setVariant(n, 'name', e.target.value)} aria-label="Variant name" />
                          <input type="text" placeholder="Price" value={v.price} onChange={e => setVariant(n, 'price', e.target.value)} aria-label="Variant price" />
                          <input type="text" placeholder="SKU" value={v.sku} onChange={e => setVariant(n, 'sku', e.target.value)} aria-label="Variant SKU" />
                          <select value={v.inStock === null ? '' : v.inStock ? 'yes' : 'no'} onChange={e => setVariant(n, 'inStock', e.target.value === '' ? null : e.target.value === 'yes')} aria-label="In stock">
                            <option value="">Stock?</option><option value="yes">In stock</option><option value="no">Out of stock</option>
                          </select>
                          <button type="button" aria-label="Remove variant" onClick={() => set('variants', editing.facts.variants.filter((_, i) => i !== n))}><Trash2 size={13} /></button>
                        </div>
                      ))}
                      <button type="button" className={styles.linkBtn} onClick={() => set('variants', [...editing.facts.variants, { name: '', price: '', sku: '', gtin: '', inStock: null }])}>+ Add variant</button>
                    </div>
                  )}
                  {sec.title === 'Reviews' && (
                    <label className={styles.wide}>
                      <span>Customer quotes (one per line)</span>
                      <textarea rows={3} value={(editing.facts.reviewQuotes || []).join('\n')} placeholder="No slipping even in hot yoga."
                        onChange={e => set('reviewQuotes', e.target.value.split('\n'))} />
                    </label>
                  )}
                </fieldset>
              ))}
              <div className={styles.actions}>
                <button type="button" className="btn btn-primary" onClick={save} disabled={saving || (editing.facts.name || '').trim().length < 2}>{saving ? 'Saving…' : 'Save fact sheet'}</button>
                {current?.schema && (
                  <button type="button" className="btn btn-ghost" onClick={() => copySchema(current.schema)}>
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy product schema code</>}
                  </button>
                )}
                {editing.id && <button type="button" className={styles.deleteBtn} onClick={() => remove(editing.id)}>Delete</button>}
                {msg && <span className={styles.muted} role="status">{msg}</span>}
              </div>
              <p className={styles.hint} style={{ marginTop: 10 }}>To use these facts, open Content Optimizer, choose this product under "Product facts", and run "Rewrite for AI".</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
