/* NeuralPath: store.js
   Single source of truth for modules, badges, and progress.
   Exposes window.NP. Progress is saved in localStorage (no personal data). */
(function () {
  'use strict';

  var KEY = 'neuralpath.v1';
  var XP_PER_LEVEL = 100;
  var XP_PER_LESSON = 20;
  var XP_MODULE_BONUS = 50;
  var XP_WARMUP = 10;

  /* ---- Content definitions ---------------------------------------- */
  var MODULES = [
    {
      id: 'concepts',
      icon: '🧠',
      title: 'AI Foundations',
      blurb: 'What AI is, how machines learn from data, and what neural networks actually do.',
      page: 'pages/concepts.html',
      lessons: [
        { id: 'what-is-ai', title: 'What is AI, really?' },
        { id: 'machine-learning', title: 'How machines learn from examples' },
        { id: 'neural-networks', title: 'Neural networks in plain language' },
        { id: 'training-vs-using', title: 'Training a model vs. using one' },
        { id: 'ai-limits', title: 'What AI can and cannot do' }
      ]
    },
    {
      id: 'tools',
      icon: '🛠️',
      title: 'Practical AI Tools',
      blurb: 'Write better prompts, study smarter, and check AI answers before you trust them.',
      page: 'pages/tools.html',
      lessons: [
        { id: 'prompting', title: 'Writing prompts that work' },
        { id: 'study-helpers', title: 'AI as a study and research helper' },
        { id: 'fact-checking', title: 'Checking AI answers' },
        { id: 'creative-code', title: 'Creative and coding helpers' }
      ]
    },
    {
      id: 'ethics',
      icon: '⚖️',
      title: 'Ethical AI Use',
      blurb: 'Keep your work honest: academic integrity, bias, privacy, and giving credit.',
      page: 'pages/ethics.html',
      lessons: [
        { id: 'integrity', title: 'Academic integrity and AI' },
        { id: 'bias', title: 'Bias and fairness' },
        { id: 'privacy', title: 'Privacy and your data' },
        { id: 'disclosure', title: 'Citing and disclosing AI use' }
      ]
    }
  ];

  var BADGES = [
    { id: 'first-step',  icon: '🚀', name: 'First Step',      desc: 'Finish any lesson.',
      test: function (s) { return lessonCount(s) >= 1; } },
    { id: 'foundations', icon: '🧠', name: 'AI Explorer',     desc: 'Finish AI Foundations.',
      test: function (s) { return moduleDone(s, 'concepts'); } },
    { id: 'tools',       icon: '🛠️', name: 'Tool Smith',      desc: 'Finish Practical AI Tools.',
      test: function (s) { return moduleDone(s, 'tools'); } },
    { id: 'ethics',      icon: '⚖️', name: 'Ethical Thinker', desc: 'Finish Ethical AI Use.',
      test: function (s) { return moduleDone(s, 'ethics'); } },
    { id: 'level-3',     icon: '⚡', name: 'Level 3',         desc: 'Reach level 3.',
      test: function (s) { return levelFor(s.xp).level >= 3; } },
    { id: 'all-clear',   icon: '🏆', name: 'Path Complete',   desc: 'Finish all three modules.',
      test: function (s) { return MODULES.every(function (m) { return moduleDone(s, m.id); }); } }
  ];

  /* ---- State ------------------------------------------------------- */
  function fresh() { return { xp: 0, done: {}, badges: [], lastWarmup: '' }; }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      var s = JSON.parse(raw);
      return {
        xp: Number(s.xp) || 0,
        done: s.done && typeof s.done === 'object' ? s.done : {},
        badges: Array.isArray(s.badges) ? s.badges : [],
        lastWarmup: typeof s.lastWarmup === 'string' ? s.lastWarmup : ''
      };
    } catch (e) { return fresh(); }
  }

  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage blocked: progress lasts this visit only */ }
  }

  /* ---- Helpers ----------------------------------------------------- */
  function getModule(id) {
    return MODULES.filter(function (m) { return m.id === id; })[0];
  }
  function doneList(s, id) { return s.done[id] || []; }
  function lessonCount(s) {
    return MODULES.reduce(function (n, m) { return n + doneList(s, m.id).length; }, 0);
  }
  function moduleDone(s, id) { return doneList(s, id).length >= getModule(id).lessons.length; }

  function levelFor(xp) {
    return {
      level: Math.floor(xp / XP_PER_LEVEL) + 1,
      into: xp % XP_PER_LEVEL,
      needed: XP_PER_LEVEL
    };
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function awardBadges(s) {
    var gained = [];
    BADGES.forEach(function (b) {
      if (s.badges.indexOf(b.id) === -1 && b.test(s)) {
        s.badges.push(b.id);
        gained.push(b);
      }
    });
    return gained;
  }

  /* ---- Public API -------------------------------------------------- */
  function completeLesson(moduleId, lessonId) {
    var m = getModule(moduleId);
    if (!m) return null;
    var s = load();
    var list = doneList(s, moduleId);
    if (list.indexOf(lessonId) !== -1) return { xpGained: 0, newBadges: [], leveledUp: false, moduleFinished: false };

    var before = levelFor(s.xp).level;
    list = list.concat(lessonId);
    s.done[moduleId] = list;
    var xp = XP_PER_LESSON;
    var finished = list.length === m.lessons.length;
    if (finished) xp += XP_MODULE_BONUS;
    s.xp += xp;

    var newBadges = awardBadges(s);
    save(s);
    return { xpGained: xp, newBadges: newBadges, leveledUp: levelFor(s.xp).level > before, moduleFinished: finished };
  }

  function claimWarmup() {
    var s = load();
    if (s.lastWarmup === today()) return { xpGained: 0, newBadges: [], leveledUp: false, already: true };
    var before = levelFor(s.xp).level;
    s.lastWarmup = today();
    s.xp += XP_WARMUP;
    var newBadges = awardBadges(s);
    save(s);
    return { xpGained: XP_WARMUP, newBadges: newBadges, leveledUp: levelFor(s.xp).level > before, already: false };
  }

  function moduleProgress(moduleId) {
    var s = load();
    var m = getModule(moduleId);
    var done = doneList(s, moduleId).length;
    return { done: done, total: m.lessons.length, pct: Math.round((done / m.lessons.length) * 100) };
  }

  function overall() {
    var s = load();
    var total = MODULES.reduce(function (n, m) { return n + m.lessons.length; }, 0);
    var done = lessonCount(s);
    return { done: done, total: total, pct: Math.round((done / total) * 100) };
  }

  function nextLesson(moduleId) {
    var s = load();
    var m = getModule(moduleId);
    var list = doneList(s, moduleId);
    return m.lessons.filter(function (l) { return list.indexOf(l.id) === -1; })[0] || null;
  }

  function reset() { save(fresh()); }

  window.NP = {
    MODULES: MODULES,
    BADGES: BADGES,
    XP_WARMUP: XP_WARMUP,
    load: load,
    level: function () { return levelFor(load().xp); },
    completeLesson: completeLesson,
    claimWarmup: claimWarmup,
    moduleProgress: moduleProgress,
    moduleDone: function (id) { return moduleDone(load(), id); },
    overall: overall,
    nextLesson: nextLesson,
    warmupClaimed: function () { return load().lastWarmup === today(); },
    reset: reset
  };
})();
