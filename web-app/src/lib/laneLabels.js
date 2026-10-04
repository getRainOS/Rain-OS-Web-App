// Single source of truth for the URL Scanner tool's lane-specific name.
// product_sellers and local_business point the same tool at a different job
// (scoring a product listing vs. a business page) — the name should say so.
// Every other lane keeps the generic "URL Scanner" name.
const URL_SCANNER_LABEL_BY_LANE = {
  product_sellers: 'Product Page Analysis',
  local_business: 'Business Page Analysis',
};

export function urlScannerLabel(lane) {
  return URL_SCANNER_LABEL_BY_LANE[lane] || 'URL Scanner';
}
