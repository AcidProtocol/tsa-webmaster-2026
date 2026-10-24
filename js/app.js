/* NeuralPath: app.js
   Hash-based single-page view switcher, sidebar progress widget, and reward notifications.
   Unknown routes fall back to the dashboard, so the portal never shows a 404. */
(function (NP) {
  'use strict';

  const { icon } = NP.ui;
  const ROUTES = ['dashboard', 'modules', 'workshop', 'datalab', 'badges', 'about'];
  let current = { name: null, params: [] };
  let firstRender = true;

  function parseHash() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const name = ROUTES.includes(parts[0]) ? parts[0] : 'dashboard';
    if (parts[0] && !ROUTES.includes(parts[0])) history.replaceState(null, '', '#/dashboard');
    return { name, params: parts.slice(1) };
  }

  function renderView({ preserveScroll = false } = {}) {
    const view = NP.views[current.name];
    const root = document.getElementById('view');
    const y = window.scrollY;
    root.innerHTML = view.render(current.params);
    if (view.mount) view.mount(root, current.params);
    NP.ui.hydrate(root);
    if (preserveScroll) window.scrollTo(0, y);
  }

  function navigate() {
    current = parseHash();
    const view = NP.views[current.name];
    document.title = `${view.title} | NeuralPath AI Learning Portal`;
    document.querySelectorAll('[data-nav]').forEach((a) => {
      const on = a.dataset.nav === current.name;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const root = document.getElementById('view');
    root.classList.remove('view-enter');
    void root.offsetWidth;
    root.classList.add('view-enter');
    renderView();
    window.scrollTo(0, 0);
    if (!firstRender) document.getElementById('main').focus({ preventScroll: true });
    firstRender = false;
  }

  function renderSidebar() {
    const lp = NP.store.levelProgress();
    const tokens = NP.store.triadTokens();
    document.querySelector('[data-side-xp]').innerHTML = `
      ${NP.ui.ring({ pct: lp.pct, size: 56, stroke: 6, label: String(lp.level), sub: '' })}
      <div class="side-xp-text">
        <span class="side-level">Level ${lp.level}</span>
        <span class="muted small">${lp.into} / ${lp.size} XP</span>
      </div>
      ${tokens > 0 ? `<button class="side-triad" data-open-triad aria-label="${tokens} Triad battle token available">${icon('swords')}<span>${tokens}</span></button>` : ''}`;
    const triadBtn = document.querySelector('[data-open-triad]');
    if (triadBtn) triadBtn.addEventListener('click', () => NP.triad.open());
    NP.ui.refreshIcons();
  }

  function bindRewards() {
    NP.bus.on('xp', ({ amount, reason }) => NP.ui.toast({ title: `+${amount} XP`, body: reason, icon: 'zap' }));
    NP.bus.on('level', ({ level }) => NP.ui.toast({ title: `Level ${level} reached`, body: 'Your neural path is getting stronger.', icon: 'trending-up', tone: 'violet' }));
    NP.bus.on('badge', (b) => NP.ui.toast({ title: `Badge unlocked: ${b.name}`, body: b.desc, icon: b.icon, tone: 'violet' }));
    NP.bus.on('triad-unlocked', () => NP.ui.toast({ title: 'Triad Boss Battle unlocked', body: 'Open it from the dashboard or sidebar.', icon: 'swords', tone: 'violet' }));
    NP.bus.on('change', () => {
      renderSidebar();
      const view = NP.views[current.name];
      if (view && view.live) renderView({ preserveScroll: true });
    });
  }

  function init() {
    NP.lesson.init();
    NP.triad.init();
    NP.assistant.init();
    NP.a11y.init();
    bindRewards();

    document.getElementById('view').addEventListener('click', (e) => {
      const lessonBtn = e.target.closest('[data-lesson]');
      if (lessonBtn) NP.lesson.open(lessonBtn.dataset.lesson);
    });

    window.addEventListener('hashchange', navigate);
    if (!location.hash) history.replaceState(null, '', '#/dashboard');
    renderSidebar();
    navigate();
  }

  document.addEventListener('DOMContentLoaded', init);
})(window.NP = window.NP || {});
