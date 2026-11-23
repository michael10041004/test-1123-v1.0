import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronLeft,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
} from 'lucide-react';
import {
  District,
  findNearestRegionLabel,
  KOREA_REGIONS,
  RegionGroup,
} from '../data/koreaLocations';
import type { SelectedLocationInfo } from '../types/outfit';
import { fetchOpenMeteoWeather, WeatherInfo } from '../utils/weather';

interface SelectedCoords {
  label: string;
  lat: number;
  lon: number;
  source: 'gps' | 'manual';
}

interface WeatherScreenProps {
  onBack: () => void;
  onRecommend: (locationInfo: SelectedLocationInfo) => void;
}

export default function WeatherScreen({ onBack, onRecommend }: WeatherScreenProps) {
  const [geoStatus, setGeoStatus] = useState<'idle' | 'checking' | 'granted' | 'denied'>('idle');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [activeLocation, setActiveLocation] = useState<SelectedCoords | null>(null);

  const [weatherStatus, setWeatherStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [missingNotice, setMissingNotice] = useState(false);

  const locationSectionRef = useRef<HTMLElement | null>(null);
  const weatherSectionRef = useRef<HTMLElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const manualOverrideRef = useRef(false);

  const loadWeatherForCoords = useCallback(async (lat: number, lon: number) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setWeatherStatus('loading');
    setWeather(null);

    try {
      const result = await fetchOpenMeteoWeather(lat, lon, controller.signal);
      if (!controller.signal.aborted) {
        setWeather(result);
        setWeatherStatus('success');
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      }
      if (!controller.signal.aborted) {
        setWeatherStatus('error');
      }
    }
  }, []);

  const requestGeolocation = useCallback((isManualRetry = false) => {
    if (isManualRetry) {
      manualOverrideRef.current = false;
    }

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGeoStatus('denied');
      return;
    }

    setGeoStatus('checking');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (manualOverrideRef.current && !isManualRetry) {
          return;
        }
        const { latitude, longitude } = position.coords;
        const nearestLabel = findNearestRegionLabel(latitude, longitude);
        setGeoStatus('granted');
        setSelectedCity(null);
        setSelectedDistrict(null);
        setMissingNotice(false);
        setActiveLocation({
          label: nearestLabel === '현재 위치' ? '현재 위치' : `현재 위치 (${nearestLabel})`,
          lat: latitude,
          lon: longitude,
          source: 'gps',
        });
        loadWeatherForCoords(latitude, longitude);
      },
      () => {
        if (manualOverrideRef.current && !isManualRetry) {
          return;
        }
        setGeoStatus('denied');
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }, [loadWeatherForCoords]);

  useEffect(() => {
    requestGeolocation(false);
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [requestGeolocation]);

  const handleSelectCity = (cityName: string) => {
    manualOverrideRef.current = true;
    setSelectedCity(cityName);
    setSelectedDistrict(null);
    setMissingNotice(false);
  };

  const handleSelectDistrict = (city: string, district: District) => {
    manualOverrideRef.current = true;
    setSelectedCity(city);
    setSelectedDistrict(district.name);
    setMissingNotice(false);
    setActiveLocation({
      label: `${city} ${district.name}`,
      lat: district.lat,
      lon: district.lon,
      source: 'manual',
    });
    loadWeatherForCoords(district.lat, district.lon);
  };

  const handleRecommendClick = () => {
    if (!activeLocation || weatherStatus !== 'success' || !weather) {
      setMissingNotice(true);
      locationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setMissingNotice(false);
    onRecommend({
      label: activeLocation.label,
      lat: activeLocation.lat,
      lon: activeLocation.lon,
      weather,
    });
  };

  const activeRegionGroup: RegionGroup | undefined = KOREA_REGIONS.find(
    (region) => region.city === selectedCity,
  );

  const locationPromptText =
    geoStatus === 'denied' && !activeLocation
      ? '위치를 찾지 못했어요. 지역을 골라 주세요'
      : '지역을 골라 주세요';

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Page Heading */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl [text-wrap:balance]">
          오늘 날씨
        </h1>
        <p className="mt-2 text-lg leading-relaxed text-slate-600 sm:text-xl">
          지금 계신 곳이나 외출할 지역을 고르면 오늘 날씨를 알려드려요.
        </p>
      </section>

      {/* 1. Location Selection Card */}
      <section
        ref={locationSectionRef}
        aria-labelledby="location-heading"
        className={`rounded-3xl bg-white p-5 sm:p-7 shadow-sm transition-colors ${
          missingNotice && !activeLocation
            ? 'border-2 border-amber-500'
            : 'border border-sky-200/80'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-6 w-6 shrink-0 text-sky-600" aria-hidden="true" />
            <h2 id="location-heading" className="text-xl font-bold text-slate-900 sm:text-2xl">
              위치 선택
            </h2>
          </div>

          <button
            type="button"
            onClick={() => requestGeolocation(true)}
            disabled={geoStatus === 'checking'}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-base font-semibold text-sky-800 transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-60 cursor-pointer whitespace-nowrap"
          >
            {geoStatus === 'checking' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
                <span>위치 찾는 중…</span>
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>현재 위치 찾기</span>
              </>
            )}
          </button>
        </div>

        {/* Location Prompt Banner */}
        <div
          role={geoStatus === 'denied' && !activeLocation ? 'alert' : 'status'}
          className={`mt-4 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-base sm:text-lg font-semibold ${
            geoStatus === 'denied' && !activeLocation
              ? 'bg-amber-50 text-amber-900 border border-amber-300'
              : activeLocation
                ? 'bg-sky-50 text-sky-900 border border-sky-200'
                : 'bg-sky-50/80 text-sky-900 border border-sky-200/70'
          }`}
        >
          <AlertCircle
            className={`h-5 w-5 shrink-0 ${
              geoStatus === 'denied' && !activeLocation ? 'text-amber-600' : 'text-sky-600'
            }`}
            aria-hidden="true"
          />
          <span>
            {activeLocation
              ? `선택된 위치: ${activeLocation.label} (다른 지역을 고르려면 아래에서 눌러 주세요)`
              : locationPromptText}
          </span>
        </div>

        {/* City List */}
        <div className="mt-5">
          <div className="mb-3 text-base font-semibold text-slate-700 sm:text-lg">
            지역 목록
          </div>
          <div
            role="radiogroup"
            aria-label="시·도 지역 선택"
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {KOREA_REGIONS.map((region) => {
              const isSelected = selectedCity === region.city;
              return (
                <button
                  key={region.city}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectCity(region.city)}
                  className={`min-h-[58px] rounded-2xl px-4 py-3 text-lg sm:text-xl font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 active:scale-[0.98] whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-sky-600 text-white border-[3px] border-sky-700 shadow-md shadow-sky-600/20'
                      : 'bg-sky-50/50 text-slate-800 border-[1.5px] border-sky-200 hover:border-sky-400 hover:bg-sky-50'
                  }`}
                >
                  {isSelected && <Check className="h-5 w-5 shrink-0" strokeWidth={3} aria-hidden="true" />}
                  <span>{region.city}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-district List (구 / 군·구) */}
        {activeRegionGroup && (
          <div className="mt-6 border-t border-sky-100 pt-5">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <span className="text-base font-bold text-sky-900 sm:text-lg">
                {activeRegionGroup.city} · {activeRegionGroup.subLabel}
              </span>
              <span className="text-sm font-medium text-slate-500 sm:text-base">
                {selectedDistrict ? `${selectedDistrict} 선택됨` : '세부 지역을 눌러 주세요'}
              </span>
            </div>

            <div
              role="radiogroup"
              aria-label={`${activeRegionGroup.city} ${activeRegionGroup.subLabel}`}
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-5"
            >
              {activeRegionGroup.districts.map((district) => {
                const isDistrictSelected =
                  selectedCity === activeRegionGroup.city && selectedDistrict === district.name;
                return (
                  <button
                    key={district.name}
                    type="button"
                    role="radio"
                    aria-checked={isDistrictSelected}
                    onClick={() => handleSelectDistrict(activeRegionGroup.city, district)}
                    className={`min-h-[52px] rounded-xl px-3 py-2.5 text-base sm:text-lg font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 active:scale-[0.98] whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                      isDistrictSelected
                        ? 'bg-sky-600 text-white border-[2.5px] border-sky-700 shadow-sm'
                        : 'bg-white text-slate-800 border border-sky-200 hover:border-sky-400 hover:bg-sky-50/70'
                    }`}
                  >
                    {isDistrictSelected && (
                      <Check className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden="true" />
                    )}
                    <span>{district.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. Weather Result Card */}
      {(weatherStatus !== 'idle' || activeLocation) && (
        <section
          ref={weatherSectionRef}
          aria-live="polite"
          aria-label="오늘 날씨 정보"
          className="rounded-3xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 via-white to-sky-100/70 p-6 sm:p-8 shadow-sm"
        >
          {weatherStatus === 'loading' && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-sky-600" aria-hidden="true" />
              <p className="mt-4 text-xl font-bold text-sky-950 sm:text-2xl">
                날씨를 확인하는 중…
              </p>
              {activeLocation && (
                <p className="mt-1.5 text-base font-medium text-slate-600 sm:text-lg">
                  {activeLocation.label}
                </p>
              )}
            </div>
          )}

          {weatherStatus === 'error' && activeLocation && (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <AlertCircle className="h-10 w-10 text-amber-600" aria-hidden="true" />
              <p className="mt-3 text-xl font-bold text-slate-900">
                날씨를 가져오지 못했어요.
              </p>
              <p className="mt-1 text-base text-slate-600 sm:text-lg">
                인터넷 연결을 확인한 뒤 다시 눌러 주세요.
              </p>
              <button
                type="button"
                onClick={() => loadWeatherForCoords(activeLocation.lat, activeLocation.lon)}
                className="mt-5 inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-lg font-bold text-white shadow-sm hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 cursor-pointer"
              >
                <RefreshCw className="h-5 w-5" aria-hidden="true" />
                <span>다시 확인하기</span>
              </button>
            </div>
          )}

          {weatherStatus === 'success' && weather && activeLocation && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200/80 pb-3">
                <span className="text-lg font-bold text-sky-800 sm:text-xl">
                  {activeLocation.label} 오늘 날씨
                </span>
                <button
                  type="button"
                  onClick={() => loadWeatherForCoords(activeLocation.lat, activeLocation.lon)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-sky-700 hover:bg-sky-100/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 cursor-pointer sm:text-base"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  <span>새로고침</span>
                </button>
              </div>

              {/* Large Primary Weather Line */}
              <div className="mt-5 text-2xl font-bold leading-snug text-slate-900 sm:text-3xl tabular-nums">
                <span className="mr-2 text-3xl sm:text-4xl" aria-hidden="true">
                  {weather.emoji}
                </span>
                <span>
                  지금 {weather.currentTemp}℃ (체감 {weather.apparentTemp}℃) · {weather.conditionLabel}
                </span>
              </div>

              {/* Large Secondary Today Summary Line */}
              <div className="mt-3 text-xl font-semibold leading-relaxed text-sky-950 sm:text-2xl tabular-nums">
                오늘 최저 {weather.minTemp}℃ · 최고 {weather.maxTemp}℃ · 비 올 확률 {weather.precipitationProbability}%
              </div>
            </div>
          )}
        </section>
      )}

      {/* Missing Location Notice before recommending */}
      {missingNotice && (!activeLocation || weatherStatus !== 'success') && (
        <div
          role="alert"
          className="flex items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-base font-semibold text-amber-900 sm:text-lg"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <span>지역과 세부 구·군을 먼저 골라 주세요.</span>
        </div>
      )}

      {/* Bottom Action Buttons: '이전' & '🤖 옷차림 추천받기' */}
      <section className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-16 shrink-0 items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-sky-300 bg-white px-5 text-lg font-bold text-sky-900 transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 active:scale-[0.99] cursor-pointer sm:h-[68px] sm:px-7 sm:text-xl whitespace-nowrap"
        >
          <ChevronLeft className="h-6 w-6 shrink-0" strokeWidth={2.4} aria-hidden="true" />
          <span>이전</span>
        </button>

        <button
          type="button"
          aria-disabled={weatherStatus !== 'success'}
          onClick={handleRecommendClick}
          className={`flex h-16 flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-lg font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 sm:h-[68px] sm:px-6 sm:text-2xl whitespace-nowrap ${
            weatherStatus === 'success'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25 hover:bg-sky-700 active:scale-[0.99] cursor-pointer'
              : 'bg-slate-200 text-slate-500 border border-slate-300/80 cursor-not-allowed'
          }`}
        >
          <span>🤖 옷차림 추천받기</span>
        </button>
      </section>
    </div>
  );
}
