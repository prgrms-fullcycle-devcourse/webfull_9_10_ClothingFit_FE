/**
 * Musinsa 상품 페이지 스크래핑 inject 스크립트 (Phase 2 PoC).
 *
 * 주의
 * - 이 파일이 export 하는 함수는 **문자열**을 돌려준다. 그 문자열이
 *   WebView 안에서 평가됨. 그래서 외부 모듈 import 불가, ES2017 이상
 *   문법은 안전상 피한다.
 * - 무신사는 SPA 라우팅이라 DOM이 늦게 그려지는 경우가 잦아
 *   MutationObserver + timeout retry 패턴을 사용.
 * - 셀렉터는 사이트 리뉴얼 시 깨질 수 있으니 한 곳에 모아둠.
 */

export function buildMusinsaScrapeScript(requestId: string): string {
  // IIFE로 격리, 마지막 `true;`는 react-native-webview의 inject 규칙 (warning 방지)
  return `
(function() {
  var REQUEST_ID = ${JSON.stringify(requestId)};
  var TIMEOUT_MS = 4000;

  function post(msg) {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    } catch (e) {}
  }

  function log(message) {
    post({ type: 'scrape:log', message: String(message) });
  }

  function fail(reason) {
    post({ type: 'scrape:fail', requestId: REQUEST_ID, reason: reason });
  }

  function ok(data) {
    post({ type: 'scrape:ok', requestId: REQUEST_ID, data: data });
  }

  // ── 셀렉터 후보 (fallback chain) ─────────────────────────
  var TITLE_SELECTORS = [
    'meta[property="og:title"]',
    'h3.product_title',
    'h1[class*="title"]',
    'h2[class*="title"]'
  ];
  var IMAGE_SELECTORS = [
    'meta[property="og:image"]',
    'div.product-img img',
    'img[class*="thumbnail"]',
    'img[class*="product"]'
  ];

  function textFrom(el) {
    if (!el) return '';
    if (el.tagName === 'META') return el.getAttribute('content') || '';
    return (el.textContent || '').trim();
  }
  function srcFrom(el) {
    if (!el) return null;
    if (el.tagName === 'META') return el.getAttribute('content') || null;
    return el.getAttribute('src') || el.getAttribute('data-src') || null;
  }
  function pickFirst(selectors, transform) {
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) {
        var v = transform(el);
        if (v) return v;
      }
    }
    return transform === srcFrom ? null : '';
  }

  // 사이즈표 추출
  // 무신사 사이즈표는 보통 <table> 형태 (헤더: 사이즈 / 어깨 / 가슴 / 총장 ...)
  function extractSizeTable() {
    var tables = document.querySelectorAll('table');
    for (var ti = 0; ti < tables.length; ti++) {
      var table = tables[ti];
      var rows = table.querySelectorAll('tr');
      if (rows.length < 2) continue;

      var header = rows[0];
      var headerCells = header.querySelectorAll('th, td');
      if (headerCells.length < 2) continue;

      // 첫 컬럼이 "사이즈"류인지 약하게 검사
      var firstHeader = (headerCells[0].textContent || '').trim();
      var looksLikeSize =
        /사이즈|size|SIZE/.test(firstHeader) ||
        /어깨|가슴|총장|허리|밑단|소매/.test((headerCells[1].textContent || ''));
      if (!looksLikeSize) continue;

      var fieldNames = [];
      for (var hi = 1; hi < headerCells.length; hi++) {
        fieldNames.push((headerCells[hi].textContent || '').trim());
      }

      var result = {};
      var rowCount = 0;
      for (var ri = 1; ri < rows.length; ri++) {
        var cells = rows[ri].querySelectorAll('th, td');
        if (cells.length !== headerCells.length) continue;
        var sizeName = (cells[0].textContent || '').trim();
        if (!sizeName) continue;
        var record = {};
        for (var ci = 1; ci < cells.length; ci++) {
          var raw = (cells[ci].textContent || '').trim().replace(/[^0-9.]/g, '');
          var num = parseFloat(raw);
          if (!isNaN(num)) record[fieldNames[ci - 1]] = num;
        }
        if (Object.keys(record).length > 0) {
          result[sizeName] = record;
          rowCount++;
        }
      }
      if (rowCount > 0) return result;
    }
    return null;
  }

  function trySnapshot() {
    var title = pickFirst(TITLE_SELECTORS, textFrom);
    var imageUrl = pickFirst(IMAGE_SELECTORS, srcFrom);
    // 사이즈표는 없을 수도 있음 — 알럿 띄울 신호로 쓰일 뿐, 실패 사유 X
    var sizeTable = extractSizeTable();

    // 최소 조건: title이나 imageUrl 중 하나는 잡혀야 페이지로 인정
    if (!title && !imageUrl) return null;

    return {
      url: location.href,
      title: title || '',
      imageUrl: imageUrl,
      sizeTable: sizeTable
    };
  }

  // 즉시 시도 → 실패 시 MutationObserver로 DOM 변경 감시 → 타임아웃
  var snap = trySnapshot();
  if (snap) {
    ok(snap);
    return;
  }

  var settled = false;
  var observer = new MutationObserver(function() {
    if (settled) return;
    var s = trySnapshot();
    if (s) {
      settled = true;
      try { observer.disconnect(); } catch (e) {}
      ok(s);
    }
  });
  try {
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (e) {
    log('observer attach failed: ' + e);
  }

  setTimeout(function() {
    if (settled) return;
    settled = true;
    try { observer.disconnect(); } catch (e) {}
    var late = trySnapshot();
    if (late) ok(late);
    else fail('상품 정보를 찾지 못했어요 (timeout)');
  }, TIMEOUT_MS);
})();
true;
`;
}
