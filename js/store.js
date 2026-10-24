/* NeuralPath: store.js
   Progress, XP, levels, badges, and the reward engine.
   Saved in localStorage only. No accounts and no personal data are collected. */
(function (NP) {
  'use strict';

  const KEY = 'neuralpath.v2';

  NP.XP = {
    LESSON: 25,
    MODULE_BONUS: 100,
    DAILY: 15,
    TRIAD_WIN: 75,
    WORKSHOP_PART: 20,
    LEVEL_SIZE: 150,
    TRIAD_EVERY: 3
  };

  /* ---- Tiny event bus ----------------------------------------------- */
  const listeners = {};
  NP.bus = {
    on(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
    emit(type, payload) { (listeners[type] || []).forEach((fn) => fn(payload)); }
  };

  const defaults = () => ({
    xp: 0,
    lessons: {},
    modules: {},
    badges: {},
    daily: { last: null, streak: 0 },
    triad: { played: 0, wins: 0, best: 0 },
    workshop: {},
    stats: { assistant: 0, a11y: 0, datalab: [] },
    prefs: { contrast: false, dyslexia: false, plain: false, text: 'md' }
  });

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (!raw) return defaults();
      const base = defaults();
      return {
        ...base,
        ...raw,
        daily: { ...base.daily, ...raw.daily },
        triad: { ...base.triad, ...raw.triad },
        stats: { ...base.stats, ...raw.stats },
        prefs: { ...base.prefs, ...raw.prefs }
      };
    } catch (e) {
      return defaults();
    }
  }

  let state = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
    NP.bus.emit('change', state);
  }

  const today = () => new Date().toISOString().slice(0, 10);

  const helpers = {
    lessonsDone: () => Object.keys(state.lessons).length,
    level: () => Math.floor(state.xp / NP.XP.LEVEL_SIZE) + 1
  };

  function addXp(amount, reason) {
    const before = helpers.level();
    state.xp += amount;
    NP.bus.emit('xp', { amount, reason });
    const after = helpers.level();
    if (after > before) NP.bus.emit('level', { level: after });
  }

  function checkBadges() {
    NP.BADGES.forEach((badge) => {
      if (!state.badges[badge.id] && badge.test(state, helpers)) {
        state.badges[badge.id] = Date.now();
        NP.bus.emit('badge', badge);
      }
    });
  }

  function commit() {
    checkBadges();
    save();
  }

  NP.store = {
    get state() { return state; },
    level: helpers.level,
    lessonsDone: helpers.lessonsDone,

    levelProgress() {
      const into = state.xp % NP.XP.LEVEL_SIZE;
      return { level: helpers.level(), into, size: NP.XP.LEVEL_SIZE, pct: into / NP.XP.LEVEL_SIZE };
    },

    isLessonDone: (id) => Boolean(state.lessons[id]),

    moduleProgress(mod) {
      const done = mod.lessons.filter((l) => state.lessons[l.id]).length;
      return { done, total: mod.lessons.length, pct: done / mod.lessons.length };
    },

    nextLesson() {
      for (const mod of NP.MODULES) {
        const lesson = mod.lessons.find((l) => !state.lessons[l.id]);
        if (lesson) return { module: mod, lesson };
      }
      return null;
    },

    completeLesson(lessonId) {
      if (state.lessons[lessonId]) return false;
      const found = NP.findLesson(lessonId);
      if (!found) return false;
      const doneBefore = helpers.lessonsDone();
      state.lessons[lessonId] = Date.now();
      addXp(NP.XP.LESSON, 'Lesson complete');

      const mod = found.module;
      if (!state.modules[mod.id] && mod.lessons.every((l) => state.lessons[l.id])) {
        state.modules[mod.id] = Date.now();
        addXp(NP.XP.MODULE_BONUS, `${mod.title} complete`);
        NP.bus.emit('module', mod);
      }

      const tokensBefore = Math.floor(doneBefore / NP.XP.TRIAD_EVERY);
      const tokensAfter = Math.floor(helpers.lessonsDone() / NP.XP.TRIAD_EVERY);
      if (tokensAfter > tokensBefore) NP.bus.emit('triad-unlocked');

      commit();
      return true;
    },

    /* Triad Boss Battle: one token per three completed lessons. */
    triadTokens() {
      return Math.max(0, Math.floor(helpers.lessonsDone() / NP.XP.TRIAD_EVERY) - state.triad.played);
    },
    triadProgress() {
      return helpers.lessonsDone() % NP.XP.TRIAD_EVERY;
    },
    startTriad() {
      if (NP.store.triadTokens() < 1) return false;
      state.triad.played += 1;
      save();
      return true;
    },
    finishTriad(won, score) {
      state.triad.best = Math.max(state.triad.best, score);
      if (won) {
        state.triad.wins += 1;
        addXp(NP.XP.TRIAD_WIN, 'Triad Boss defeated');
      }
      commit();
    },

    canClaimDaily: () => state.daily.last !== today(),
    claimDaily() {
      if (!NP.store.canClaimDaily()) return false;
      const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      state.daily.streak = state.daily.last === yesterday ? state.daily.streak + 1 : 1;
      state.daily.last = today();
      addXp(NP.XP.DAILY, 'Daily Warm-Up');
      commit();
      return true;
    },

    completeWorkshopPart(part) {
      if (state.workshop[part]) return false;
      state.workshop[part] = Date.now();
      addXp(NP.XP.WORKSHOP_PART, 'Workshop part complete');
      commit();
      return true;
    },
    flagWorkshop(key) {
      if (state.workshop[key]) return;
      state.workshop[key] = Date.now();
      commit();
    },

    trackAssistant() { state.stats.assistant += 1; commit(); },
    trackA11y() { state.stats.a11y += 1; commit(); },
    trackDataLab(chartId) {
      if (state.stats.datalab.includes(chartId)) return;
      state.stats.datalab.push(chartId);
      commit();
    },

    setPref(key, value) { state.prefs[key] = value; save(); },

    reset() {
      const prefs = state.prefs;
      state = defaults();
      state.prefs = prefs;
      save();
    }
  };
})(window.NP = window.NP || {});
