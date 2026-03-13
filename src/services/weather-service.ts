import axios from 'axios';

// ─── Open-Meteo Weather API (free, no key) ────────────────────────────

export interface CurrentWeather {
  temperature: number; // °F
  windSpeed: number; // mph
  humidity: number; // %
  weatherCode: number;
  weatherLabel: string;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number; // inches
  weatherCode: number;
  weatherLabel: string;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
}

const WMO_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ hail',
  99: 'Thunderstorm w/ heavy hail',
};

export const WMO_ICONS: Record<number, string> = {
  0: 'wb_sunny',
  1: 'wb_sunny',
  2: 'partly_cloudy_day',
  3: 'cloud',
  45: 'foggy',
  48: 'foggy',
  51: 'grain',
  53: 'grain',
  55: 'grain',
  61: 'rainy',
  63: 'rainy',
  65: 'rainy',
  71: 'ac_unit',
  73: 'ac_unit',
  75: 'ac_unit',
  77: 'ac_unit',
  80: 'rainy',
  81: 'rainy',
  82: 'thunderstorm',
  85: 'ac_unit',
  86: 'ac_unit',
  95: 'thunderstorm',
  96: 'thunderstorm',
  99: 'thunderstorm',
};

function cToF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

function mmToInches(mm: number): number {
  return Math.round(mm * 0.0394 * 100) / 100;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = 'https://api.open-meteo.com/v1/forecast';
  const resp = await axios.get(url, {
    params: {
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
      temperature_unit: 'celsius',
      wind_speed_unit: 'mph',
      precipitation_unit: 'mm',
      forecast_days: 7,
      timezone: 'auto',
    },
  });

  const data = resp.data;
  const cur = data.current;

  const current: CurrentWeather = {
    temperature: cToF(cur.temperature_2m),
    windSpeed: Math.round(cur.wind_speed_10m),
    humidity: cur.relative_humidity_2m,
    weatherCode: cur.weather_code,
    weatherLabel: WMO_CODES[cur.weather_code] ?? 'Unknown',
    isDay: cur.is_day === 1,
  };

  const daily: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
    date,
    tempMax: cToF(data.daily.temperature_2m_max[i]),
    tempMin: cToF(data.daily.temperature_2m_min[i]),
    precipitationSum: mmToInches(data.daily.precipitation_sum[i]),
    weatherCode: data.daily.weather_code[i],
    weatherLabel: WMO_CODES[data.daily.weather_code[i]] ?? 'Unknown',
  }));

  return { current, daily };
}
