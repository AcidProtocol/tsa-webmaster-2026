/* NeuralPath: lesson.js
   Lesson reader dialog. A lesson can only be completed after the student
   scrolls to the end AND answers the knowledge check-in correctly. */
(function (NP) {
  'use strict';

  const { icon, esc } = NP.ui;
  let dialog;
  let current = null;
  let gate = { read: false, passed: false };

  function render(lessonId) {
    const found = NP.findLesson(lessonId);
    if (!found) return;
    const { module: mod, lesson, index } = found;
    const done = NP.store.isLessonDone(lesson.id);
    current = found;
    gate = { read: done, passed: done };

    dialog.innerHTML = `
      <div class="dialog-panel lesson-panel">
        <header class="dialog-head lesson-head">
          <div>
            <p class="eyebrow">${icon(mod.icon)} ${esc(mod.title)} <span class="dot-sep" aria-hidden="true"></span> Lesson ${index + 1} of ${mod.lessons.length} <span class="dot-sep" aria-hidden="true"></span> ${lesson.minutes} min</p>
            <h2 class="dialog-title" id="lesson-title">${esc(lesson.title)}</h2>
          </div>
          <button class="icon-btn" data-close aria-label="Close lesson">${icon('x')}</button>
          <div class="read-progress" aria-hidden="true"><span data-read-bar></span></div>
        </header>

        <div class="dialog-body lesson-body" data-scroll tabindex="0" aria-labelledby="lesson-title">
          <p class="lesson-intro" data-simplify>${esc(lesson.intro)}</p>
          ${lesson.sections.map((s) => `
            <section class="lesson-section">
              <h3>${esc(s.h)}</h3>
              <p data-simplify>${esc(s.p)}</p>
            </section>`).join('')}

          <aside class="callout">
            <p class="callout-title">${icon('lightbulb')} ${esc(lesson.callout.title)}</p>
            <p data-simplify>${esc(lesson.callout.body)}</p>
          </aside>

          <section class="takeaways" aria-labelledby="takeaways-h">
            <h3 id="takeaways-h">Key takeaways</h3>
            <ul>${lesson.takeaways.map((t) => `<li>${icon('check')}<span data-simplify>${esc(t)}</span></li>`).join('')}</ul>
          </section>

          <form class="check" data-check>
            <fieldset>
              <legend><span class="eyebrow">${icon('shield-check')} Knowledge check-in</span>${esc(lesson.check.q)}</legend>
              ${lesson.check.options.map((o, i) => `
                <label class="option">
                  <input type="radio" name="answer" value="${i}" ${done && i === lesson.check.answer ? 'checked' : ''}>
                  <span class="option-mark" aria-hidden="true"></span>
                  <span>${esc(o)}</span>
                </label>`).join('')}
            </fieldset>
            <button class="btn btn-ghost" type="submit">Check answer</button>
            <p class="check-feedback" data-feedback aria-live="polite"></p>
          </form>
          <div data-end-sentinel aria-hidden="true"></div>
        </div>

        <footer class="dialog-foot lesson-foot" data-foot></footer>
      </div>`;

    bind();
    renderFoot();
    NP.ui.hydrate(dialog);
    NP.ui.openDialog(dialog);
    const scroller = dialog.querySelector('[data-scroll]');
    scroller.scrollTop = 0;
    requestAnimationFrame(() => onScroll(scroller));
  }

  function renderFoot() {
    const foot = dialog.querySelector('[data-foot]');
    const done = NP.store.isLessonDone(current.lesson.id);
    const next = current.module.lessons[current.index + 1];

    if (done) {
      foot.innerHTML = `
        <p class="foot-status is-done">${icon('circle-check')} Lesson completed</p>
        <div class="foot-actions">
          ${next
            ? `<button class="btn btn-primary" data-next="${next.id}">Next: ${esc(next.title)} ${icon('arrow-right')}</button>`
            : `<button class="btn btn-primary" data-close>Back to module ${icon('arrow-right')}</button>`}
        </div>`;
    } else {
      const ready = gate.read && gate.passed;
      foot.innerHTML = `
        <ul class="gate-list" aria-label="Requirements to complete this lesson">
          <li class="${gate.read ? 'ok' : ''}">${icon(gate.read ? 'circle-check' : 'circle')} Read to the end</li>
          <li class="${gate.passed ? 'ok' : ''}">${icon(gate.passed ? 'circle-check' : 'circle')} Pass the check-in</li>
        </ul>
        <button class="btn btn-primary" data-complete ${ready ? '' : 'disabled'} aria-disabled="${!ready}">
          ${icon('check')} Complete Lesson <span class="xp-pill">+${NP.XP.LESSON} XP</span>
        </button>`;
    }

    foot.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
    const nextBtn = foot.querySelector('[data-next]');
    if (nextBtn) nextBtn.addEventListener('click', () => render(nextBtn.dataset.next));
    const completeBtn = foot.querySelector('[data-complete]');
    if (completeBtn) {
      completeBtn.addEventListener('click', () => {
        if (!(gate.read && gate.passed)) return;
        NP.store.completeLesson(current.lesson.id);
        renderFoot();
      });
    }
    NP.ui.refreshIcons();
  }

  function onScroll(scroller) {
    const max = scroller.scrollHeight - scroller.clientHeight;
    const pct = max <= 0 ? 1 : scroller.scrollTop / max;
    dialog.querySelector('[data-read-bar]').style.width = `${Math.round(pct * 100)}%`;
    if (!gate.read && pct > 0.96) {
      gate.read = true;
      renderFoot();
    }
  }

  function bind() {
    dialog.querySelectorAll('.lesson-head [data-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
    const scroller = dialog.querySelector('[data-scroll]');
    scroller.addEventListener('scroll', () => onScroll(scroller), { passive: true });

    const form = dialog.querySelector('[data-check]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const choice = form.querySelector('input[name="answer"]:checked');
      const feedback = form.querySelector('[data-feedback]');
      if (!choice) {
        feedback.className = 'check-feedback is-warn';
        feedback.textContent = 'Choose an answer first.';
        return;
      }
      const correct = Number(choice.value) === current.lesson.check.answer;
      feedback.className = `check-feedback ${correct ? 'is-good' : 'is-bad'}`;
      feedback.textContent = correct
        ? `Correct. ${current.lesson.check.explain}`
        : 'Not quite. Re-read the sections above and try again.';
      form.querySelectorAll('.option').forEach((o) => o.classList.remove('is-right', 'is-wrong'));
      choice.closest('.option').classList.add(correct ? 'is-right' : 'is-wrong');
      if (correct && !gate.passed) {
        gate.passed = true;
        renderFoot();
      }
    });
  }

  NP.lesson = {
    init() {
      dialog = document.getElementById('lesson-dialog');
      NP.ui.bindDialog(dialog, () => NP.bus.emit('lesson-closed'));
    },
    open: render
  };
})(window.NP = window.NP || {});
