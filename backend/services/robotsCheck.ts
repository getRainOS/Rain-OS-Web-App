// services/robotsCheck.ts — shared robots.txt / AI-crawler-access parsing.
// Used by both Repo Analysis (reads robots.txt from the repo's source tree)
// and URL Scanner (fetches robots.txt live from the deployed site).
//
// Parses actual User-agent/Allow/Disallow blocks instead of a substring
// search, so a crawler explicitly blocked under its own name (or by a
// `User-agent: *` block it isn't carved out of) is reported as blocked —
// not as "allowed" just because its name appears somewhere in the file.

export type CrawlerAccess = 'allowed' | 'blocked' | 'not_mentioned';

export interface CrawlerStatus {
  crawler: string;
  access: CrawlerAccess;
}

/** The AI crawlers we check for by name. Order here is the order shown in the UI. */
export const AI_CRAWLERS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'PerplexityBot'] as const;

interface RobotsRule {
  type: 'allow' | 'disallow';
  path: string;
}

interface RobotsBlock {
  userAgent: string;
  rules: RobotsRule[];
}

/**
 * Parse a robots.txt body into its User-agent blocks, each carrying the
 * Allow/Disallow rules that apply to it, in file order. Consecutive
 * `User-agent:` lines (before any rule line) are treated as a group that
 * shares the rules which follow, per the robots.txt spec.
 */
function parseBlocks(robotsTxt: string): RobotsBlock[] {
  const blocks: RobotsBlock[] = [];
  let currentGroup: RobotsBlock[] = [];
  let groupHasRules = false;

  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();

    if (key === 'user-agent') {
      if (groupHasRules) {
        currentGroup = [];
        groupHasRules = false;
      }
      const block: RobotsBlock = { userAgent: value, rules: [] };
      blocks.push(block);
      currentGroup.push(block);
    } else if (key === 'allow' || key === 'disallow') {
      if (currentGroup.length === 0) continue; // rule before any User-agent — ignore
      groupHasRules = true;
      for (const block of currentGroup) {
        block.rules.push({ type: key, path: value });
      }
    }
  }

  return blocks;
}

/**
 * Whether a block disallows the whole site. Only root-level rules ("/" or
 * the empty "Disallow:" that means "disallow nothing") are considered —
 * this is a site-wide access check, not full path-level robots.txt
 * compliance. The last matching directive in file order wins, which is how
 * a specific Allow placed after a blanket Disallow (or vice versa) is
 * conventionally resolved for an exact-path match.
 */
function blockDisallowsRoot(block: RobotsBlock): boolean {
  let blocked = false;
  for (const rule of block.rules) {
    if (rule.path === '/') {
      blocked = rule.type === 'disallow';
    } else if (rule.path === '' && rule.type === 'disallow') {
      blocked = false; // "Disallow:" with no path means allow everything
    }
  }
  return blocked;
}

/**
 * Determine one crawler's access: check its own User-agent block first,
 * fall back to the wildcard `User-agent: *` block, and if neither exists,
 * it's "not mentioned" — which robots.txt treats as allowed by default.
 */
export function checkCrawlerAccess(robotsTxt: string, crawler: string): CrawlerAccess {
  const blocks = parseBlocks(robotsTxt || '');
  const specific = blocks.find(b => b.userAgent.toLowerCase() === crawler.toLowerCase());
  if (specific) {
    return blockDisallowsRoot(specific) ? 'blocked' : 'allowed';
  }
  const wildcard = blocks.find(b => b.userAgent === '*');
  if (wildcard) {
    return blockDisallowsRoot(wildcard) ? 'blocked' : 'allowed';
  }
  return 'not_mentioned';
}

/** Check all tracked AI crawlers against a robots.txt body (or null/absent). */
export function checkAllCrawlers(robotsTxt: string | null): CrawlerStatus[] {
  const text = robotsTxt || '';
  return AI_CRAWLERS.map(crawler => ({ crawler, access: checkCrawlerAccess(text, crawler) }));
}

/**
 * Score a repo/site's AI-crawler access out of 17: 5 points for the file
 * existing, 3 points per crawler that isn't blocked (both "allowed" and
 * "not_mentioned" count, since robots.txt is opt-out — silence is not a
 * penalty). Crawler status is independent of file existence: a missing
 * robots.txt still means nothing is blocked, so every crawler scores as
 * not-blocked even when hasRobotsTxt is false.
 */
export function scoreAiCrawlerAccess(hasRobotsTxt: boolean, statuses: CrawlerStatus[]): number {
  let score = hasRobotsTxt ? 5 : 0;
  for (const s of statuses) {
    if (s.access !== 'blocked') score += 3;
  }
  return score;
}
