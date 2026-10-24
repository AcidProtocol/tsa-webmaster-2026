/* NeuralPath: app.js
   Renders the dashboard from NP (store.js) and handles theme + toasts. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  /* ---- Theme ------------------------------------------------------- */
  function applyTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    var dark = theme === 'dark';
    var btn = $('theme-toggle');
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    $('theme-ico').textContent = dark ? '☀️' : '🌙';
    if (persist) {
      try { localStorage.setItem('neuralpath.theme', theme); } catch (e) { /* ignore */ }
    }
  }

  /* ---- Toasts ------------------------------------------------------ */
  function toast(text, kind) {
    var el = document.createElement('div');
    el.className = 'toast';
    if (kind) el.setAttribute('data-kind', kind);
    el.textContent = text;
    $('toast-region').appendChild(el);
    setTimeout(function () { el.remove(); }, 4200);
  }

  function announce(result, label) {
    if (result.xpGained) toast('+' + result.xpGained + ' XP' + (label ? ' · ' + label : ''));
    if (result.moduleFinished) toast('Module finished! Bonus XP earned.');
    if (result.leveledUp) toast('Level up! You are now level ' + NP.level().level + '.');
    result.newBadges.forEach(function (b) { toast('Badge earned: ' + b.name, 'badge'); });
  }

  /* ---- Rendering --------------------------------------------------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderHeader() {
    var state = NP.load();
    var lv = NP.level();
    var pct = Math.round((lv.into / lv.needed) * 100);

    $('xp-total').textContent = state.xp;
    $('level-num').textContent = lv.level;
    $('level-ring').style.setProperty('--p', pct);
    $('level-ring').setAttribute('aria-label', 'Level ' + lv.level + ', ' + pct + ' percent to next level');
    $('level-note').textContent = (lv.needed - lv.into) + ' XP to level ' + (lv.level + 1);
  }

  function renderHero() {
    var next = null;
    var nextModule = null;
    NP.MODULES.some(function (m) {
      var l = NP.nextLesson(m.id);
      if (l) { next = l; nextModule = m; return true; }
      return false;
    });

    var btn = $('continue-btn');
    var any = NP.overall().done > 0;
    if (!next) {
      btn.textContent = 'Review the modules';
      btn.setAttribute('href', 'pages/concepts.html');
      $('hero-sub').textContent = 'You finished every lesson. Nice work. Review any module to keep the ideas fresh.';
    } else {
      btn.textContent = (any ? 'Continue: ' : 'Start: ') + next.title;
      btn.setAttribute('href', nextModule.page);
    }
  }

  function renderTrail() {
    var trail = $('trail');
    trail.textContent = '';
    var classes = ['--concepts', '--tools', '--ethics'];

    NP.MODULES.forEach(function (m, i) {
      var p = NP.moduleProgress(m.id);
      var state = p.done === p.total ? 'done' : p.done > 0 ? 'progress' : 'todo';
      var li = el('li', 'trail-node');
      li.setAttribute('data-state', state);
      li.style.setProperty('--node-color', 'var(' + classes[i] + ')');
      var dot = el('span', 'trail-dot', state === 'done' ? '✅' : m.icon);
      dot.setAttribute('aria-hidden', 'true');
      li.appendChild(dot);
      li.appendChild(el('span', 'trail-name', m.title));
      li.appendChild(el('span', 'trail-count', p.done + ' of ' + p.total + ' lessons'));
      trail.appendChild(li);
    });

    var o = NP.overall();
    trail.style.setProperty('--pct-num', String(o.pct / 100));
    $('overall-pct').textContent = o.pct + '%';
  }

  function renderStats() {
    var o = NP.overall();
    var finished = NP.MODULES.filter(function (m) { return NP.moduleDone(m.id); }).length;
    $('stat-lessons').textContent = o.done;
    $('stat-modules').textContent = finished + '/' + NP.MODULES.length;
    $('stat-badges').textContent = NP.load().badges.length;

    var claimed = NP.warmupClaimed();
    $('warmup-btn').disabled = claimed;
    $('warmup-note').textContent = claimed ? 'Claimed today. Come back tomorrow.' : '+' + NP.XP_WARMUP + ' XP, once a day';
  }

  function renderModules() {
    var grid = $('modules-grid');
    grid.textContent = '';

    NP.MODULES.forEach(function (m) {
      var p = NP.moduleProgress(m.id);
      var card = el('article', 'module-card');
      card.setAttribute('data-module', m.id);

      var ico = el('div', 'module-ico', m.icon);
      ico.setAttribute('aria-hidden', 'true');
      card.appendChild(ico);
      card.appendChild(el('h3', null, m.title));
      card.appendChild(el('p', 'module-blurb', m.blurb));

      var prog = el('div', 'progress');
      var meta = el('div', 'progress-meta');
      meta.appendChild(el('span', null, p.done + ' of ' + p.total + ' lessons'));
      meta.appendChild(el('span', null, p.pct + '%'));
      var bar = el('div', 'bar');
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-label', m.title + ' progress');
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
      bar.setAttribute('aria-valuenow', String(p.pct));
      var fill = el('div', 'bar-fill');
      fill.style.width = p.pct + '%';
      bar.appendChild(fill);
      prog.appendChild(meta);
      prog.appendChild(bar);
      card.appendChild(prog);

      var done = p.done === p.total;
      var a = el('a', 'btn', done ? 'Review module' : p.done ? 'Continue' : 'Start module');
      a.setAttribute('href', m.page);
      a.setAttribute('data-done', String(done));
      card.appendChild(a);

      grid.appendChild(card);
    });
  }

  function renderBadges() {
    var earned = NP.load().badges;
    var list = $('badge-grid');
    list.textContent = '';
    NP.BADGES.forEach(function (b) {
      var has = earned.indexOf(b.id) !== -1;
      var li = el('li', 'badge');
      li.setAttribute('data-earned', String(has));
      var ico = el('span', 'badge-ico', b.icon);
      ico.setAttribute('aria-hidden', 'true');
      li.appendChild(ico);
      li.appendChild(el('span', 'badge-name', b.name));
      li.appendChild(el('span', 'badge-desc', has ? 'Earned' : b.desc));
      list.appendChild(li);
    });
  }

  function renderAll() {
    renderHeader();
    renderHero();
    renderTrail();
    renderStats();
    renderModules();
    renderBadges();
  }

  /* ---- Events ------------------------------------------------------ */
  function init() {
    applyTheme(document.documentElement.getAttribute('data-theme') || 'light', false);

    $('theme-toggle').addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
    });

    $('warmup-btn').addEventListener('click', function () {
      var r = NP.claimWarmup();
      if (r.already) { toast('You already claimed today\'s warm-up.'); }
      else { announce(r, 'daily warm-up'); }
      renderAll();
    });

    document.querySelectorAll('[data-demo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-demo');
        var next = NP.nextLesson(id);
        if (!next) { toast('That module is already finished.'); return; }
        announce(NP.completeLesson(id, next.id), next.title);
        renderAll();
      });
    });

    $('reset-btn').addEventListener('click', function () {
      if (window.confirm('Reset all XP, progress, and badges on this device?')) {
        NP.reset();
        renderAll();
        toast('Progress reset.');
      }
    });

    renderAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
