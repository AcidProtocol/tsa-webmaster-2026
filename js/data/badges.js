/* NeuralPath: data/badges.js
   Badge definitions. Each test receives (state, helpers) from the store. */
(function (NP) {
  'use strict';

  const moduleDone = (id) => (s) => Boolean(s.modules[id]);

  NP.BADGES = [
    { id: 'first-step', name: 'First Signal', icon: 'zap', rarity: 'common',
      desc: 'Complete your first lesson.', test: (s, h) => h.lessonsDone() >= 1 },
    { id: 'warm-up', name: 'Warmed Up', icon: 'sun', rarity: 'common',
      desc: 'Claim a Daily Warm-Up bonus.', test: (s) => Boolean(s.daily.last) },
    { id: 'streak-3', name: 'On a Roll', icon: 'flame', rarity: 'uncommon',
      desc: 'Claim the Daily Warm-Up three days in a row.', test: (s) => s.daily.streak >= 3 },
    { id: 'foundations', name: 'Foundation Builder', icon: 'brain', rarity: 'uncommon',
      desc: 'Complete every lesson in AI Foundations.', test: moduleDone('foundations') },
    { id: 'prompting', name: 'Prompt Architect', icon: 'sparkles', rarity: 'uncommon',
      desc: 'Complete every lesson in Practical Prompt Engineering.', test: moduleDone('prompting') },
    { id: 'ethics', name: 'Ethics Guardian', icon: 'scale', rarity: 'uncommon',
      desc: 'Complete every lesson in Ethics, Bias & Attribution.', test: moduleDone('ethics') },
    { id: 'autonomy', name: 'Systems Navigator', icon: 'rocket', rarity: 'uncommon',
      desc: 'Complete every lesson in Future of Autonomous Systems.', test: moduleDone('autonomy') },
    { id: 'level-3', name: 'Rising Node', icon: 'trending-up', rarity: 'common',
      desc: 'Reach Level 3.', test: (s, h) => h.level() >= 3 },
    { id: 'level-6', name: 'Deep Network', icon: 'layers', rarity: 'rare',
      desc: 'Reach Level 6.', test: (s, h) => h.level() >= 6 },
    { id: 'workshop', name: 'Workshop Graduate', icon: 'graduation-cap', rarity: 'uncommon',
      desc: 'Finish all three parts of the Demystifying AI workshop.',
      test: (s) => ['predict', 'prep', 'hallucination'].every((p) => s.workshop[p]) },
    { id: 'hallucination-hunter', name: 'Fact Checker', icon: 'search-check', rarity: 'uncommon',
      desc: 'Find every hallucination in a workshop round with no false alarms.',
      test: (s) => Boolean(s.workshop.perfectSpot) },
    { id: 'triad-champion', name: 'Triad Champion', icon: 'swords', rarity: 'legendary',
      desc: 'Defeat The Hallucinator in a Triad Boss Battle.', test: (s) => s.triad.wins >= 1 },
    { id: 'data-analyst', name: 'Data Analyst', icon: 'chart-column', rarity: 'common',
      desc: 'Interact with every chart in the Data Lab.', test: (s) => (s.stats.datalab || []).length >= 3 },
    { id: 'curious-mind', name: 'Curious Mind', icon: 'message-circle', rarity: 'common',
      desc: 'Ask the AI Assistant three questions.', test: (s) => s.stats.assistant >= 3 },
    { id: 'inclusive', name: 'Inclusive Learner', icon: 'accessibility', rarity: 'common',
      desc: 'Try a tool from the accessibility toolbar.', test: (s) => s.stats.a11y >= 1 },
    { id: 'completionist', name: 'NeuralPath Master', icon: 'trophy', rarity: 'legendary',
      desc: 'Complete every lesson in every module.', test: (s, h) => h.lessonsDone() >= NP.TOTAL_LESSONS }
  ];
})(window.NP = window.NP || {});
