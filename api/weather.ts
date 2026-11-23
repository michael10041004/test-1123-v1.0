import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCorsHeaders } from './_lib/cors.js';
import { fetchWeatherFromOpenMeteo, WeatherServiceError } from './_lib/weatherService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  try {
    const rawLat = Array.isArray(req.query.lat) ? req.query.lat[0] : req.query.lat;
    const rawLon = Array.isArray(req.query.lon) ? req.query.lon[0] : req.query.lon;
    const weather = await fetchWeatherFromOpenMeteo(rawLat, rawLon);
    return res.status(200).json(weather);
  } catch (error) {
    if (error instanceof WeatherServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Weather serverless proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch weather information.' });
  }
}
