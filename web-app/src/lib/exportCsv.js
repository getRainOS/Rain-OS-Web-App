// CSV export: one row per record, columns picked explicitly so the file reads
// cleanly in Excel or Google Sheets. Values with commas, quotes or line
// breaks are quoted; a leading = + - @ is prefixed so spreadsheets never run
// a cell as a formula.
function cell(v) {
  if (v == null) return '';
  let s = Array.isArray(v) ? v.join('; ') : typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows, columns) {
  const head = columns.map(c => cell(c.label)).join(',');
  const body = rows.map(r => columns.map(c => cell(c.get(r))).join(','));
  return [head, ...body].join('\r\n');
}

export function downloadCsv(filename, rows, columns) {
  const blob = new Blob(['﻿' + toCsv(rows, columns)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const day = d => (d ? new Date(d).toISOString().slice(0, 10) : '');
const stamp = () => new Date().toISOString().slice(0, 10);

export const EXPORTS = {
  analyses: {
    file: () => `rain-os-analyses-${stamp()}.csv`,
    columns: [
      { label: 'Date', get: r => day(r.analyzed_at) },
      { label: 'Title', get: r => r.title || '' },
      { label: 'URL', get: r => r.url || '' },
      { label: 'Repo', get: r => r.repo || '' },
      { label: 'Overall score', get: r => r.overall_score },
      { label: 'AI Readability', get: r => r.ai_readability },
      { label: 'Digital Authority', get: r => r.digital_authority },
      { label: 'Conversion Readiness', get: r => r.conversion_readiness },
      { label: 'RAG Readiness', get: r => r.rag_readiness },
      { label: 'Product Discoverability', get: r => r.product_discoverability },
      { label: 'Local Presence', get: r => r.local_presence },
    ],
  },
  citations: {
    file: () => `rain-os-citations-${stamp()}.csv`,
    columns: [
      { label: 'Date', get: r => day(r.checkedAt || r.checked_at) },
      { label: 'Question', get: r => r.topic },
      { label: 'Website', get: r => r.url || '' },
      { label: 'Cited', get: r => (r.cited ? 'Yes' : 'No') },
      { label: 'Cited sources', get: r => (r.sources || []).map(s => s.domain || s.uri || s.url).filter(Boolean) },
    ],
  },
  brandSentiment: {
    file: () => `rain-os-brand-sentiment-${stamp()}.csv`,
    columns: [
      { label: 'Date', get: r => day(r.checkedAt || r.checked_at) },
      { label: 'Name', get: r => r.name || '' },
      { label: 'Brand', get: r => r.brand },
      { label: 'Question', get: r => r.topic },
      { label: 'Website', get: r => r.url || '' },
      { label: 'Mentioned', get: r => ((r.mentionStatus || r.mention_status) === 'mentioned' ? 'Yes' : 'No') },
      { label: 'Position', get: r => r.mentionPosition ?? r.mention_position ?? '' },
      { label: 'Sentiment', get: r => r.sentiment || '' },
    ],
  },
  sov: {
    file: () => `rain-os-share-of-voice-${stamp()}.csv`,
    columns: [
      { label: 'Date', get: r => day(r.checkedAt || r.checked_at) },
      { label: 'Name', get: r => r.name || '' },
      { label: 'Brand', get: r => r.brand },
      { label: 'Question', get: r => r.topic },
      { label: 'Website', get: r => r.url || '' },
      { label: 'Share of Voice %', get: r => r.sharePercent ?? '' },
      { label: 'Answers mentioning you (of 3)', get: r => r.mentionedCount ?? r.citedCount ?? '' },
      { label: 'Competitors', get: r => (r.brandShares || []).filter(b => !b.isYou).map(b => `${b.brand} ${b.sharePercent}%`) },
    ],
  },
};
