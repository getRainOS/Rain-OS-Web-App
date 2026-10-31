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
  shipping: '', returns: '', warranty: '', rating: '', reviewCount: '', reviewQuotes: [], image: '', sourceText: '', drafts: [],
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
  const [defaults, setDefaults] = useState({ shipping: '', returns: '', warranty: '', currency: '' });
  const [defaultsMsg, setDefaultsMsg] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [importing, setImporting] = useState('');
  const [importMsg, setImportMsg] = useState(null); // { ok, text }
  const [drafting, setDrafting] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('least');

  const load = () => api.products()
    .then(({ data }) => { setItems(data?.items || []); if (data?.defaults) setDefaults(d => ({ ...d, ...data.defaults })); })
    .catch(() => setItems([]))
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const current = editing && items.find(i => i.id === editing.id);
  // Editing a drafted field counts as checking it.
  const set = (k, v) => setEditing(e => ({ ...e, facts: { ...e.facts, [k]: v, drafts: (e.facts.drafts || []).filter(d => d !== k) } }));
  const confirmDraft = k => setEditing(e => ({ ...e, facts: { ...e.facts, drafts: (e.facts.drafts || []).filter(d => d !== k) } }));

  async function runImport(kind) {
    setImporting(kind); setImportMsg(null);
    try {
      if (kind === 'store') {
        const { data } = await api.importStore(storeUrl);
        setImportMsg({ ok: true, text: `Imported ${data.found} products from ${data.store}: ${data.created} new, ${data.updated} updated. Prices, variants and stock came from your store; your own notes were kept.` });
      } else {
        const { data } = await api.importProductPage(pageUrl);
        setImportMsg({ ok: true, text: `Imported ${data.item?.facts?.name || 'the product'}.` });
        if (data.item) setEditing({ id: data.item.id, facts: data.item.facts });
      }
      await load();
    } catch (err) {
      setImportMsg({ ok: false, text: err.message || 'The import failed.' });
    } finally {
      setImporting('');
    }
  }

  async function saveDefaults() {
    setDefaultsMsg('');
    try { await api.saveProductDefaults(defaults); setDefaultsMsg('Saved. Applies to every product that leaves these blank.'); load(); }
    catch (err) { setDefaultsMsg(err.message || 'Could not save.'); }
  }

  async function draft() {
    if (!editing?.id) return;
    setDrafting(true); setMsg('');
    try {
      const { data } = await api.draftProduct(editing.id);
      if (data.item) setEditing({ id: data.item.id, facts: data.item.facts });
      setMsg(data.drafted?.length ? `Drafted ${data.drafted.length} fields from the product description. Check each one marked "Draft".` : 'The description had nothing more to draft from.');
      load();
    } catch (err) {
      setMsg(err.message || 'The AI draft failed.');
    } finally {
      setDrafting(false);
    }
  }
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
        title="Product Details"
        subtitle="The facts AI shopping answers compare products on, entered once per product. The AI rewrite uses them as verified facts, and each sheet generates your product's structured data."
      />

      <div className={`card ${styles.importBar}`}>
        <div className={styles.importCol}>
          <h3>Import your whole Shopify store</h3>
          <p>Creates a sheet for every product with name, brand, price, variants, SKUs, stock and description. Safe to re-run: it refreshes store data and keeps your notes.</p>
          <div className={styles.inline}>
            <input type="text" placeholder="yourstore.com" value={storeUrl} onChange={e => setStoreUrl(e.target.value)} aria-label="Shopify store address" />
            <button type="button" className="btn btn-primary" disabled={!storeUrl.trim() || !!importing} onClick={() => runImport('store')}>{importing === 'store' ? 'Importing…' : 'Import all products'}</button>
          </div>
        </div>
        <div className={styles.importCol}>
          <h3>Or import one product page</h3>
          <p>Works on any store platform: reads the product data built into the page.</p>
          <div className={styles.inline}>
            <input type="text" placeholder="yourstore.com/products/…" value={pageUrl} onChange={e => setPageUrl(e.target.value)} aria-label="Product page address" />
            <button type="button" className="btn btn-ghost" disabled={!pageUrl.trim() || !!importing} onClick={() => runImport('page')}>{importing === 'page' ? 'Importing…' : 'Import'}</button>
          </div>
        </div>
        {importMsg && <p className={importMsg.ok ? styles.okMsg : styles.errMsg} role="status">{importMsg.text}</p>}
      </div>

      <details className={`card ${styles.defaults}`}>
        <summary>Store-wide defaults <span className={styles.muted}>Shipping, returns and warranty, set once for every product</span></summary>
        <div className={styles.grid} style={{ marginTop: 12 }}>
          {[['shipping', 'Shipping', 'Free over $50; ships in 2 business days'], ['returns', 'Returns', '30-day free returns'], ['warranty', 'Warranty', '1-year warranty'], ['currency', 'Currency', 'USD']].map(([k, label, ph]) => (
            <label key={k}><span>{label}</span><input type="text" value={defaults[k] || ''} placeholder={ph} onChange={e => setDefaults(d => ({ ...d, [k]: e.target.value }))} /></label>
          ))}
        </div>
        <div className={styles.inline} style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={saveDefaults}>Save defaults</button>
          {defaultsMsg && <span className={styles.muted} role="status">{defaultsMsg}</span>}
        </div>
      </details>

      <div className={styles.layout}>
        <aside className={styles.list}>
          <button type="button" className="btn btn-primary" onClick={() => { setEditing({ facts: { ...EMPTY } }); setMsg(''); }}>
            <Plus size={14} /> New product
          </button>
          {loading ? <p className={styles.muted}>Loading…</p> : items.length === 0 ? (
            <p className={styles.muted}>No products yet. Import your store above, or add your best seller.</p>
          ) : (
            <>
            {items.length > 8 && (
              <div className={styles.listTools}>
                <input type="search" placeholder={`Search ${items.length} products`} value={query} onChange={e => setQuery(e.target.value)} aria-label="Search products" />
                <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort products">
                  <option value="least">Fewest facts first</option>
                  <option value="recent">Recently updated</option>
                  <option value="name">A–Z</option>
                </select>
              </div>
            )}
            <ul className={styles.scroll}>
              {items
                .filter(i => !query.trim() || i.facts.name.toLowerCase().includes(query.trim().toLowerCase()))
                .sort((a, b) => sort === 'name' ? a.facts.name.localeCompare(b.facts.name)
                  : sort === 'recent' ? String(b.updatedAt).localeCompare(String(a.updatedAt))
                  : a.completeness.filled - b.completeness.filled)
                .map(i => (
                <li key={i.id}>
                  <button type="button" className={editing?.id === i.id ? styles.active : ''} onClick={() => { setEditing({ id: i.id, facts: i.facts }); setMsg(''); }}>
                    <span>{i.facts.name}</span>
                    <span className={styles.muted}>{i.completeness.filled}/{i.completeness.total} facts</span>
                  </button>
                </li>
              ))}
            </ul>
            </>
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
              {current && current.facts.sourceText && (
                <div className={styles.draftBar}>
                  <span>Let AI draft "best for", specs and materials from this product's description. Drafts don't count until you check them.</span>
                  <button type="button" className="btn btn-ghost" disabled={drafting} onClick={draft}>{drafting ? 'Drafting…' : 'Draft with AI'}</button>
                </div>
              )}
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
                        <span>
                          {label}
                          {(editing.facts.drafts || []).includes(k) && (
                            <>
                              <span className={styles.draftBadge}>Draft — check</span>
                              <button type="button" className={styles.linkBtn} onClick={e => { e.preventDefault(); confirmDraft(k); }}>Looks right</button>
                            </>
                          )}
                          {['shipping', 'returns', 'warranty'].includes(k) && !editing.facts[k] && defaults[k] && <span className={styles.muted}> · using store default</span>}
                        </span>
                        {wide
                          ? <textarea rows={2} value={editing.facts[k] || ''} placeholder={`e.g. ${ph}`} onChange={e => set(k, e.target.value)} />
                          : <input type="text" value={editing.facts[k] || ''} placeholder={['shipping', 'returns', 'warranty'].includes(k) && defaults[k] ? `Store default: ${defaults[k]}` : `e.g. ${ph}`} onChange={e => set(k, e.target.value)} />}
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
                      <textarea rows={3} value={(editing.facts.reviewQuotes || []).join('\n')} placeholder="e.g. No slipping even in hot yoga."
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
