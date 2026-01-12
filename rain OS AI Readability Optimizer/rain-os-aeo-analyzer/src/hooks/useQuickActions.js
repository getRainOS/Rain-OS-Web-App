import { useState, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

export const useQuickActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const suggestTitles = useCallback(async (content, currentTitle) => {
    setIsLoading(true);
    setResults(null);

    try {
      const response = await apiFetch({
        path: '/rain-os-aeo/v1/quick-action',
        method: 'POST',
        data: {
          action: 'suggest_titles',
          content,
          title: currentTitle,
        },
      });

      if (response.success && response.data) {
        setResults({ titles: response.data.titles });
      }
    } catch (error) {
      console.error('Suggest titles failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateMeta = useCallback(async (content, title) => {
    setIsLoading(true);
    setResults(null);

    try {
      const response = await apiFetch({
        path: '/rain-os-aeo/v1/quick-action',
        method: 'POST',
        data: {
          action: 'generate_meta',
          content,
          title,
        },
      });

      if (response.success && response.data) {
        setResults({ meta: { text: response.data.meta_description } });
      }
    } catch (error) {
      console.error('Generate meta failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const summarizeContent = useCallback(async (content) => {
    setIsLoading(true);
    setResults(null);

    try {
      const response = await apiFetch({
        path: '/rain-os-aeo/v1/quick-action',
        method: 'POST',
        data: {
          action: 'summarize',
          content,
        },
      });

      if (response.success && response.data) {
        setResults({ summary: response.data.summary });
      }
    } catch (error) {
      console.error('Summarize failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rewriteSelection = useCallback(async (selectedText) => {
    if (!selectedText || selectedText.trim().length < 10) {
      setResults({
        rewrite: {
          original: __('Please select some text first', 'rain-os-aeo-analyzer'),
          improved: __('Select at least 10 characters of text to rewrite.', 'rain-os-aeo-analyzer'),
        },
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response = await apiFetch({
        path: '/rain-os-aeo/v1/quick-action',
        method: 'POST',
        data: {
          action: 'rewrite',
          content: selectedText,
        },
      });

      if (response.success && response.data) {
        setResults({
          rewrite: {
            original: selectedText,
            improved: response.data.rewritten,
          },
        });
      }
    } catch (error) {
      console.error('Rewrite failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    suggestTitles,
    generateMeta,
    summarizeContent,
    rewriteSelection,
    isLoading,
    results,
  };
};
