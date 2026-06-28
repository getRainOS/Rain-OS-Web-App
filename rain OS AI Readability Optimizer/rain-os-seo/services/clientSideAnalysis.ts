/**
 * Rain OS SEO Analyzer - Client-Side Analysis Service
 * TypeScript implementation for client-side content analysis logic
 */

interface AnalysisResult {
  overallScore: number;
  pillarScores: PillarScores;
  subScores: SubScore[];
  recommendations: string[];
  keywords: string[];
  authorship: AuthorshipData;
}

interface PillarScores {
  aiReadability: number;
  digitalAuthority: number;
  conversionReadiness: number;
}

interface SubScore {
  category: string;
  score: number;
  weight: number;
}

interface AuthorshipData {
  hash: string;
  timestamp: string;
  status: string;
}

interface UsageInfo {
  used: number;
  limit: number;
  resetDate: string;
}

interface QuickToolResult {
  success: boolean;
  data: {
    titles?: string[];
    description?: string;
    summary?: string;
    rewritten?: string;
  };
}

export class ClientSideAnalysis {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor(apiBaseUrl: string, apiKey: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey;
  }

  async analyzeContent(content: string, industry: string): Promise<AnalysisResult> {
    const response = await this.makeRequest('/api/analyze', {
      action: 'full_analysis',
      content,
      industry
    });

    return this.parseAnalysisResponse(response);
  }

  async suggestTitles(content: string): Promise<string[]> {
    const response = await this.makeRequest('/api/analyze', {
      action: 'suggest_titles',
      content
    });
    return response.titles || [];
  }

  async generateDescription(content: string): Promise<string> {
    const response = await this.makeRequest('/api/analyze', {
      action: 'generate_description',
      content
    });
    return response.description || '';
  }

  async summarizeContent(content: string): Promise<string> {
    const response = await this.makeRequest('/api/analyze', {
      action: 'summarize_content',
      content
    });
    return response.summary || '';
  }

  async rewriteSentence(sentence: string): Promise<string> {
    const response = await this.makeRequest('/api/analyze', {
      action: 'rewrite_sentence',
      sentence
    });
    return response.rewritten || '';
  }

  private async makeRequest(endpoint: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(data)
    });

    const usageInfo = this.parseUsageHeader(response);
    if (usageInfo) {
      this.dispatchUsageUpdate(usageInfo);
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  parseUsageHeader(response: Response): UsageInfo | null {
    const usageHeader = response.headers.get('X-Usage-Info');
    if (!usageHeader) return null;

    try {
      const parsed = JSON.parse(usageHeader);
      return {
        used: parsed.used || 0,
        limit: parsed.limit || 100,
        resetDate: parsed.resetDate || ''
      };
    } catch {
      return null;
    }
  }

  private dispatchUsageUpdate(usage: UsageInfo): void {
    const event = new CustomEvent('rainos:usage-update', {
      detail: usage
    });
    document.dispatchEvent(event);
  }

  private parseAnalysisResponse(response: Record<string, unknown>): AnalysisResult {
    return {
      overallScore: (response.overallScore as number) || 0,
      pillarScores: {
        aiReadability: (response.pillarScores as PillarScores)?.aiReadability || 0,
        digitalAuthority: (response.pillarScores as PillarScores)?.digitalAuthority || 0,
        conversionReadiness: (response.pillarScores as PillarScores)?.conversionReadiness || 0
      },
      subScores: (response.subScores as SubScore[]) || [],
      recommendations: (response.recommendations as string[]) || [],
      keywords: (response.keywords as string[]) || [],
      authorship: {
        hash: (response.authorship as AuthorshipData)?.hash || '',
        timestamp: (response.authorship as AuthorshipData)?.timestamp || '',
        status: (response.authorship as AuthorshipData)?.status || 'unverified'
      }
    };
  }

  generateContentCustomHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  calculateLocalReadabilityScore(content: string): number {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = words.length / Math.max(1, sentences.length);
    
    let score = 100;
    if (avgWordsPerSentence > 25) score -= 15;
    if (avgWordsPerSentence > 35) score -= 20;
    if (avgWordsPerSentence < 5) score -= 10;
    
    const longWords = words.filter(w => w.length > 12).length;
    const longWordRatio = longWords / Math.max(1, words.length);
    if (longWordRatio > 0.2) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  }

  getSubScoreDescriptions(): Record<string, { why: string; recommendations: string[] }> {
    return {
      'Semantic Clarity': {
        why: 'Measures how precisely and unambiguously your content communicates its message. High semantic clarity helps AI systems accurately understand and represent your content.',
        recommendations: [
          'Use specific, concrete language instead of vague terms',
          'Define technical terms when first introduced',
          'Ensure pronouns have clear antecedents',
          'Avoid ambiguous phrases that could be misinterpreted'
        ]
      },
      'Logical Structure': {
        why: 'Evaluates how well your content is organized. A clear hierarchy helps both readers and AI systems navigate and understand your content.',
        recommendations: [
          'Use proper heading hierarchy (H1 > H2 > H3)',
          'Group related content under appropriate headings',
          'Use transition sentences between sections',
          'Ensure each section has a clear purpose'
        ]
      },
      'Readability': {
        why: 'Measures how easy your content is to read. Content with high readability is more likely to be quoted by AI systems.',
        recommendations: [
          'Keep sentences concise (under 25 words)',
          'Use active voice when possible',
          'Break up long paragraphs',
          'Use bullet points for lists'
        ]
      },
      'Entity Recognition': {
        why: 'Measures how well your content identifies and connects to known entities. This helps AI systems understand context.',
        recommendations: [
          'Link to authoritative sources',
          'Mention full names on first reference',
          'Include structured data markup',
          'Reference established concepts explicitly'
        ]
      },
      'Citation Readiness': {
        why: 'Evaluates how quotable your content is. AI systems prefer to cite clear, definitive statements.',
        recommendations: [
          'Include clear, quotable statements',
          'Use definitions and statistics',
          'Avoid hedging language',
          'Provide concrete examples'
        ]
      },
      'AEO Alignment': {
        why: 'Measures how well your content is structured to provide direct answers to common questions.',
        recommendations: [
          'Answer questions directly in the first sentence',
          'Use question-based headings',
          'Include FAQ sections',
          'Provide concise, complete answers'
        ]
      }
    };
  }
}

export default ClientSideAnalysis;
