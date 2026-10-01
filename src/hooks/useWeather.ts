import { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  LucideIcon
} from 'lucide-react';

export interface WeatherInfo {
  temperature: number;
  description: string;
  Icon: LucideIcon;
  iconColor: string;
  location: string;
  isLoading: boolean;
  isRealtime: boolean;
}

interface CachedWeather {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  location: string;
  timestamp: number;
}

const CACHE_KEY = 'ambozini_weather_cache_v2';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

// Mapeamento WMO Weather Interpretation Codes (WMO 4677)
const mapWeatherDetails = (
  code: number,
  isDay: boolean
): { description: string; Icon: LucideIcon; iconColor: string } => {
  if (code === 0) {
    return isDay
      ? { description: 'Céu limpo', Icon: Sun, iconColor: 'text-amber-400' }
      : { description: 'Noite estrelada', Icon: Moon, iconColor: 'text-indigo-200' };
  }
  if (code === 1 || code === 2) {
    return isDay
      ? { description: 'Parcialmente nublado', Icon: CloudSun, iconColor: 'text-amber-300' }
      : { description: 'Parcialmente nublado', Icon: Moon, iconColor: 'text-indigo-200' };
  }
  if (code === 3) {
    return { description: 'Encoberto', Icon: Cloud, iconColor: 'text-stone-300' };
  }
  if (code === 45 || code === 48) {
    return { description: 'Nevoeiro / Névoa', Icon: CloudFog, iconColor: 'text-stone-300' };
  }
  if ([51, 53, 55, 56, 57].includes(code)) {
    return { description: 'Chuvisco', Icon: CloudDrizzle, iconColor: 'text-sky-300' };
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { description: 'Chuva', Icon: CloudRain, iconColor: 'text-sky-400' };
  }
  if ([95, 96, 99].includes(code)) {
    return { description: 'Trovoadas / Tempestade', Icon: CloudLightning, iconColor: 'text-yellow-400' };
  }
  return isDay
    ? { description: 'Tempo bom', Icon: Sun, iconColor: 'text-amber-400' }
    : { description: 'Noite limpa', Icon: Moon, iconColor: 'text-indigo-200' };
};

// Formatação amigável de cidade/estado (Ex: Campinas, SP)
const formatLocation = (data: { locality?: string; city?: string; principalSubdivisionCode?: string }): string => {
  const city = data.locality || data.city || 'Campinas';
  const stateCode = data.principalSubdivisionCode ? data.principalSubdivisionCode.replace('BR-', '') : '';
  return stateCode ? `${city}, ${stateCode}` : city;
};

export const useWeather = () => {
  const getInitialState = (): WeatherInfo => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedWeather = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          const details = mapWeatherDetails(parsed.weatherCode, parsed.isDay);
          return {
            temperature: parsed.temperature,
            description: details.description,
            Icon: details.Icon,
            iconColor: details.iconColor,
            location: parsed.location || 'Campinas, SP',
            isLoading: false,
            isRealtime: true
          };
        }
      }
    } catch {
      // Ignora falhas de parse de cache
    }

    const currentHour = new Date().getHours();
    const isDay = currentHour >= 6 && currentHour < 18;
    return {
      temperature: 24,
      description: isDay ? 'Tempo bom' : 'Noite calma',
      Icon: isDay ? CloudSun : Moon,
      iconColor: isDay ? 'text-amber-400' : 'text-indigo-200',
      location: 'Campinas, SP',
      isLoading: true,
      isRealtime: false
    };
  };

  const [weather, setWeather] = useState<WeatherInfo>(getInitialState);

  useEffect(() => {
    let isMounted = true;

    const fetchWeatherAndLocation = async (lat?: number, lon?: number) => {
      try {
        let latitude = lat;
        let longitude = lon;
        let resolvedLocation = 'Campinas, SP';

        // 1. Obtém a cidade/estado via serviço de geocodificação reverso gratuito (BigDataCloud)
        try {
          const geocodeUrl =
            latitude !== undefined && longitude !== undefined
              ? `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`
              : `https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=pt`;

          const geoRes = await fetch(geocodeUrl);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            resolvedLocation = formatLocation(geoData);
            if (latitude === undefined && geoData.latitude && geoData.longitude) {
              latitude = Number(geoData.latitude);
              longitude = Number(geoData.longitude);
            }
          }
        } catch {
          // Se falhar a geolocalização por IP, usa fallback da matriz
        }

        // Se ainda não temos coordenadas, usa o fallback da matriz (Campinas / SP)
        if (latitude === undefined || longitude === undefined) {
          latitude = -22.9099;
          longitude = -47.0626;
        }

        // 2. Consulta a temperatura e código meteorológico na Open-Meteo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&timezone=auto`;
        const res = await fetch(weatherUrl);
        if (!res.ok) throw new Error('Falha ao obter dados meteorológicos');

        const data = await res.json();
        const current = data.current;
        if (!current) throw new Error('Formato inesperado');

        const temp = Math.round(current.temperature_2m);
        const code = Number(current.weather_code ?? 0);
        const isDay = current.is_day === 1;

        // Salva em cache para 15 minutos
        try {
          const cachePayload: CachedWeather = {
            temperature: temp,
            weatherCode: code,
            isDay,
            location: resolvedLocation,
            timestamp: Date.now()
          };
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
        } catch {
          // Ignora se o sessionStorage estiver indisponível
        }

        if (isMounted) {
          const details = mapWeatherDetails(code, isDay);
          setWeather({
            temperature: temp,
            description: details.description,
            Icon: details.Icon,
            iconColor: details.iconColor,
            location: resolvedLocation,
            isLoading: false,
            isRealtime: true
          });
        }
      } catch (err) {
        console.warn('Erro ao atualizar clima e localização em tempo real:', err);
        if (isMounted) {
          setWeather((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    const loadData = () => {
      // Tenta obter coordenadas GPS precisas caso permitido pelo usuário
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            fetchWeatherAndLocation(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            // Em caso de recusa/bloqueio, usa geolocalização automática por IP
            fetchWeatherAndLocation();
          },
          { timeout: 4000, maximumAge: CACHE_TTL_MS }
        );
      } else {
        // Fallback por IP
        fetchWeatherAndLocation();
      }
    };

    loadData();

    // Recarrega a cada 15 minutos
    const interval = setInterval(loadData, CACHE_TTL_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return weather;
};
