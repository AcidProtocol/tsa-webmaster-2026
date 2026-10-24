/* NeuralPath: views/datalab.js
   Interactive SVG charts and data tables. Parameter counts are publicly reported figures;
   token and audit datasets are illustrative classroom examples and are labeled as such. */
(function (NP) {
  'use strict';

  const { icon, esc } = NP.ui;

  const MODELS = [
    { name: 'GPT-2', org: 'OpenAI', year: 2019, params: 1.5 },
    { name: 'GPT-3', org: 'OpenAI', year: 2020, params: 175 },
    { name: 'Gopher', org: 'DeepMind', year: 2021, params: 280 },
    { name: 'PaLM', org: 'Google', year: 2022, params: 540 },
    { name: 'Llama 2', org: 'Meta', year: 2023, params: 70 },
    { name: 'Llama 3.1', org: 'Meta', year: 2024, params: 405 }
  ];

  const TOKENS = [
    { name: 'Vague prompt', input: 14, output: 620, rounds: 4 },
    { name: 'Detailed request', input: 48, output: 410, rounds: 2 },
    { name: 'PREP prompt', input: 96, output: 300, rounds: 1 },
    { name: 'Few-shot PREP', input: 170, output: 260, rounds: 1 }
  ];

  const DIMENSIONS = ['Transparency', 'Privacy', 'Fairness', 'Accountability', 'Safety'];
  const TOOLS = [
    { name: 'Study Assistant A', color: 'var(--cyan)', scores: [88, 92, 74, 81, 90] },
    { name: 'Essay Helper B', color: 'var(--violet-text)', scores: [62, 55, 70, 58, 72] },
    { name: 'Research Bot C', color: 'var(--warn)', scores: [79, 68, 85, 90, 76] }
  ];

  const lab = { scale: 'log', metric: 'total', tool: 0, sort: { key: 'avg', dir: -1 } };

  const fmtParams = (b) => (b >= 1 ? `${b}B` : `${b * 1000}M`);
  const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  /* ---- Chart 1: parameter scaling --------------------------------- */
  function scalingChart() {
    const W = 640, H = 300, L = 56, R = 16, T = 20, B = 44;
    const iw = W - L - R, ih = H - T - B;
    const isLog = lab.scale === 'log';
    const max = isLog ? 3 : 600;
    const y = (v) => T + ih - ((isLog ? Math.log10(Math.max(v, 1)) : v) / max) * ih;
    const ticks = isLog ? [1, 10, 100, 1000] : [0, 150, 300, 450, 600];
    const bw = iw / MODELS.length;

    return `
      <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-labelledby="scale-title scale-desc">
        <title id="scale-title">Model parameter counts by year</title>
        <desc id="scale-desc">${MODELS.map((m) => `${m.name} ${m.year}: ${fmtParams(m.params)} parameters`).join('. ')}</desc>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--cyan)" />
            <stop offset="100%" stop-color="var(--violet)" />
          </linearGradient>
        </defs>
        ${ticks.map((t) => `
          <line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="grid-line" />
          <text x="${L - 10}" y="${y(t) + 4}" class="axis-text" text-anchor="end">${t === 0 ? '0' : fmtParams(t)}</text>`).join('')}
        ${MODELS.map((m, i) => {
          const x = L + i * bw + bw * 0.2;
          const top = y(m.params);
          return `
            <g class="bar-g" tabindex="0" role="img" aria-label="${m.name}, ${m.org}, ${m.year}: ${fmtParams(m.params)} parameters" data-tip="${m.name} (${m.org}, ${m.year}): ${fmtParams(m.params)} parameters">
              <rect x="${x}" y="${top}" width="${bw * 0.6}" height="${Math.max(2, T + ih - top)}" rx="6" fill="url(#barGrad)" class="bar-rect" />
              <text x="${x + bw * 0.3}" y="${top - 8}" class="bar-val" text-anchor="middle">${fmtParams(m.params)}</text>
              <text x="${x + bw * 0.3}" y="${H - B + 18}" class="axis-text" text-anchor="middle">${m.name}</text>
              <text x="${x + bw * 0.3}" y="${H - B + 33}" class="axis-text axis-sub" text-anchor="middle">${m.year}</text>
            </g>`;
        }).join('')}
      </svg>`;
  }

  /* ---- Chart 2: token efficiency ---------------------------------- */
  function tokenChart() {
    const W = 640, rowH = 56, L = 150, R = 70, T = 10;
    const H = T + TOKENS.length * rowH + 30;
    const iw = W - L - R;
    const isTotal = lab.metric === 'total';
    const totalOf = (t) => (t.input + t.output) * t.rounds;
    const max = isTotal ? Math.max(...TOKENS.map(totalOf)) : 4;

    return `
      <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-labelledby="tok-title tok-desc">
        <title id="tok-title">${isTotal ? 'Total tokens used to reach a usable answer' : 'Rounds needed to reach a usable answer'}</title>
        <desc id="tok-desc">${TOKENS.map((t) => `${t.name}: ${isTotal ? totalOf(t) + ' tokens' : t.rounds + ' rounds'}`).join('. ')}</desc>
        ${TOKENS.map((t, i) => {
          const yy = T + i * rowH;
          if (isTotal) {
            const inW = (t.input * t.rounds / max) * iw;
            const outW = (t.output * t.rounds / max) * iw;
            return `
              <g class="bar-g" tabindex="0" role="img" aria-label="${t.name}: ${t.input * t.rounds} input and ${t.output * t.rounds} output tokens" data-tip="${t.name}: ${t.input * t.rounds} input + ${t.output * t.rounds} output tokens over ${t.rounds} round(s)">
                <text x="${L - 12}" y="${yy + 26}" class="axis-text axis-strong" text-anchor="end">${t.name}</text>
                <rect x="${L}" y="${yy + 10}" width="${inW}" height="26" rx="5" class="seg-in" />
                <rect x="${L + inW}" y="${yy + 10}" width="${outW}" height="26" rx="5" class="seg-out" />
                <text x="${L + inW + outW + 8}" y="${yy + 28}" class="bar-val">${totalOf(t)}</text>
              </g>`;
          }
          const w = (t.rounds / max) * iw;
          return `
            <g class="bar-g" tabindex="0" role="img" aria-label="${t.name}: ${t.rounds} rounds" data-tip="${t.name}: ${t.rounds} round(s) of back-and-forth">
              <text x="${L - 12}" y="${yy + 26}" class="axis-text axis-strong" text-anchor="end">${t.name}</text>
              <rect x="${L}" y="${yy + 10}" width="${w}" height="26" rx="5" fill="url(#barGrad)" class="bar-rect" />
              <text x="${L + w + 8}" y="${yy + 28}" class="bar-val">${t.rounds}</text>
            </g>`;
        }).join('')}
      </svg>
      ${isTotal ? `<div class="legend"><span><i class="swatch seg-in-swatch"></i>Input tokens</span><span><i class="swatch seg-out-swatch"></i>Output tokens</span></div>` : ''}`;
  }

  /* ---- Chart 3: ethical audit radar ------------------------------- */
  function radarChart() {
    const S = 320, C = S / 2, Rr = 115;
    const pt = (i, v) => {
      const a = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
      return [C + Math.cos(a) * Rr * (v / 100), C + Math.sin(a) * Rr * (v / 100)];
    };
    const poly = (scores) => scores.map((v, i) => pt(i, v).join(',')).join(' ');
    return `
      <svg viewBox="0 0 ${S} ${S}" class="chart radar" role="img" aria-labelledby="radar-title radar-desc">
        <title id="radar-title">Ethical audit scores for ${TOOLS[lab.tool].name}</title>
        <desc id="radar-desc">${DIMENSIONS.map((d, i) => `${d}: ${TOOLS[lab.tool].scores[i]}`).join(', ')}</desc>
        ${[25, 50, 75, 100].map((r) => `<polygon points="${poly(DIMENSIONS.map(() => r))}" class="radar-ring" />`).join('')}
        ${DIMENSIONS.map((d, i) => {
          const [x, y] = pt(i, 100);
          const [lx, ly] = pt(i, 122);
          return `<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" class="radar-axis" />
            <text x="${lx}" y="${ly + 4}" class="axis-text axis-strong" text-anchor="middle">${d}</text>`;
        }).join('')}
        ${TOOLS.map((t, i) => i === lab.tool ? '' : `<polygon points="${poly(t.scores)}" class="radar-ghost" />`).join('')}
        <polygon points="${poly(TOOLS[lab.tool].scores)}" class="radar-shape" style="--shape:${TOOLS[lab.tool].color}" />
        ${TOOLS[lab.tool].scores.map((v, i) => { const [x, y] = pt(i, v); return `<circle cx="${x}" cy="${y}" r="4.5" class="radar-dot" style="--shape:${TOOLS[lab.tool].color}" />`; }).join('')}
      </svg>`;
  }

  function auditTable() {
    const rows = TOOLS.map((t, i) => ({ i, name: t.name, avg: avg(t.scores), ...Object.fromEntries(DIMENSIONS.map((d, j) => [d, t.scores[j]])) }));
    const { key, dir } = lab.sort;
    rows.sort((a, b) => (typeof a[key] === 'string' ? a[key].localeCompare(b[key]) : a[key] - b[key]) * dir);
    const cols = [['name', 'Tool'], ...DIMENSIONS.map((d) => [d, d]), ['avg', 'Overall']];
    const grade = (v) => (v >= 85 ? 'is-high' : v >= 70 ? 'is-mid' : 'is-low');
    return `
      <div class="table-wrap">
        <table class="data-table">
          <caption class="sr-only">Ethical audit compliance scores. Select a column header to sort.</caption>
          <thead><tr>${cols.map(([k, label]) => `
            <th scope="col" aria-sort="${key === k ? (dir === 1 ? 'ascending' : 'descending') : 'none'}">
              <button class="th-btn" data-sort="${k}">${label} ${icon(key === k ? (dir === 1 ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down', 'th-icon')}</button>
            </th>`).join('')}</tr></thead>
          <tbody>${rows.map((r) => `
            <tr class="${r.i === lab.tool ? 'is-active' : ''}">
              <th scope="row"><button class="row-btn" data-tool="${r.i}">${esc(r.name)}</button></th>
              ${DIMENSIONS.map((d) => `<td><span class="score-cell ${grade(r[d])}">${r[d]}</span></td>`).join('')}
              <td><strong class="score-cell ${grade(r.avg)}">${r.avg}</strong></td>
            </tr>`).join('')}</tbody>
        </table>
      </div>`;
  }

  function modelTable() {
    return `
      <div class="table-wrap">
        <table class="data-table">
          <caption class="sr-only">Publicly reported model parameter counts</caption>
          <thead><tr><th scope="col">Model</th><th scope="col">Developer</th><th scope="col">Year</th><th scope="col">Parameters</th><th scope="col">vs. GPT-2</th></tr></thead>
          <tbody>${MODELS.map((m) => `<tr><th scope="row">${m.name}</th><td>${m.org}</td><td>${m.year}</td><td>${fmtParams(m.params)}</td><td>${Math.round(m.params / 1.5)}x</td></tr>`).join('')}</tbody>
        </table>
      </div>`;
  }

  function render() {
    return `
      <header class="page-head">
        <p class="eyebrow">${icon('activity')} Data Lab</p>
        <h1 class="page-title">Explore AI <span class="grad-text">by the numbers</span></h1>
        <p class="lead" data-simplify>Read real data and illustrative benchmarks the way a researcher would. Hover, focus, toggle, and sort every chart to uncover the story behind the numbers.</p>
      </header>

      <section class="card lab-card" data-chart="scaling">
        <div class="section-head">
          <div>
            <h2 class="card-title">${icon('trending-up')} AI parameter scaling</h2>
            <p class="muted small">Publicly reported parameter counts, in billions.</p>
          </div>
          <div class="seg" role="group" aria-label="Y-axis scale">
            <button class="seg-btn ${lab.scale === 'log' ? 'is-active' : ''}" data-scale="log" aria-pressed="${lab.scale === 'log'}">Log scale</button>
            <button class="seg-btn ${lab.scale === 'linear' ? 'is-active' : ''}" data-scale="linear" aria-pressed="${lab.scale === 'linear'}">Linear scale</button>
          </div>
        </div>
        <div class="chart-wrap" data-tipzone>${scalingChart()}<div class="chart-tip" role="status" aria-live="polite" data-tip-out></div></div>
        <p class="insight" data-simplify>${lab.scale === 'log'
          ? 'On a log scale, each gridline is ten times larger than the one below it. This reveals that model size grew over 100 times in a single year from 2019 to 2020.'
          : 'On a linear scale, GPT-2 nearly disappears. Notice that newer models like Llama 2 are smaller than older ones, because better training data and methods can beat raw size.'}</p>
        <details class="table-toggle"><summary>${icon('table')} View data table</summary>${modelTable()}</details>
      </section>

      <div class="two-col">
        <section class="card lab-card" data-chart="tokens">
          <div class="section-head">
            <div>
              <h2 class="card-title">${icon('coins')} Token efficiency benchmark</h2>
              <p class="muted small">Illustrative classroom benchmark: generating a 5-question quiz.</p>
            </div>
          </div>
          <div class="seg" role="group" aria-label="Metric">
            <button class="seg-btn ${lab.metric === 'total' ? 'is-active' : ''}" data-metric="total" aria-pressed="${lab.metric === 'total'}">Total tokens</button>
            <button class="seg-btn ${lab.metric === 'rounds' ? 'is-active' : ''}" data-metric="rounds" aria-pressed="${lab.metric === 'rounds'}">Rounds</button>
          </div>
          <div class="chart-wrap" data-tipzone>${tokenChart()}<div class="chart-tip" role="status" aria-live="polite" data-tip-out></div></div>
          <p class="insight" data-simplify>A longer, well-structured prompt costs more input tokens but usually saves far more output tokens and revisions overall.</p>
        </section>

        <section class="card lab-card" data-chart="audit">
          <div class="section-head">
            <div>
              <h2 class="card-title">${icon('shield-check')} Ethical audit compliance</h2>
              <p class="muted small">Illustrative scores for three hypothetical school AI tools.</p>
            </div>
          </div>
          <div class="seg seg-wrap" role="group" aria-label="Select tool">
            ${TOOLS.map((t, i) => `<button class="seg-btn ${lab.tool === i ? 'is-active' : ''}" data-tool="${i}" aria-pressed="${lab.tool === i}"><i class="swatch" style="background:${t.color}"></i>${t.name}</button>`).join('')}
          </div>
          <div class="radar-wrap">${radarChart()}</div>
          <p class="insight" data-simplify>${esc(TOOLS[lab.tool].name)} averages ${avg(TOOLS[lab.tool].scores)} out of 100. Its weakest area is ${DIMENSIONS[TOOLS[lab.tool].scores.indexOf(Math.min(...TOOLS[lab.tool].scores))]}.</p>
        </section>
      </div>

      <section class="card lab-card" data-chart="audit-table">
        <div class="section-head">
          <div>
            <h2 class="card-title">${icon('table')} Audit scorecard</h2>
            <p class="muted small">Select a column to sort, or a tool name to view it on the radar chart.</p>
          </div>
        </div>
        ${auditTable()}
      </section>`;
  }

  function mount(root) {
    const rerender = (chartId) => {
      const y = window.scrollY;
      root.innerHTML = render();
      mount(root);
      NP.ui.hydrate(root);
      window.scrollTo(0, y);
      if (chartId) NP.store.trackDataLab(chartId);
    };

    root.querySelectorAll('[data-scale]').forEach((b) => b.addEventListener('click', () => { lab.scale = b.dataset.scale; rerender('scaling'); }));
    root.querySelectorAll('[data-metric]').forEach((b) => b.addEventListener('click', () => { lab.metric = b.dataset.metric; rerender('tokens'); }));
    root.querySelectorAll('[data-tool]').forEach((b) => b.addEventListener('click', () => { lab.tool = Number(b.dataset.tool); rerender('audit'); }));
    root.querySelectorAll('[data-sort]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.sort;
      lab.sort = { key: k, dir: lab.sort.key === k ? -lab.sort.dir : -1 };
      rerender('audit');
    }));

    root.querySelectorAll('[data-tipzone]').forEach((zone) => {
      const out = zone.querySelector('[data-tip-out]');
      const chartId = zone.closest('[data-chart]').dataset.chart;
      const show = (e) => {
        const g = e.target.closest('[data-tip]');
        if (!g) return;
        out.textContent = g.dataset.tip;
        out.classList.add('is-on');
        NP.store.trackDataLab(chartId);
      };
      zone.addEventListener('mouseover', show);
      zone.addEventListener('focusin', show);
      zone.addEventListener('mouseleave', () => out.classList.remove('is-on'));
      zone.addEventListener('focusout', () => out.classList.remove('is-on'));
    });
  }

  NP.views = NP.views || {};
  NP.views.datalab = { title: 'Data Lab', render, mount };
})(window.NP = window.NP || {});
