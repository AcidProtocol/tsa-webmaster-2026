/* NeuralPath: workshop.js
   Interactions for pages/workshop.html. Needs store.js (NP) and ui.js (UI).
   Sections: helpers · progress · tabs · timer · part 1 · part 2 · part 3 · init */
(function () {
    'use strict';

    /* ===================================================================
       Helpers
       =================================================================== */
    function $(id) { return document.getElementById(id); }

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    function shuffle(list) {
        var a = list.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    /* Combine several store results into one so the student sees a single set of toasts. */
    function mergeResults(list) {
        var out = { xpGained: 0, newBadges: [], leveledUp: false, moduleFinished: false };
        list.forEach(function (r) {
            if (!r) return;
            out.xpGained += r.xpGained || 0;
            out.newBadges = out.newBadges.concat(r.newBadges || []);
            out.leveledUp = out.leveledUp || !!r.leveledUp;
            out.moduleFinished = out.moduleFinished || !!r.moduleFinished;
        });
        return out;
    }

    /* ===================================================================
       Progress (three parts, one activity each)
       =================================================================== */
    var PARTS = [
        { n: 1, activity: 'ws-predict' },
        { n: 2, activity: 'ws-prep' },
        { n: 3, activity: 'ws-quiz-pass' }
    ];

    function renderProgress() {
        var count = 0;
        PARTS.forEach(function (p) {
            var done = NP.activityDone(p.activity);
            if (done) count++;
            var status = document.querySelector('[data-status="' + p.n + '"]');
            status.textContent = done ? 'Complete' : 'Not started';
            status.setAttribute('data-done', String(done));
            var note = document.querySelector('[data-done-note="' + p.n + '"]');
            if (note) note.hidden = !done;
        });

        var pct = Math.round((count / PARTS.length) * 100);
        $('ws-progress-text').textContent = count + ' of ' + PARTS.length + ' parts complete';
        $('ws-progress-pct').textContent = pct + '%';
        $('ws-progress-fill').style.width = pct + '%';
        $('ws-progress-bar').setAttribute('aria-valuenow', String(pct));
        $('ws-finish').hidden = count < PARTS.length;
        UI.syncXP();
    }

    /* Run a store call, show toasts, refresh progress. */
    function award(result, label) {
        UI.announce(result, label);
        renderProgress();
    }

    /* ===================================================================
       Tabs
       =================================================================== */
    function initTabs() {
        var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

        function show(n, focus) {
            tabs.forEach(function (t) {
                var on = Number(t.getAttribute('data-step')) === n;
                t.setAttribute('aria-selected', String(on));
                t.tabIndex = on ? 0 : -1;
                $('panel-' + t.getAttribute('data-step')).hidden = !on;
                if (on && focus) t.focus();
            });
        }

        tabs.forEach(function (t, i) {
            t.addEventListener('click', function () { show(Number(t.getAttribute('data-step')), false); });
            t.addEventListener('keydown', function (e) {
                var next = null;
                if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
                else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
                else if (e.key === 'Home') next = 0;
                else if (e.key === 'End') next = tabs.length - 1;
                if (next !== null) { e.preventDefault(); show(next + 1, true); }
            });
        });

        document.querySelectorAll('[data-goto]').forEach(function (b) {
            b.addEventListener('click', function () {
                show(Number(b.getAttribute('data-goto')), false);
                $('tab-' + b.getAttribute('data-goto')).scrollIntoView({ block: 'start' });
            });
        });

        /* Myth and reality reveals */
        document.querySelectorAll('[data-reveal]').forEach(function (b) {
            b.addEventListener('click', function () {
                var target = $(b.getAttribute('data-reveal'));
                var open = target.hidden;
                target.hidden = !open;
                b.setAttribute('aria-expanded', String(open));
                b.textContent = open ? 'Hide the reality' : 'Show the reality';
            });
        });
    }

    /* ===================================================================
       Session timer (optional, for facilitators)
       =================================================================== */
    function initTimer() {
        var elapsed = 0;
        var handle = null;

        function fmt(sec) {
            var m = Math.floor(sec / 60);
            var s = sec % 60;
            return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        }
        function segment(sec) {
            if (sec < 600) return 'Part 1: aim to finish by 10:00';
            if (sec < 2100) return 'Part 2: aim to finish by 35:00';
            if (sec < 3600) return 'Part 3: aim to finish by 60:00';
            return 'Time is up. Wrap up your last activity.';
        }
        function paint() {
            $('timer-text').textContent = fmt(elapsed);
            $('timer-seg').textContent = segment(elapsed);
        }

        $('timer-toggle').addEventListener('click', function () {
            if (handle) {
                clearInterval(handle);
                handle = null;
                $('timer-toggle').textContent = 'Resume timer';
            } else {
                handle = setInterval(function () { elapsed++; paint(); }, 1000);
                $('timer-toggle').textContent = 'Pause timer';
            }
        });
        $('timer-reset').addEventListener('click', function () {
            clearInterval(handle);
            handle = null;
            elapsed = 0;
            $('timer-toggle').textContent = 'Start timer';
            paint();
        });
        paint();
    }

    /* ===================================================================
       Part 1: next-word predictor
       =================================================================== */
    var SCENARIOS = [
        {
            id: 'everyday', label: 'Everyday sentence', prefix: 'The students opened their',
            insight: 'Several words were close contenders, so different runs give different sentences. The model picks what is likely, not what is true.',
            steps: [
                { all: [['books', 38], ['laptops', 26], ['notebooks', 18], ['minds', 10], ['lockers', 8]] },
                { all: [['and', 32], ['to', 30], ['before', 20], ['.', 18]], by: { minds: [['to', 55], ['and', 25], ['.', 20]] } },
                { all: [['the', 35], ['their', 25], ['a', 20], ['.', 20]] }
            ]
        },
        {
            id: 'fact', label: 'A factual question', prefix: 'The capital of France is',
            insight: 'One word dominated, so the model almost always says Paris. High odds usually come from facts that appeared consistently in its training text. It is still predicting, not looking anything up.',
            steps: [
                { all: [['Paris', 93], ['a', 3], ['located', 2], ['Lyon', 1], ['not', 1]] },
                { all: [['.', 70], [',', 20], ['and', 10]] },
                { all: [['the', 40], ['a', 30], ['.', 30]] }
            ]
        },
        {
            id: 'story', label: 'A creative story', prefix: 'Once upon a time, a robot',
            insight: 'Lots of close options means lots of different stories. A flatter spread helps creative writing. For facts, you want a sharp one.',
            steps: [
                { all: [['wandered', 22], ['learned', 20], ['discovered', 18], ['built', 14], ['dreamed', 12], ['found', 14]] },
                { all: [['into', 30], ['that', 25], ['a', 25], ['the', 20]] },
                { all: [['forest', 25], ['secret', 25], ['garden', 25], ['city', 25]] }
            ]
        }
    ];
    var PREDICTIONS_NEEDED = 3;

    function probabilities(list, temperature) {
        var inv = 1 / temperature;
        var weights = list.map(function (x) { return Math.pow(x[1], inv); });
        var sum = weights.reduce(function (a, b) { return a + b; }, 0);
        return list.map(function (x, i) { return { word: x[0], p: weights[i] / sum }; })
            .sort(function (a, b) { return b.p - a.p; });
    }

    function tokenNote(word) {
        if (word === '.') return 'ends the sentence';
        if (word === ',') return 'comma';
        return '';
    }

    function temperatureName(t) {
        if (t < 0.6) return 'Very focused';
        if (t < 1.3) return 'Balanced';
        return 'Adventurous';
    }

    function initPredict() {
        var state = { scn: SCENARIOS[0], step: 0, words: [], finished: false };
        var made = 0;
        var scnBox = $('pred-scn');

        function temperature() { return parseFloat($('pred-temp').value); }

        function currentList() {
            var step = state.scn.steps[state.step];
            var last = state.words[state.words.length - 1];
            return (step.by && step.by[last]) || step.all;
        }

        function renderSentence() {
            var box = $('pred-sentence');
            box.textContent = '';
            box.appendChild(document.createTextNode(state.scn.prefix));
            if (state.words.length) {
                var gen = el('span', 'pred-new');
                var text = '';
                state.words.forEach(function (w) { text += (/^[.,]$/.test(w) ? '' : ' ') + w; });
                gen.textContent = text;
                box.appendChild(gen);
            }
            if (!state.finished) box.appendChild(el('span', 'pred-caret'));
        }

        function renderOptions() {
            var ul = $('pred-options');
            ul.textContent = '';
            $('pred-sample').disabled = state.finished;
            if (state.finished) { $('pred-status').textContent = ''; return; }

            var probs = probabilities(currentList(), temperature());
            probs.forEach(function (o) {
                var pct = Math.round(o.p * 100);
                var li = document.createElement('li');
                var b = el('button', 'pred-opt');
                b.type = 'button';
                b.style.setProperty('--w', Math.max(pct, 2) + '%');
                var label = el('span');
                label.textContent = o.word === '.' ? '.' : o.word;
                var note = tokenNote(o.word);
                if (note) label.appendChild(el('small', null, note));
                b.appendChild(label);
                b.appendChild(el('span', 'pred-pct', pct + '%'));
                b.setAttribute('aria-label', (note || o.word) + ', ' + pct + ' percent');
                b.addEventListener('click', function () { pick(o.word); });
                li.appendChild(b);
                ul.appendChild(li);
            });
            var top = probs[0];
            $('pred-status').textContent = 'Most likely next word: ' + (top.word === '.' ? 'a period' : top.word) + ' (' + Math.round(top.p * 100) + '%).';
        }

        function renderMeta() {
            $('pred-count').textContent = 'Predictions made: ' + Math.min(made, PREDICTIONS_NEEDED) + ' of ' + PREDICTIONS_NEEDED + (made > PREDICTIONS_NEEDED ? ' (keep experimenting!)' : '');
            var insight = $('pred-insight');
            insight.hidden = !state.finished;
            if (state.finished) insight.textContent = state.scn.insight;
        }

        function render() {
            renderSentence();
            renderOptions();
            renderMeta();
        }

        function pick(word) {
            if (state.finished) return;
            state.words.push(word);
            made++;
            if (word === '.' || state.step >= state.scn.steps.length - 1) state.finished = true;
            else state.step++;
            render();
            if (made >= PREDICTIONS_NEEDED && !NP.activityDone('ws-predict')) {
                award(NP.completeActivity('ws-predict', 15, { module: 'concepts', lesson: 'what-is-ai' }), 'next-word demo');
            }
        }

        function sample() {
            var probs = probabilities(currentList(), temperature());
            var r = Math.random();
            var acc = 0;
            for (var i = 0; i < probs.length; i++) {
                acc += probs[i].p;
                if (r <= acc) { pick(probs[i].word); return; }
            }
            pick(probs[probs.length - 1].word);
        }

        function restart(scn) {
            state = { scn: scn || state.scn, step: 0, words: [], finished: false };
            render();
        }

        SCENARIOS.forEach(function (s, i) {
            var chip = el('button', 'chip', s.label);
            chip.type = 'button';
            chip.setAttribute('aria-pressed', String(i === 0));
            chip.addEventListener('click', function () {
                Array.prototype.forEach.call(scnBox.children, function (c) { c.setAttribute('aria-pressed', 'false'); });
                chip.setAttribute('aria-pressed', 'true');
                restart(s);
            });
            scnBox.appendChild(chip);
        });

        $('pred-temp').addEventListener('input', function () {
            $('pred-temp-out').textContent = temperatureName(temperature());
            renderOptions();
        });
        $('pred-sample').addEventListener('click', sample);
        $('pred-reset').addEventListener('click', function () { restart(); });

        render();
    }

    /* ===================================================================
       Part 2a: simulated research tour
       =================================================================== */
    var TOUR = {
        1: {
            q: '',
            a: false,
            caption: 'Start with sources you trust: class readings, your own notes, and articles from your library\u2019s databases. A source-based tool answers from these, not from the whole internet.'
        },
        2: {
            q: 'What did my sources say about why leaves look green?',
            a: true,
            caption: 'Ask a specific question. Notice that the answer points to numbered sources instead of just stating facts.'
        },
        3: {
            q: 'What did my sources say about why leaves look green?',
            a: true,
            caption: 'Click each citation and read the original passage. If the passage doesn\u2019t say it, don\u2019t use it.'
        }
    };
    var PASSAGES = {
        1: 'Source 1, Chapter 4 (simulated): \u201CChlorophyll absorbs light mostly in the red and blue parts of the spectrum and reflects green.\u201D',
        2: 'Source 2, lab notes (simulated): \u201CSpinach sample: chlorophyll reading 38. Pale sample: 21.\u201D'
    };

    function initTour() {
        var root = $('tour');
        var chips = root.querySelectorAll('[data-tour]');

        function cite(n, enabled) {
            var b = el('button', 'cite', '[' + n + ']');
            b.type = 'button';
            b.disabled = !enabled;
            b.setAttribute('aria-label', 'Citation ' + n + (enabled ? ', show passage' : ''));
            b.addEventListener('click', function () {
                var p = $('tour-passage');
                p.textContent = PASSAGES[n];
                p.hidden = false;
            });
            return b;
        }

        function show(step) {
            var data = TOUR[step];
            root.setAttribute('data-step', String(step));
            Array.prototype.forEach.call(chips, function (c) {
                c.setAttribute('aria-pressed', String(Number(c.getAttribute('data-tour')) === step));
            });
            $('tour-q').textContent = data.q;
            var a = $('tour-a');
            a.textContent = '';
            if (data.a) {
                var enabled = step === 3;
                a.appendChild(document.createTextNode('Leaves look green because chlorophyll absorbs mostly red and blue light and reflects green'));
                a.appendChild(cite(1, enabled));
                a.appendChild(document.createTextNode('. Your lab notes also record that the spinach sample had a higher chlorophyll reading than the pale sample'));
                a.appendChild(cite(2, enabled));
                a.appendChild(document.createTextNode('.'));
            }
            var passage = $('tour-passage');
            passage.hidden = true;
            passage.textContent = '';
            $('tour-caption').textContent = data.caption;
        }

        Array.prototype.forEach.call(chips, function (c) {
            c.addEventListener('click', function () { show(Number(c.getAttribute('data-tour'))); });
        });
        show(1);
    }

    /* ===================================================================
       Part 2b: PREP prompt builder
       =================================================================== */
    var TASKS = {
        summarize: {
            label: 'Understand a hard reading',
            weak: 'Summarize this.',
            p1: 'Summarize the main argument of the reading I paste below.',
            r: 'I\u2019m a 10th grader preparing for a class discussion, and the vocabulary is dense.',
            e: 'A good answer is three short bullet points, each with a plain-language example.',
            p2: 'Keep it under 150 words and tell me which parts you\u2019re unsure about.'
        },
        brainstorm: {
            label: 'Brainstorm essay angles',
            weak: 'Write about social media.',
            p1: 'Give me five possible angles for an essay on social media and teen sleep.',
            r: 'It\u2019s for a 3-page argumentative essay in English 10. I haven\u2019t picked a side yet and I want to choose myself.',
            e: 'Format each angle like this: Claim: ... Evidence I could look for: ...',
            p2: 'Give me angles only. Don\u2019t write any of the essay, and suggest what kinds of sources to look up.'
        },
        explain: {
            label: 'Explain a tough concept',
            weak: 'What is supply and demand?',
            p1: 'Explain how supply and demand set prices.',
            r: 'I\u2019m in 9th grade economics. I understand what a market is, but I get lost on the graphs.',
            e: 'Use a food truck selling tacos as the running example.',
            p2: 'Keep it under 200 words, then ask me two questions to check that I understood.'
        },
        feedback: {
            label: 'Get feedback on my draft',
            weak: 'Fix my essay.',
            p1: 'Give me feedback on the thesis statement in my draft below.',
            r: 'This is my own writing for a history paper. I want to improve it myself, so please don\u2019t rewrite it.',
            e: 'Point out one strength, then one question a reader might ask, like a teacher\u2019s margin comment.',
            p2: 'Use three sentences or fewer, and don\u2019t change my wording.'
        }
    };
    var FIELDS = [
        { key: 'p1', id: 'pb-p1', label: 'Point', tip: 'Start with the Point: one clear sentence saying what you need.' },
        { key: 'r', id: 'pb-r', label: 'Reason', tip: 'Add a Reason: your class, your level, and why you\u2019re asking.' },
        { key: 'e', id: 'pb-e', label: 'Example', tip: 'Add an Example: describe what a good answer looks like.' },
        { key: 'p2', id: 'pb-p2', label: 'Point again', tip: 'Finish with Point again: set a length, a format, and what to leave out.' }
    ];
    var MIN_CHARS = 15;

    function initBuilder() {
        var select = $('pb-task');
        var taskKey = 'summarize';

        Object.keys(TASKS).forEach(function (k) {
            var o = document.createElement('option');
            o.value = k;
            o.textContent = TASKS[k].label;
            select.appendChild(o);
        });

        function values() {
            var v = {};
            FIELDS.forEach(function (f) { v[f.key] = $(f.id).value.trim(); });
            return v;
        }

        function buildPrompt(v) {
            var labels = $('pb-labels').checked;
            var parts = [];
            FIELDS.forEach(function (f) {
                if (v[f.key]) parts.push(labels ? f.label + ': ' + v[f.key] : v[f.key]);
            });
            return parts.join('\n\n');
        }

        function update() {
            var v = values();
            var text = buildPrompt(v);
            var out = $('pb-out');
            out.textContent = text || 'Your prompt will appear here as you type.';
            out.classList.toggle('is-empty', !text);

            var score = 0;
            var weakest = null;
            FIELDS.forEach(function (f) {
                var n = v[f.key].length;
                score += n >= MIN_CHARS ? 1 : n > 0 ? 0.5 : 0;
                if (!weakest && n < MIN_CHARS) weakest = f;
            });
            var pct = Math.round((score / FIELDS.length) * 100);
            $('pb-score-text').textContent = pct + '%';
            $('pb-score-fill').style.width = pct + '%';
            $('pb-score-bar').setAttribute('aria-valuenow', String(pct));
            $('pb-tip').textContent = weakest ? weakest.tip : 'Strong prompt. Lock it in, then check anything the AI tells you.';
            $('pb-lock').disabled = !!weakest;
        }

        function setTask(key) {
            taskKey = key;
            var t = TASKS[key];
            FIELDS.forEach(function (f) {
                var box = $(f.id);
                box.value = '';
                box.placeholder = 'e.g., ' + t[f.key];
            });
            $('pb-weak').textContent = t.weak;
            update();
        }

        select.addEventListener('change', function () { setTask(select.value); });
        FIELDS.forEach(function (f) { $(f.id).addEventListener('input', update); });
        $('pb-labels').addEventListener('change', update);

        $('pb-sample').addEventListener('click', function () {
            var t = TASKS[taskKey];
            FIELDS.forEach(function (f) { $(f.id).value = t[f.key]; });
            update();
        });

        $('pb-lock').addEventListener('click', function () {
            var r = NP.completeActivity('ws-prep', 25, { module: 'tools', lesson: 'prompting' });
            if (r.already) UI.toast('Already locked in earlier. XP counts once.');
            else award(r, 'PREP prompt');
        });

        function fallbackCopy(text) {
            try {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                var ok = document.execCommand('copy');
                ta.remove();
                UI.toast(ok ? 'Prompt copied.' : 'Select the text and copy it yourself.');
            } catch (e) {
                UI.toast('Select the text and copy it yourself.');
            }
        }

        $('pb-copy').addEventListener('click', function () {
            var text = buildPrompt(values());
            if (!text) { UI.toast('Write something first, then copy it.'); return; }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () { UI.toast('Prompt copied.'); }, function () { fallbackCopy(text); });
            } else {
                fallbackCopy(text);
            }
        });

        setTask(taskKey);
    }

    /* ===================================================================
       Part 3: Spot the hallucination
       =================================================================== */
    var CLAIMS = [
        {
            id: 'c1', error: false,
            text: 'Photosynthesis takes place mainly in the chloroplasts of plant cells.',
            note: 'Accurate. Chloroplasts are where photosynthesis mainly happens in plant cells.'
        },
        {
            id: 'c2', error: true, title: 'The gases are reversed',
            text: 'Plants absorb oxygen from the air and release carbon dioxide during photosynthesis.',
            why: 'Plants take in carbon dioxide and release oxygen during photosynthesis. The sentence has the gases backward.',
            fixNote: 'Plants take in carbon dioxide and release oxygen.',
            options: [
                { ok: true, text: 'Plants take in carbon dioxide and release oxygen during photosynthesis.' },
                { ok: false, text: 'Plants take in nitrogen and release oxygen.', why: 'Plants don\u2019t use nitrogen for photosynthesis. They take in carbon dioxide.' },
                { ok: false, text: 'Keep it, but say it only happens at night.', why: 'Releasing carbon dioxide at night is respiration, a different process.' }
            ]
        },
        {
            id: 'c3', error: false,
            text: 'Chlorophyll, the green pigment in leaves, mostly absorbs red and blue light.',
            note: 'Accurate. Chlorophyll reflects green light, which is why leaves look green.'
        },
        {
            id: 'c4', error: true, title: 'A citation you can\u2019t find',
            text: 'The process was first fully described in a landmark paper by Dr. Eleanor Whitfield, \u201CThe Solar Engine of Life\u201D (Journal of Botanical Sciences, vol. 12, 1905).',
            why: 'This author and paper were invented for this exercise, but real chatbots produce citations just like this. The tell: it is tidy and specific, yet you can\u2019t find it in Google Scholar or a library database.',
            fixNote: 'Always search for the author and title yourself. If it doesn\u2019t exist, it can\u2019t be cited.',
            options: [
                { ok: true, text: 'Search the author and title in Google Scholar or a library database. If you can\u2019t find it, remove the citation.' },
                { ok: false, text: 'Keep it, because it lists a journal, volume, and year.', why: 'Details make a citation look real, but invented citations include them too.' },
                { ok: false, text: 'Change the year so it sounds more believable.', why: 'Changing details doesn\u2019t make a source real. You\u2019d be inventing evidence.' }
            ]
        },
        {
            id: 'c5', error: false,
            text: 'Photosynthesis produces glucose, which plants use for energy and growth.',
            note: 'Accurate. Glucose is a sugar plants use for energy and to build tissue.'
        },
        {
            id: 'c6', error: true, title: 'A \u201Cstudy\u201D with no source',
            text: 'According to a 2021 Harvard study, plants photosynthesize 40% faster when classical music is played nearby.',
            why: 'A vague \u201CHarvard study\u201D with no title, authors, or link can\u2019t be checked, and the claim doesn\u2019t match established plant science. Treat it as unverified until you find the original.',
            fixNote: 'A named university and a precise number are not proof. Find the study itself.',
            options: [
                { ok: true, text: 'Look for the actual study. If you can\u2019t find it, remove the claim.' },
                { ok: false, text: 'Keep it and add \u201Cmany experts agree.\u201D', why: 'Adding vague authority doesn\u2019t verify anything.' },
                { ok: false, text: 'Swap \u201CHarvard\u201D for another university to be safe.', why: 'Swapping names trades one unverified claim for another.' }
            ]
        },
        {
            id: 'c7', error: true, title: 'Right idea, wrong location',
            text: 'The light-dependent reactions take place in the stroma of the chloroplast.',
            why: 'The light-dependent reactions happen in the thylakoid membranes. The stroma is where the Calvin cycle takes place.',
            fixNote: 'Thylakoid membranes: light-dependent reactions. Stroma: Calvin cycle.',
            options: [
                { ok: true, text: 'The light-dependent reactions take place in the thylakoid membranes. The stroma is where the Calvin cycle happens.' },
                { ok: false, text: 'They take place in the cell nucleus.', why: 'The nucleus holds DNA. Photosynthesis happens in chloroplasts.' },
                { ok: false, text: 'They take place in the mitochondria instead.', why: 'Mitochondria handle cellular respiration, not photosynthesis.' }
            ]
        }
    ];
    var ERRORS_TOTAL = CLAIMS.filter(function (c) { return c.error; }).length;
    var CAUGHT_NEEDED = 3;
    var FIXES_NEEDED = 3;

    function initQuiz() {
        var flagged, checked, caught, fixes;

        function updateCount() {
            var n = Object.keys(flagged).filter(function (k) { return flagged[k]; }).length;
            $('quiz-count').textContent = n + (n === 1 ? ' sentence flagged' : ' sentences flagged');
            $('quiz-check').disabled = checked || n === 0;
        }

        function reset() {
            flagged = {};
            checked = false;
            caught = 0;
            fixes = 0;
            var text = $('quiz-text');
            text.textContent = '';
            CLAIMS.forEach(function (c) {
                var b = el('button', 'claim', c.text);
                b.type = 'button';
                b.id = 'claim-' + c.id;
                b.setAttribute('aria-pressed', 'false');
                b.addEventListener('click', function () {
                    if (checked) return;
                    flagged[c.id] = !flagged[c.id];
                    b.setAttribute('aria-pressed', String(!!flagged[c.id]));
                    updateCount();
                });
                text.appendChild(b);
                text.appendChild(document.createTextNode(' '));
            });
            $('quiz-summary').textContent = '';
            $('quiz-notes').textContent = '';
            $('quiz-fixes').textContent = '';
            $('quiz-pass').hidden = true;
            $('quiz-retry').hidden = true;
            updateCount();
        }

        function maybePass() {
            if (caught >= CAUGHT_NEEDED && fixes >= FIXES_NEEDED && !NP.activityDone('ws-quiz-pass')) {
                return NP.completeActivity('ws-quiz-pass', 15, { module: 'ethics', lesson: 'disclosure' });
            }
            return null;
        }

        function showPass(passResult) {
            if (!passResult) return;
            var box = $('quiz-pass');
            box.textContent = 'You passed Spot the Hallucination. You checked the claims instead of trusting them, which is exactly the habit that matters.';
            box.hidden = false;
        }

        function renderFix(c, wasCaught) {
            var card = el('fieldset', 'fix-card');
            card.appendChild(el('legend', null, c.title));
            card.appendChild(el('p', 'fix-why', (wasCaught ? 'You caught this one. ' : 'You missed this one. ') + c.why));
            card.appendChild(el('p', null, 'How would you fix it?'));

            var fb = el('p', 'fix-fb');
            fb.setAttribute('aria-live', 'polite');
            var solved = false;

            shuffle(c.options).forEach(function (opt, i) {
                var label = el('label', 'opt');
                var input = document.createElement('input');
                input.type = 'radio';
                input.name = 'fix-' + c.id;
                input.value = String(i);
                input.setAttribute('data-correct', String(opt.ok));
                label.appendChild(input);
                label.appendChild(el('span', null, opt.text));
                input.addEventListener('change', function () {
                    if (solved) return;
                    if (opt.ok) {
                        solved = true;
                        fixes++;
                        fb.textContent = 'Correct. ' + c.fixNote;
                        fb.setAttribute('data-ok', 'true');
                        card.querySelectorAll('input').forEach(function (r) { r.disabled = true; });
                        var fixResult = NP.completeActivity('ws-q-fix-' + c.id, 5);
                        var passResult = maybePass();
                        award(mergeResults([fixResult, passResult]), 'fixed an error');
                        showPass(passResult);
                    } else {
                        fb.textContent = 'Not quite. ' + opt.why + ' Try another answer.';
                        fb.setAttribute('data-ok', 'false');
                    }
                });
                card.appendChild(label);
            });
            card.appendChild(fb);
            return card;
        }

        function check() {
            checked = true;
            var results = [];
            var missed = 0;
            var falseAlarms = 0;
            var notes = $('quiz-notes');
            var fixesBox = $('quiz-fixes');

            CLAIMS.forEach(function (c) {
                var btn = $('claim-' + c.id);
                var flag = !!flagged[c.id];
                var state = c.error ? (flag ? 'caught' : 'missed') : (flag ? 'false' : 'ok');
                btn.setAttribute('aria-disabled', 'true');
                if (state !== 'ok') {
                    btn.setAttribute('data-result', state);
                    var tag = { caught: '\u2713 error caught', missed: '! missed error', false: '\u2717 actually accurate' }[state];
                    btn.appendChild(el('span', 'claim-tag', tag));
                }

                if (c.error && flag) {
                    caught++;
                    results.push(NP.completeActivity('ws-q-flag-' + c.id, 10));
                }
                if (c.error && !flag) missed++;
                if (!c.error && flag) {
                    falseAlarms++;
                    notes.appendChild(el('li', null, c.note));
                }
                if (c.error) fixesBox.appendChild(renderFix(c, flag));
            });

            var summary = 'You caught ' + caught + ' of ' + ERRORS_TOTAL + ' errors';
            if (falseAlarms) summary += ' and flagged ' + falseAlarms + (falseAlarms === 1 ? ' sentence that was accurate' : ' sentences that were accurate');
            summary += '.';
            if (missed) summary += ' Read why you missed ' + (missed === 1 ? 'one' : 'some') + ', then fix every error below.';
            else summary += ' Now fix each error below.';
            $('quiz-summary').textContent = summary;

            $('quiz-check').disabled = true;
            $('quiz-retry').hidden = false;
            award(mergeResults(results), 'errors caught');
        }

        $('quiz-check').addEventListener('click', check);
        $('quiz-retry').addEventListener('click', reset);
        reset();
    }

    /* ===================================================================
       Init
       =================================================================== */
    function init() {
        UI.initTheme();
        initTabs();
        initTimer();
        initPredict();
        initTour();
        initBuilder();
        initQuiz();
        renderProgress();
    }

    document.addEventListener('DOMContentLoaded', init);
})();