/**
 * 29CM 상품 페이지 스크래핑 inject 스크립트 (Phase 3 PoC).
 * 무신사 패턴과 동일한 구조 — selector만 다름.
 */

export function buildCm29ScrapeScript(requestId: string): string {
  return `
(function() {
  var REQUEST_ID = ${JSON.stringify(requestId)};
  var TIMEOUT_MS = 4500;

  function post(msg) {
    try { window.ReactNativeWebView.postMessage(JSON.stringify(msg)); } catch (e) {}
  }
  function ok(data) { post({ type: 'scrape:ok', requestId: REQUEST_ID, data: data }); }
  function fail(reason) { post({ type: 'scrape:fail', requestId: REQUEST_ID, reason: reason }); }

  var TITLE_SELECTORS = [
    'meta[property="og:title"]',
    'meta[name="twitter:title"]',
    'h1[class*="ProductName"]',
    'h2[class*="ProductName"]',
    'h1'
  ];
  var IMAGE_SELECTORS = [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    'img[alt*="대표"]',
    'div[class*="ProductImage"] img',
    'img[src*="img.29cm"]'
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

  // 29CM 사이즈표: 상세 페이지 안의 <table> 또는 dt/dd 리스트로 표시되는 경우가 있음.
  // 우선 <table>만 처리 (가장 흔함).
  function extractSizeTable() {
    var tables = document.querySelectorAll('table');
    for (var ti = 0; ti < tables.length; ti++) {
      var rows = tables[ti].querySelectorAll('tr');
      if (rows.length < 2) continue;
      var headerCells = rows[0].querySelectorAll('th, td');
      if (headerCells.length < 2) continue;

      var firstHeader = (headerCells[0].textContent || '').trim();
      var secondHeader = (headerCells[1].textContent || '').trim();
      var looksLikeSize =
        /사이즈|size/i.test(firstHeader) ||
        /어깨|가슴|총장|허리|밑단|소매|굽|발/.test(secondHeader);
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
    var sizeTable = extractSizeTable();
    if (!title && !imageUrl) return null;
    return { url: location.href, title: title || '', imageUrl: imageUrl, sizeTable: sizeTable };
  }

  var snap = trySnapshot();
  if (snap) { ok(snap); return; }

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
  } catch (e) {}

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
