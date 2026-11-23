import type React from 'react';
import type { WeatherInfo } from '../utils/weather';

export type AgeGroup = '20대' | '30대' | '40대' | '50대' | '60대' | '70대 이상';
export type GenderOption = '여성' | '남성' | '선택 안 함';
export type StyleId = 'casual' | 'neat' | 'active' | 'classic';

export interface StyleOption {
  id: StyleId;
  name: string;
  description: string;
  Illustration: React.ComponentType<{ selected?: boolean; className?: string }>;
}

export interface SelectedLocationInfo {
  label: string;
  lat: number;
  lon: number;
  weather: WeatherInfo;
}

export interface OutfitRecommendation {
  겉옷: string;
  상의: string;
  하의: string;
  신발: string;
  소품: string;
  추천이유: string;
}
