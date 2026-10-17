// Plan and cost for a Full check. By our own counting each tool run uses one
// analysis (Share of Voice's three Gemini calls still count as one).
export const PLANS = {
  quick: { label: 'Quick', questions: 1, shareOfVoice: false, blurb: 'Page scan, 1 question and a brand check' },
  full:  { label: 'Full',  questions: 3, shareOfVoice: true,  blurb: 'Page scan, 3 questions, Share of Voice and a brand check' },
};

// Share of Voice asks the AI 3 separate questions, so it uses 3 analyses.
export const SOV_COST = 3;

export function costOf(plan, questionCount) {
  const p = PLANS[plan];
  // scan + each question + Brand Sentiment (+ Share of Voice on Full)
  return 1 + questionCount + 1 + (p.shareOfVoice ? SOV_COST : 0);
}

export function siteFromUrl(input) {
  try {
    return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// "acme.com" -> "Acme": a starting guess the user can edit.
export function guessBrand(domain) {
  const root = (domain || '').split('.')[0] || '';
  return root ? root.charAt(0).toUpperCase() + root.slice(1) : '';
}
