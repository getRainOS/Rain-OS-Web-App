import { useState, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { refreshBackendAnalysis } from './useAIReadiness';

const pdEnabled = window.rainOsAeo?.pdEnabled !== false;

export const useContentAnalysis = (postId, title, content) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitStatus, setCommitStatus] = useState(null);

  const analyzeContent = useCallback(async () => {
    if (!content || content.trim().length < 50) {
      setStatusMessage({
        type: 'error',
        message: __('Please add more content before analyzing (minimum 50 characters).', 'rain-os-aeo-analyzer'),
      });
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage({
      type: 'info',
      message: __('Analyzing your content...', 'rain-os-aeo-analyzer'),
    });

    try {
      const response = await apiFetch({
        path: '/rain-os-aeo/v1/analyze',
        method: 'POST',
        data: {
          post_id: postId,
          title: title,
          content: content,
        },
      });

      if (response.success && response.data) {
        setAnalysisData({
          overallScore: response.data.overall_score || 0,
          pillars: {
            aiReadability: {
              score: response.data.ai_readability || 0,
              label: 'AI Readability',
              color: '#22d3ee',
            },
            digitalAuthority: {
              score: response.data.digital_authority || 0,
              label: 'Digital Authority',
              color: '#10b981',
            },
            conversionReadiness: {
              score: response.data.conversion_readiness || 0,
              label: 'Conversion Readiness',
              color: '#a855f7',
            },
            ...(pdEnabled ? {
              productDiscoverability: {
                score: response.data.product_discoverability || 0,
                label: 'Product Discoverability',
                color: '#f97316',
              },
            } : {}),
          },
          subScores: {
            ...(response.data.sub_scores || {}),
            ...(response.data.phase2_sub_scores || {}),
          },
          aiReadabilityDetail:          response.data.ai_readability_detail || null,
          digitalAuthorityDetail:       response.data.digital_authority_detail || null,
          conversionReadinessDetail:    response.data.conversion_readiness_detail || null,
          productDiscoverabilityDetail: response.data.product_discoverability_detail || null,
          authorship:      response.data.authorship || null,
          keywords:        response.data.keywords || [],
          recommendations: response.data.recommendations || [],
        });

        setStatusMessage({
          type: 'success',
          message: __('Analysis complete!', 'rain-os-aeo-analyzer'),
        });

        setTimeout(() => setStatusMessage(null), 3000);

        refreshBackendAnalysis(
          postId,
          response.data.recommendations || [],
          setAnalysisData
        );
      } else {
        throw new Error(response.message || 'Analysis failed');
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: error.message || __('Failed to analyze content. Please try again.', 'rain-os-aeo-analyzer'),
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [postId, title, content]);

  const commitContent = useCallback(async () => {
    if (!content || content.trim().length < 50) {
      setCommitStatus({
        type: 'error',
        message: __('Please add more content before committing.', 'rain-os-aeo-analyzer'),
      });
      return;
    }

    setIsCommitting(true);
    setCommitStatus({
      type: 'info',
      message: __('Committing content...', 'rain-os-aeo-analyzer'),
    });

    try {
      const response = await apiFetch({
        path: '/rain-os-aeo/v1/normalize',
        method: 'POST',
        data: {
          post_id: postId,
          title: title,
          content: content,
        },
      });

      if (response.success) {
        setCommitStatus({
          type: 'info',
          message: __('Processing...', 'rain-os-aeo-analyzer'),
        });

        let attempts = 0;
        const maxAttempts = 10;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const statusResponse = await apiFetch({
              path: `/rain-os-aeo/v1/normalize/status/${response.task_id}`,
            });

            if (statusResponse.status === 'complete') {
              clearInterval(pollInterval);
              setCommitStatus({
                type: 'success',
                message: __('Content committed successfully!', 'rain-os-aeo-analyzer'),
              });
              setIsCommitting(false);
              setTimeout(() => setCommitStatus(null), 3000);

              refreshBackendAnalysis(
                postId,
                analysisData?.recommendations || [],
                setAnalysisData
              );
            } else if (statusResponse.status === 'failed') {
              clearInterval(pollInterval);
              setCommitStatus({
                type: 'error',
                message: statusResponse.message || __('Commit failed.', 'rain-os-aeo-analyzer'),
              });
              setIsCommitting(false);
            } else if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setCommitStatus({
                type: 'success',
                message: __('Content queued for processing.', 'rain-os-aeo-analyzer'),
              });
              setIsCommitting(false);
            }
          } catch (pollError) {
            if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setIsCommitting(false);
            }
          }
        }, 2000);
      } else {
        throw new Error(response.message || 'Commit failed');
      }
    } catch (error) {
      setCommitStatus({
        type: 'error',
        message: error.message || __('Failed to commit content.', 'rain-os-aeo-analyzer'),
      });
      setIsCommitting(false);
    }
  }, [postId, title, content, analysisData]);

  return {
    analysisData,
    isAnalyzing,
    analyzeContent,
    statusMessage,
    commitContent,
    isCommitting,
    commitStatus,
  };
};
