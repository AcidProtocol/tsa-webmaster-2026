/* NeuralPath: views/modules.js
   Module catalog (#/modules) and module detail (#/modules/:id). */
(function (NP) {
  'use strict';

  const { icon, esc } = NP.ui;

  function catalog() {
    return `
      <header class="page-head">
        <p class="eyebrow">${icon('book-open')} Curriculum</p>
        <h1 class="page-title">Learning <span class="grad-text">Modules</span></h1>
        <p class="lead" data-simplify>Four modules, seventeen lessons. Each lesson ends with a knowledge check-in, so XP reflects real understanding.</p>
      </header>
      <div class="module-grid">
        ${NP.MODULES.map((mod, i) => {
          const p = NP.store.moduleProgress(mod);
          const complete = p.done === p.total;
          return `
            <a class="card module-card accent-${mod.accent}" href="#/modules/${mod.id}">
              <div class="module-card-top">
                <span class="card-icon ${mod.accent === 'violet' ? 'card-icon-violet' : ''}">${icon(mod.icon)}</span>
                <span class="module-num">Module ${String(i + 1).padStart(2, '0')}</span>
              </div>
              <h2 class="module-title">${esc(mod.title)}</h2>
              <p class="muted" data-simplify>${esc(mod.tagline)}</p>
              <div class="module-meta">
                <span>${icon('layers')} ${mod.lessons.length} lessons</span>
                <span>${icon('clock')} ${mod.lessons.reduce((s, l) => s + l.minutes, 0)} min</span>
                <span>${icon('zap')} ${mod.lessons.length * NP.XP.LESSON + NP.XP.MODULE_BONUS} XP</span>
              </div>
              <div class="module-progress">
                ${NP.ui.progressBar(p.pct, `${mod.title} progress`)}
                <span class="small ${complete ? 'text-good' : 'muted'}">${complete ? 'Complete' : `${p.done} of ${p.total}`}</span>
              </div>
            </a>`;
        }).join('')}
      </div>`;
  }

  function detail(mod) {
    const p = NP.store.moduleProgress(mod);
    const index = NP.MODULES.indexOf(mod);
    const firstOpen = mod.lessons.find((l) => !NP.store.isLessonDone(l.id));
    return `
      <a class="back-link" href="#/modules">${icon('chevron-left')} All modules</a>
      <section class="card module-hero accent-${mod.accent}">
        <div class="module-hero-copy">
          <p class="eyebrow">${icon(mod.icon)} Module ${String(index + 1).padStart(2, '0')}</p>
          <h1 class="page-title">${esc(mod.title)}</h1>
          <p class="lead" data-simplify>${esc(mod.tagline)}</p>
          ${firstOpen
            ? `<button class="btn btn-primary" data-lesson="${firstOpen.id}">${icon('play')} ${p.done ? 'Continue' : 'Start'} module</button>`
            : `<p class="text-good">${icon('circle-check')} Module complete. +${NP.XP.MODULE_BONUS} XP bonus earned.</p>`}
        </div>
        ${NP.ui.ring({ pct: p.pct, size: 140, stroke: 11, label: `${Math.round(p.pct * 100)}%`, sub: `${p.done} / ${p.total} lessons` })}
      </section>

      <ol class="lesson-list">
        ${mod.lessons.map((l, i) => {
          const done = NP.store.isLessonDone(l.id);
          return `
            <li>
              <button class="card lesson-row ${done ? 'is-done' : ''}" data-lesson="${l.id}">
                <span class="lesson-index" aria-hidden="true">${done ? icon('check') : String(i + 1).padStart(2, '0')}</span>
                <span class="lesson-row-main">
                  <span class="lesson-row-title">${esc(l.title)}</span>
                  <span class="muted small" data-simplify>${esc(l.intro.split('. ')[0])}.</span>
                </span>
                <span class="lesson-row-meta">
                  <span class="muted small">${icon('clock')} ${l.minutes} min</span>
                  <span class="status-pill ${done ? 'is-done' : ''}">${done ? 'Completed' : `+${NP.XP.LESSON} XP`}</span>
                </span>
              </button>
            </li>`;
        }).join('')}
      </ol>
      <p class="sr-only">${done(p)}</p>`;
  }

  const done = (p) => `${p.done} of ${p.total} lessons completed.`;

  NP.views = NP.views || {};
  NP.views.modules = {
    title: 'Modules',
    live: true,
    render(params) {
      const mod = params[0] ? NP.findModule(params[0]) : null;
      return mod ? detail(mod) : catalog();
    }
  };
})(window.NP = window.NP || {});
