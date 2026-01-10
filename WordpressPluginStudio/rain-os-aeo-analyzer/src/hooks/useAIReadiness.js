import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const SEVERITY_MAP = {
  high: { icon: '🔴', color: '#ef4444' },
  medium: { icon: '🟠', color: '#f59e0b' },
  low: { icon: '💡', color: '#22d3ee' },
};

const CATEGORY_COLORS = {
  readability: '#22d3ee',
  structure: '#22d3ee',
  freshness: '#10b981',
  citation: '#10b981',
  visibility: '#a855f7',
};

const adaptBackendRecommendations = (backendRecs) => {
  if (!backendRecs || !Array.isArray(backendRecs)) return [];

  const seen = new Set();
  const adapted = [];

  for (const rec of backendRecs) {
    const stableKey = `${rec.category || ''}:${rec.scope || ''}:${rec.chunkId || ''}:${rec.issue || ''}:${rec.recommendation || ''}`;

    if (seen.has(stableKey)) continue;
    seen.add(stableKey);

    const severity = SEVERITY_MAP[rec.severity] || SEVERITY_MAP.low;
    const categoryColor = CATEGORY_COLORS[rec.category] || '#22d3ee';

    adapted.push({
      icon: severity.icon,
      title: rec.issue || 'Recommendation',
      description: rec.recommendation || '',
      color: categoryColor,
      _fromBackend: true,
    });
  }

  return adapted;
};

const mergeRecommendations = (existing, backendRecs) => {
  if (!backendRecs || backendRecs.length === 0) return existing || [];
  if (!existing || existing.length === 0) return backendRecs;

  const existingKeys = new Set(
    existing.map((r) => `${r.title || ''}:${r.description || ''}`)
  );

  const merged = [...existing];
  for (const rec of backendRecs) {
    const key = `${rec.title || ''}:${rec.description || ''}`;
    if (!existingKeys.has(key)) {
      merged.push(rec);
      existingKeys.add(key);
    }
  }

  return merged;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const backendAnalysisCache = new Map();

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

export const refreshBackendAnalysis = async (postId, currentRecommendations, setAnalysisData) => {
  if (!postId) return null;

  const cached = backendAnalysisCache.get(postId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    if (cached.data?.recommendations && cached.data.recommendations.length > 0) {
      const adaptedRecs = adaptBackendRecommendations(cached.data.recommendations);
      const mergedRecs = mergeRecommendations(currentRecommendations, adaptedRecs);

      if (setAnalysisData) {
        setAnalysisData((prev) =>
          prev
            ? {
                ...prev,
                recommendations: mergedRecs,
              }
            : null
        );
      }
    }
    return cached.data;
  }

  try {
    const response = await apiFetch({
      path: `/rain-os-aeo/v1/backend-analysis/${postId}`,
      parse: false,
    });

    if (response.status === 204) {
      backendAnalysisCache.set(postId, { data: null, timestamp: Date.now() });
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data) {
      backendAnalysisCache.set(postId, { data: null, timestamp: Date.now() });
      return null;
    }

    backendAnalysisCache.set(postId, { data, timestamp: Date.now() });

    if (data.recommendations && data.recommendations.length > 0) {
      const adaptedRecs = adaptBackendRecommendations(data.recommendations);
      const mergedRecs = mergeRecommendations(currentRecommendations, adaptedRecs);

      if (setAnalysisData) {
        setAnalysisData((prev) =>
          prev
            ? {
                ...prev,
                recommendations: mergedRecs,
              }
            : null
        );
      }
    }

    return data;
  } catch (err) {
    if (window.rainOsAeo?.debug) {
      console.log('Rain OS: Backend analysis fetch failed:', err);
    }
    return null;
  }
};
