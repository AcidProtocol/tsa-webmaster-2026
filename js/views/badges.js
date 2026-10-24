/* NeuralPath: views/badges.js */
(function (NP) {
  'use strict';

  const { icon, esc } = NP.ui;
  const RARITY_LABEL = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', legendary: 'Legendary' };

  NP.views = NP.views || {};
  NP.views.badges = {
    title: 'Badges',
    live: true,
    render() {
      const s = NP.store.state;
      const earned = NP.BADGES.filter((b) => s.badges[b.id]).length;
      return `
        <header class="page-head page-head-row">
          <div>
            <p class="eyebrow">${icon('award')} Achievements</p>
            <h1 class="page-title">Badge <span class="grad-text">Gallery</span></h1>
            <p class="lead">Earn badges by learning, practicing, and exploring. Hover or focus a badge to see how to unlock it.</p>
          </div>
          ${NP.ui.ring({ pct: earned / NP.BADGES.length, size: 130, stroke: 10, label: `${earned}/${NP.BADGES.length}`, sub: 'unlocked' })}
        </header>
        <ul class="badge-grid">
          ${NP.BADGES.map((b) => {
            const at = s.badges[b.id];
            const tipId = `tip-${b.id}`;
            return `
              <li>
                <button class="card badge-card ${at ? 'is-unlocked' : 'is-locked'} badge-${b.rarity}" aria-describedby="${tipId}">
                  <span class="badge-medal badge-${b.rarity}">${icon(at ? b.icon : 'lock')}</span>
                  <span class="badge-name">${esc(b.name)}</span>
                  <span class="rarity rarity-${b.rarity}">${RARITY_LABEL[b.rarity]}</span>
                  <span class="badge-tip" role="tooltip" id="${tipId}">
                    <strong>${at ? 'Unlocked' : 'Locked'}</strong>
                    ${esc(b.desc)}
                    ${at ? `<em>Earned ${new Date(at).toLocaleDateString()}</em>` : ''}
                  </span>
                </button>
              </li>`;
          }).join('')}
        </ul>`;
    }
  };
})(window.NP = window.NP || {});
