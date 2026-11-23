import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyCorsHeaders } from './api/_lib/cors.js';
import {
  generateOutfitRecommendation,
  OutfitServiceError,
} from './api/_lib/outfitService.js';
import {
  fetchWeatherFromOpenMeteo,
  WeatherServiceError,
} from './api/_lib/weatherService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());

app.options('/api/weather', (req, res) => {
  applyCorsHeaders(req, res, 'GET, OPTIONS');
  res.status(204).end();
});

app.get('/api/weather', async (req, res) => {
  applyCorsHeaders(req, res, 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const rawLat = Array.isArray(req.query.lat) ? req.query.lat[0] : req.query.lat;
    const rawLon = Array.isArray(req.query.lon) ? req.query.lon[0] : req.query.lon;
    const weather = await fetchWeatherFromOpenMeteo(rawLat, rawLon);
    res.json(weather);
  } catch (error) {
    if (error instanceof WeatherServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Weather proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch weather information.' });
  }
});

app.options('/api/recommend-outfit', (req, res) => {
  applyCorsHeaders(req, res, 'POST, OPTIONS');
  res.status(204).end();
});

app.post('/api/recommend-outfit', async (req, res) => {
  applyCorsHeaders(req, res, 'POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const recommendation = await generateOutfitRecommendation(req.body);
    res.json(recommendation);
  } catch (error) {
    if (error instanceof OutfitServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Gemini recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate outfit recommendation.' });
  }
});

async function startServer() {
  const distDir = path.resolve(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distDir);

  if (isProd) {
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
