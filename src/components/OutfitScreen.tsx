import React from 'react';
import { AlertCircle, Home, Loader2, RefreshCw } from 'lucide-react';
import type {
  AgeGroup,
  GenderOption,
  OutfitRecommendation,
  StyleOption,
} from '../types/outfit';
import type { WeatherInfo } from '../utils/weather';

interface OutfitScreenProps {
  age: AgeGroup;
  gender: GenderOption;
  styleOption: StyleOption;
  locationLabel: string;
  weather: WeatherInfo;
  status: 'loading' | 'success' | 'error';
  recommendation: OutfitRecommendation | null;
  onRetryRecommend: () => void;
  onRestart: () => void;
}

const OUTFIT_ROWS: Array<{
  key: keyof Pick<OutfitRecommendation, '겉옷' | '상의' | '하의' | '신발' | '소품'>;
  emoji: string;
  label: string;
}> = [
  { key: '겉옷', emoji: '🧥', label: '겉옷' },
  { key: '상의', emoji: '👕', label: '상의' },
  { key: '하의', emoji: '👖', label: '하의' },
  { key: '신발', emoji: '👟', label: '신발' },
  { key: '소품', emoji: '🎒', label: '소품' },
];

export default function OutfitScreen({
  age,
  gender,
  styleOption,
  locationLabel,
  weather,
  status,
  recommendation,
  onRetryRecommend,
  onRestart,
}: OutfitScreenProps) {
  const isLoading = status === 'loading';
  const { Illustration } = styleOption;

  return (
    <div className="space-y-7 sm:space-y-9">
      {/* Page Heading */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl [text-wrap:balance]">
          오늘의 옷차림
        </h1>
      </section>

      {/* Top 1-Line Weather Summary */}
      <section aria-label="오늘 날씨 요약">
        <div className="rounded-2xl border border-sky-200 bg-sky-100/75 px-4 py-3.5 text-base font-semibold text-sky-950 sm:px-5 sm:text-lg tabular-nums">
          <span className="mr-1.5" aria-hidden="true">
            {weather.emoji}
          </span>
          <span>
            {locationLabel} · 지금 {weather.currentTemp}℃ (체감 {weather.apparentTemp}℃) ·{' '}
            {weather.conditionLabel} · 최저 {weather.minTemp}℃ / 최고 {weather.maxTemp}℃ · 비 올 확률{' '}
            {weather.precipitationProbability}%
          </span>
        </div>
      </section>

      {/* Recommendation Area: Loading / Error / Single Outfit Card */}
      <section aria-live="polite">
        {isLoading && (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-sky-200 bg-white px-6 py-14 text-center shadow-sm">
            <Loader2 className="h-12 w-12 animate-spin text-sky-600" aria-hidden="true" />
            <p className="mt-5 text-xl font-bold text-sky-950 sm:text-2xl">
              AI가 옷을 고르는 중이에요…
            </p>
            <p className="mt-2 text-base text-slate-600 sm:text-lg">
              오늘 날씨와 {styleOption.name} 스타일에 꼭 맞게 맞추고 있어요.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div
            role="alert"
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-amber-300 bg-amber-50 px-6 py-12 text-center shadow-sm"
          >
            <AlertCircle className="h-12 w-12 text-amber-600" aria-hidden="true" />
            <p className="mt-4 text-xl font-bold text-amber-950 sm:text-2xl [text-wrap:balance]">
              지금은 추천할 수 없어요. 잠시 후 다시 눌러 주세요
            </p>
          </div>
        )}

        {status === 'success' && recommendation && (
          <article className="rounded-3xl border-2 border-sky-300 bg-white p-5 sm:p-8 shadow-sm">
            {/* Style Header with Illustration & Name */}
            <div className="flex items-center gap-4 border-b border-sky-100 pb-5 sm:gap-5">
              <Illustration selected className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {styleOption.name}
                </h2>
                <p className="mt-1 text-base font-medium text-sky-800 sm:text-lg">
                  {age} · {gender}
                </p>
              </div>
            </div>

            {/* 5 Outfit Item Rows */}
            <ul className="divide-y divide-sky-100 py-2">
              {OUTFIT_ROWS.map((row) => (
                <li
                  key={row.key}
                  className="flex items-start gap-3.5 py-4 sm:items-center sm:gap-4 sm:py-4"
                >
                  <span className="text-2xl leading-none sm:text-3xl shrink-0" aria-hidden="true">
                    {row.emoji}
                  </span>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                    <span className="min-w-[52px] text-base font-bold text-sky-800 sm:text-lg shrink-0">
                      {row.label}
                    </span>
                    <span className="text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
                      {recommendation[row.key]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Reason Section */}
            <div className="mt-2 rounded-2xl border border-sky-200/80 bg-sky-50/75 p-4 sm:p-5">
              <h3 className="text-lg font-bold text-sky-950 sm:text-xl">
                💡 추천 이유
              </h3>
              <p className="mt-2 text-lg leading-relaxed text-slate-800 sm:text-xl">
                {recommendation.추천이유}
              </p>
            </div>
          </article>
        )}
      </section>

      {/* Bottom Action Buttons: '다시 추천받기' & '처음으로' */}
      <section className="flex flex-col gap-3 pt-1 sm:flex-row">
        <button
          type="button"
          disabled={isLoading}
          onClick={onRetryRecommend}
          className={`flex h-16 flex-1 items-center justify-center gap-2 rounded-2xl px-6 text-lg font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 sm:h-[68px] sm:text-xl whitespace-nowrap ${
            isLoading
              ? 'bg-slate-200 text-slate-400 border border-slate-300/80 cursor-not-allowed'
              : 'bg-sky-600 text-white shadow-lg shadow-sky-600/25 hover:bg-sky-700 active:scale-[0.99] cursor-pointer'
          }`}
        >
          <RefreshCw className="h-5 w-5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
          <span>다시 추천받기</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={onRestart}
          className={`flex h-16 items-center justify-center gap-2 rounded-2xl border-[1.5px] px-6 text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 sm:h-[68px] sm:px-8 sm:text-xl whitespace-nowrap ${
            isLoading
              ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'border-sky-300 bg-white text-sky-900 hover:bg-sky-50 active:scale-[0.99] cursor-pointer'
          }`}
        >
          <Home className="h-5 w-5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
          <span>처음으로</span>
        </button>
      </section>
    </div>
  );
}
