import type { AIRecommendation } from '../../../types';

export function visibilityRecommendations(): AIRecommendation[] {
  return [
    {
      scope: 'document',
      category: 'visibility',
      severity: 'low',
      issue: 'Weak semantic anchors',
      recommendation: 'Clarify key concepts and definitions early in the content.',
      expectedImpact: 5,
    },
    {
      scope: 'document',
      category: 'visibility',
      severity: 'medium',
      issue: 'Missing schema markup',
      recommendation: 'Add JSON-LD structured data to help AI systems understand the content type and context.',
      expectedImpact: 10,
      artifact: {
        type: 'json-ld',
        content: `<script type="application/ld+json">\n${JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': 'Your Article Title',
          'author': {
            '@type': 'Person',
            'name': 'Author Name',
          },
          'datePublished': new Date().toISOString().split('T')[0],
          'dateModified': new Date().toISOString().split('T')[0],
          'description': 'A short description of the article.',
        }, null, 2)}\n</script>`,
        filename: 'schema.json',
      },
    },
  ];
}
