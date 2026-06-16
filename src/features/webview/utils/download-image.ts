import { File, Paths } from 'expo-file-system';

/** 브라우저처럼 보이는 헤더 (무신사 CDN 핫링크 차단 우회용) */
const DOWNLOAD_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  Referer: 'https://www.musinsa.com/',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
};

/**
 * 상품 원본 이미지 URL을 캐시로 다운로드하고 file:// 경로를 돌려준다.
 * COPY 시 미리보기 라이트박스 스크린샷이 세로로 눌리는 문제를 피하려고,
 * inject가 잡은 "화면에 보이던 원본 이미지"를 직접 받아 크롭 소스로 쓴다.
 * 실패(또는 너무 작은 파일=에러 페이지)면 null → 호출부에서 스크린샷으로 폴백.
 *
 * ⚠️ 파일명은 매 호출 고유해야 한다. 고정 파일명을 쓰면 RN <Image>가 URI 문자열로
 *    캐싱하기 때문에, 파일 내용이 바뀌어도 이전(다른 상품) 이미지를 보여준다.
 */
let prevUri: string | null = null;

export async function downloadProductImage(url: string): Promise<string | null> {
  try {
    const normalized = url.replace(/([^:])\/\/+/g, '$1/'); // 경로 중복 슬래시 제거
    const extMatch = normalized.split('?')[0].match(/\.(jpg|jpeg|png|webp|gif)$/i);
    const ext = extMatch ? extMatch[1] : 'jpg';
    // 매번 고유 파일명 → URI가 달라져 RN 이미지 캐시 stale 방지
    const dest = new File(Paths.cache, `copy_preview_${Date.now()}.${ext}`);
    if (dest.exists) dest.delete();
    const file = await File.downloadFileAsync(normalized, dest, { headers: DOWNLOAD_HEADERS });
    const size = file.size ?? 0;
    if (__DEV__)
      console.log(`[copy:preview-img] ${Math.round(size / 1024)}KB ${file.uri.slice(-32)}`);
    if (size < 1000) {
      try {
        if (file.exists) file.delete();
      } catch {}
      return null; // 1KB 미만 = 에러/빈 파일
    }
    // 직전 파일은 정리(캐시 누적 방지) — 크롭 화면은 새 URI를 쓰므로 안전
    if (prevUri) {
      try {
        const old = new File(prevUri);
        if (old.exists) old.delete();
      } catch {}
    }
    prevUri = file.uri;
    return file.uri;
  } catch (e) {
    if (__DEV__) console.log('[copy:preview-img] 다운로드 실패:', String(e).slice(0, 120));
    return null;
  }
}
