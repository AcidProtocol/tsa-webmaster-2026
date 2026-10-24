/* NeuralPath: a11y.js
   Accessibility toolbar: High Contrast, Dyslexia-Friendly Font, text size,
   Plain Language mode, and the Simplify Text converter.
   The simplifier runs entirely in the browser, so no student text leaves the device. */
(function (NP) {
  'use strict';

  const { icon, esc } = NP.ui;

  /* Jargon -> plain word swaps. Order matters: longer phrases first. */
  const SWAPS = [
    ['artificial intelligence', 'AI'],
    ['statistical patterns', 'patterns'],
    ['in order to', 'to'],
    ['prior to', 'before'],
    ['a fraction of a second', 'less than a second'],
    ['peer-reviewed', 'expert-checked'],
    ['underrepresented', 'left out'],
    ['unstructured data', 'free-form data'],
    ['structured data', 'table-style data'],
    ['backpropagation', 'error-correction training'],
    ['hallucinations', 'made-up answers'],
    ['hallucination', 'made-up answer'],
    ['algorithmic', 'computer-rule'],
    ['algorithms', 'step-by-step rules'],
    ['algorithm', 'step-by-step rule'],
    ['inference', 'using the model'],
    ['parameters', 'settings'],
    ['telemetry', 'activity data'],
    ['anomalies', 'unusual events'],
    ['irreversible', 'cannot be undone'],
    ['autonomous', 'self-running'],
    ['autonomy', 'independence'],
    ['optimize', 'improve'],
    ['generalizing', 'working on new examples'],
    ['generalize', 'work on new examples'],
    ['utilize', 'use'],
    ['utilizes', 'uses'],
    ['approximately', 'about'],
    ['demonstrates', 'shows'],
    ['demonstrate', 'show'],
    ['numerous', 'many'],
    ['subsequently', 'later'],
    ['consequently', 'so'],
    ['therefore', 'so'],
    ['however', 'but'],
    ['additionally', 'also'],
    ['furthermore', 'also'],
    ['moreover', 'also'],
    ['facilitate', 'help'],
    ['comprehend', 'understand'],
    ['sufficient', 'enough'],
    ['individuals', 'people'],
    ['obtain', 'get'],
    ['assist', 'help'],
    ['commence', 'start'],
    ['terminate', 'end'],
    ['modify', 'change'],
    ['regarding', 'about'],
    ['methodology', 'method'],
    ['dramatically', 'greatly'],
    ['systematically', 'consistently'],
    ['significant', 'big'],
    ['transparency', 'openness'],
    ['accountability', 'responsibility'],
    ['mitigate', 'reduce'],
    ['constraints', 'limits'],
    ['acquire', 'get'],
    ['endeavor', 'try'],
    ['predominantly', 'mostly'],
    ['fabricated', 'fake'],
    ['misrepresents', 'gives a false picture of']
  ];

  const SWAP_RULES = SWAPS.map(([from, to]) => ({
    re: new RegExp(`\\b${from.replace(/[-]/g, '\\-')}\\b`, 'gi'),
    to
  }));

  const matchCase = (source, replacement) =>
    source[0] === source[0].toUpperCase() && source[0] !== source[0].toLowerCase()
      ? replacement[0].toUpperCase() + replacement.slice(1)
      : replacement;

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function splitLong(sentence) {
    const words = sentence.split(/\s+/);
    if (words.length <= 20) return [sentence];
    const re = /,\s+(and|but|so|while|which|because)\s+/i;
    const m = sentence.slice(Math.floor(sentence.length / 3)).match(re);
    if (!m) return [sentence];
    const at = Math.floor(sentence.length / 3) + m.index;
    const first = sentence.slice(0, at).trim() + '.';
    let rest = sentence.slice(at + m[0].length).trim();
    const joiner = m[1].toLowerCase();
    if (joiner === 'which') rest = 'This ' + rest;
    else if (joiner === 'but') rest = 'But ' + rest;
    else if (joiner === 'so') rest = 'So ' + rest;
    else if (joiner === 'because') rest = 'This is because ' + rest;
    else rest = capitalize(rest);
    return [first, ...splitLong(rest)];
  }

  function simplify(text) {
    let out = text;
    SWAP_RULES.forEach(({ re, to }) => {
      out = out.replace(re, (match) => matchCase(match, to));
    });
    out = out.replace(/;\s+/g, '. ').replace(/\.\s+([a-z])/g, (m, c) => '. ' + c.toUpperCase());
    const sentences = out.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [out];
    return sentences
      .map((s) => s.trim())
      .filter(Boolean)
      .flatMap(splitLong)
      .join(' ');
  }

  function syllables(word) {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (w.length <= 3) return 1;
    const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g);
    return Math.max(1, groups ? groups.length : 1);
  }

  /* Flesch-Kincaid grade level estimate. */
  function gradeLevel(text) {
    const words = text.split(/\s+/).filter((w) => /[a-z]/i.test(w));
    if (!words.length) return 0;
    const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
    const syl = words.reduce((sum, w) => sum + syllables(w), 0);
    return Math.max(0, 0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59);
  }

  function applyPlain(root) {
    const on = NP.store.state.prefs.plain;
    root.querySelectorAll('[data-simplify]').forEach((el) => {
      if (on) {
        if (el.dataset.original === undefined) el.dataset.original = el.textContent;
        el.textContent = simplify(el.dataset.original);
        el.classList.add('is-plain');
      } else if (el.dataset.original !== undefined) {
        el.textContent = el.dataset.original;
        delete el.dataset.original;
        el.classList.remove('is-plain');
      }
    });
  }

  const SAMPLES = [
    'Large language models utilize billions of parameters that are systematically adjusted through backpropagation; consequently, they are able to generalize statistical patterns from unstructured data, although they remain susceptible to hallucinations when prompts lack sufficient context.',
    'Algorithmic bias occurs when underrepresented populations are predominantly excluded from training datasets, which results in models that produce disproportionately inaccurate outcomes and therefore require transparency and accountability measures to mitigate harm.',
    'Autonomous agents commence multi-step tasks by decomposing objectives into subtasks, subsequently invoking external tools, and they require human approval prior to irreversible actions in order to facilitate safe operation.'
  ];

  function renderSimplifier(dialog) {
    dialog.innerHTML = `
      <div class="dialog-panel">
        <header class="dialog-head">
          <div>
            <p class="eyebrow">${icon('sparkles')} Plain Language Converter</p>
            <h2 class="dialog-title" id="simplify-title">Simplify complex text</h2>
          </div>
          <button class="icon-btn" data-close aria-label="Close converter">${icon('x')}</button>
        </header>
        <div class="dialog-body simplify-body">
          <p class="muted">Paste a dense paragraph from a textbook or article. NeuralPath swaps jargon for everyday words and breaks long sentences apart. Everything runs on your device.</p>
          <div class="sample-row" role="group" aria-label="Load a sample">
            ${SAMPLES.map((_, i) => `<button class="chip" data-sample="${i}">Sample ${i + 1}</button>`).join('')}
          </div>
          <label class="field-label" for="simplify-input">Original text</label>
          <textarea id="simplify-input" class="input textarea" rows="5">${esc(SAMPLES[0])}</textarea>
          <button class="btn btn-primary" data-run>${icon('wand-sparkles')} Simplify text</button>
          <div class="simplify-result" aria-live="polite">
            <div class="grade-row">
              <div class="grade"><span class="grade-label">Original reading level</span><span class="grade-value" data-before>--</span></div>
              ${icon('arrow-right', 'grade-arrow')}
              <div class="grade grade-good"><span class="grade-label">Simplified reading level</span><span class="grade-value" data-after>--</span></div>
            </div>
            <p class="field-label">Plain language version</p>
            <p class="simplify-output" data-output>Press Simplify text to convert.</p>
          </div>
        </div>
      </div>`;

    const input = dialog.querySelector('#simplify-input');
    const run = () => {
      const text = input.value.trim();
      if (!text) return;
      const out = simplify(text);
      dialog.querySelector('[data-output]').textContent = out;
      dialog.querySelector('[data-before]').textContent = `Grade ${gradeLevel(text).toFixed(1)}`;
      dialog.querySelector('[data-after]').textContent = `Grade ${gradeLevel(out).toFixed(1)}`;
    };
    dialog.querySelector('[data-run]').addEventListener('click', run);
    dialog.querySelectorAll('[data-sample]').forEach((b) =>
      b.addEventListener('click', () => { input.value = SAMPLES[+b.dataset.sample]; run(); }));
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    NP.ui.refreshIcons();
  }

  const TEXT_SIZES = ['md', 'lg', 'xl'];

  function applyPrefs() {
    const p = NP.store.state.prefs;
    const html = document.documentElement;
    html.classList.toggle('hc', p.contrast);
    html.classList.toggle('dys', p.dyslexia);
    html.classList.toggle('plain', p.plain);
    html.dataset.text = p.text;
    document.querySelectorAll('[data-a11y]').forEach((btn) => {
      const key = btn.dataset.a11y;
      if (key in p && typeof p[key] === 'boolean') btn.setAttribute('aria-pressed', String(p[key]));
    });
    const sizeLabel = document.querySelector('[data-size-label]');
    if (sizeLabel) sizeLabel.textContent = { md: '100%', lg: '115%', xl: '130%' }[p.text];
  }

  function init() {
    applyPrefs();
    const dialog = document.getElementById('simplify-dialog');
    renderSimplifier(dialog);
    NP.ui.bindDialog(dialog);

    document.querySelectorAll('[data-a11y]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.a11y;
        const p = NP.store.state.prefs;
        if (key === 'simplify') {
          NP.ui.openDialog(dialog);
          dialog.querySelector('[data-run]').click();
        } else if (key === 'text') {
          NP.store.setPref('text', TEXT_SIZES[(TEXT_SIZES.indexOf(p.text) + 1) % TEXT_SIZES.length]);
        } else {
          NP.store.setPref(key, !p[key]);
          if (key === 'plain') {
            applyPlain(document);
            NP.ui.toast({
              title: p.plain ? 'Plain Language on' : 'Plain Language off',
              body: p.plain ? 'Lesson text now uses simpler words and shorter sentences.' : 'Original lesson text restored.',
              icon: 'type'
            });
          }
        }
        applyPrefs();
        NP.store.trackA11y();
      });
    });
  }

  NP.a11y = { init, simplify, gradeLevel, applyPlain };
})(window.NP = window.NP || {});
