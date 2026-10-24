/* NeuralPath: views/dashboard.js */
(function (NP) {
  'use strict';

  const { icon, esc } = NP.ui;

  function dailyCard() {
    const s = NP.store.state;
    const can = NP.store.canClaimDaily();
    const fact = NP.DAILY_FACTS[new Date().getDate() % NP.DAILY_FACTS.length];
    return `
      <article class="card card-daily">
        <div class="card-head">
          <span class="card-icon">${icon('sun')}</span>
          <div>
            <h2 class="card-title">Daily Warm-Up</h2>
            <p class="muted small">${s.daily.streak > 0 ? `${s.daily.streak}-day streak` : 'Start a streak today'}</p>
          </div>
        </div>
        <p class="fact"><span class="eyebrow">Today\u2019s signal</span><span data-simplify>${esc(fact)}</span></p>
        <button class="btn ${can ? 'btn-primary' : 'btn-ghost'}" data-claim ${can ? '' : 'disabled'}>
          ${icon(can ? 'gift' : 'circle-check')} ${can ? `Claim warm-up <span class="xp-pill">+${NP.XP.DAILY} XP</span>` : 'Claimed today. Come back tomorrow.'}
        </button>
      </article>`;
  }

  function triadCard() {
    const tokens = NP.store.triadTokens();
    const progress = NP.store.triadProgress();
    const steps = Array.from({ length: NP.XP.TRIAD_EVERY }, (_, i) =>
      `<span class="triad-step ${i < progress || tokens > 0 ? 'is-on' : ''}"></span>`).join('');
    return `
      <article class="card card-triad ${tokens > 0 ? 'is-ready' : ''}">
        <div class="card-head">
          <span class="card-icon card-icon-violet">${icon('swords')}</span>
          <div>
            <h2 class="card-title">Triad Boss Battle</h2>
            <p class="muted small">${tokens > 0 ? `${tokens} battle token${tokens > 1 ? 's' : ''} ready` : `${progress} of ${NP.XP.TRIAD_EVERY} lessons toward next battle`}</p>
          </div>
        </div>
        <div class="triad-steps" aria-hidden="true">${steps}</div>
        <p class="muted" data-simplify>Every three lessons unlocks a rapid-fire battle against The Hallucinator. Separate real facts from AI fabrications to win bonus XP and a legendary badge.</p>
        <button class="btn ${tokens > 0 ? 'btn-primary' : 'btn-ghost'}" data-triad>
          ${icon(tokens > 0 ? 'play' : 'lock')} ${tokens > 0 ? 'Enter the battle' : 'View battle rules'}
        </button>
      </article>`;
  }

  function moduleRow(mod) {
    const p = NP.store.moduleProgress(mod);
    return `
      <a class="module-row" href="#/modules/${mod.id}">
        <span class="card-icon ${mod.accent === 'violet' ? 'card-icon-violet' : ''}">${icon(mod.icon)}</span>
        <div class="module-row-main">
          <div class="module-row-top"><span class="module-row-title">${esc(mod.title)}</span><span class="muted small">${p.done}/${p.total}</span></div>
          ${NP.ui.progressBar(p.pct, `${mod.title} progress`)}
        </div>
        ${icon('chevron-right', 'muted')}
      </a>`;
  }

  NP.views = NP.views || {};
  NP.views.dashboard = {
    title: 'Dashboard',
    live: true,
    render() {
      const s = NP.store.state;
      const lp = NP.store.levelProgress();
      const next = NP.store.nextLesson();
      const badgeCount = Object.keys(s.badges).length;
      const recent = NP.BADGES.filter((b) => s.badges[b.id]).sort((a, b) => s.badges[b.id] - s.badges[a.id]).slice(0, 4);

      return `
        <section class="hero card">
          <div class="hero-copy">
            <p class="eyebrow">${icon('graduation-cap')} AI Learning Portal for Grades 9\u201312</p>
            <h1 class="display">Learn how AI works. <span class="grad-text">Use it with integrity.</span></h1>
            <p class="lead" data-simplify>NeuralPath turns artificial intelligence into a clear, hands-on path: understand the technology, master practical tools, and build the ethical judgment to use them well.</p>
            <div class="hero-actions">
              ${next
                ? `<button class="btn btn-primary btn-lg" data-lesson="${next.lesson.id}">${icon('play')} ${NP.store.lessonsDone() ? 'Continue' : 'Start'}: ${esc(next.lesson.title)}</button>`
                : `<a class="btn btn-primary btn-lg" href="#/badges">${icon('trophy')} View your achievements</a>`}
              <a class="btn btn-ghost btn-lg" href="#/workshop">${icon('flask-conical')} Open the Workshop</a>
            </div>
          </div>
          <div class="hero-ring">
            ${NP.ui.ring({ pct: lp.pct, size: 190, stroke: 14, label: `Lvl ${lp.level}`, sub: `${lp.into} / ${lp.size} XP` })}
            <p class="muted small">${lp.size - lp.into} XP to Level ${lp.level + 1}</p>
          </div>
        </section>

        <section class="stat-grid" aria-label="Your progress">
          <div class="card stat"><span class="stat-icon">${icon('zap')}</span><span class="stat-num">${s.xp}</span><span class="stat-label">Total XP</span></div>
          <div class="card stat"><span class="stat-icon">${icon('book-open')}</span><span class="stat-num">${NP.store.lessonsDone()}<small>/${NP.TOTAL_LESSONS}</small></span><span class="stat-label">Lessons complete</span></div>
          <div class="card stat"><span class="stat-icon">${icon('award')}</span><span class="stat-num">${badgeCount}<small>/${NP.BADGES.length}</small></span><span class="stat-label">Badges earned</span></div>
          <div class="card stat"><span class="stat-icon">${icon('flame')}</span><span class="stat-num">${s.daily.streak}</span><span class="stat-label">Day streak</span></div>
        </section>

        <section class="two-col">
          ${dailyCard()}
          ${triadCard()}
        </section>

        <section class="two-col two-col-wide">
          <article class="card">
            <div class="section-head">
              <h2 class="card-title">Module progress</h2>
              <a class="link" href="#/modules">All modules ${icon('arrow-right')}</a>
            </div>
            <div class="module-rows">${NP.MODULES.map(moduleRow).join('')}</div>
          </article>
          <article class="card">
            <div class="section-head">
              <h2 class="card-title">Recent badges</h2>
              <a class="link" href="#/badges">Gallery ${icon('arrow-right')}</a>
            </div>
            ${recent.length
              ? `<ul class="recent-badges">${recent.map((b) => `
                  <li><span class="badge-medal badge-${b.rarity}">${icon(b.icon)}</span><div><p class="badge-name">${esc(b.name)}</p><p class="muted small">${esc(b.desc)}</p></div></li>`).join('')}</ul>`
              : `<div class="empty">${icon('award')}<p>Complete a lesson or claim your warm-up to earn your first badge.</p></div>`}
          </article>
        </section>`;
    },
    mount(root) {
      const claim = root.querySelector('[data-claim]');
      if (claim) claim.addEventListener('click', () => NP.store.claimDaily());
      root.querySelector('[data-triad]').addEventListener('click', () => NP.triad.open());
    }
  };
})(window.NP = window.NP || {});
