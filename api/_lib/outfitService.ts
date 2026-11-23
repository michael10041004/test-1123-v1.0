import { GoogleGenAI, Type } from '@google/genai';

export interface RecommendRequestBody {
  age: string;
  gender: string;
  styleName: string;
  styleDescription?: string;
  currentTemp: number;
  apparentTemp: number;
  conditionLabel: string;
  maxTemp: number;
  minTemp: number;
  precipitationProbability: number;
}

export interface OutfitRecommendation {
  겉옷: string;
  상의: string;
  하의: string;
  신발: string;
  소품: string;
  추천이유: string;
}

export class OutfitServiceError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'OutfitServiceError';
    this.statusCode = statusCode;
  }
}

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown, maxLength = 100): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

export function parseRecommendRequestBody(rawBody: unknown): RecommendRequestBody {
  let bodyObj: unknown = rawBody;
  if (typeof rawBody === 'string') {
    try {
      bodyObj = JSON.parse(rawBody);
    } catch {
      throw new OutfitServiceError(400, 'Invalid JSON request body.');
    }
  }

  const body = bodyObj as Partial<RecommendRequestBody> | null | undefined;
  if (
    !body ||
    !isNonEmptyString(body.age, 40) ||
    !isNonEmptyString(body.gender, 40) ||
    !isNonEmptyString(body.styleName, 60) ||
    !isNonEmptyString(body.conditionLabel, 60) ||
    !isValidNumber(body.currentTemp) ||
    !isValidNumber(body.apparentTemp) ||
    !isValidNumber(body.maxTemp) ||
    !isValidNumber(body.minTemp) ||
    !isValidNumber(body.precipitationProbability)
  ) {
    throw new OutfitServiceError(400, 'Invalid request parameters.');
  }

  return {
    age: body.age.trim(),
    gender: body.gender.trim(),
    styleName: body.styleName.trim(),
    styleDescription:
      typeof body.styleDescription === 'string' ? body.styleDescription.trim().slice(0, 120) : '',
    currentTemp: body.currentTemp,
    apparentTemp: body.apparentTemp,
    conditionLabel: body.conditionLabel.trim(),
    maxTemp: body.maxTemp,
    minTemp: body.minTemp,
    precipitationProbability: body.precipitationProbability,
  };
}

export async function generateOutfitRecommendation(
  rawBody: unknown,
): Promise<OutfitRecommendation> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new OutfitServiceError(500, 'GEMINI_API_KEY is not configured on the server.');
  }

  const body = parseRecommendRequestBody(rawBody);
  const tempDiff = body.maxTemp - body.minTemp;

  const prompt = [
    '당신은 한국인을 위한 친절한 일상 옷차림 도우미입니다.',
    '아래 사용자 정보와 오늘 날씨를 보고, 사용자가 고른 스타일에 딱 맞는 옷차림 정확히 1가지를 추천해 주세요.',
    '',
    '[사용자 정보]',
    `- 연령대: ${body.age}`,
    `- 성별: ${body.gender}`,
    `- 고른 스타일: ${body.styleName}${body.styleDescription ? ` (${body.styleDescription})` : ''}`,
    '',
    '[오늘 날씨]',
    `- 지금 기온: ${body.currentTemp}℃`,
    `- 체감온도: ${body.apparentTemp}℃`,
    `- 날씨 상태: ${body.conditionLabel}`,
    `- 오늘 최저 기온: ${body.minTemp}℃`,
    `- 오늘 최고 기온: ${body.maxTemp}℃ (일교차 ${tempDiff}℃)`,
    `- 강수 확률: ${body.precipitationProbability}%`,
    '',
    '[규칙]',
    '1. 고른 스타일로 옷차림 정확히 1가지에 대해 겉옷, 상의, 하의, 신발, 소품을 각각 한 줄씩 구체적으로 추천해 주세요.',
    '2. 오늘 기온과 체감온도, 날씨 상태에 꼭 맞게 추천해 주세요. 비 올 확률이 높거나(40% 이상) 비·소나기·눈 소식이 있으면 우산이나 방수 신발을 꼭 넣어 주세요.',
    '3. 아침저녁과 낮의 기온 차이(일교차)가 8℃ 이상 크면 벗고 입기 편한 껴입기(레이어드)를 추천해 주세요.',
    '4. 연령대와 성별에 자연스럽게 어울리면서 누구나 쉽게 구할 수 있는 평범하고 실용적인 옷으로 추천해 주세요. 특정 브랜드 이름은 절대 넣지 마세요.',
    '5. 추천이유는 오늘 날씨와 기온을 근거로 한 문장으로 작성해 주세요.',
    '6. 모든 내용은 쉬운 한국어와 다정한 존댓말(~요 체)로 작성해 주세요.',
    '7. 반드시 지정된 JSON 형식(겉옷, 상의, 하의, 신발, 소품, 추천이유)으로만 응답해 주세요.',
  ].join('\n');

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let rawText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            겉옷: {
              type: Type.STRING,
              description: '오늘 날씨와 스타일에 맞는 겉옷 추천 (예: 가벼운 면 자켓)',
            },
            상의: {
              type: Type.STRING,
              description: '오늘 날씨와 스타일에 맞는 상의 추천',
            },
            하의: {
              type: Type.STRING,
              description: '오늘 날씨와 스타일에 맞는 하의 추천',
            },
            신발: {
              type: Type.STRING,
              description: '오늘 날씨와 스타일에 맞는 신발 추천',
            },
            소품: {
              type: Type.STRING,
              description: '오늘 날씨에 필요한 우산, 모자, 스카프 등 소품 추천',
            },
            추천이유: {
              type: Type.STRING,
              description: '오늘 날씨를 근거로 한 한 문장의 존댓말 추천 이유',
            },
          },
          required: ['겉옷', '상의', '하의', '신발', '소품', '추천이유'],
        },
      },
    });

    rawText = (response.text ?? '').trim();
  } catch (error) {
    console.error('Gemini API request failed:', error);
    throw new OutfitServiceError(502, 'Failed to generate outfit recommendation from AI service.');
  }

  if (!rawText) {
    throw new OutfitServiceError(502, 'Empty response from Gemini API.');
  }

  let parsed: Record<string, unknown>;
  try {
    const sanitized = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    parsed = JSON.parse(sanitized) as Record<string, unknown>;
  } catch {
    throw new OutfitServiceError(502, 'Invalid JSON returned from Gemini API.');
  }

  const recommendation: OutfitRecommendation = {
    겉옷: String(parsed['겉옷'] ?? '').trim(),
    상의: String(parsed['상의'] ?? '').trim(),
    하의: String(parsed['하의'] ?? '').trim(),
    신발: String(parsed['신발'] ?? '').trim(),
    소품: String(parsed['소품'] ?? '').trim(),
    추천이유: String(parsed['추천이유'] ?? parsed['추천 이유'] ?? '').trim(),
  };

  if (
    !recommendation.겉옷 ||
    !recommendation.상의 ||
    !recommendation.하의 ||
    !recommendation.신발 ||
    !recommendation.소품 ||
    !recommendation.추천이유
  ) {
    throw new OutfitServiceError(502, 'Incomplete outfit recommendation returned.');
  }

  return recommendation;
}
