// services/readability.ts
// Algorithmic pre-analysis — hard metrics fed into Gemini as scoring anchors.
// Zero API cost. Runs before every Gemini call.
export interface ReadabilityMetrics {
    avgSentenceLength: number;
    sentenceLengthVariance: number;
    longSentenceRatio: number;
    passiveVoiceRatio: number;
    coreferenceLeakCount: number;
    abstractionRatio: number;
    nestedClauseDepth: number;
    headingDensity: number;
    answerFirstRatio: number;
    qaDensity: number;
    definitionDensity: number;
    entityDensity: number;
    listItemRatio: number;
    wordCount: number;
    }
    const stripHtml = (t: string): string =>
    t.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const getSentences = (t: string): string[] =>
    t.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 10);
    const getWords = (t: string): string[] =>
    t.split(/\s+/).filter(Boolean);
    // Vague/abstract words that reduce semantic precision
    const ABSTRACT_WORDS = new Set([
    'thing', 'stuff', 'various', 'several', 'many', 'some', 'certain',
    'aspect', 'factor', 'issue', 'situation', 'manner', 'way', 'kind',
    'type', 'form', 'nature', 'level', 'area', 'field', 'case',
    ]);
    export function computeReadabilityMetrics(raw: string): ReadabilityMetrics {
    const text = stripHtml(raw);
    const words = getWords(text);
    const sentences = getSentences(text);
    const wordCount = words.length;
    // ─── Sentence length metrics ─────────────────────────────────────────────
    const sentenceLengths = sentences.map((s) => getWords(s).length);
    const avg = sentenceLengths.length
    ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
    : 0;
    const variance = sentenceLengths.length
    
    
    
    ? Math.sqrt(
    sentenceLengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) /
    sentenceLengths.length
    )
    : 0;
    const longRatio = sentenceLengths.length
    ? sentenceLengths.filter((l) => l > 30).length / sentenceLengths.length
    : 0;
    // ─── Passive voice ────────────────────────────────────────────────────────
    const passive = (text.match(/\b(was|were|been|is|are|be)\s+\w+ed\b/gi) ||
    []).length;
    const passiveRatio = sentences.length ? passive / sentences.length : 0;
    // ─── Coreference leaks (ambiguous pronouns without clear antecedent) ──────
    const corefLeaks =
    (text.match(/\b(it|this|that|they|them|these|those|he|she)\b/gi) || []).length;
    // ─── Abstraction ratio ────────────────────────────────────────────────────
    const abstractCount = words.filter((w) =>
    ABSTRACT_WORDS.has(w.toLowerCase())).length;
    const abstractRatio = wordCount ? abstractCount / wordCount : 0;
    // ─── Nested clause depth (commas per sentence as proxy) ──────────────────
    const totalCommas = (text.match(/,/g) || []).length;
    const nestedDepth = sentences.length ? totalCommas / sentences.length : 0;
    // ─── Heading density (headings per 100 words) ────────────────────────────
    const headingMatches = (raw.match(/<h[1-6][^>]*>/gi) || []).length;
    const headingDensity = wordCount ? (headingMatches / wordCount) * 100 : 0;
    // ─── Answer-first ratio (sentences that lead with a direct answer) ────────
    // Heuristic: short sentences (<= 20 words) that start with a noun or number
    const answerFirstCount = sentences.filter((s) => {
    const ws = getWords(s);
    return ws.length <= 20 && /^[A-Z0-9]/.test(s.trim()) &&
    !s.trim().endsWith('?');
    }).length;
    const answerFirstRatio = sentences.length ? answerFirstCount / sentences.length
    : 0;
    // ─── QA density (question sentences) ─────────────────────────────────────
    const questionCount = sentences.filter((s) => s.trim().endsWith('?')).length;
    const qaDensity = sentences.length ? questionCount / sentences.length : 0;
    // ─── Definition density (per 100 words) ──────────────────────────────────
    const defMatches = (text.match(/\b(is defined as|refers to|means|is a|are a)\b/gi) || []).length;
    const defDensity = wordCount ? (defMatches / wordCount) * 100 : 0;
    // ─── Entity density (proper nouns per 100 words) ─────────────────────────
    // Heuristic: capitalised words not at sentence start
    const entityMatches = (text.match(/(?<!\.\s)(?<![A-Z])\b[A-Z][a-z]+\b/g) ||
    []).length;
    const entityDensity = wordCount ? (entityMatches / wordCount) * 100 : 0;
    
    
    
    // ─── List item ratio (list items per 100 words) ──────────────────────────
    const listItems = (raw.match(/<li[^>]*>/gi) || []).length;
    const listRatio = wordCount ? (listItems / wordCount) * 100 : 0;
    return {
    avgSentenceLength: Math.round(avg * 10) / 10,
    sentenceLengthVariance: Math.round(variance * 10) / 10,
    longSentenceRatio: Math.round(longRatio * 100) / 100,
    passiveVoiceRatio: Math.round(passiveRatio * 100) / 100,
    coreferenceLeakCount: corefLeaks,
    abstractionRatio: Math.round(abstractRatio * 100) / 100,
    nestedClauseDepth: Math.round(nestedDepth * 10) / 10,
    headingDensity: Math.round(headingDensity * 100) / 100,
    answerFirstRatio: Math.round(answerFirstRatio * 100) / 100,
    qaDensity: Math.round(qaDensity * 100) / 100,
    definitionDensity: Math.round(defDensity * 100) / 100,
    entityDensity: Math.round(entityDensity * 100) / 100,
    listItemRatio: Math.round(listRatio * 100) / 100,
    wordCount,
    };
    }
    export function formatMetricsAsGroundingBlock(m: ReadabilityMetrics): string {
    return [
    '=== ALGORITHMIC PRE-ANALYSIS (use as scoring anchors — do not contradict) ===',
    `Word count: ${m.wordCount}`,
    `Avg sentence length: ${m.avgSentenceLength} words (optimal: 15-20; penalise
    AI Readability if >25)`,
    `Sentence length variance: ${m.sentenceLengthVariance} stddev (optimal: 4-
    12)`,
    `Long sentence ratio: ${(m.longSentenceRatio * 100).toFixed(1)}% sentences >30
    words (penalise structuralClarity if >20%)`,
    `Passive voice ratio: ${(m.passiveVoiceRatio * 100).toFixed(1)}% (penalise
    semanticPrecision if >30%)`,
    `Coreference leaks: ${m.coreferenceLeakCount} ambiguous pronouns (penalise
    semanticPrecision: -3pts each, max -20)`,
    `Abstraction ratio: ${(m.abstractionRatio * 100).toFixed(1)}% vague words
    (penalise: -20 x ratio)`,
    `Nested clause depth: ${m.nestedClauseDepth.toFixed(1)} commas/sentence
    (penalise structuralClarity if >3)`,
    `Heading density: ${m.headingDensity.toFixed(2)} per 100 words (optimal: 0.5-
    2.0)`,
    `Answer-first ratio: ${(m.answerFirstRatio * 100).toFixed(1)}% (reward
    answerFirstFormatting generously if >40%)`,
    `QA density: ${(m.qaDensity * 100).toFixed(1)}% question sentences`,
    `Definition density: ${m.definitionDensity.toFixed(2)} per 100 words`,
    `Entity density: ${m.entityDensity.toFixed(2)} proper nouns per 100 words`,
    `List item ratio: ${m.listItemRatio.toFixed(2)} list items per 100 words`,
    '=== END PRE-ANALYSIS ===',
    ].join('\n');
    }