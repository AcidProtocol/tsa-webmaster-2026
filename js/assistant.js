/* NeuralPath: assistant.js
   NeuralPath AI Assistant drawer. Answers come from a curated, on-device knowledge base
   that matches questions to vetted guidance, so responses never hallucinate and no chat
   data leaves the student's browser. */
(function (NP) {
  'use strict';

  const { icon, esc } = NP.ui;

  const KB = [
    {
      keys: ['prep', 'prompt', 'better prompt', 'write a prompt', 'prompting'],
      answer: 'Use the PREP framework. Persona: who the AI should act as. Request: a clear action verb like explain, compare, or quiz me. Examples: show a sample of what you want. Parameters: length, format, and what to avoid. Example: "Act as a history tutor. Quiz me with 5 questions on the French Revolution, one at a time, and do not reveal answers until I respond."',
      link: { label: 'Open the PREP lesson', lesson: 'prep-framework' }
    },
    {
      keys: ['hallucinat', 'made up', 'fake', 'wrong answer', 'true', 'verify', 'fact check', 'fact-check'],
      answer: 'A hallucination is a confident answer that is false. To check: 1) find the claim in a reliable source you can open and read, 2) search for any citation title in Google Scholar or your library database, 3) be extra skeptical of exact numbers, quotes, and dates. If you cannot verify it, do not use it.',
      link: { label: 'Practice in the Workshop', route: 'workshop' }
    },
    {
      keys: ['cite', 'citation', 'apa', 'mla', 'reference', 'works cited'],
      answer: 'APA: OpenAI. (2024). ChatGPT (May 13 version) [Large language model]. https://chat.openai.com. MLA: "Your prompt here" prompt. ChatGPT, 13 May version, OpenAI, 20 May 2024, chat.openai.com. Also add a short disclosure describing how you used the tool, and save a copy of the conversation.',
      link: { label: 'Open the citation lesson', lesson: 'disclosure-citation' }
    },
    {
      keys: ['cheat', 'integrity', 'allowed', 'plagiar', 'teacher', 'policy', 'rules'],
      answer: 'Use the learning test: if your teacher watched how you used AI, would they agree you still learned what the assignment was designed to teach? Brainstorming and practice quizzes are usually fine. Submitting AI-written work as your own is not. When unsure, ask your teacher first and keep your drafts.',
      link: { label: 'Open Academic Integrity', lesson: 'academic-integrity' }
    },
    {
      keys: ['bias', 'fair', 'discriminat', 'stereotyp'],
      answer: 'Algorithmic bias happens when AI is consistently unfair to certain groups, usually because the training data left them out or reflected past discrimination. Watch for stereotypes in AI outputs, test prompts with different names or groups, and never let AI make high-stakes decisions about people without human review.',
      link: { label: 'Open Algorithmic Bias', lesson: 'algorithmic-bias' }
    },
    {
      keys: ['privacy', 'data', 'personal', 'safe', 'password', 'share'],
      answer: 'Treat every AI chat as if a stranger could read it. Never share passwords, addresses, phone numbers, medical details, or other people\u2019s private information. Look for a setting that turns off chat history or training, and prefer school-approved tools.',
      link: { label: 'Open Data Privacy', lesson: 'data-privacy' }
    },
    {
      keys: ['study', 'exam', 'test', 'learn', 'memor', 'homework', 'tips'],
      answer: 'Three proven study moves with AI: 1) Retrieval practice: ask it to quiz you one question at a time without showing answers. 2) Explain it back: teach the concept to the AI and ask it to find gaps. 3) Spaced review: ask for a 5-day review schedule for your notes. Always study from your own class materials first.'
    },
    {
      keys: ['temperature', 'random', 'creative'],
      answer: 'Temperature controls randomness. Low temperature (near 0) makes the model pick the most likely next word, giving focused, consistent answers. High temperature spreads probability across more words, giving more creative but less reliable text.',
      link: { label: 'Try the temperature simulator', route: 'workshop' }
    },
    {
      keys: ['token', 'context window', 'context', 'memory', 'forget'],
      answer: 'Models read text as tokens, roughly three quarters of a word each. The context window is how many tokens the model can consider at once. In very long chats, early instructions can fall out of the window, so start a new chat and restate key instructions if answers drift.',
      link: { label: 'Open Context Windows', lesson: 'context-windows' }
    },
    {
      keys: ['neural', 'network', 'weights', 'deep learning', 'how does ai work', 'how ai works'],
      answer: 'A neural network is layers of simple math units. Each one multiplies inputs by weights, adds them, and passes the result on. During training, backpropagation nudges the weights to reduce mistakes. Repeat millions of times and the network learns useful patterns.',
      link: { label: 'Open Neural Networks', lesson: 'neural-networks' }
    },
    {
      keys: ['agent', 'autonomous', 'agentic'],
      answer: 'An AI agent pursues a goal by looping: observe, plan, act with a tool, then review the result. Agents are great for multi-step tasks, but small errors can compound, so high-stakes actions should always require a human checkpoint.',
      link: { label: 'Open Agentic Workflows', lesson: 'agentic-workflows' }
    },
    {
      keys: ['research', 'notebooklm', 'consensus', 'sources', 'essay'],
      answer: 'Try a grounded workflow: find sources with Consensus (peer-reviewed papers) or your library database, upload your readings to NotebookLM so answers link to exact passages, then read the originals yourself and cite them directly, not the chatbot.',
      link: { label: 'Open Research Workflows', lesson: 'research-workflows' }
    },
    {
      keys: ['xp', 'level', 'badge', 'points', 'triad', 'boss', 'game'],
      answer: `You earn ${NP.XP.LESSON} XP per lesson, a ${NP.XP.MODULE_BONUS} XP bonus for finishing a module, ${NP.XP.DAILY} XP for the Daily Warm-Up, and ${NP.XP.WORKSHOP_PART} XP per workshop part. You level up every ${NP.XP.LEVEL_SIZE} XP. Every ${NP.XP.TRIAD_EVERY} lessons unlocks a Triad Boss Battle worth ${NP.XP.TRIAD_WIN} XP and a legendary badge.`,
      link: { label: 'View badges', route: 'badges' }
    },
    {
      keys: ['scam', 'phishing', 'deepfake', 'security', 'hack', 'cyber'],
      answer: 'AI makes scams more convincing. Red flags: urgency, secrecy, and requests for money or passwords. Use multi-factor authentication and a password manager, verify surprising requests through a second channel, and set up a family code word to beat voice-clone scams.',
      link: { label: 'Open Cybersecurity', lesson: 'cybersecurity' }
    },
    {
      keys: ['hello', 'hi', 'hey', 'help', 'what can you do'],
      answer: 'Hi! I can help with writing better prompts, checking AI answers, citing AI in APA or MLA, study strategies, AI ethics, and how XP and badges work here. Try one of the suggestions below.'
    }
  ];

  const SUGGESTIONS = ['How do I write a better prompt?', 'How do I cite ChatGPT in APA?', 'How can I spot a hallucination?', 'Study tips with AI'];

  function match(question) {
    const q = question.toLowerCase();
    let best = null;
    let bestScore = 0;
    KB.forEach((entry) => {
      const score = entry.keys.reduce((sum, k) => sum + (q.includes(k) ? k.length : 0), 0);
      if (score > bestScore) { best = entry; bestScore = score; }
    });
    return best || {
      answer: 'I do not have a vetted answer for that yet, and I would rather tell you that than guess. Try asking about prompts, hallucinations, citations, study tips, privacy, bias, or AI agents. For anything else, check with your teacher or librarian.'
    };
  }

  let drawer, log, input, fab;

  function addMessage(role, html) {
    const el = document.createElement('div');
    el.className = `msg msg-${role}`;
    el.innerHTML = role === 'bot'
      ? `<span class="msg-avatar" aria-hidden="true">${icon('bot')}</span><div class="msg-bubble">${html}</div>`
      : `<div class="msg-bubble">${html}</div>`;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    NP.ui.refreshIcons();
    return el;
  }

  function ask(question) {
    const text = question.trim();
    if (!text) return;
    addMessage('user', esc(text));
    NP.store.trackAssistant();
    const typing = addMessage('bot', '<span class="typing" aria-label="Assistant is typing"><span></span><span></span><span></span></span>');
    const entry = match(text);
    setTimeout(() => {
      const link = entry.link
        ? `<button class="msg-link" data-${entry.link.lesson ? 'lesson' : 'route'}="${entry.link.lesson || entry.link.route}">${esc(entry.link.label)} ${icon('arrow-right')}</button>`
        : '';
      typing.querySelector('.msg-bubble').innerHTML = `<p>${esc(entry.answer)}</p>${link}`;
      log.scrollTop = log.scrollHeight;
      NP.ui.refreshIcons();
    }, 650);
  }

  function setOpen(open) {
    drawer.hidden = !open;
    drawer.classList.toggle('is-open', open);
    fab.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => input.focus(), 50);
  }

  NP.assistant = {
    init() {
      drawer = document.getElementById('assistant');
      fab = document.getElementById('assistant-fab');
      log = drawer.querySelector('[data-log]');
      input = drawer.querySelector('[data-input]');
      const form = drawer.querySelector('[data-form]');

      drawer.querySelector('[data-chips]').innerHTML = SUGGESTIONS.map((s) =>
        `<button class="chip" type="button" data-suggest="${esc(s)}">${esc(s)}</button>`).join('');

      addMessage('bot', '<p>Hi, I am the NeuralPath AI Assistant. Ask me about prompts, AI ethics, citations, or study strategies.</p>');

      fab.addEventListener('click', () => setOpen(drawer.hidden));
      drawer.querySelector('[data-close]').addEventListener('click', () => { setOpen(false); fab.focus(); });
      drawer.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setOpen(false); fab.focus(); } });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.nativeEvent?.isComposing || e.isComposing || e.keyCode === 229)) e.preventDefault();
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        ask(input.value);
        input.value = '';
      });

      drawer.addEventListener('click', (e) => {
        const suggest = e.target.closest('[data-suggest]');
        if (suggest) return ask(suggest.dataset.suggest);
        const lesson = e.target.closest('[data-lesson]');
        if (lesson) return NP.lesson.open(lesson.dataset.lesson);
        const route = e.target.closest('[data-route]');
        if (route) { location.hash = `#/${route.dataset.route}`; setOpen(false); }
      });
    },
    open: () => setOpen(true)
  };
})(window.NP = window.NP || {});
