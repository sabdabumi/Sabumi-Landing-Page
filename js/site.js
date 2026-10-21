/* Sabumi.id v2 — shared behaviour for every page */
(function(){
  var html = document.documentElement;

  /* ---------- Language (ID default, EN from data-en attributes) ---------- */
  var textEls = [].slice.call(document.querySelectorAll('[data-en]'));
  textEls.forEach(function(el){ el.dataset.id = el.textContent; });
  var altEls = [].slice.call(document.querySelectorAll('[data-en-alt]'));
  altEls.forEach(function(el){ el.dataset.idAlt = el.getAttribute('alt'); });
  var labelEls = [].slice.call(document.querySelectorAll('[data-en-label]'));
  labelEls.forEach(function(el){ el.dataset.idLabel = el.getAttribute('aria-label'); });
  var titleId = document.title, titleEn = html.dataset.titleEn || titleId;
  var lang = 'id';
  var listeners = [];

  function setLang(l){
    lang = l;
    var en = l === 'en';
    textEls.forEach(function(el){ el.textContent = en ? el.dataset.en : el.dataset.id; });
    altEls.forEach(function(el){ el.setAttribute('alt', en ? el.dataset.enAlt : el.dataset.idAlt); });
    labelEls.forEach(function(el){ el.setAttribute('aria-label', en ? el.dataset.enLabel : el.dataset.idLabel); });
    html.lang = l;
    document.title = en ? titleEn : titleId;
    document.querySelectorAll('[data-lang]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.lang === l)); });
    listeners.forEach(function(fn){ fn(l); });
    try { localStorage.setItem('sabumi-lang', l); } catch(e){}
  }
  document.querySelectorAll('[data-lang]').forEach(function(b){
    b.addEventListener('click', function(){ setLang(b.dataset.lang); });
  });

  /* ---------- Header ---------- */
  var nav = document.querySelector('.nav');
  var onScroll = function(){ nav.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  var toggle = document.querySelector('.menu-toggle'), menu = document.getElementById('menu');
  function closeMenu(){ toggle.setAttribute('aria-expanded','false'); menu.classList.remove('open'); document.body.classList.remove('menu-open'); }
  toggle.addEventListener('click', function(){
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  });

  /* Header steps aside while scrolling down, returns when scrolling up or when it holds focus */
  var lastY = window.scrollY;
  window.addEventListener('scroll', function(){
    var y = window.scrollY;
    if (menu.classList.contains('open') || nav.contains(document.activeElement)) { nav.classList.remove('away'); lastY = y; return; }
    if (y > lastY + 6 && y > 420) nav.classList.add('away');
    else if (y < lastY - 6 || y < 420) nav.classList.remove('away');
    lastY = y;
  }, {passive:true});
  nav.addEventListener('focusin', function(){ nav.classList.remove('away'); });

  /* ---------- Section reveal ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var groups = ['.sec-head', '.pillars > *', '.ledger', '.soon > *', '.news > *', '.feed > *', '.stats > *',
    '.steps > *', '.sdgs > *', '.sdg-list > *', '.trio > *', '.offer > *', '.tiers > *', '.track > *',
    '.channels > *', '.kec > *', '.region-map', '.table-wrap', '.band blockquote', '.band .wrap > div',
    '.cta-band', '.composer', '.collab-grid > div', '.story > div', '.glossary > *', '.partners', '.facts', '.group-head', '.filters'];
  var targets = [];
  groups.forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(el){
      if (el.closest('.hero') || el.classList.contains('rv')) return;
      var sib = [].slice.call(el.parentNode.children).filter(function(c){ return c.matches(sel); });
      el.style.setProperty('--i', Math.min(sib.indexOf(el), 6));
      el.classList.add('rv'); targets.push(el);
    });
  });
  document.querySelectorAll('.story figure img, .entry-fig img').forEach(function(el){ el.classList.add('rv-img'); targets.push(el); });
  /* Anything already on screen at load is shown as is; only what scrolls into view animates */
  targets = targets.filter(function(el){
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) { el.classList.add('in'); return false; }
    return true;
  });
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function(el){ el.classList.add('in'); });
  } else {
    var ro = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); } });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.08});
    targets.forEach(function(el){ ro.observe(el); });
  }

  /* ---------- Mobile action dock ---------- */
  var dock = document.querySelector('.dock');
  if (dock && 'IntersectionObserver' in window) {
    var blockers = new Set();
    var updateDock = function(){ dock.classList.toggle('show', window.scrollY > 520 && blockers.size === 0); };
    var bo = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting) blockers.add(en.target); else blockers.delete(en.target); });
      updateDock();
    });
    document.querySelectorAll('form.composer, footer, .cta-band').forEach(function(el){ bo.observe(el); });
    window.addEventListener('scroll', updateDock, {passive:true});
  }
  menu.addEventListener('click', function(e){ if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); toggle.focus(); }
  });

  /* ---------- Contour lines ---------- */
  document.querySelectorAll('svg.contour').forEach(function(svg){
    var W = 1600, H = +svg.dataset.h || 900;
    var cx = +svg.dataset.cx || 1180, cy = +svg.dataset.cy || 430, rings = +svg.dataset.rings || 14;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var NS = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < rings; i++) {
      var r = 70 + i * 52, pts = [];
      for (var a = 0; a <= 64; a++) {
        var t = a / 64 * Math.PI * 2;
        var wob = 1 + 0.16 * Math.sin(3 * t + i * 0.35) + 0.09 * Math.sin(5 * t + 1.3 + i * 0.2) + 0.05 * Math.sin(9 * t + i);
        pts.push((cx + Math.cos(t) * r * wob * 1.35).toFixed(1) + ' ' + (cy + Math.sin(t) * r * wob * 0.8).toFixed(1));
      }
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', 'M' + pts.join('L') + 'Z');
      path.setAttribute('pathLength', '1');
      if (i % 4 === 3) path.setAttribute('class', 'index');
      path.style.animationDelay = (i * 0.07) + 's';
      svg.appendChild(path);
    }
  });

  /* ---------- Region accordion + map ---------- */
  var kecButtons = [].slice.call(document.querySelectorAll('.kec button'));
  if (kecButtons.length) {
    var activate = function(k){
      kecButtons.forEach(function(b){
        var on = b.dataset.k === k;
        b.setAttribute('aria-expanded', String(on));
        document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
      });
      document.querySelectorAll('.region-map g[data-k] .map-dot').forEach(function(c){
        var on = c.parentNode.dataset.k === k;
        c.classList.toggle('active', on); c.setAttribute('r', on ? 13 : 9);
      });
    };
    kecButtons.forEach(function(b){ b.addEventListener('click', function(){ activate(b.dataset.k); }); });
    activate(kecButtons[0].dataset.k);
  }

  /* ---------- Programme filter ---------- */
  var filterBtns = [].slice.call(document.querySelectorAll('.filters button'));
  if (filterBtns.length) {
    var progs = [].slice.call(document.querySelectorAll('[data-pilar]'));
    var status = document.getElementById('filter-status');
    var current = 'semua';
    var applyFilter = function(){
      var shown = 0;
      progs.forEach(function(p){
        var on = current === 'semua' || p.dataset.pilar.split(' ').indexOf(current) > -1;
        p.hidden = !on; if (on) shown++;
      });
      document.querySelectorAll('[data-group]').forEach(function(g){
        var any = g.querySelector('[data-pilar]:not([hidden])');
        g.hidden = !any;
      });
      status.textContent = lang === 'en' ? shown + ' programmes shown' : shown + ' program ditampilkan';
    };
    filterBtns.forEach(function(b){
      b.addEventListener('click', function(){
        current = b.dataset.filter;
        filterBtns.forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); });
        applyFilter();
      });
    });
    listeners.push(applyFilter);
    applyFilter();
  }

  /* ---------- Copy to clipboard (contact page) ---------- */
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click', function(){
      var out = document.getElementById(b.dataset.out);
      var done = function(ok){
        out.textContent = ok ? (lang === 'en' ? 'Copied.' : 'Tersalin.') : (lang === 'en' ? 'Copy failed. Select the text manually.' : 'Gagal menyalin. Pilih teksnya secara manual.');
        setTimeout(function(){ out.textContent = ''; }, 4000);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).then(function(){ done(true); }, function(){ done(false); });
      else done(false);
    });
  });

  /* ---------- WhatsApp composer ---------- */
  var form = document.querySelector('form.composer');
  if (form) {
    var topicsId = ['Menjadi relawan','Kerja sama / CSR','Riset atau KKN kampus','Pertanyaan program'];
    var topicsEn = ['Volunteering','Partnership / CSR','Campus research or community service','Programme question'];
    var nameEl = document.getElementById('c-name'), msgEl = document.getElementById('c-msg'), topicEl = document.getElementById('c-topic');
    var check = function(input, errId){
      var ok = input.value.trim() !== '';
      input.setAttribute('aria-invalid', String(!ok));
      document.getElementById(errId).hidden = ok;
      return ok;
    };
    nameEl.addEventListener('blur', function(){ if (nameEl.hasAttribute('aria-invalid')) check(nameEl,'e-name'); });
    msgEl.addEventListener('blur', function(){ if (msgEl.hasAttribute('aria-invalid')) check(msgEl,'e-msg'); });
    /* ?topik=1 preselects a topic, e.g. from "Diskusikan dengan kami" links */
    var m = /[?&]topik=(\d)/.exec(location.search);
    if (m && topicEl.options[+m[1]]) topicEl.value = m[1];
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var okName = check(nameEl,'e-name'), okMsg = check(msgEl,'e-msg');
      if (!okName) { nameEl.focus(); return; }
      if (!okMsg) { msgEl.focus(); return; }
      var en = lang === 'en', t = +topicEl.value;
      var org = document.getElementById('c-org').value.trim();
      var text = (en ? 'Hello Sabumi, I am ' : 'Halo Sabumi, saya ') + nameEl.value.trim() +
        (org ? (en ? ' from ' : ' dari ') + org : '') + '.\n' +
        (en ? 'Topic: ' + topicsEn[t] : 'Topik: ' + topicsId[t]) + '\n\n' + msgEl.value.trim();
      window.open('https://wa.me/6285860945889?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }

  try { if (localStorage.getItem('sabumi-lang') === 'en') setLang('en'); } catch(e){}
})();
