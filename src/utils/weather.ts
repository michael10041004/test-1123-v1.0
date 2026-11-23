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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export async function fetchOpenMeteoWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<WeatherInfo> {
  const params = new URLSearchParams({
    lat: lat.toFixed(4),
    lon: lon.toFixed(4),
  });

  const response = await fetch(`${API_BASE_URL}/api/weather?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Weather API proxy failed with status ${response.status}`);
  }

  const data = (await response.json()) as Partial<WeatherInfo>;
  if (
    typeof data.currentTemp !== 'number' ||
    typeof data.apparentTemp !== 'number' ||
    typeof data.conditionLabel !== 'string' ||
    typeof data.emoji !== 'string' ||
    typeof data.minTemp !== 'number' ||
    typeof data.maxTemp !== 'number' ||
    typeof data.precipitationProbability !== 'number'
  ) {
    throw new Error('Invalid weather response format');
  }

  return data as WeatherInfo;
}
