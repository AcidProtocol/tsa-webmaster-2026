# NeuralPath: AI Learning Portal (TSA Webmaster)

An interactive AI learning portal for grades 9-12. Learn the concepts, try practical tools, and practice ethical AI use, while earning XP and badges.

## Folder structure

```
tsa-ai-portal/
├── index.html              # Student dashboard (home)
├── pages/
│   ├── concepts.html       # Module 1: Fundamental AI Concepts   (TODO)
│   ├── tools.html          # Module 2: Practical AI Tools        (TODO)
│   ├── ethics.html         # Module 3: Ethical AI Usage          (TODO)
│   ├── badges.html         # Full achievements gallery           (TODO)
│   └── about.html          # Team, sources, accessibility notes  (TODO)
├── css/
│   └── styles.css          # Design tokens, layout, components, dark/light
├── js/
│   ├── store.js            # Module/badge data + XP, progress, badge logic (localStorage)
│   └── app.js              # Dashboard rendering + theme toggle
├── assets/
│   ├── images/             # Logo, illustrations (original or properly licensed)
│   └── icons/              # Favicon, badge art
├── docs/
│   └── portfolio-outline.md  # TSA documentation checklist
└── README.md
```

## Run it

Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Design decisions

- **No build step.** Plain HTML/CSS/JS so judges can open it anywhere.
- **Design tokens** (CSS variables) drive both themes; the theme follows the OS setting and can be toggled and saved.
- **Single source of truth.** All modules and badges are defined in `js/store.js`; pages only render that data.
- **Progress saved in `localStorage`.** No accounts or personal data collected.
- **Accessibility.** Semantic landmarks, visible focus states, `aria` on progress bars, reduced-motion support.
