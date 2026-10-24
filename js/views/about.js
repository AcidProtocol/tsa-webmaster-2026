/* NeuralPath: views/about.js */
(function (NP) {
  'use strict';

  const { icon } = NP.ui;

  const SOURCES = [
    'American Psychological Association. (2023). How to cite ChatGPT. APA Style Blog. https://apastyle.apa.org/blog/how-to-cite-chatgpt',
    'Modern Language Association. (2023). How do I cite generative AI in MLA style? MLA Style Center. https://style.mla.org/citing-generative-ai/',
    'Brown, T., et al. (2020). Language models are few-shot learners. Advances in Neural Information Processing Systems, 33.',
    'Buolamwini, J., & Gebru, T. (2018). Gender shades: Intersectional accuracy disparities in commercial gender classification. Proceedings of Machine Learning Research, 81, 77\u201391.',
    'Turing, A. M. (1950). Computing machinery and intelligence. Mind, 59(236), 433\u2013460.',
    'National Institute of Standards and Technology. (2023). Artificial intelligence risk management framework (AI RMF 1.0). https://doi.org/10.6028/NIST.AI.100-1'
  ];

  const FEATURES = [
    ['zap', 'Reward engine', `+${NP.XP.LESSON} XP per lesson, +${NP.XP.MODULE_BONUS} XP per module, a level every ${NP.XP.LEVEL_SIZE} XP.`],
    ['shield-check', 'Verified completion', 'Lessons unlock completion only after reading to the end and passing a knowledge check-in.'],
    ['swords', 'Triad Boss Battle', 'Every three lessons unlocks a rapid-fire game that trains misinformation detection.'],
    ['accessibility', 'Inclusive by design', 'High contrast, dyslexia-friendly font, text sizing, and plain language on every page.'],
    ['lock-keyhole', 'Private by default', 'No accounts and no tracking. Progress is stored only in this browser.'],
    ['bot', 'Grounded assistant', 'The assistant answers from a vetted knowledge base and says so when it does not know.']
  ];

  NP.views = NP.views || {};
  NP.views.about = {
    title: 'About',
    render() {
      return `
        <header class="page-head">
          <p class="eyebrow">${icon('info')} About NeuralPath</p>
          <h1 class="page-title">AI literacy for <span class="grad-text">every high schooler</span></h1>
          <p class="lead" data-simplify>Students are using AI every day, often without understanding how it works, when it fails, or how to use it honestly. NeuralPath closes that gap with short, verified lessons, hands-on labs, and game mechanics that reward real understanding.</p>
        </header>

        <section class="feature-grid">
          ${FEATURES.map(([ic, title, body]) => `
            <article class="card feature">
              <span class="card-icon">${icon(ic)}</span>
              <h2 class="card-title">${title}</h2>
              <p class="muted" data-simplify>${body}</p>
            </article>`).join('')}
        </section>

        <section class="two-col">
          <article class="card">
            <h2 class="card-title">${icon('accessibility')} Accessibility statement</h2>
            <p class="muted" data-simplify>NeuralPath targets WCAG 2.2 AA. Every page uses semantic landmarks, visible focus states, keyboard-operable controls, labeled charts with text alternatives, and respects reduced-motion settings. The toolbar at the top of every page offers high contrast, a dyslexia-friendly typeface, larger text, and a Plain Language mode that rewrites lesson text with simpler words and shorter sentences.</p>
          </article>
          <article class="card">
            <h2 class="card-title">${icon('file-text')} AI use disclosure</h2>
            <p class="muted" data-simplify>In keeping with what we teach, our team discloses that AI tools, including v0 by Vercel, were used to help generate code and draft content for this site. Our team reviewed, fact-checked against the sources below, and edited every lesson. Data Lab parameter counts are publicly reported figures; token and audit datasets are illustrative examples created for teaching.</p>
          </article>
        </section>

        <section class="card">
          <h2 class="card-title">${icon('book-marked')} Sources</h2>
          <ol class="sources">${SOURCES.map((s) => `<li>${NP.ui.esc(s)}</li>`).join('')}</ol>
        </section>

        <section class="card reset-card">
          <div>
            <h2 class="card-title">Reset progress</h2>
            <p class="muted small">Clears XP, lessons, and badges stored in this browser. Accessibility settings are kept.</p>
          </div>
          <button class="btn btn-danger" data-reset>${icon('rotate-ccw')} Reset my progress</button>
        </section>`;
    },
    mount(root) {
      root.querySelector('[data-reset]').addEventListener('click', () => {
        if (window.confirm('Reset all NeuralPath progress in this browser? This cannot be undone.')) {
          NP.store.reset();
          NP.ui.toast({ title: 'Progress reset', body: 'Your journey starts fresh.', icon: 'rotate-ccw' });
        }
      });
    }
  };
})(window.NP = window.NP || {});
