/**
 * 이미지 사이즈표 → SizeTable 추출 (Gemini vision).
 *
 * 흐름
 *  - inject가 상세영역 이미지 후보(URL)들을 수집해 넘긴다.
 *  - 여기서 후보를 다운로드(referer 헤더로 핫링크 차단 우회) → 폭 정규화 →
 *    base64 → Gemini vision에 보내 사이즈표를 JSON으로 추출한다.
 *  - 브랜드/카테고리마다 표 구조(정방향/전치, 라벨 형태)가 달라도 Gemini가
 *    사람처럼 읽어 처리한다. 실패 시 null → 상위에서 reference 폴백.
 *
 * ⚠️ 배포 주의: 현재 Gemini를 앱에서 직접 호출(키 노출). 배포 전 백엔드 경유로
 *    옮길 것. 교체 지점은 gemini-size-ocr.ts의 callGemini().
 */
import { File, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import { env } from '@/lib/env';

import type { SizeTable } from '../api/musinsa-size-api';
import type { CategoryId } from '../constants/categories';
import { geminiExtractSizeTable } from './gemini-size-ocr';

/** 브라우저처럼 보이는 헤더 (외부서버 핫링크 차단 우회용) */
const DOWNLOAD_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  Referer: 'https://www.musinsa.com/',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
};

/**
 * 이미지 URL을 캐시 디렉터리로 다운로드하고 file:// 경로를 돌려준다.
 * ML Kit/Gemini가 외부 URL을 직접 못 받는 문제(핫링크 차단)를 RN fetch로 우회.
 * 실패(또는 빈 파일) 시 null.
 */
async function downloadToCache(url: string, index: number): Promise<string | null> {
  try {
    const normalized = url.replace(/([^:])\/\/+/g, '$1/'); // 경로 중복 슬래시 제거
    const extMatch = normalized.split('?')[0].match(/\.(jpg|jpeg|png|webp|gif)$/i);
    const ext = extMatch ? extMatch[1] : 'jpg';
    const dest = new File(Paths.cache, `sizechart_${index}.${ext}`);
    if (dest.exists) dest.delete();
    const file = await File.downloadFileAsync(normalized, dest, {
      headers: DOWNLOAD_HEADERS,
    });
    const size = file.size ?? 0;
    if (__DEV__)
      console.log(`[ocr] 다운로드[${index}] ${Math.round(size / 1024)}KB ${file.uri.slice(-28)}`);
    if (size < 1000) return null; // 1KB 미만 = 에러 페이지/빈 파일
    return file.uri;
  } catch (e) {
    if (__DEV__) console.log(`[ocr] 다운로드 실패[${index}]:`, String(e).slice(0, 100));
    return null;
  }
}

/**
 * 이미지 후보들을 다운로드·정규화해 Gemini로 사이즈표를 추출.
 * 실패 시 null (상위에서 reference 폴백).
 */
export async function ocrSizeChartFromCandidates(
  candidates: string[],
  categoryId: CategoryId,
): Promise<SizeTable | null> {
  if (!env.isGeminiConfigured) {
    if (__DEV__) console.log('[ocr] Gemini 키 미설정 → null (reference 폴백)');
    return null;
  }

  // 1) 후보 다운로드 → 폭 1200 리사이즈 → base64
  const base64Images: string[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const url = candidates[i];
    try {
      let localUri = url;
      if (!url.startsWith('data:') && !url.startsWith('file:')) {
        const local = await downloadToCache(url, i);
        if (!local) continue;
        localUri = local;
      }
      const resized = await manipulateAsync(localUri, [{ resize: { width: 1200 } }], {
        compress: 0.85,
        format: SaveFormat.JPEG,
      });
      const b64 = await new File(resized.uri).base64();
      base64Images.push(b64);
    } catch (e) {
      if (__DEV__) console.log(`[ocr] 후보[${i}] 준비 실패:`, String(e).slice(0, 120));
    }
  }

  if (base64Images.length === 0) {
    if (__DEV__) console.log('[ocr] base64 이미지 0개 → null');
    return null;
  }

  // 2) Gemini vision으로 표 추출 (브랜드/구조 무관)
  const table = await geminiExtractSizeTable(base64Images, categoryId);
  if (__DEV__) {
    console.log(
      `[ocr] (${categoryId}) 최종: ${table ? Object.keys(table).length + '종 ' + JSON.stringify(table).slice(0, 200) : '없음(null)'}`,
    );
  }
  return table;
}
