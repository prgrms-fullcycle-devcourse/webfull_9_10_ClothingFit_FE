/**
 * Gemini vision으로 사이즈표 이미지 → SizeTable 추출.
 *
 * 왜 Gemini인가
 *  - 규칙 파서는 브랜드마다 표 구조(정방향/전치, 라벨 형태)가 달라 자주 깨진다.
 *  - Gemini는 이미지를 사람처럼 읽어 구조 무관하게 표를 JSON으로 정리한다.
 *
 * ⚠️ 배포 주의
 *  - 지금은 개발 단계라 앱에서 직접 Gemini를 호출(키가 앱에 노출).
 *  - 배포 전 반드시 백엔드 경유로 옮길 것. 그때 이 파일의 callGemini()
 *    내부만 "우리 서버 호출"로 교체하면 된다(호출 지점 격리).
 */
import { env } from '@/lib/env';

import type { SizeTable } from '../api/musinsa-size-api';
import type { CategoryId } from '../constants/categories';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** 카테고리 → 프롬프트에 넣을 한국어 분류명 */
function categoryKo(categoryId: CategoryId): string {
  switch (categoryId) {
    case 'top':
      return '상의';
    case 'outer':
      return '아우터(상의류)';
    case 'bottom':
      return '하의';
    case 'hat':
      return '모자';
    case 'shoes':
      return '신발';
    default:
      return '의류';
  }
}

function buildPrompt(categoryId: CategoryId): string {
  const ko = categoryKo(categoryId);
  return [
    `이 이미지는 의류 상품의 사이즈표야. 카테고리는 "${ko}"야.`,
    '이미지 안의 사이즈표를 읽어서 아래 JSON 형식으로만 출력해. 설명/마크다운 없이 순수 JSON만.',
    '',
    '형식: { "사이즈라벨": { "측정항목": 숫자 } }',
    '예: { "M": { "가슴단면": 54, "총장": 75 }, "L": { "가슴단면": 56, "총장": 79 } }',
    '',
    '규칙:',
    `- "${ko}"에 해당하는 표만 추출해. (상의/하의가 한 이미지에 같이 있으면 ${ko} 표만)`,
    '- 표가 가로(사이즈가 열)든 세로(사이즈가 행)든 알아서 사이즈라벨 기준으로 정리해.',
    '- 값은 cm 숫자만. 범위(83-86)는 중앙값(84.5)으로. mm면 cm로 변환.',
    '- "085(S)"처럼 라벨이 복합이면 대표 라벨 하나로(예: "S" 또는 "085").',
    '- 실측 사이즈표가 없고 신체 권장 사이즈표만 있으면 그거라도 추출.',
    '- 사이즈표를 못 찾으면 정확히 {} 만 출력.',
  ].join('\n');
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Gemini API 호출 (이 함수만 배포 시 백엔드 호출로 교체).
 * 503(과부하)·429(레이트리밋)는 일시적이라 지수 백오프로 재시도한다.
 */
async function callGemini(base64Jpeg: string, prompt: string): Promise<string> {
  const key = env.geminiApiKey;
  if (!key) throw new Error('GEMINI_API_KEY 미설정');

  const body = JSON.stringify({
    contents: [
      {
        parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: base64Jpeg } }],
      },
    ],
    generationConfig: { temperature: 0 },
  });

  const MAX_RETRY = 3;
  let lastErr = '';
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body,
    });
    if (res.ok) {
      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    }
    lastErr = `${res.status}: ${(await res.text()).slice(0, 120)}`;
    // 일시적 오류(503/429)만 재시도. 그 외(400/403 등)는 즉시 실패.
    if (res.status !== 503 && res.status !== 429) break;
    if (attempt < MAX_RETRY) {
      const wait = 800 * Math.pow(2, attempt); // 0.8s, 1.6s, 3.2s
      if (__DEV__)
        console.log(`[gemini] ${res.status} 재시도 ${attempt + 1}/${MAX_RETRY} (${wait}ms)`);
      await sleep(wait);
    }
  }
  throw new Error(`Gemini ${lastErr}`);
}

/** Gemini 응답 텍스트에서 JSON 추출 (```json 펜스/잡텍스트 제거) */
function extractJson(text: string): unknown | null {
  if (!text) return null;
  // 코드펜스 제거
  let t = text
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();
  // 첫 { ~ 마지막 } 만
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start < 0 || end < 0 || end <= start) return null;
  t = t.slice(start, end + 1);
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

/** Gemini 응답 JSON을 SizeTable로 정규화 (숫자만, 빈 행 제거) */
function toSizeTable(parsed: unknown): SizeTable | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const out: SizeTable = {};
  for (const [label, row] of Object.entries(parsed as Record<string, unknown>)) {
    if (!row || typeof row !== 'object') continue;
    const measurements: Record<string, number> = {};
    for (const [name, value] of Object.entries(row as Record<string, unknown>)) {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      if (Number.isFinite(num)) measurements[name] = num;
    }
    if (Object.keys(measurements).length > 0) out[label.trim()] = measurements;
  }
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * base64 JPEG(들)을 Gemini로 분석해 SizeTable 추출.
 * 첫 이미지에서 표를 찾으면 그걸 채택(추가 호출 절약).
 */
export async function geminiExtractSizeTable(
  base64Images: string[],
  categoryId: CategoryId,
): Promise<SizeTable | null> {
  const prompt = buildPrompt(categoryId);
  for (let i = 0; i < base64Images.length; i++) {
    try {
      const text = await callGemini(base64Images[i], prompt);
      const parsed = extractJson(text);
      const table = toSizeTable(parsed);
      if (__DEV__) {
        console.log(
          `[gemini] 이미지[${i}] → ${table ? Object.keys(table).length + '종 ' + JSON.stringify(table).slice(0, 200) : '없음'}`,
        );
      }
      if (table) return table;
    } catch (e) {
      if (__DEV__) console.log(`[gemini] 이미지[${i}] 실패:`, String(e).slice(0, 150));
    }
  }
  return null;
}
