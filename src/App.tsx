import React, { useRef, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, ChevronRight, Sun } from 'lucide-react';
import OutfitScreen from './components/OutfitScreen';
import {
  ActiveWearIllustration,
  CasualIllustration,
  ClassicIllustration,
  NeatOutingIllustration,
} from './components/StyleIllustrations';
import WeatherScreen from './components/WeatherScreen';
import type {
  AgeGroup,
  GenderOption,
  OutfitRecommendation,
  SelectedLocationInfo,
  StyleId,
  StyleOption,
} from './types/outfit';

const AGE_OPTIONS: AgeGroup[] = ['20대', '30대', '40대', '50대', '60대', '70대 이상'];
const GENDER_OPTIONS: GenderOption[] = ['여성', '남성', '선택 안 함'];

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'casual',
    name: '편안한 캐주얼',
    description: '동네 산책·장보기, 편하고 무난하게',
    Illustration: CasualIllustration,
  },
  {
    id: 'neat',
    name: '단정한 외출복',
    description: '모임·병원·관공서, 깔끔하게',
    Illustration: NeatOutingIllustration,
  },
  {
    id: 'active',
    name: '활동적인 운동복',
    description: '걷기·등산·운동, 가볍고 따뜻하게',
    Illustration: ActiveWearIllustration,
  },
  {
    id: 'classic',
    name: '차분한 클래식',
    description: '격식 있는 자리, 고급스럽게',
    Illustration: ClassicIllustration,
  },
];

export default function App() {
  const [step, setStep] = useState<'about' | 'weather' | 'outfit'>('about');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [selectedGender, setSelectedGender] = useState<GenderOption | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleId | null>(null);
  const [attemptedNext, setAttemptedNext] = useState(false);

  const [locationInfo, setLocationInfo] = useState<SelectedLocationInfo | null>(null);
  const [outfitStatus, setOutfitStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null);

  const ageSectionRef = useRef<HTMLElement | null>(null);
  const genderSectionRef = useRef<HTMLElement | null>(null);
  const styleSectionRef = useRef<HTMLElement | null>(null);
  const recommendAbortRef = useRef<AbortController | null>(null);

  const getMissingFieldInfo = () => {
    if (!selectedAge) {
      return {
        label: '연령대',
        message: '연령대를 골라 주세요',
        ref: ageSectionRef,
      };
    }
    if (!selectedGender) {
      return {
        label: '성별',
        message: '성별을 골라 주세요',
        ref: genderSectionRef,
      };
    }
    if (!selectedStyle) {
      return {
        label: '선호하는 옷 스타일',
        message: '선호하는 옷 스타일을 골라 주세요',
        ref: styleSectionRef,
      };
    }
    return null;
  };

  const missingInfo = getMissingFieldInfo();
  const isComplete = missingInfo === null;

  const selectedStyleObj = STYLE_OPTIONS.find((item) => item.id === selectedStyle) ?? null;

  const handleNextClick = () => {
    if (!isComplete && missingInfo) {
      setAttemptedNext(true);
      missingInfo.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setAttemptedNext(false);
    setStep('weather');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAbout = () => {
    setStep('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const requestOutfitRecommendation = async (targetLocation: SelectedLocationInfo) => {
    if (!selectedAge || !selectedGender || !selectedStyleObj) {
      return;
    }

    if (recommendAbortRef.current) {
      recommendAbortRef.current.abort();
    }
    const controller = new AbortController();
    recommendAbortRef.current = controller;

    setOutfitStatus('loading');
    setRecommendation(null);

    try {
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
      const response = await fetch(`${apiBaseUrl}/api/recommend-outfit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          age: selectedAge,
          gender: selectedGender,
          styleName: selectedStyleObj.name,
          styleDescription: selectedStyleObj.description,
          currentTemp: targetLocation.weather.currentTemp,
          apparentTemp: targetLocation.weather.apparentTemp,
          conditionLabel: targetLocation.weather.conditionLabel,
          maxTemp: targetLocation.weather.maxTemp,
          minTemp: targetLocation.weather.minTemp,
          precipitationProbability: targetLocation.weather.precipitationProbability,
        }),
      });

      if (!response.ok) {
        throw new Error(`Recommendation request failed with status ${response.status}`);
      }

      const data = (await response.json()) as OutfitRecommendation;
      if (!controller.signal.aborted) {
        setRecommendation(data);
        setOutfitStatus('success');
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }
      if (!controller.signal.aborted) {
        setOutfitStatus('error');
      }
    }
  };

  const handleGoToOutfit = (selectedLocation: SelectedLocationInfo) => {
    setLocationInfo(selectedLocation);
    setStep('outfit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void requestOutfitRecommendation(selectedLocation);
  };

  const handleRetryRecommend = () => {
    if (!locationInfo || outfitStatus === 'loading') {
      return;
    }
    void requestOutfitRecommendation(locationInfo);
  };

  const handleRestart = () => {
    if (recommendAbortRef.current) {
      recommendAbortRef.current.abort();
    }
    setSelectedAge(null);
    setSelectedGender(null);
    setSelectedStyle(null);
    setAttemptedNext(false);
    setLocationInfo(null);
    setRecommendation(null);
    setOutfitStatus('loading');
    setStep('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100/80 via-[#F2F9FF] to-white text-slate-900">
      {/* Top Brand Header */}
      <header className="border-b border-sky-200/70 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-500/20"
              aria-hidden="true"
            >
              <Sun className="h-6 w-6" strokeWidth={2.3} />
            </span>
            <span className="text-xl font-bold tracking-tight text-sky-950 sm:text-2xl whitespace-nowrap shrink-0">
              나만의 코디
            </span>
          </div>
          <span className="text-sm font-semibold text-sky-700 sm:text-base whitespace-nowrap shrink-0">
            {step === 'about'
              ? '1단계 · 나에 대해'
              : step === 'weather'
                ? '2단계 · 오늘 날씨'
                : '3단계 · 오늘의 옷차림'}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-8 sm:pt-10">
        {step === 'outfit' && selectedAge && selectedGender && selectedStyleObj && locationInfo ? (
          <OutfitScreen
            age={selectedAge}
            gender={selectedGender}
            styleOption={selectedStyleObj}
            locationLabel={locationInfo.label}
            weather={locationInfo.weather}
            status={outfitStatus}
            recommendation={recommendation}
            onRetryRecommend={handleRetryRecommend}
            onRestart={handleRestart}
          />
        ) : step === 'weather' ? (
          <WeatherScreen onBack={handleBackToAbout} onRecommend={handleGoToOutfit} />
        ) : (
          <>
        {/* Page Heading */}
        <section className="mb-8 sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl [text-wrap:balance]">
            나에 대해
          </h1>
          <p className="mt-2 text-lg leading-relaxed text-slate-600 sm:text-xl">
            편안하고 알맞은 옷차림을 위해 세 가지를 골라 주세요.
          </p>
        </section>

        <div className="space-y-9 sm:space-y-11">
          {/* Top Row on Desktop: Age & Gender */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            {/* 1. 연령대 */}
            <section
              ref={ageSectionRef}
              aria-labelledby="age-heading"
              className={`rounded-3xl bg-white p-5 sm:p-7 lg:col-span-7 shadow-sm transition-colors ${
                attemptedNext && !selectedAge
                  ? 'border-2 border-amber-500'
                  : 'border border-sky-200/80'
              }`}
            >
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 id="age-heading" className="text-xl font-bold text-slate-900 sm:text-2xl">
                  연령대
                </h2>
                <span className="text-sm font-medium text-sky-700 sm:text-base">
                  {selectedAge ? `선택됨: ${selectedAge}` : '하나만 골라 주세요'}
                </span>
              </div>

              <div
                role="radiogroup"
                aria-labelledby="age-heading"
                className="grid grid-cols-2 gap-3 sm:grid-cols-3"
              >
                {AGE_OPTIONS.map((age) => {
                  const isSelected = selectedAge === age;
                  return (
                    <button
                      key={age}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setSelectedAge(age);
                        if (attemptedNext) setAttemptedNext(false);
                      }}
                      className={`min-h-[60px] sm:min-h-[64px] rounded-2xl px-4 py-3 text-lg sm:text-xl font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 active:scale-[0.98] whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-sky-600 text-white border-[3px] border-sky-700 shadow-md shadow-sky-600/20'
                          : 'bg-sky-50/50 text-slate-800 border-[1.5px] border-sky-200 hover:border-sky-400 hover:bg-sky-50'
                      }`}
                    >
                      {isSelected && <Check className="h-5 w-5 shrink-0" strokeWidth={3} aria-hidden="true" />}
                      <span>{age}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. 성별 */}
            <section
              ref={genderSectionRef}
              aria-labelledby="gender-heading"
              className={`rounded-3xl bg-white p-5 sm:p-7 lg:col-span-5 shadow-sm transition-colors ${
                attemptedNext && !selectedGender
                  ? 'border-2 border-amber-500'
                  : 'border border-sky-200/80'
              }`}
            >
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 id="gender-heading" className="text-xl font-bold text-slate-900 sm:text-2xl">
                  성별
                </h2>
                <span className="text-sm font-medium text-sky-700 sm:text-base">
                  {selectedGender ? `선택됨: ${selectedGender}` : '하나만 골라 주세요'}
                </span>
              </div>

              <div
                role="radiogroup"
                aria-labelledby="gender-heading"
                className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-1"
              >
                {GENDER_OPTIONS.map((gender) => {
                  const isSelected = selectedGender === gender;
                  return (
                    <button
                      key={gender}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setSelectedGender(gender);
                        if (attemptedNext) setAttemptedNext(false);
                      }}
                      className={`min-h-[60px] sm:min-h-[64px] rounded-2xl px-2 sm:px-4 py-3 text-[17px] sm:text-xl font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 active:scale-[0.98] whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-sky-600 text-white border-[3px] border-sky-700 shadow-md shadow-sky-600/20'
                          : 'bg-sky-50/50 text-slate-800 border-[1.5px] border-sky-200 hover:border-sky-400 hover:bg-sky-50'
                      }`}
                    >
                      {isSelected && <Check className="h-5 w-5 shrink-0" strokeWidth={3} aria-hidden="true" />}
                      <span>{gender}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* 3. 선호하는 옷 스타일 */}
          <section
            ref={styleSectionRef}
            aria-labelledby="style-heading"
            className={`rounded-3xl bg-white p-5 sm:p-7 shadow-sm transition-colors ${
              attemptedNext && !selectedStyle
                ? 'border-2 border-amber-500'
                : 'border border-sky-200/80'
            }`}
          >
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="style-heading" className="text-xl font-bold text-slate-900 sm:text-2xl">
                선호하는 옷 스타일
              </h2>
              <span className="text-sm font-medium text-sky-700 sm:text-base">
                {selectedStyleObj ? `선택됨: ${selectedStyleObj.name}` : '마음에 드는 스타일 하나를 골라 주세요'}
              </span>
            </div>

            <div
              role="radiogroup"
              aria-labelledby="style-heading"
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              {STYLE_OPTIONS.map((style) => {
                const isSelected = selectedStyle === style.id;
                const { Illustration } = style;
                return (
                  <label
                    key={style.id}
                    className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl p-4 sm:p-5 transition-all duration-150 focus-within:ring-4 focus-within:ring-sky-300 active:scale-[0.99] ${
                      isSelected
                        ? 'border-[3px] border-sky-600 bg-sky-50/90 shadow-md shadow-sky-200/60'
                        : 'border-[1.5px] border-sky-200/90 bg-white hover:border-sky-400 hover:bg-sky-50/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="preferred-style"
                      value={style.id}
                      checked={isSelected}
                      onChange={() => {
                        setSelectedStyle(style.id);
                        if (attemptedNext) setAttemptedNext(false);
                      }}
                      className="sr-only"
                    />

                    {/* Custom SVG Illustration */}
                    <div className="shrink-0">
                      <Illustration
                        selected={isSelected}
                        className="h-20 w-20 sm:h-22 sm:w-22 transition-transform duration-150 group-hover:scale-[1.03]"
                      />
                    </div>

                    {/* Style Name + 1-line Description */}
                    <div className="min-w-0 flex-1">
                      <div className="text-xl font-bold text-slate-900 sm:text-[22px]">
                        {style.name}
                      </div>
                      <p className="mt-1 text-base leading-snug text-slate-600 sm:text-[17px]">
                        {style.description}
                      </p>
                    </div>

                    {/* Visual Radio Button */}
                    <div
                      aria-hidden="true"
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isSelected
                          ? 'border-sky-600 bg-white'
                          : 'border-sky-300 bg-white group-hover:border-sky-500'
                      }`}
                    >
                      {isSelected && <span className="h-3.5 w-3.5 rounded-full bg-sky-600" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Bottom Guidance & '다음' Button */}
          <section className="pt-2">
            {/* Validation / Missing Field Message */}
            <div
              role={attemptedNext && !isComplete ? 'alert' : 'status'}
              aria-live="polite"
              className={`mb-4 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-center text-base sm:text-lg font-semibold transition-colors ${
                isComplete
                  ? 'bg-sky-100/80 text-sky-900'
                  : attemptedNext
                    ? 'bg-amber-50 text-amber-900 border border-amber-300'
                    : 'bg-sky-50 text-sky-800 border border-sky-200/70'
              }`}
            >
              {isComplete ? (
                <>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
                  <span>모두 골랐어요! 아래 &lsquo;다음&rsquo; 버튼을 눌러 주세요.</span>
                </>
              ) : (
                <>
                  <AlertCircle
                    className={`h-5 w-5 shrink-0 ${attemptedNext ? 'text-amber-600' : 'text-sky-600'}`}
                    aria-hidden="true"
                  />
                  <span>{missingInfo?.message}</span>
                </>
              )}
            </div>

            <button
              type="button"
              aria-disabled={!isComplete}
              onClick={handleNextClick}
              className={`flex h-16 w-full items-center justify-center gap-2 rounded-2xl px-6 text-xl font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 sm:h-[68px] sm:text-2xl ${
                isComplete
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25 hover:bg-sky-700 active:scale-[0.99] cursor-pointer'
                  : 'bg-slate-200 text-slate-500 border border-slate-300/80 cursor-not-allowed'
              }`}
            >
              <span>다음</span>
              <ChevronRight className="h-6 w-6 shrink-0" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </section>
        </div>
          </>
        )}
      </main>
    </div>
  );
}
