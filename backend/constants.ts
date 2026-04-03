import type { SubScore } from './types';

export const SUB_SCORE_DEFINITIONS: { category: SubScore['category']; description: string; pillar: 'AI Readability' | 'Digital Authority' | 'Conversion Readiness' }[] = [
  { 
    category: 'Semantic Clarity', 
    description: 'Context-rich, unambiguous writing that is easy for AI to parse.',
    pillar: 'AI Readability',
  },
  { 
    category: 'Logical Structure', 
    description: 'Clear sectioning, headings, and chunking for logical flow.',
    pillar: 'AI Readability',
  },
  { 
    category: 'Descriptive Metadata', 
    description: 'Use of schema, alt text, and semantic HTML tags.',
    pillar: 'Digital Authority',
  },
  { 
    category: 'Entity Recognition', 
    description: 'Named entities linked to knowledge graphs (e.g., people, places).',
    pillar: 'Digital Authority',
  },
  { 
    category: 'Citation Readiness', 
    description: 'Quotable, verifiable statements that are easy to cite.',
    pillar: 'Digital Authority',
  },
  { 
    category: 'AEO Alignment', 
    description: 'How well the content provides a direct, conversational answer for AI. Precise, unambiguous language scores higher, while vague or easily misinterpreted text is penalized.',
    pillar: 'AI Readability',
  },
  { 
    category: 'Readability', 
    description: 'Sentence flow, balance, and human-friendly language.',
    pillar: 'AI Readability',
  },
  { 
    category: 'Schema Extraction', 
    description: 'Detection of structured data like Schema.org and FAQ formats.',
    pillar: 'Conversion Readiness',
  },
  { 
    category: 'QA-format Detection', 
    description: 'Question/answer structure for direct use in AI engines.',
    pillar: 'Conversion Readiness',
  }
];

export const INDUSTRIES = [
  'Technology',
  'Marketing & Advertising',
  'Healthcare & Wellness',
  'Finance & Fintech',
  'E-commerce & Retail',
  'Education',
  'Travel & Hospitality',
  'General / Other',
];