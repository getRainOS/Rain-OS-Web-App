import express from 'express';

export default async function handler(_req: express.Request, res: express.Response) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
