export interface WeatherInfo {
  currentTemp: number;
  apparentTemp: number;
  weatherCode: number;
  conditionLabel: string;
  emoji: string;
  minTemp: number;
  maxTemp: number;
  precipitationProbability: number;
}

interface WeatherConditionMeta {
  label: string;
  emoji: string;
}

export class WeatherServiceError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'WeatherServiceError';
    this.statusCode = statusCode;
  }
}

export function mapWmoWeatherCode(code: number): WeatherConditionMeta {
  if (code === 0) {
    return { label: '맑음', emoji: '☀️' };
  }
  if (code === 1) {
    return { label: '맑음', emoji: '🌤️' };
  }
  if (code === 2) {
    return { label: '구름 조금', emoji: '⛅' };
  }
  if (code === 3) {
    return { label: '흐림', emoji: '☁️' };
  }
  if (code === 45 || code === 48) {
    return { label: '안개', emoji: '🌫️' };
  }
  if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) {
    return { label: '이슬비', emoji: '🌦️' };
  }
  if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67) {
    return { label: '비', emoji: '🌧️' };
  }
  if (code === 71 || code === 73 || code === 75 || code === 77) {
    return { label: '눈', emoji: '❄️' };
  }
  if (code === 80 || code === 81 || code === 82) {
    return { label: '소나기', emoji: '🌦️' };
  }
  if (code === 85 || code === 86) {
    return { label: '눈보라', emoji: '🌨️' };
  }
  if (code === 95 || code === 96 || code === 99) {
    return { label: '천둥번개', emoji: '⛈️' };
  }
  return { label: '흐림', emoji: '☁️' };
}

export async function fetchWeatherFromOpenMeteo(
  rawLat: unknown,
  rawLon: unknown,
): Promise<WeatherInfo> {
  const lat = Number(rawLat);
  const lon = Number(rawLon);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    throw new WeatherServiceError(400, 'Invalid latitude or longitude query parameters.');
  }

  const baseUrl = (
    process.env.WEATHER_API_BASE_URL || 'https://api.open-meteo.com/v1/forecast'
  ).replace(/\/$/, '');

  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: 'temperature_2m,apparent_temperature,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'Asia/Seoul',
    forecast_days: '1',
  });

  let response: Response;
  try {
    response = await fetch(`${baseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    if ((error as Error).name === 'TimeoutError' || (error as Error).name === 'AbortError') {
      throw new WeatherServiceError(504, 'Weather upstream request timed out.');
    }
    throw new WeatherServiceError(502, 'Failed to reach weather upstream service.');
  }

  if (!response.ok) {
    throw new WeatherServiceError(
      502,
      `Weather upstream service responded with status ${response.status}.`,
    );
  }

  const data = (await response.json()) as {
    current?: {
      temperature_2m?: unknown;
      apparent_temperature?: unknown;
      weather_code?: unknown;
    };
    daily?: {
      temperature_2m_min?: unknown[];
      temperature_2m_max?: unknown[];
      precipitation_probability_max?: unknown[];
    };
  };

  if (!data?.current || !data?.daily) {
    throw new WeatherServiceError(502, 'Invalid weather upstream response format.');
  }

  const weatherCode = Number(data.current.weather_code ?? 0);
  const meta = mapWmoWeatherCode(weatherCode);

  const currentTemp = Math.round(Number(data.current.temperature_2m));
  const apparentTemp = Math.round(Number(data.current.apparent_temperature));
  const minTemp = Math.round(Number(data.daily.temperature_2m_min?.[0] ?? currentTemp));
  const maxTemp = Math.round(Number(data.daily.temperature_2m_max?.[0] ?? currentTemp));
  const rawPrecip = data.daily.precipitation_probability_max?.[0];
  const precipitationProbability =
    rawPrecip === null || rawPrecip === undefined ? 0 : Math.round(Number(rawPrecip));

  if (!Number.isFinite(currentTemp) || !Number.isFinite(apparentTemp)) {
    throw new WeatherServiceError(502, 'Invalid temperature values from weather service.');
  }

  return {
    currentTemp,
    apparentTemp,
    weatherCode,
    conditionLabel: meta.label,
    emoji: meta.emoji,
    minTemp,
    maxTemp,
    precipitationProbability,
  };
}
