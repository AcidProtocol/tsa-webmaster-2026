/* NeuralPath: triad.js
   The Triad Boss Battle. Unlocks once for every three completed lessons.
   Students classify rapid-fire claims as Verified or Hallucination to defeat "The Hallucinator". */
(function (NP) {
  'use strict';

  const { icon, esc } = NP.ui;

  const CLAIMS = [
    { text: 'The term "artificial intelligence" was coined for a 1956 workshop at Dartmouth College.', real: true, why: 'John McCarthy proposed the Dartmouth workshop in 1955, and it took place in 1956.' },
    { text: 'Large language models generate text by predicting likely next tokens.', real: true, why: 'Next-token prediction is the core mechanism behind LLMs.' },
    { text: 'AlphaGo defeated Go world champion Lee Sedol in 2016.', real: true, why: 'DeepMind\u2019s AlphaGo won the match 4 to 1 in March 2016.' },
    { text: 'In English, one token is roughly three quarters of a word.', real: true, why: 'This is the common rule of thumb for English text.' },
    { text: 'APA style lists OpenAI as the author when citing ChatGPT.', real: true, why: 'APA treats the model\u2019s creator as the author.' },
    { text: 'Lowering a model\u2019s temperature makes its outputs more predictable.', real: true, why: 'Low temperature concentrates probability on the most likely tokens.' },
    { text: 'IBM\u2019s Deep Blue defeated chess champion Garry Kasparov in 1997.', real: true, why: 'Deep Blue won the 1997 rematch.' },
    { text: 'Neural networks learn by adjusting numerical weights.', real: true, why: 'Training updates weights to reduce error.' },
    { text: 'GPT-3 was reported to have 175 billion parameters.', real: true, why: 'OpenAI\u2019s 2020 GPT-3 paper reported 175 billion parameters.' },
    { text: 'ChatGPT was first released to the public in 2012.', real: false, why: 'ChatGPT launched in November 2022.' },
    { text: 'Alan Turing introduced the Turing Test in a paper published in 1990.', real: false, why: 'Turing\u2019s paper "Computing Machinery and Intelligence" was published in 1950.' },
    { text: 'AI chatbots always search the live internet before every answer.', real: false, why: 'Many models answer only from training data unless a search tool is connected.' },
    { text: 'A 2021 Harvard study proved AI writing detectors are 100% accurate.', real: false, why: 'No such study exists. Detectors are known to produce false positives.' },
    { text: 'Neural networks were invented by Google in 2015.', real: false, why: 'Artificial neurons date to the 1940s, and the perceptron to 1958.' },
    { text: 'A model\u2019s weights update every time you send it a message.', real: false, why: 'During inference, weights are frozen.' },
    { text: 'MLA style requires including the AI company\u2019s phone number in citations.', real: false, why: 'MLA citations include the prompt, tool, version, company, date, and URL. No phone number.' },
    { text: 'Language models store a perfect copy of every web page they were trained on.', real: false, why: 'Models learn compressed patterns, not a searchable copy of the web.' },
    { text: 'Human-in-the-loop means AI systems are never allowed to run without a human typing every word.', real: false, why: 'It means humans stay involved at key decision points, not that they type everything.' }
  ];

  const CONFIG = { bossHp: 6, lives: 3, rounds: 10, seconds: 10 };

  let dialog;
  let game = null;
  let raf = 0;

  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

  function renderIntro() {
    stopTimer();
    const tokens = NP.store.triadTokens();
    const s = NP.store.state.triad;
    dialog.innerHTML = `
      <div class="dialog-panel triad-panel">
        <header class="dialog-head">
          <div>
            <p class="eyebrow">${icon('swords')} Triad Boss Battle</p>
            <h2 class="dialog-title" id="triad-title">Defeat The Hallucinator</h2>
          </div>
          <button class="icon-btn" data-close aria-label="Close battle">${icon('x')}</button>
        </header>
        <div class="dialog-body triad-intro">
          <div class="boss-portrait" aria-hidden="true">${icon('bot')}</div>
          <p class="lead">The Hallucinator is flooding the network with convincing claims. Some are true. Some are invented. Decide fast.</p>
          <ul class="rule-list">
            <li>${icon('timer')} ${CONFIG.seconds} seconds per claim, up to ${CONFIG.rounds} claims</li>
            <li>${icon('target')} Each correct call deals damage. Three in a row lands a critical hit.</li>
            <li>${icon('heart')} A wrong call or timeout costs one of your ${CONFIG.lives} shields</li>
            <li>${icon('keyboard')} Keyboard: press <kbd>F</kbd> for Verified, <kbd>J</kbd> for Hallucination</li>
          </ul>
          <div class="triad-stats">
            <div><span class="stat-num">${tokens}</span><span class="stat-label">Battle tokens</span></div>
            <div><span class="stat-num">${s.wins}</span><span class="stat-label">Victories</span></div>
            <div><span class="stat-num">${s.best}</span><span class="stat-label">Best score</span></div>
          </div>
          ${tokens > 0
            ? `<button class="btn btn-primary btn-lg" data-start>${icon('play')} Start battle <span class="xp-pill">+${NP.XP.TRIAD_WIN} XP on victory</span></button>`
            : `<p class="locked-note">${icon('lock')} Complete ${NP.XP.TRIAD_EVERY - NP.store.triadProgress()} more lesson(s) to earn your next battle token.</p>`}
        </div>
      </div>`;
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    const start = dialog.querySelector('[data-start]');
    if (start) start.addEventListener('click', startGame);
    NP.ui.refreshIcons();
  }

  function startGame() {
    if (!NP.store.startTriad()) return renderIntro();
    game = {
      queue: shuffle(CLAIMS).slice(0, CONFIG.rounds),
      round: 0,
      bossHp: CONFIG.bossHp,
      lives: CONFIG.lives,
      streak: 0,
      score: 0,
      locked: false
    };
    renderArena();
    nextRound();
  }

  function renderArena() {
    dialog.innerHTML = `
      <div class="dialog-panel triad-panel">
        <header class="dialog-head">
          <div>
            <p class="eyebrow">${icon('swords')} Triad Boss Battle</p>
            <h2 class="dialog-title" id="triad-title">The Hallucinator</h2>
          </div>
          <p class="score" aria-live="polite">Score <strong data-score>0</strong></p>
        </header>
        <div class="dialog-body arena">
          <div class="hud">
            <div class="hud-boss">
              <span class="hud-label">${icon('bot')} Boss integrity</span>
              <div class="hp-bar" role="progressbar" aria-label="Boss health" aria-valuemin="0" aria-valuemax="${CONFIG.bossHp}" data-hp-wrap>
                <span class="hp-fill" data-hp></span>
              </div>
            </div>
            <div class="hud-lives" aria-label="Shields remaining" data-lives></div>
          </div>
          <div class="claim-card" data-card>
            <p class="claim-round" data-round></p>
            <p class="claim-text" data-claim aria-live="assertive"></p>
            <div class="timer" aria-hidden="true"><span data-timer></span></div>
          </div>
          <div class="claim-actions">
            <button class="btn btn-verify" data-answer="true">${icon('shield-check')} Verified <kbd>F</kbd></button>
            <button class="btn btn-halluc" data-answer="false">${icon('triangle-alert')} Hallucination <kbd>J</kbd></button>
          </div>
          <p class="claim-feedback" data-feedback aria-live="polite"></p>
        </div>
      </div>`;
    dialog.querySelectorAll('[data-answer]').forEach((b) =>
      b.addEventListener('click', () => answer(b.dataset.answer === 'true')));
    updateHud();
    NP.ui.refreshIcons();
  }

  function updateHud() {
    const hp = dialog.querySelector('[data-hp]');
    if (!hp) return;
    hp.style.width = `${(Math.max(0, game.bossHp) / CONFIG.bossHp) * 100}%`;
    dialog.querySelector('[data-hp-wrap]').setAttribute('aria-valuenow', String(Math.max(0, game.bossHp)));
    dialog.querySelector('[data-lives]').innerHTML = Array.from({ length: CONFIG.lives }, (_, i) =>
      `<span class="life ${i < game.lives ? '' : 'is-lost'}">${icon('shield')}</span>`).join('') +
      `<span class="sr-only">${game.lives} of ${CONFIG.lives} shields</span>`;
    dialog.querySelector('[data-score]').textContent = game.score;
    NP.ui.refreshIcons();
  }

  function nextRound() {
    if (game.bossHp <= 0) return renderResult(true);
    if (game.lives <= 0 || game.round >= game.queue.length) return renderResult(false);
    const claim = game.queue[game.round];
    game.locked = false;
    const card = dialog.querySelector('[data-card]');
    card.classList.remove('is-right', 'is-wrong');
    dialog.querySelector('[data-round]').textContent = `Claim ${game.round + 1} of ${game.queue.length}`;
    dialog.querySelector('[data-claim]').textContent = claim.text;
    dialog.querySelector('[data-feedback]').textContent = '';
    dialog.querySelectorAll('[data-answer]').forEach((b) => (b.disabled = false));
    startTimer();
  }

  function startTimer() {
    stopTimer();
    const bar = dialog.querySelector('[data-timer]');
    const start = performance.now();
    const total = CONFIG.seconds * 1000;
    game.startedAt = start;
    const tick = (now) => {
      const left = Math.max(0, 1 - (now - start) / total);
      bar.style.width = `${left * 100}%`;
      bar.classList.toggle('is-low', left < 0.3);
      if (left <= 0) return answer(null);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function stopTimer() {
    cancelAnimationFrame(raf);
  }

  function answer(choice) {
    if (!game || game.locked) return;
    game.locked = true;
    stopTimer();
    const claim = game.queue[game.round];
    const correct = choice === claim.real;
    const card = dialog.querySelector('[data-card]');
    const feedback = dialog.querySelector('[data-feedback]');
    dialog.querySelectorAll('[data-answer]').forEach((b) => (b.disabled = true));

    if (correct) {
      game.streak += 1;
      const crit = game.streak >= 3;
      game.bossHp -= crit ? 2 : 1;
      const elapsed = (performance.now() - game.startedAt) / 1000;
      game.score += 100 + Math.round(Math.max(0, CONFIG.seconds - elapsed) * 10) + (crit ? 50 : 0);
      card.classList.add('is-right');
      feedback.className = 'claim-feedback is-good';
      feedback.textContent = `${crit ? 'Critical hit. ' : 'Direct hit. '}${claim.why}`;
    } else {
      game.streak = 0;
      game.lives -= 1;
      card.classList.add('is-wrong');
      feedback.className = 'claim-feedback is-bad';
      feedback.textContent = `${choice === null ? 'Time ran out. ' : 'Shield lost. '}That claim was ${claim.real ? 'verified' : 'a hallucination'}. ${claim.why}`;
    }
    updateHud();
    game.round += 1;
    setTimeout(() => { if (dialog.open && game) nextRound(); }, 2200);
  }

  function renderResult(won) {
    stopTimer();
    const finalScore = game.score + (won ? game.lives * 100 : 0);
    NP.store.finishTriad(won, finalScore);
    game = null;
    dialog.innerHTML = `
      <div class="dialog-panel triad-panel">
        <header class="dialog-head">
          <div>
            <p class="eyebrow">${icon('swords')} Triad Boss Battle</p>
            <h2 class="dialog-title" id="triad-title">${won ? 'Victory' : 'The Hallucinator escaped'}</h2>
          </div>
          <button class="icon-btn" data-close aria-label="Close battle">${icon('x')}</button>
        </header>
        <div class="dialog-body triad-result">
          <div class="result-emblem ${won ? 'is-win' : ''}" aria-hidden="true">${icon(won ? 'trophy' : 'rotate-ccw')}</div>
          <p class="lead">${won
            ? `You exposed every trick. +${NP.XP.TRIAD_WIN} XP and the legendary Triad Champion badge are yours.`
            : 'Misinformation spreads fast. Review the claims you missed and earn another token by completing three more lessons.'}</p>
          <p class="result-score">Final score <strong>${finalScore}</strong></p>
          <div class="foot-actions">
            ${NP.store.triadTokens() > 0 ? `<button class="btn btn-primary" data-again>${icon('play')} Battle again</button>` : ''}
            <button class="btn btn-ghost" data-close>Return to portal</button>
          </div>
        </div>
      </div>`;
    dialog.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
    const again = dialog.querySelector('[data-again]');
    if (again) again.addEventListener('click', startGame);
    NP.ui.refreshIcons();
  }

  NP.triad = {
    init() {
      dialog = document.getElementById('triad-dialog');
      NP.ui.bindDialog(dialog, () => {
        stopTimer();
        game = null;
        NP.bus.emit('change', NP.store.state);
      });
      dialog.addEventListener('keydown', (e) => {
        if (!game || game.locked) return;
        if (e.key === 'f' || e.key === 'F') answer(true);
        if (e.key === 'j' || e.key === 'J') answer(false);
      });
    },
    open() {
      renderIntro();
      NP.ui.openDialog(dialog);
    }
  };
})(window.NP = window.NP || {});
