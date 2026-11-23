import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCorsHeaders } from './_lib/cors.js';
import { generateOutfitRecommendation, OutfitServiceError } from './_lib/outfitService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, 'POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const recommendation = await generateOutfitRecommendation(req.body);
    return res.status(200).json(recommendation);
  } catch (error) {
    if (error instanceof OutfitServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Recommend outfit serverless error:', error);
    return res.status(500).json({ error: 'Failed to generate outfit recommendation.' });
  }
}
