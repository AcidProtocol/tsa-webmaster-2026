/* NeuralPath: views/workshop.js
   "Demystifying AI in Academia" interactive workshop:
   Part 1 temperature simulator, Part 2 PREP prompt builder, Part 3 Spot the Hallucination. */
(function (NP) {
  'use strict';

  const { icon, esc } = NP.ui;

  const PARTS = [
    { id: 'predict', label: 'Predictive Text', icon: 'thermometer' },
    { id: 'prep', label: 'PREP Builder', icon: 'pencil-ruler' },
    { id: 'hallucination', label: 'Spot the Hallucination', icon: 'search-check' }
  ];

  let active = 'predict';

  /* ---- Part 1: next-word probability simulator ---------------------- */
  const CONTEXTS = [
    { text: 'The students opened their laptops and started to', words: [['study', 3.2], ['type', 2.8], ['research', 2.2], ['browse', 1.6], ['code', 1.4], ['dance', -0.5], ['levitate', -1.8]] },
    { text: 'Before trusting an AI answer, you should always', words: [['verify', 3.4], ['check', 3.1], ['cite', 1.9], ['question', 1.7], ['read', 1.4], ['ignore', -0.4], ['celebrate', -1.6]] },
    { text: 'Neural networks learn by adjusting their', words: [['weights', 3.6], ['parameters', 2.6], ['connections', 2.0], ['values', 1.5], ['settings', 1.1], ['opinions', -1.2], ['shoes', -2.4]] }
  ];
  const sim = { ctx: 0, temp: 1, picks: [] };

  function softmax(words, t) {
    const exps = words.map(([, l]) => Math.exp(l / t));
    const sum = exps.reduce((a, b) => a + b, 0);
    return words.map(([w], i) => ({ word: w, p: exps[i] / sum }));
  }

  function entropy(probs) {
    const h = -probs.reduce((s, { p }) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
    return h / Math.log2(probs.length);
  }

  function distHtml() {
    const probs = softmax(CONTEXTS[sim.ctx].words, sim.temp);
    const creativity = entropy(probs);
    const mood = sim.temp < 0.5 ? 'Focused and predictable' : sim.temp < 1.3 ? 'Balanced' : 'Creative and chaotic';
    return `
          <div class="section-head">
            <h3 class="card-title">Probability distribution</h3>
            <span class="tag">${esc(mood)}</span>
          </div>
          <ul class="prob-list" aria-label="Next word probabilities">
            ${probs.map(({ word, p }) => `
              <li class="prob">
                <span class="prob-word">${esc(word)}</span>
                <span class="prob-track"><span class="prob-fill" style="width:${(p * 100).toFixed(1)}%"></span></span>
                <span class="prob-val">${(p * 100).toFixed(1)}%</span>
              </li>`).join('')}
          </ul>
          <div class="meter">
            <div class="meter-top"><span class="small muted">Creativity (normalized entropy)</span><span class="small">${Math.round(creativity * 100)}%</span></div>
            ${NP.ui.progressBar(creativity, 'Creativity level')}
          </div>
          ${sim.picks.length ? `
            <h4 class="mini-title">Sample history</h4>
            <ul class="history">${sim.picks.slice(0, 5).map((p) => `<li><span>${esc(p.word)}</span><span class="muted small">T = ${p.temp.toFixed(2)}, ${(p.p * 100).toFixed(1)}%</span></li>`).join('')}</ul>` : ''}`;
  }

  function renderPredict() {
    const ctx = CONTEXTS[sim.ctx];
    const last = sim.picks[0];
    return `
      <div class="ws-grid">
        <div class="card">
          <p class="eyebrow">${icon('thermometer')} Part 1</p>
          <h2 class="card-title">How does AI choose the next word?</h2>
          <p class="muted" data-simplify>A language model scores every possible next word, then turns those scores into probabilities. Temperature controls how evenly that probability is spread. Move the slider and watch the bars change.</p>

          <div class="ctx-tabs" role="group" aria-label="Choose a sentence">
            ${CONTEXTS.map((c, i) => `<button class="chip ${i === sim.ctx ? 'is-active' : ''}" data-ctx="${i}" aria-pressed="${i === sim.ctx}">Sentence ${i + 1}</button>`).join('')}
          </div>

          <p class="sentence">${esc(ctx.text)} <span class="sentence-next ${last && last.ctx === sim.ctx ? 'is-filled' : ''}">${last && last.ctx === sim.ctx ? esc(last.word) : '____'}</span></p>

          <div class="slider-wrap">
            <label class="field-label" for="temp">Temperature <strong data-temp-val>${sim.temp.toFixed(2)}</strong></label>
            <input id="temp" type="range" min="0.1" max="2" step="0.05" value="${sim.temp}" class="range" data-temp>
            <div class="range-scale"><span>0.1 precise</span><span>1.0 default</span><span>2.0 wild</span></div>
          </div>

          <div class="ws-actions">
            <button class="btn btn-primary" data-sample>${icon('dices')} Sample next word</button>
            <span class="muted small">${sim.picks.length < 3 ? `Sample ${3 - sim.picks.length} more time(s) to complete Part 1` : 'Part 1 complete'}</span>
          </div>
        </div>

        <div class="card" data-dist>${distHtml()}</div>
      </div>`;
  }

  function mountPredict(root) {
    const slider = root.querySelector('[data-temp]');
    slider.addEventListener('input', () => {
      sim.temp = Number(slider.value);
      root.querySelector('[data-temp-val]').textContent = sim.temp.toFixed(2);
      root.querySelector('[data-dist]').innerHTML = distHtml();
    });
    root.querySelectorAll('[data-ctx]').forEach((b) => b.addEventListener('click', () => { sim.ctx = Number(b.dataset.ctx); rerender(root); }));
    root.querySelector('[data-sample]').addEventListener('click', () => {
      const probs = softmax(CONTEXTS[sim.ctx].words, sim.temp);
      let r = Math.random();
      const pick = probs.find((x) => (r -= x.p) <= 0) || probs[probs.length - 1];
      sim.picks.unshift({ word: pick.word, p: pick.p, temp: sim.temp, ctx: sim.ctx });
      if (sim.picks.length >= 3) NP.store.completeWorkshopPart('predict');
      rerender(root, { keepFocus: '[data-sample]' });
    });
  }

  /* ---- Part 2: PREP builder ---------------------------------------- */
  const prep = { persona: '', request: '', examples: '', parameters: '', copied: false };
  const VERBS = ['explain', 'compare', 'quiz', 'summarize', 'outline', 'create', 'list', 'analyze', 'give', 'write', 'review', 'critique', 'brainstorm', 'teach', 'help me', 'generate', 'describe', 'check'];
  const PREP_FIELDS = [
    { key: 'persona', letter: 'P', name: 'Persona', hint: 'Who should the AI act as?', placeholder: 'Act as a patient chemistry tutor for a 10th grader...', example: 'Act as a patient AP Biology tutor who explains ideas for a 10th grader.' },
    { key: 'request', letter: 'R', name: 'Request', hint: 'What exactly do you want? Start with an action verb.', placeholder: 'Quiz me on the stages of mitosis...', example: 'Quiz me on the four stages of mitosis, asking one question at a time.' },
    { key: 'examples', letter: 'E', name: 'Examples', hint: 'Show a sample of the output you want.', placeholder: 'Example question: Which stage do chromosomes line up in the middle?', example: 'Example: "During which stage do chromosomes line up in the middle of the cell? A) Prophase B) Metaphase C) Anaphase D) Telophase"' },
    { key: 'parameters', letter: 'P', name: 'Parameters', hint: 'Set length, format, and limits.', placeholder: '5 questions, multiple choice, do not reveal answers...', example: 'Ask 5 multiple-choice questions. Wait for my answer before revealing if I am correct. Keep explanations under 50 words.' }
  ];

  function scoreField(key, value) {
    const v = value.trim();
    if (!v) return { score: 0, note: 'Empty' };
    if (key === 'persona') return /act as|you are|pretend|role/i.test(v) && v.length >= 15 ? { score: 25, note: 'Clear role' } : { score: 12, note: 'Try "Act as a..."' };
    if (key === 'request') {
      const hasVerb = VERBS.some((w) => v.toLowerCase().includes(w));
      return hasVerb && v.length >= 20 ? { score: 25, note: 'Specific action' } : { score: 12, note: hasVerb ? 'Add more detail' : 'Start with an action verb' };
    }
    if (key === 'examples') return v.length >= 25 ? { score: 25, note: 'Concrete sample' } : { score: 12, note: 'Make the example concrete' };
    return /\d|bullet|word|sentence|paragraph|table|format|do not|don\u2019t|don't|under|limit/i.test(v) ? { score: 25, note: 'Clear limits' } : { score: 12, note: 'Add a number or format' };
  }

  function assembled() {
    return PREP_FIELDS.map((f) => prep[f.key].trim()).filter(Boolean).join('\n\n');
  }

  function renderPrep() {
    const scores = PREP_FIELDS.map((f) => scoreField(f.key, prep[f.key]));
    const total = scores.reduce((s, x) => s + x.score, 0);
    const text = assembled();
    return `
      <div class="ws-grid">
        <div class="card">
          <p class="eyebrow">${icon('pencil-ruler')} Part 2</p>
          <h2 class="card-title">Build a prompt with PREP</h2>
          <p class="muted" data-simplify>Fill in each part of the PREP framework. The quality meter scores your prompt as you type. Reach 100 to complete Part 2.</p>
          <div class="prep-fields">
            ${PREP_FIELDS.map((f, i) => `
              <div class="prep-field">
                <div class="prep-label-row">
                  <label class="field-label" for="prep-${f.key}"><span class="prep-letter">${f.letter}</span> ${f.name}</label>
                  <span class="small ${scores[i].score === 25 ? 'text-good' : 'muted'}" data-note="${f.key}">${scores[i].note}</span>
                </div>
                <p class="small muted">${f.hint}</p>
                <textarea id="prep-${f.key}" class="input textarea" rows="2" data-prep="${f.key}" placeholder="${esc(f.placeholder)}">${esc(prep[f.key])}</textarea>
              </div>`).join('')}
          </div>
          <button class="btn btn-ghost" data-fill>${icon('sparkles')} Fill with a strong example</button>
        </div>
        <div class="card prep-preview">
          <div class="section-head">
            <h3 class="card-title">Live prompt preview</h3>
            <button class="btn btn-ghost btn-sm" data-copy ${text ? '' : 'disabled'}>${icon(prep.copied ? 'check' : 'copy')} ${prep.copied ? 'Copied' : 'Copy'}</button>
          </div>
          <pre class="prompt-out" data-out>${text ? esc(text) : 'Your assembled prompt will appear here.'}</pre>
          <div class="meter">
            <div class="meter-top"><span class="small muted">Prompt quality</span><span class="small" data-total>${total} / 100</span></div>
            <div data-bar>${NP.ui.progressBar(total / 100, 'Prompt quality')}</div>
          </div>
          <p class="small ${total === 100 ? 'text-good' : 'muted'}" data-verdict>${total === 100 ? 'Excellent. This prompt gives the AI a role, a task, a model answer, and clear limits.' : 'Strengthen each part to reach 100.'}</p>
        </div>
      </div>`;
  }

  function mountPrep(root) {
    const update = () => {
      const scores = PREP_FIELDS.map((f) => scoreField(f.key, prep[f.key]));
      const total = scores.reduce((s, x) => s + x.score, 0);
      PREP_FIELDS.forEach((f, i) => {
        const note = root.querySelector(`[data-note="${f.key}"]`);
        note.textContent = scores[i].note;
        note.className = `small ${scores[i].score === 25 ? 'text-good' : 'muted'}`;
      });
      const text = assembled();
      root.querySelector('[data-out]').textContent = text || 'Your assembled prompt will appear here.';
      root.querySelector('[data-total]').textContent = `${total} / 100`;
      root.querySelector('[data-bar]').innerHTML = NP.ui.progressBar(total / 100, 'Prompt quality');
      root.querySelector('[data-copy]').disabled = !text;
      const verdict = root.querySelector('[data-verdict]');
      verdict.className = `small ${total === 100 ? 'text-good' : 'muted'}`;
      verdict.textContent = total === 100 ? 'Excellent. This prompt gives the AI a role, a task, a model answer, and clear limits.' : 'Strengthen each part to reach 100.';
      if (total === 100) NP.store.completeWorkshopPart('prep');
    };
    root.querySelectorAll('[data-prep]').forEach((ta) => ta.addEventListener('input', () => { prep[ta.dataset.prep] = ta.value; update(); }));
    root.querySelector('[data-fill]').addEventListener('click', () => {
      PREP_FIELDS.forEach((f) => { prep[f.key] = f.example; root.querySelector(`[data-prep="${f.key}"]`).value = f.example; });
      update();
    });
    root.querySelector('[data-copy]').addEventListener('click', async (e) => {
      try {
        await navigator.clipboard.writeText(assembled());
        e.currentTarget.innerHTML = `${icon('check')} Copied`;
        NP.ui.refreshIcons();
      } catch (err) { /* clipboard unavailable */ }
    });
  }

  /* ---- Part 3: Spot the Hallucination ------------------------------ */
  const ROUNDS = [
    {
      title: 'AI answer: The history of the Turing Test',
      sentences: [
        { t: 'Alan Turing proposed what is now called the Turing Test in his 1950 paper "Computing Machinery and Intelligence."', h: false },
        { t: 'In the test, a human judge chats with a hidden machine and a hidden person and tries to tell them apart.', h: false },
        { t: 'Turing won the Nobel Prize in Physics in 1954 for this work.', h: true, why: 'Turing never won a Nobel Prize. He died in 1954.' },
        { t: 'He originally called it the "imitation game."', h: false },
        { t: 'A 2019 Stanford study found that 87% of chatbots pass the Turing Test every time.', h: true, why: 'This statistic and study are invented. Specific numbers with no link are a red flag.' },
        { t: 'Today, researchers still debate whether passing the test really demonstrates intelligence.', h: false }
      ]
    },
    {
      title: 'AI answer: Sources for your climate essay',
      sentences: [
        { t: 'Rising global temperatures are largely driven by greenhouse gas emissions from burning fossil fuels.', h: false },
        { t: 'The Intergovernmental Panel on Climate Change (IPCC) publishes major assessment reports on climate science.', h: false },
        { t: 'According to Johnson & Patel (2021), "Arctic Ice and the Future," Journal of Polar Futures, 14(3), Arctic sea ice vanished entirely in 2025.', h: true, why: 'This citation is fabricated. The journal and article do not exist, and Arctic sea ice has not vanished.' },
        { t: 'NASA and NOAA both maintain global surface temperature records.', h: false },
        { t: 'The Paris Agreement was signed in 1985 by every country in the world.', h: true, why: 'The Paris Agreement was adopted in 2015, and not every country joined.' },
        { t: 'Your teacher may ask you to cite the original reports rather than the AI tool.', h: false }
      ]
    }
  ];
  const spot = { round: 0, picked: new Set(), checked: [false, false], result: null };

  function renderSpot() {
    const round = ROUNDS[spot.round];
    const res = spot.result;
    return `
      <div class="card">
        <div class="section-head">
          <div>
            <p class="eyebrow">${icon('search-check')} Part 3 <span class="dot-sep" aria-hidden="true"></span> Round ${spot.round + 1} of ${ROUNDS.length}</p>
            <h2 class="card-title">Spot the Hallucination</h2>
          </div>
          <div class="ctx-tabs" role="group" aria-label="Choose a round">
            ${ROUNDS.map((_, i) => `<button class="chip ${i === spot.round ? 'is-active' : ''}" data-round="${i}" aria-pressed="${i === spot.round}">${spot.checked[i] ? icon('check') : ''} Round ${i + 1}</button>`).join('')}
          </div>
        </div>
        <p class="muted" data-simplify>Below is a response an AI chatbot might give. Select every sentence you think is a hallucination, then check your answers.</p>
        <div class="ai-response">
          <p class="ai-response-head">${icon('bot')} ${esc(round.title)}</p>
          <div class="sentences">
            ${round.sentences.map((s, i) => {
              const picked = spot.picked.has(i);
              let state = '';
              if (res) state = s.h && picked ? 'is-caught' : s.h ? 'is-missed' : picked ? 'is-false' : '';
              return `<button class="sentence-btn ${picked ? 'is-picked' : ''} ${state}" data-s="${i}" aria-pressed="${picked}" ${res ? 'disabled' : ''}>
                <span>${esc(s.t)}</span>
                ${res && s.h ? `<span class="why">${icon('triangle-alert')} ${esc(s.why)}</span>` : ''}
                ${res && !s.h && picked ? `<span class="why">${icon('info')} This sentence is accurate.</span>` : ''}
              </button>`;
            }).join('')}
          </div>
        </div>
        <div class="ws-actions">
          ${res
            ? `<p class="spot-result ${res.perfect ? 'text-good' : ''}" aria-live="polite">${res.perfect ? `${icon('circle-check')} Perfect round. You caught every hallucination with no false alarms.` : `You caught ${res.caught} of ${res.total} hallucinations with ${res.falseAlarms} false alarm(s).`}</p>
               <button class="btn btn-ghost" data-retry>${icon('rotate-ccw')} Try again</button>
               ${spot.round < ROUNDS.length - 1 ? `<button class="btn btn-primary" data-next>Next round ${icon('arrow-right')}</button>` : ''}`
            : `<button class="btn btn-primary" data-check ${spot.picked.size ? '' : 'disabled'}>${icon('search-check')} Check my answers</button>
               <span class="muted small">${spot.picked.size} selected</span>`}
        </div>
      </div>`;
  }

  function mountSpot(root) {
    root.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => {
      const i = Number(b.dataset.s);
      spot.picked.has(i) ? spot.picked.delete(i) : spot.picked.add(i);
      rerender(root, { keepFocus: `[data-s="${i}"]` });
    }));
    root.querySelectorAll('[data-round]').forEach((b) => b.addEventListener('click', () => {
      spot.round = Number(b.dataset.round); spot.picked = new Set(); spot.result = null; rerender(root);
    }));
    const check = root.querySelector('[data-check]');
    if (check) check.addEventListener('click', () => {
      const s = ROUNDS[spot.round].sentences;
      const total = s.filter((x) => x.h).length;
      const caught = s.filter((x, i) => x.h && spot.picked.has(i)).length;
      const falseAlarms = s.filter((x, i) => !x.h && spot.picked.has(i)).length;
      spot.result = { total, caught, falseAlarms, perfect: caught === total && falseAlarms === 0 };
      spot.checked[spot.round] = true;
      if (spot.result.perfect) NP.store.flagWorkshop('perfectSpot');
      if (spot.checked.every(Boolean)) NP.store.completeWorkshopPart('hallucination');
      rerender(root);
    });
    const retry = root.querySelector('[data-retry]');
    if (retry) retry.addEventListener('click', () => { spot.picked = new Set(); spot.result = null; rerender(root); });
    const next = root.querySelector('[data-next]');
    if (next) next.addEventListener('click', () => { spot.round += 1; spot.picked = new Set(); spot.result = null; rerender(root); });
  }

  /* ---- Shell ------------------------------------------------------- */
  const RENDER = { predict: renderPredict, prep: renderPrep, hallucination: renderSpot };
  const MOUNT = { predict: mountPredict, prep: mountPrep, hallucination: mountSpot };

  let viewRoot = null;

  /* Part mount functions receive the panel; always re-render from the view root. */
  function rerender(_scope, opts = {}) {
    const root = viewRoot;
    const panel = root.querySelector('[data-panel]');
    panel.innerHTML = RENDER[active]();
    MOUNT[active](panel);
    renderStepper(root);
    NP.ui.hydrate(panel);
    if (opts.keepFocus) {
      const el = panel.querySelector(opts.keepFocus);
      if (el) el.focus();
    }
  }

  function renderStepper(root) {
    const w = NP.store.state.workshop;
    root.querySelector('[data-stepper]').innerHTML = PARTS.map((p, i) => `
      <button role="tab" class="step ${active === p.id ? 'is-active' : ''} ${w[p.id] ? 'is-done' : ''}" id="tab-${p.id}"
        aria-selected="${active === p.id}" aria-controls="ws-panel" data-part="${p.id}" tabindex="${active === p.id ? 0 : -1}">
        <span class="step-num">${w[p.id] ? icon('check') : i + 1}</span>
        <span class="step-text"><span class="step-label">Part ${i + 1}</span><span class="step-name">${p.label}</span></span>
      </button>`).join('');
    root.querySelectorAll('[data-part]').forEach((b) => {
      b.addEventListener('click', () => { active = b.dataset.part; rerender(root); });
      b.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const idx = PARTS.findIndex((p) => p.id === active);
        active = PARTS[(idx + (e.key === 'ArrowRight' ? 1 : PARTS.length - 1)) % PARTS.length].id;
        rerender(root);
        root.querySelector(`[data-part="${active}"]`).focus();
      });
    });
    NP.ui.refreshIcons();
  }

  NP.views = NP.views || {};
  NP.views.workshop = {
    title: 'Workshop',
    render() {
      const doneCount = PARTS.filter((p) => NP.store.state.workshop[p.id]).length;
      return `
        <header class="page-head">
          <p class="eyebrow">${icon('flask-conical')} Interactive Workshop</p>
          <h1 class="page-title">Demystifying AI <span class="grad-text">in Academia</span></h1>
          <p class="lead" data-simplify>Three hands-on labs that reveal how AI generates text, how to direct it, and how to catch it when it is wrong. Each completed part earns ${NP.XP.WORKSHOP_PART} XP.</p>
          <p class="small muted">${doneCount} of ${PARTS.length} parts complete</p>
        </header>
        <div class="stepper" role="tablist" aria-label="Workshop parts" data-stepper></div>
        <div id="ws-panel" role="tabpanel" data-panel></div>`;
    },
    mount(root) {
      viewRoot = root;
      rerender();
    }
  };
})(window.NP = window.NP || {});
