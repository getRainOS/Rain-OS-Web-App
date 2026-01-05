import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export const useAIReadiness = (postId) => {
  const [scores, setScores] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) return;

    const fetchScores = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFetch({
          path: `/rain-os-aeo/v1/ai-scores/${postId}`,
        });

        if (response.success && response.data) {
          setScores({
            readability: response.data.readability || 0,
            structure: response.data.structure || 0,
            freshness: response.data.freshness || 0,
            citationReadiness: response.data.citation_readiness || 0,
            aiVisibility: response.data.ai_visibility || 0,
          });
        } else {
          setScores(null);
        }
      } catch (err) {
        if (err.code !== 'no_scores') {
          setError(err.message || 'Failed to load AI scores');
        }
        setScores(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, [postId]);

  return { scores, isLoading, error };
};
