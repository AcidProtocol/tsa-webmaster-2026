/* NeuralPath: ui.js
   Shared interface helpers used by every page: theme toggle, toasts, XP pill.
   Load after store.js. Every helper quietly does nothing if its element is missing. */
window.UI = (function () {
    'use strict';

    function $(id) { return document.getElementById(id); }

    function applyTheme(theme, persist) {
        document.documentElement.setAttribute('data-theme', theme);
        var dark = theme === 'dark';
        var btn = $('theme-toggle');
        if (btn) {
            btn.setAttribute('aria-pressed', String(dark));
            btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        }
        var ico = $('theme-ico');
        if (ico) ico.textContent = dark ? '☀️' : '🌙';
        if (persist) {
            try { localStorage.setItem('neuralpath.theme', theme); } catch (e) { /* ignore */ }
        }
    }

    function initTheme() {
        applyTheme(document.documentElement.getAttribute('data-theme') || 'light', false);
        var btn = $('theme-toggle');
        if (btn) {
            btn.addEventListener('click', function () {
                var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                applyTheme(next, true);
            });
        }
    }

    function toast(text, kind) {
        var region = $('toast-region');
        if (!region) return;
        var el = document.createElement('div');
        el.className = 'toast';
        if (kind) el.setAttribute('data-kind', kind);
        el.textContent = text;
        region.appendChild(el);
        setTimeout(function () { el.remove(); }, 4200);
    }

    function syncXP() {
        var n = $('xp-total');
        if (n) n.textContent = NP.load().xp;
    }

    /* Turns a store result ({xpGained, newBadges, leveledUp, moduleFinished}) into toasts. */
    function announce(result, label) {
        if (!result) return;
        if (result.xpGained) toast('+' + result.xpGained + ' XP' + (label ? ' · ' + label : ''));
        if (result.moduleFinished) toast('Module finished! Bonus XP earned.');
        if (result.leveledUp) toast('Level up! You are now level ' + NP.level().level + '.');
        (result.newBadges || []).forEach(function (b) { toast('Badge earned: ' + b.name, 'badge'); });
        syncXP();
    }

    return { initTheme: initTheme, toast: toast, announce: announce, syncXP: syncXP };
})();