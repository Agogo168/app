/* 校安 App：自動顯示「加入主畫面」安裝教學
 * - 已從桌面圖示開啟（App 模式）→ 不顯示
 * - 從 LINE / FB / IG 等 App 內建瀏覽器開啟 → 引導改用 Safari / Chrome
 * - iPhone Safari → 圖解「分享 → 加入主畫面」
 * - Android Chrome → 一鍵「安裝 App」按鈕
 * - 按「稍後再說」→ 3 天內不再顯示
 */
(function () {
  var HIDE_DAYS = 3;
  var KEY = 'xiaoan_install_hide_until';
  var ua = navigator.userAgent || '';

  var isStandalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) ||
                     navigator.standalone === true;
  if (isStandalone) return;

  var isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  if (!isIOS && !isAndroid) return;                       // 電腦版不顯示

  var isLine = /\bLine\//i.test(ua);
  var inApp = isLine || /FBAN|FBAV|FB_IAB|Instagram|MicroMessenger|KAKAOTALK|Threads|GSA\//i.test(ua) ||
              (isAndroid && /; wv\)/.test(ua));
  var isIOSSafari = isIOS && !inApp && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);

  try { if (Date.now() < Number(localStorage.getItem(KEY) || 0)) return; } catch (e) {}

  // ---------- 樣式 ----------
  var css =
    '.call{position:relative;z-index:10001}' +   /* 撥號按鈕永遠在最上層，教學畫面不會擋住 */
    '#ia-mask{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:9998}' +
    '#ia{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#fff;border-radius:18px 18px 0 0;' +
    'padding:20px 20px calc(20px + env(safe-area-inset-bottom));box-shadow:0 -4px 20px rgba(0,0,0,.2);' +
    'font-family:"Noto Sans TC",sans-serif;color:#222;animation:iaup .25s ease-out}' +
    '@keyframes iaup{from{transform:translateY(100%)}to{transform:none}}' +
    '#ia .hd{display:flex;align-items:center;gap:12px;margin-bottom:14px}' +
    '#ia .hd img{width:52px;height:52px;border-radius:12px}' +
    '#ia .hd b{font-size:18px;display:block}#ia .hd span{font-size:13px;color:#666}' +
    '#ia ol{margin:0 0 6px;padding-left:22px;font-size:16px;line-height:1.9}' +
    '#ia .ic{display:inline-flex;vertical-align:-5px;margin:0 2px}' +
    '#ia .btn{display:block;width:100%;box-sizing:border-box;text-align:center;padding:13px;margin-top:10px;' +
    'border:0;border-radius:10px;font-size:17px;text-decoration:none;cursor:pointer}' +
    '#ia .pri{background:#c62828;color:#fff}#ia .sec{background:#eee;color:#444}' +
    '#ia .tip{font-size:13px;color:#888;margin-top:8px;text-align:center}' +
    '#ia-arrow{position:fixed;z-index:10000;font-size:34px;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.5);' +
    'animation:iabob 1s infinite alternate}' +
    '@keyframes iabob{from{transform:translateY(0)}to{transform:translateY(8px)}}';

  var SHARE = '<span class="ic"><svg width="20" height="22" viewBox="0 0 20 22" fill="none" stroke="#1a73e8" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14V2M6 6l4-4 4 4"/>' +
    '<path d="M6 9H3v11h14V9h-3"/></svg></span>';
  var ADD = '<span class="ic"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#333" ' +
    'stroke-width="2"><rect x="2" y="2" width="16" height="16" rx="4"/><path d="M10 6v8M6 10h8"/></svg></span>';
  var DOTS = '<b style="font-size:20px;line-height:1">⋮</b>';

  // ---------- 依情況決定內容 ----------
  var body = '', actions = '', arrow = null;
  var here = location.href.split('#')[0];

  if (inApp) {
    body = '<p style="margin:0 0 8px;font-size:16px">您目前在 <b>' + (isLine ? 'LINE' : 'App') +
           '</b> 內開啟，無法加入主畫面。<br>請改用 <b>' + (isIOS ? 'Safari' : 'Chrome') + '</b> 開啟：</p>';
    if (isLine) {
      var u = here + (here.indexOf('?') < 0 ? '?' : '&') + 'openExternalBrowser=1';
      actions = '<a class="btn pri" href="' + u + '">用 ' + (isIOS ? 'Safari' : '瀏覽器') + ' 開啟</a>';
    } else if (isAndroid) {
      var intent = 'intent://' + here.replace(/^https?:\/\//, '') +
                   '#Intent;scheme=https;package=com.android.chrome;end';
      actions = '<a class="btn pri" href="' + intent + '">用 Chrome 開啟</a>';
    } else {
      body += '<ol><li>按右上或右下角的 ' + DOTS + ' 或 ' + SHARE + '</li>' +
              '<li>選「<b>以 Safari 開啟</b>」或「在瀏覽器中開啟」</li></ol>';
    }
    actions += '<button class="btn sec" id="ia-copy">複製網址（再貼到 ' + (isIOS ? 'Safari' : 'Chrome') + '）</button>';
  } else if (isIOS) {
    body = '<ol>' +
      '<li>按畫面' + (isIOSSafari ? '下方' : '上方') + '的「分享」' + SHARE + '</li>' +
      '<li>往下滑，選「<b>加入主畫面</b>」' + ADD + '</li>' +
      '<li>按右上角「<b>新增</b>」</li></ol>' +
      '<div class="tip">找不到分享按鈕？請先按右下角「⋯」</div>';
    if (!isIOSSafari) body += '<div class="tip">若找不到「加入主畫面」，請改用 Safari 開啟本頁</div>';
    if (isIOSSafari) arrow = '⬇';
  } else {
    body = '<ol><li>按右上角 ' + DOTS + '</li>' +
           '<li>選「<b>加到主畫面</b>」或「<b>安裝應用程式</b>」</li>' +
           '<li>按「<b>安裝</b>」或「<b>新增</b>」</li></ol>';
    actions = '<button class="btn pri" id="ia-install" style="display:none">安裝 App</button>';
  }

  // ---------- 畫出面板 ----------
  function show() {
    if (document.getElementById('ia')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var mask = document.createElement('div'); mask.id = 'ia-mask';
    var box = document.createElement('div'); box.id = 'ia';
    box.innerHTML =
      '<div class="hd"><img src="apple-touch-icon.png" alt=""><div><b>把「校園安全」加到手機桌面</b>' +
      '<span>緊急時一鍵撥打校安專線，不用再找網址</span></div></div>' +
      body + actions + '<button class="btn sec" id="ia-later">稍後再說</button>';
    document.body.appendChild(mask); document.body.appendChild(box);

    if (arrow) {
      var a = document.createElement('div'); a.id = 'ia-arrow'; a.textContent = arrow;
      a.style.left = 'calc(50% - 12px)'; a.style.bottom = '6px';
      // Safari 分享鈕在畫面最下方工具列中間；箭頭提示位置
      box.style.bottom = '64px'; box.style.borderRadius = '18px'; box.style.margin = '0 10px';
      document.body.appendChild(a);
    }

    function close(remember) {
      [box, mask, document.getElementById('ia-arrow')].forEach(function (el) { if (el) el.remove(); });
      if (remember) {
        try { localStorage.setItem(KEY, String(Date.now() + HIDE_DAYS * 864e5)); } catch (e) {}
      }
    }
    document.getElementById('ia-later').onclick = function () { close(true); };
    mask.onclick = function () { close(true); };

    var copy = document.getElementById('ia-copy');
    if (copy) copy.onclick = function () {
      var done = function () { copy.textContent = '已複製，請貼到 ' + (isIOS ? 'Safari' : 'Chrome') + ' 網址列'; };
      if (navigator.clipboard) navigator.clipboard.writeText(here).then(done, function () { prompt('請複製網址', here); });
      else prompt('請複製網址', here);
    };

    if (deferred) enableInstall();
  }

  // ---------- Android Chrome 一鍵安裝 ----------
  var deferred = null;
  function enableInstall() {
    var b = document.getElementById('ia-install');
    if (!b || !deferred) return;
    b.style.display = 'block';
    b.onclick = function () {
      deferred.prompt();
      deferred.userChoice.then(function (r) {
        if (r.outcome === 'accepted') {
          var el = document.getElementById('ia'); if (el) el.remove();
          var m = document.getElementById('ia-mask'); if (m) m.remove();
        }
        deferred = null;
      });
    };
  }
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e; enableInstall();
  });
  window.addEventListener('appinstalled', function () {
    var el = document.getElementById('ia'); if (el) el.remove();
    var m = document.getElementById('ia-mask'); if (m) m.remove();
  });

  // 頁面載入 1.5 秒後再顯示，先讓使用者看到撥號按鈕
  setTimeout(show, 1500);
})();
