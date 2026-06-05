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
  var TIMEOUT_MS = 12000;     // 하드 타임아웃 (store 타임아웃 15000보다 작게)
  var SIZE_GRACE_MS = 4000;   // 기본정보 확보 후 사이즈표를 추가로 기다리는 시간
  var POLL_MS = 350;          // 더보기 클릭/표 렌더 폴링 주기

  function post(msg) {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    } catch (e) {}
  }

  function log(message) {
    post({ type: 'scrape:log', message: String(message) });
  }

  // verbose 로그: 폴링 첫 1회에만 출력 (같은 detail 로그가 매 폴링마다
  // 도배되는 것을 막는다). 더보기 클릭·결과 전송 등 중요 이벤트는 log() 사용.
  var VERBOSE = true;
  function vlog(message) {
    if (VERBOSE) log(message);
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
  function pickFirst(label, selectors, transform) {
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) {
        var v = transform(el);
        if (v) {
          vlog('[' + label + '] 매칭 셀렉터: "' + selectors[i] + '" → ' + String(v).slice(0, 60));
          return v;
        }
      }
    }
    vlog('[' + label + '] 매칭 실패 (시도한 셀렉터 ' + selectors.length + '개)');
    return transform === srcFrom ? null : '';
  }

  // 측정항목 헤더 키워드 (이 컬럼들은 숫자 cm 값)
  var MEAS_RE = /어깨|가슴|총장|기장|밑단|소매|허리|암홀|밑위|허벅지|단면|둘레|품|폭|길이/;
  // 사이즈 라벨 형태 (S/M/L, FREE, 또는 숫자 사이즈)
  var SIZE_LABEL_RE = /^(XS|S|M|L|XL|2XL|3XL|4XL|XXL|XXXL|FREE|F|\\d{1,3}(\\.\\d+)?)$/i;

  // 무신사 사이즈표는 측정값(<table>)과 사이즈 라벨(고정 컬럼)이 분리돼 있는
  // 경우가 많다. 표 밖 라벨을 "행의 화면 세로 위치"로 정렬 매칭해서 찾는다.
  function collectExternalLabels(table, dataRowEls) {
    var root = table;
    for (var u = 0; u < 5 && root.parentElement; u++) root = root.parentElement;

    var all = root.querySelectorAll('*');
    var candidates = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (table.contains(el)) continue; // 측정 표 내부는 제외
      if (el.children && el.children.length > 0) continue; // leaf만
      var t = (el.textContent || '').trim();
      if (!t || t.length > 6) continue;
      if (!SIZE_LABEL_RE.test(t)) continue;
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue; // 숨김 제외
      candidates.push({ text: t, mid: r.top + r.height / 2 });
    }
    vlog('  표 밖 라벨 후보 ' + candidates.length + '개');

    var labels = [];
    for (var j = 0; j < dataRowEls.length; j++) {
      var rr = dataRowEls[j].getBoundingClientRect();
      var rowMid = rr.top + rr.height / 2;
      var best = null;
      var bestDist = 1e9;
      for (var k = 0; k < candidates.length; k++) {
        var d = Math.abs(candidates[k].mid - rowMid);
        if (d < bestDist) { bestDist = d; best = candidates[k]; }
      }
      labels.push(best && bestDist <= Math.max(rr.height, 12) ? best.text : null);
    }
    return labels;
  }

  // ── "상품 정보 더보기" 펼치기 ─────────────────────────────
  // 무신사는 사이즈표를 접어두고(lazy) "더보기"를 눌러야 DOM에 그린다.
  // 한 번 누르면 충분하므로 클릭 여부를 플래그로 기억한다.
  // "상품 정보 더보기"만 정확히 노린다.
  //  - <a>는 제외: 클릭 시 페이지 네비게이션이 일어나 inject 컨텍스트가 날아감.
  //  - "혜택 더보기" / 리뷰 "더보기" 등과 충돌하지 않도록 패턴을 좁힌다.
  var EXPAND_RE = /상품.?정보.?더보기|상세.?정보.?더보기|사이즈.?정보.?더보기|펼쳐보기/;
  var EXPAND_DENY_RE = /혜택|쿠폰|리뷰|후기|댓글|구매|배송|신고/;
  var expandClicked = false;
  function expandDetails() {
    if (expandClicked) return;
    // <a> 제외 — button/role=button만 (네비게이션 방지)
    var clickables = document.querySelectorAll('button, div[role="button"]');
    for (var i = 0; i < clickables.length; i++) {
      var el = clickables[i];
      var t = (el.textContent || '').trim();
      if (!t || t.length > 20) continue;
      if (EXPAND_DENY_RE.test(t)) continue;     // 혜택/리뷰 더보기 차단
      if (!EXPAND_RE.test(t)) continue;          // 상품정보 더보기만 허용
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue; // 숨김 제외
      try {
        el.click();
        expandClicked = true;
        log('"상품 정보 더보기" 클릭: "' + t + '"');
        return;
      } catch (e) {}
    }
  }

  // ── 페이지 자동 스크롤 ────────────────────────────────────
  // 무신사 상세는 실측 사이즈 "이미지"를 스크롤해야 lazy load 한다.
  // 더보기 클릭 후 페이지를 단계적으로 끝까지 내려 이미지를 모두 로드시킨다.
  var scrollStep = 0;
  function autoScroll() {
    // 한 tick마다 큰 보폭으로 내려 lazy 로딩을 빠르게 트리거
    var h = document.body ? document.body.scrollHeight : 0;
    var y = Math.min(scrollStep * 2500, h);
    window.scrollTo(0, y);
    scrollStep++;
  }
  function scrolledToBottom() {
    var h = document.body ? document.body.scrollHeight : 0;
    return window.scrollY + window.innerHeight >= h - 50;
  }

  // ── 사이즈표 이미지 "후보" 수집 ───────────────────────────
  // 무신사 실측표는 키워드 없는 외부서버 상세이미지(content-img-*)로 오는 일이
  // 많아 alt/src로 못 고른다. 그래서 상세영역의 "그럴듯한" 이미지들을 후보로
  // 모아 RN에서 OCR로 판별한다. (광고배너/추천/상품사진은 제외)
  var CAND_DENY_RE = /banner|cms|event|notice|delivery|footer|logo|icon|qr|coupon/i;
  function collectSizeChartCandidates() {
    var imgs = document.querySelectorAll('img');
    var cands = [];
    for (var i = 0; i < imgs.length; i++) {
      var el = imgs[i];
      var src = el.src || el.getAttribute('src') || el.getAttribute('data-src') || '';
      if (!src || src.indexOf('data:') === 0) continue;
      if (CAND_DENY_RE.test(src)) continue;            // 광고/공지/배송 등 제외
      var rct = el.getBoundingClientRect();
      var w = rct.width || el.naturalWidth || 0;
      if (w < 200) continue;                           // 작은 이미지(아이콘 등) 제외
      // 대표 상품사진은 사이즈표 아님 → 후순위. 세로로 긴 이미지(상세표)는 가점.
      var isProductPhoto = /goods_img|prd_img/i.test(src);
      var tall = (el.naturalHeight || 0) > (el.naturalWidth || 1) * 1.2;
      cands.push({ el: el, src: src, y: rct.top + window.scrollY, photo: isProductPhoto, tall: tall });
    }
    // 정렬: 상품사진 뒤로 / 세로 긴 것 앞으로 / 그다음 y(위→아래)
    cands.sort(function (a, b) {
      if (a.photo !== b.photo) return a.photo ? 1 : -1;
      if (a.tall !== b.tall) return a.tall ? -1 : 1;
      return a.y - b.y;
    });
    // URL 수집 (RN에서 직접 fetch해 OCR). 중복 제거 + 상한.
    var seen = {};
    var out = [];
    for (var j = 0; j < cands.length && out.length < 6; j++) {
      var s = cands[j].src;
      if (seen[s]) continue;
      seen[s] = 1;
      out.push(s);
    }
    return out;
  }

  // 사이즈표가 이미지로 제공되는지 감지 (OCR 대상 이미지 URL 반환).
  // 절대경로로 resolve된 el.src를 우선 사용 (OCR이 바로 다운로드 가능하도록).
  function detectImageSizeChart() {
    var imgs = document.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      var el = imgs[i];
      var alt = el.getAttribute('alt') || '';
      var rawSrc = el.getAttribute('src') || el.getAttribute('data-src') || '';
      // el.src는 브라우저가 절대 URL로 정규화해줌 (상대경로 방지)
      var absSrc = el.src || rawSrc;
      if (/size.?chart|사이즈|치수|size.?guide/i.test(alt) ||
          /size.?chart|sizetable|size.?guide|sizechart/i.test(rawSrc)) {
        return absSrc || rawSrc;
      }
    }
    return null;
  }

  // 진단용: 더보기 클릭 후 DOM에 실측표가 어떤 형태로 있는지 1회 덤프
  var diagDone = false;
  function diagnoseSizeArea() {
    if (diagDone) return;
    diagDone = true;
    // 1) "실측사이즈" 텍스트가 페이지에 있나?
    var bodyText = (document.body.textContent || '');
    log('[진단] "실측사이즈" 텍스트 ' + (bodyText.indexOf('실측사이즈') >= 0 ? '있음' : '없음') +
        ' / "치수항목" ' + (bodyText.indexOf('치수항목') >= 0 ? '있음' : '없음') +
        ' / "앞기장" ' + (bodyText.indexOf('앞기장') >= 0 ? '있음' : '없음'));
    // 2) 모든 table의 헤더 첫 줄 덤프
    var tables = document.querySelectorAll('table');
    log('[진단] table ' + tables.length + '개');
    for (var i = 0; i < tables.length; i++) {
      var r0 = tables[i].querySelector('tr');
      var h = r0 ? (r0.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 80) : '(빈 tr)';
      log('[진단] table[' + i + '] 첫행: ' + h);
    }
    // 3) 큰 이미지(상세 이미지) src를 넓게 덤프 — 실측 이미지 URL 패턴 파악용
    var imgs = document.querySelectorAll('img');
    log('[진단] 전체 img ' + imgs.length + '개. 큰 이미지(폭>200) src 덤프:');
    var hit = 0;
    for (var j = 0; j < imgs.length && hit < 12; j++) {
      var im = imgs[j];
      var w = im.naturalWidth || im.width || 0;
      var rct = im.getBoundingClientRect();
      var alt = im.getAttribute('alt') || '';
      var src = im.src || im.getAttribute('src') || im.getAttribute('data-src') || '';
      // 화면상 폭이 크거나(상세 이미지) alt/src에 단서가 있는 것
      if (rct.width > 200 || /사이즈|치수|실측|size/i.test(alt) || /size|chart|measure/i.test(src)) {
        log('[진단] img w' + Math.round(rct.width) + ' alt="' + alt.slice(0, 20) + '" src=' + src.slice(0, 95));
        hit++;
      }
    }
    if (hit === 0) log('[진단] 큰 이미지 없음');
  }

  function extractSizeTable() {
    var tables = document.querySelectorAll('table');
    vlog('사이즈표 탐색: <table> ' + tables.length + '개 발견');
    for (var ti = 0; ti < tables.length; ti++) {
      var table = tables[ti];
      var rows = table.querySelectorAll('tr');
      if (rows.length < 2) continue;

      var headerCells = rows[0].querySelectorAll('th, td');
      if (headerCells.length < 2) continue;

      // 헤더 컬럼 분류: 측정항목 컬럼 vs (사이즈명) 라벨 컬럼
      var headerTexts = [];
      for (var hi = 0; hi < headerCells.length; hi++) {
        headerTexts.push((headerCells[hi].textContent || '').trim());
      }
      var labelCol = -1; // 표 안에 사이즈명 컬럼이 있으면 그 인덱스
      var measCols = []; // 측정항목 컬럼 인덱스들
      for (var ci = 0; ci < headerTexts.length; ci++) {
        if (MEAS_RE.test(headerTexts[ci])) measCols.push(ci);
        else if (labelCol === -1) labelCol = ci;
      }
      if (measCols.length === 0) {
        vlog('table[' + ti + '] 헤더가 사이즈표 아님: "' + headerTexts.join('|') + '"');
        continue;
      }
      var measNames = [];
      for (var mn = 0; mn < measCols.length; mn++) measNames.push(headerTexts[measCols[mn]]);
      vlog(
        'table[' + ti + '] 사이즈표 후보! 측정항목: ' + measNames.join(', ') +
        (labelCol >= 0 ? (' / 사이즈컬럼: "' + headerTexts[labelCol] + '"') : ' / 사이즈컬럼 없음(표 밖 탐색)')
      );

      // 데이터 행 수집 (colspan "내 사이즈 입력" 행 등은 셀 수 불일치로 제외)
      var dataRowEls = [];
      var records = [];
      var inlineLabels = [];
      var hasInlineLabel = false;
      for (var ri = 1; ri < rows.length; ri++) {
        var cells = rows[ri].querySelectorAll('th, td');
        if (cells.length !== headerCells.length) continue;
        var record = {};
        for (var mi = 0; mi < measCols.length; mi++) {
          var col = measCols[mi];
          var raw = (cells[col].textContent || '').trim().replace(/[^0-9.]/g, '');
          var num = parseFloat(raw);
          if (!isNaN(num)) record[headerTexts[col]] = num;
        }
        if (Object.keys(record).length === 0) continue;
        var inline = labelCol >= 0 ? (cells[labelCol].textContent || '').trim() : '';
        if (inline) hasInlineLabel = true;
        dataRowEls.push(rows[ri]);
        records.push(record);
        inlineLabels.push(inline);
      }
      if (records.length === 0) continue;

      // 사이즈명 결정: 표 안 라벨 우선, 없으면 표 밖 위치정렬 탐색
      var labels = hasInlineLabel ? inlineLabels : collectExternalLabels(table, dataRowEls);

      var result = {};
      for (var di = 0; di < records.length; di++) {
        var name = labels[di] ? String(labels[di]).trim() : '';
        if (!name) name = '사이즈' + (di + 1);
        if (result[name]) name = name + '_' + (di + 1); // 키 충돌 방지
        result[name] = records[di];
      }
      log('table[' + ti + '] 추출 성공: 사이즈 ' + Object.keys(result).length + '종 (' + Object.keys(result).join(', ') + ')');
      return result;
    }
    vlog('사이즈표 추출 실패 (조건 맞는 table 없음)');
    return null;
  }

  function trySnapshot() {
    var title = pickFirst('제목', TITLE_SELECTORS, textFrom);
    var imageUrl = pickFirst('이미지', IMAGE_SELECTORS, srcFrom);
    // 사이즈표는 없을 수도 있음 — 알럿 띄울 신호로 쓰일 뿐, 실패 사유 X
    var sizeTable = extractSizeTable();

    // 최소 조건: title이나 imageUrl 중 하나는 잡혀야 페이지로 인정
    if (!title && !imageUrl) return null;

    // 이미지 후보(base64)는 무거우니 매 폴링이 아니라 종료 시점에만 채운다.
    // (tick에서 snap.sizeChartCandidates에 주입)
    return {
      url: location.href,
      title: title || '',
      imageUrl: imageUrl,
      sizeTable: sizeTable,
      sizeChartImageUrl: null,
      sizeChartCandidates: []
    };
  }

  log('===== 무신사 스크래핑 시작 (' + location.href + ') =====');

  // 흐름
  //   1) 폴링하며 기본정보(title/image) 확보를 기다린다.
  //   2) 기본정보가 잡히면 "더보기"를 클릭해 사이즈표를 펼치고,
  //      표가 그려질 때까지 SIZE_GRACE_MS 동안 추가로 기다린다.
  //   3) 사이즈표를 잡으면 즉시 전송. 못 잡아도 grace 종료 시 기본정보만 전송.
  //   4) 전체 TIMEOUT_MS를 넘기면 잡힌 것까지 전송(또는 실패).
  var settled = false;
  var basicSnap = null;        // title/image까지만 잡힌 스냅샷
  var basicAt = 0;             // 기본정보 확보 시각
  var startedAt = Date.now();

  function finish(snap, why) {
    if (settled) return;
    settled = true;
    clearInterval(pollId);
    if (snap) {
      log('결과 전송 (' + why + ', 사이즈표 ' + (snap.sizeTable ? '있음' : '없음') + ')');
      ok(snap);
    } else {
      log('타임아웃 → 상품 정보 못 찾음');
      fail('상품 정보를 찾지 못했어요 (timeout)');
    }
  }

  function tick() {
    if (settled) return;
    var snap = trySnapshot();
    // 첫 폴링의 detail 로그만 남기고 이후 반복 폴링은 조용히 (로그 도배 방지)
    VERBOSE = false;

    // 아직 기본정보(title/image)조차 못 잡음 → 계속 폴링
    if (!snap) {
      if (Date.now() - startedAt >= TIMEOUT_MS) finish(null, 'timeout');
      return;
    }

    // 사이즈표까지 확보 → 즉시 전송 (최선의 결과)
    if (snap.sizeTable) {
      finish(snap, '사이즈표 확보');
      return;
    }

    // 기본정보는 있는데 사이즈표가 아직 없음
    if (!basicSnap) {
      basicSnap = snap;
      basicAt = Date.now();
      log('기본정보 확보 → "더보기" 펼치고 사이즈표 대기 시작');
    }
    expandDetails(); // 더보기 클릭 (한 번만 실제 수행)
    autoScroll();    // 매 tick 페이지를 더 내려 실측 이미지(lazy) 로드 유도

    // 종료 조건
    //  - 무신사 상세는 길어 바닥까지 가면 타임아웃 위험 → 적당히 스크롤 후 전송.
    //  - WebView throttle로 스크롤이 더뎌도 grace 경과하면 후보 수집해 전송.
    var MIN_SCROLLS = 5; // 상세 이미지 lazy 로드에 충분한 스크롤 횟수
    var hardOver = Date.now() - startedAt >= TIMEOUT_MS;
    var graceOver = Date.now() - basicAt >= SIZE_GRACE_MS;

    if (expandClicked && (scrollStep >= MIN_SCROLLS || graceOver || scrolledToBottom())) {
      var cands = collectSizeChartCandidates();
      snap.sizeChartCandidates = cands;
      log('스크롤 ' + scrollStep + '회 + URL 후보 ' + cands.length + '개 → 전송');
      finish(snap, '이미지 후보 수집 완료');
      return;
    }

    if (hardOver) {
      var lateCands = collectSizeChartCandidates();
      snap.sizeChartCandidates = lateCands;
      diagnoseSizeArea();
      finish(snap, 'timeout(후보 ' + lateCands.length + '개)');
    }
  }

  var pollId = setInterval(tick, POLL_MS);
  tick(); // 즉시 1회
})();
true;
`;
}
