/* NeuralPath: ui.js
   Shared rendering helpers: icons, escaping, progress ring, toasts, dialogs. */
(function (NP) {
  'use strict';

  let ringId = 0;

  NP.ui = {
    icon(name, cls = '') {
      return `<i data-lucide="${name}" class="icon ${cls}" aria-hidden="true"></i>`;
    },

    esc(value) {
      return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },

    /* Glowing SVG progress ring used for level progress. */
    ring({ pct, size = 160, stroke = 12, label = '', sub = '' }) {
      const id = `ring-${++ringId}`;
      const r = (size - stroke) / 2;
      const c = 2 * Math.PI * r;
      const offset = c * (1 - Math.min(1, Math.max(0, pct)));
      return `
        <div class="ring" style="width:${size}px;height:${size}px">
          <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
            <defs>
              <linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="var(--cyan)" />
                <stop offset="100%" stop-color="var(--violet)" />
              </linearGradient>
              <filter id="${id}-f" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" fill="none" />
            <circle class="ring-value" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" fill="none"
              stroke="url(#${id}-g)" filter="url(#${id}-f)" stroke-linecap="round"
              stroke-dasharray="${c}" stroke-dashoffset="${offset}"
              transform="rotate(-90 ${size / 2} ${size / 2})" />
          </svg>
          <div class="ring-label"><span class="ring-main">${label}</span><span class="ring-sub">${sub}</span></div>
        </div>`;
    },

    progressBar(pct, label) {
      const value = Math.round(pct * 100);
      return `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}" aria-label="${NP.ui.esc(label)}">
        <span class="bar-fill" style="width:${value}%"></span></div>`;
    },

    toast({ title, body = '', icon = 'zap', tone = 'cyan' }) {
      const region = document.getElementById('toasts');
      if (!region) return;
      const el = document.createElement('div');
      el.className = `toast toast-${tone}`;
      el.innerHTML = `<span class="toast-icon">${NP.ui.icon(icon)}</span>
        <div><p class="toast-title">${NP.ui.esc(title)}</p>${body ? `<p class="toast-body">${NP.ui.esc(body)}</p>` : ''}</div>`;
      region.appendChild(el);
      NP.ui.refreshIcons();
      setTimeout(() => el.classList.add('toast-out'), 3200);
      setTimeout(() => el.remove(), 3700);
    },

    refreshIcons() {
      if (window.lucide) window.lucide.createIcons();
    },

    /* Run after any render: swap icon placeholders and apply Plain Language mode. */
    hydrate(root) {
      NP.ui.refreshIcons();
      if (NP.a11y) NP.a11y.applyPlain(root || document);
    },

    openDialog(dialog) {
      if (!dialog.open) dialog.showModal();
      document.body.classList.add('no-scroll');
    },

    closeDialog(dialog) {
      if (dialog.open) dialog.close();
    },

    bindDialog(dialog, onClose) {
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
      });
      dialog.addEventListener('close', () => {
        document.body.classList.remove('no-scroll');
        if (onClose) onClose();
      });
    }
  };
})(window.NP = window.NP || {});
