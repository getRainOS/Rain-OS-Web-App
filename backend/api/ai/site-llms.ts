import express from 'express';

/**
 * Plugin uses this to check backend capability.
 * Keep it lightweight and deterministic.
 */
export default async function handler(_req: express.Request, res: express.Response) {
  return res.status(200).json({
    available: true,
    engine: 'rain-os-ai-readiness',
    version: '1.0.0',
    features: {
      normalize: true,
      scores: true,
      diagnostics: true,
      recommendations: true,
    },
    timestamp: new Date().toISOString(),
  });
}
