import { useMemo } from '@wordpress/element';

export const useLocalAudit = (title, content) => {
  return useMemo(() => {
    const plainText = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const wordCount = plainText.split(/\s+/).filter(Boolean).length;

    const hasHeadings = /<h[1-6][^>]*>/i.test(content);
    const hasImages = /<img[^>]+>/i.test(content);
    const hasAltTags = /<img[^>]+alt\s*=\s*["'][^"']+["']/i.test(content);
    const hasInternalLinks = /<a[^>]+href\s*=\s*["']\/[^"']*["']/i.test(content) ||
      /<a[^>]+href\s*=\s*["']#[^"']*["']/i.test(content);
    const hasExternalLinks = /<a[^>]+href\s*=\s*["']https?:\/\/[^"']+["']/i.test(content);

    return {
      hasTitle: title && title.trim().length > 0,
      hasContent: plainText.length > 100,
      hasHeadings,
      hasImages,
      hasAltTags: hasImages ? hasAltTags : true,
      hasInternalLinks,
      hasExternalLinks,
      wordCountOk: wordCount >= 300,
      wordCount,
    };
  }, [title, content]);
};
