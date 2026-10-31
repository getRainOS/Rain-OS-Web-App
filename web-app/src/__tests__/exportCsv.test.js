import { describe, it, expect } from 'vitest';
import { toCsv } from '../lib/exportCsv.js';

const columns = [
  { label: 'Question', get: r => r.question },
  { label: 'Sources', get: r => r.sources },
];

describe('toCsv', () => {
  it('writes a header row and one row per record', () => {
    const csv = toCsv([{ question: 'Best plumber', sources: ['a.com', 'b.com'] }], columns);
    expect(csv).toBe('Question,Sources\r\nBest plumber,a.com; b.com');
  });
  it('quotes values with commas, quotes and line breaks', () => {
    const csv = toCsv([{ question: 'Fix, "fast"\nnow', sources: '' }], columns);
    expect(csv.split('\r\n')[1]).toBe('"Fix, ""fast""\nnow",');
  });
  it('stops spreadsheets running a cell as a formula', () => {
    const csv = toCsv([{ question: '=HYPERLINK("x")', sources: '' }], columns);
    expect(csv.split('\r\n')[1].startsWith("\"'=HYPERLINK")).toBe(true);
  });
  it('leaves empty values blank', () => {
    expect(toCsv([{ question: null, sources: undefined }], columns).split('\r\n')[1]).toBe(',');
  });
});
