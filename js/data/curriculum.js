/* NeuralPath: data/curriculum.js
   All module and lesson content. Views only render this data.
   Lesson text is plain strings so the Plain Language mode can rewrite it. */
(function (NP) {
  'use strict';

  NP.MODULES = [
    {
      id: 'foundations',
      title: 'AI Foundations',
      tagline: 'What AI is, how machines learn from data, and what neural networks actually do.',
      icon: 'brain',
      accent: 'cyan',
      lessons: [
        {
          id: 'what-is-ai',
          title: 'What is AI & Data',
          minutes: 6,
          intro: 'Artificial intelligence is software that performs tasks we usually associate with human thinking, such as recognizing images, understanding language, or making predictions. Every modern AI system is built on one ingredient above all others: data.',
          sections: [
            {
              h: 'AI is a pattern finder, not a mind',
              p: 'Most AI you use today is narrow AI. It is very good at one kind of task, like predicting the next word in a sentence or spotting a stop sign in a photo. It does not understand the world the way you do. It finds statistical patterns in examples and applies those patterns to new inputs.'
            },
            {
              h: 'Data is the raw material',
              p: 'Data is any recorded information: text, images, audio, clicks, sensor readings, or spreadsheets. Structured data fits neatly into rows and columns. Unstructured data, like essays or videos, does not. Large language models are trained mostly on unstructured text gathered from books, websites, and code.'
            },
            {
              h: 'Garbage in, garbage out',
              p: 'An AI model can only be as good as the data it learns from. If the data is incomplete, outdated, or unbalanced, the model will repeat those problems. This is why data quality is one of the most important topics in all of AI.'
            }
          ],
          callout: {
            title: 'Real-world example',
            body: 'Your phone keyboard suggests the next word by learning from millions of typed sentences. It has never read your mind; it has only seen which words usually follow others.'
          },
          takeaways: [
            'Today\u2019s AI is narrow: it excels at specific pattern-based tasks.',
            'Data is the foundation every AI model is built on.',
            'Poor-quality data produces poor-quality AI.'
          ],
          check: {
            q: 'Which statement best describes how most modern AI works?',
            options: [
              'It understands the world the same way people do.',
              'It finds statistical patterns in data and applies them to new inputs.',
              'It searches the internet live for every answer.',
              'It follows a fixed list of rules written by hand for every situation.'
            ],
            answer: 1,
            explain: 'Modern AI learns patterns from training data, then uses those patterns to respond to new inputs.'
          }
        },
        {
          id: 'ml-mechanics',
          title: 'Machine Learning Mechanics',
          minutes: 7,
          intro: 'Machine learning is the branch of AI where computers learn rules from examples instead of being programmed with every rule by hand.',
          sections: [
            {
              h: 'Three ways machines learn',
              p: 'In supervised learning, the model trains on labeled examples, such as emails marked spam or not spam. In unsupervised learning, the model finds groups or structure in unlabeled data, such as clustering songs by sound. In reinforcement learning, the model learns by trial and error, earning rewards for good actions, like an AI learning to play a game.'
            },
            {
              h: 'Features, labels, and predictions',
              p: 'Features are the inputs the model looks at, such as square footage and number of bedrooms for a house. The label is the answer we want, such as the sale price. During training, the model adjusts itself to make its predictions closer to the real labels.'
            },
            {
              h: 'Measuring the error',
              p: 'A loss function scores how wrong the model is. Training is the process of lowering that score step by step. A model that memorizes its training data but fails on new data is overfitting, which is like memorizing answers to a practice test without learning the subject.'
            }
          ],
          callout: {
            title: 'Try it mentally',
            body: 'If you wanted to predict whether it will rain tomorrow, what features would you collect? Humidity, air pressure, cloud cover, and today\u2019s weather are all strong candidates.'
          },
          takeaways: [
            'Supervised, unsupervised, and reinforcement learning are the three main approaches.',
            'Features go in; predictions come out; labels are the correct answers.',
            'Overfitting means a model memorized instead of generalizing.'
          ],
          check: {
            q: 'A model scores 99% on its training data but only 55% on new data. What is most likely happening?',
            options: ['Underfitting', 'Overfitting', 'Reinforcement learning', 'Perfect generalization'],
            answer: 1,
            explain: 'Overfitting is when a model memorizes training examples and fails to generalize to new data.'
          }
        },
        {
          id: 'neural-networks',
          title: 'Neural Networks in Plain Language',
          minutes: 7,
          intro: 'A neural network is a stack of simple math units, loosely inspired by brain cells, that work together to turn inputs into useful outputs.',
          sections: [
            {
              h: 'Neurons, weights, and layers',
              p: 'Each artificial neuron takes in numbers, multiplies each one by a weight that shows how important it is, adds them up, and passes the result forward. Neurons are arranged in layers: an input layer, one or more hidden layers, and an output layer.'
            },
            {
              h: 'Learning by adjusting weights',
              p: 'When the network makes a mistake, a method called backpropagation figures out how much each weight contributed to the error. The weights are then nudged a tiny amount in the direction that reduces the error. Repeat this millions of times and the network becomes accurate.'
            },
            {
              h: 'Why deep networks are powerful',
              p: 'Deep learning simply means using many hidden layers. Early layers learn simple features, like edges in an image. Later layers combine them into complex features, like eyes, faces, or whole objects. Language models use a design called the transformer, which lets every word pay attention to every other word.'
            }
          ],
          callout: {
            title: 'Analogy',
            body: 'Think of a neural network as a huge sound mixing board with billions of sliders. Training is the process of finding the slider positions that produce the right sound for every song.'
          },
          takeaways: [
            'Neurons multiply inputs by weights and pass results forward.',
            'Backpropagation adjusts weights to reduce error.',
            'Deep networks build complex ideas from simple features.'
          ],
          check: {
            q: 'What does a neural network actually change while it learns?',
            options: ['Its input data', 'Its weights', 'Its number of users', 'The labels in the dataset'],
            answer: 1,
            explain: 'Learning means adjusting the weights so the network\u2019s outputs get closer to the correct answers.'
          }
        },
        {
          id: 'training-inference',
          title: 'Training vs. Inference',
          minutes: 5,
          intro: 'Every AI model lives two very different lives: the expensive training phase where it learns, and the inference phase where it answers your questions.',
          sections: [
            {
              h: 'Training: the learning phase',
              p: 'Training a large model can take weeks or months on thousands of specialized chips and costs millions of dollars in computing power and electricity. During training, the model\u2019s weights change constantly.'
            },
            {
              h: 'Inference: the using phase',
              p: 'Inference is when a finished model receives your input and produces an output. The weights are frozen; the model is not learning from you in that moment. Each response takes a fraction of a second to a few seconds.'
            },
            {
              h: 'The knowledge cutoff',
              p: 'Because training happens on data collected up to a certain date, a model has a knowledge cutoff. It may not know about recent events unless the tool is connected to search or you provide the information yourself.'
            }
          ],
          callout: {
            title: 'Why it matters for you',
            body: 'If a chatbot gives an answer about a recent event, check whether it actually searched the web. If not, it may be guessing based on old data.'
          },
          takeaways: [
            'Training is slow, costly, and changes the model\u2019s weights.',
            'Inference is fast and uses frozen weights.',
            'Models have a knowledge cutoff tied to their training data.'
          ],
          check: {
            q: 'During inference, what happens to the model\u2019s weights?',
            options: ['They are rewritten for each user', 'They stay frozen', 'They are deleted', 'They double in size'],
            answer: 1,
            explain: 'Inference uses a finished model, so its weights are frozen while it generates a response.'
          }
        },
        {
          id: 'model-limitations',
          title: 'Model Limitations',
          minutes: 6,
          intro: 'AI tools are impressive, but knowing where they fail is what separates a skilled user from a careless one.',
          sections: [
            {
              h: 'Hallucinations',
              p: 'A hallucination is when an AI confidently produces information that is false, such as a fake quote, an invented statistic, or a research paper that does not exist. This happens because language models generate likely-sounding text, not verified facts.'
            },
            {
              h: 'No true reasoning guarantee',
              p: 'Models can make simple math errors, contradict themselves, or follow a convincing but wrong chain of logic. They can also be overly agreeable, changing a correct answer just because you pushed back.'
            },
            {
              h: 'Bias and blind spots',
              p: 'Models reflect the data they were trained on. Topics, languages, and communities that are underrepresented in that data will be handled less accurately. Always cross-check important claims with trusted primary sources.'
            }
          ],
          callout: {
            title: 'The verification habit',
            body: 'Before using an AI fact in schoolwork, find it in at least one reliable source you can cite directly. If you cannot find it, do not use it.'
          },
          takeaways: [
            'Hallucinations are confident but false outputs.',
            'AI reasoning and math can fail without warning.',
            'Verify important claims with trustworthy sources.'
          ],
          check: {
            q: 'An AI cites a journal article you cannot find anywhere online. What is the best next step?',
            options: [
              'Cite it anyway because the AI sounded confident.',
              'Treat it as a likely hallucination and find a real source.',
              'Ask the AI to promise the article is real.',
              'Change the title slightly and cite it.'
            ],
            answer: 1,
            explain: 'Fabricated citations are a classic hallucination. Only cite sources you have personally located and read.'
          }
        }
      ]
    },
    {
      id: 'prompting',
      title: 'Practical Prompt Engineering',
      tagline: 'Write prompts that get useful results and build research workflows you can trust.',
      icon: 'sparkles',
      accent: 'violet',
      lessons: [
        {
          id: 'prep-framework',
          title: 'Writing Effective Prompts (PREP)',
          minutes: 7,
          intro: 'A vague prompt gets a vague answer. The PREP framework gives you a simple checklist for writing prompts that produce focused, useful results.',
          sections: [
            {
              h: 'P: Persona',
              p: 'Tell the AI who to act as. For example: act as a patient chemistry tutor for a tenth grader. A persona sets the tone, vocabulary, and level of detail.'
            },
            {
              h: 'R: Request',
              p: 'State exactly what you want, using a clear action verb. Explain, compare, quiz me, outline, or give feedback are far more useful than help me with chemistry.'
            },
            {
              h: 'E: Examples',
              p: 'Show the AI what good output looks like. Paste a sample question, a format you like, or one worked example. This technique is called few-shot prompting and it dramatically improves consistency.'
            },
            {
              h: 'P: Parameters',
              p: 'Set the limits: length, format, reading level, and what to avoid. For example: use five bullet points, no more than 150 words, and do not give me the final answers.'
            }
          ],
          callout: {
            title: 'Before and after',
            body: 'Weak: Help me study the cell. Strong: Act as a biology tutor. Quiz me with five multiple-choice questions on cell organelles, like the example below. Wait for my answer before revealing the next question.'
          },
          takeaways: [
            'Persona sets the voice and expertise level.',
            'Request uses a specific action verb.',
            'Examples and Parameters shape format and limits.'
          ],
          check: {
            q: 'Which part of PREP is "Keep it under 100 words and use bullet points"?',
            options: ['Persona', 'Request', 'Examples', 'Parameters'],
            answer: 3,
            explain: 'Parameters set constraints like length, format, and reading level.'
          }
        },
        {
          id: 'context-windows',
          title: 'Context Windows & System Prompts',
          minutes: 6,
          intro: 'An AI model does not remember you the way a friend does. Everything it knows about your conversation must fit inside its context window.',
          sections: [
            {
              h: 'Tokens and the context window',
              p: 'Models read text in chunks called tokens. A token is often part of a word; in English, one token is roughly three quarters of a word. The context window is the maximum number of tokens the model can consider at once, including your messages, its replies, and any files you attach.'
            },
            {
              h: 'When the window fills up',
              p: 'In very long chats, older messages may be trimmed or summarized, and the model can lose track of early instructions. If answers start drifting, start a fresh chat and restate your key instructions.'
            },
            {
              h: 'System prompts',
              p: 'A system prompt is a hidden set of instructions, written by the app developer, that shapes how the model behaves before you type anything. Many tools let you set your own custom instructions, which act like a personal system prompt.'
            }
          ],
          callout: {
            title: 'Pro tip',
            body: 'Put your most important instruction at the start and repeat it at the end of a long prompt. Models pay the most attention to the beginning and end of their context.'
          },
          takeaways: [
            'Tokens are chunks of text; the context window is the token limit.',
            'Long chats can push early instructions out of memory.',
            'System prompts and custom instructions shape every reply.'
          ],
          check: {
            q: 'Roughly how many English words fit in 1,000 tokens?',
            options: ['About 75 words', 'About 750 words', 'About 7,500 words', 'Exactly 1,000 words'],
            answer: 1,
            explain: 'One token is roughly three quarters of an English word, so 1,000 tokens is about 750 words.'
          }
        },
        {
          id: 'research-workflows',
          title: 'Advanced Research Workflows',
          minutes: 8,
          intro: 'General chatbots are not search engines. Specialized research tools ground their answers in real sources, which makes them far more useful for schoolwork.',
          sections: [
            {
              h: 'NotebookLM: grounded in your sources',
              p: 'Google NotebookLM answers questions using only the documents you upload, such as class notes, articles, or PDFs. Every answer links back to the exact passage it came from, so you can verify it in seconds.'
            },
            {
              h: 'Consensus: searching peer-reviewed research',
              p: 'Consensus is an AI search engine that looks through published, peer-reviewed scientific papers. It summarizes what studies found and links to each paper, which is ideal for science fair projects and research essays.'
            },
            {
              h: 'A trustworthy workflow',
              p: 'First, find sources with a research tool or your library database. Second, read the original sources yourself. Third, use AI to help organize notes or generate questions. Fourth, write in your own words and cite the original sources, not the chatbot.'
            }
          ],
          callout: {
            title: 'Remember',
            body: 'Even grounded tools can misread a source. The link to the original passage is there so you can check it. Use it.'
          },
          takeaways: [
            'NotebookLM answers from documents you provide, with citations.',
            'Consensus searches peer-reviewed research papers.',
            'Always read and cite the original source yourself.'
          ],
          check: {
            q: 'What makes NotebookLM different from a general chatbot?',
            options: [
              'It never makes mistakes.',
              'It answers based on the sources you upload and links to them.',
              'It writes your essay for you.',
              'It only works offline.'
            ],
            answer: 1,
            explain: 'NotebookLM grounds its responses in your uploaded documents and shows where each answer came from.'
          }
        },
        {
          id: 'coding-creative',
          title: 'Coding & Creative Assistants',
          minutes: 6,
          intro: 'AI can be a powerful partner for writing code and exploring creative ideas, as long as you stay the author and the decision maker.',
          sections: [
            {
              h: 'Coding assistants',
              p: 'Tools like GitHub Copilot suggest code as you type, explain error messages, and help you understand unfamiliar code. Use them to learn: ask why a fix works, not just for the fix. Always test AI-written code, because it can contain bugs or security flaws.'
            },
            {
              h: 'Creative assistants',
              p: 'Image, music, and writing tools can help you brainstorm, create mood boards, or explore different styles. They work best as a starting point. Your own choices, edits, and voice are what make the work yours.'
            },
            {
              h: 'Know your class rules',
              p: 'Some assignments allow AI brainstorming but not AI drafting. Others ban AI entirely. When in doubt, ask your teacher before you start, and keep notes about how you used each tool.'
            }
          ],
          callout: {
            title: 'Learning prompt',
            body: 'Here is my code and the error it shows. Do not rewrite it. Explain what the error means and give me a hint about where to look.'
          },
          takeaways: [
            'Use coding assistants to understand, not just to copy.',
            'Test every piece of AI-generated code.',
            'Creative AI is a starting point; your choices make the work original.'
          ],
          check: {
            q: 'What is the best way to use a coding assistant while learning to program?',
            options: [
              'Paste every assignment and submit the result.',
              'Ask it to explain errors and give hints, then fix the code yourself.',
              'Never test the code it writes.',
              'Use it only to rename variables.'
            ],
            answer: 1,
            explain: 'Asking for explanations and hints keeps you learning while still getting help.'
          }
        }
      ]
    },
    {
      id: 'ethics',
      title: 'Ethics, Bias & Attribution',
      tagline: 'Keep your work honest and fair: integrity, privacy, bias, and giving proper credit.',
      icon: 'scale',
      accent: 'cyan',
      lessons: [
        {
          id: 'academic-integrity',
          title: 'Academic Integrity & Boundaries',
          minutes: 6,
          intro: 'Academic integrity means the work you submit honestly represents your own learning. AI does not change that principle; it just creates new ways to keep or break it.',
          sections: [
            {
              h: 'The spectrum of AI use',
              p: 'AI use ranges from clearly fine, like checking spelling or generating practice questions, to clearly not fine, like submitting an AI-written essay as your own. In the middle are gray areas, such as AI-generated outlines, that depend on your teacher\u2019s policy.'
            },
            {
              h: 'The learning test',
              p: 'Ask yourself: if my teacher watched how I used this tool, would they agree I still learned what the assignment was designed to teach? If the answer is no, you have crossed a boundary.'
            },
            {
              h: 'Detectors are not perfect',
              p: 'AI detection tools often produce false positives, especially for students writing in a second language. Keep drafts, notes, and version history to show your process. This protects you and demonstrates honest work.'
            }
          ],
          callout: {
            title: 'Simple rule',
            body: 'Use AI to help you think, not to think for you.'
          },
          takeaways: [
            'Integrity means your work reflects your own learning.',
            'Gray areas depend on each teacher\u2019s policy.',
            'Save drafts and version history to document your process.'
          ],
          check: {
            q: 'Which use of AI is most clearly an academic integrity violation?',
            options: [
              'Generating practice quiz questions to study',
              'Submitting an AI-written essay as your own work',
              'Asking AI to explain a confusing concept',
              'Checking your grammar after writing'
            ],
            answer: 1,
            explain: 'Presenting AI-generated work as your own misrepresents your learning.'
          }
        },
        {
          id: 'data-privacy',
          title: 'Data Privacy & Training Consent',
          minutes: 6,
          intro: 'When you type into an AI tool, your words travel to a company\u2019s servers. What happens next depends on the company\u2019s policies and your settings.',
          sections: [
            {
              h: 'Your chats may train future models',
              p: 'Some AI services use conversations to improve future models unless you opt out. Human reviewers may read samples of conversations. Many tools offer a setting to turn off chat history or training.'
            },
            {
              h: 'Never share sensitive information',
              p: 'Do not enter passwords, home addresses, phone numbers, medical details, or other people\u2019s private information. Treat every AI chat as if it could be read by a stranger.'
            },
            {
              h: 'Consent and creators',
              p: 'Many models were trained on writing, art, and photos collected from the internet without asking the creators. This raises ongoing legal and ethical questions about consent, credit, and payment for creative work.'
            }
          ],
          callout: {
            title: 'Privacy checklist',
            body: 'Check the age requirement, look for a training opt-out, use school-approved tools, and remove names before pasting any text.'
          },
          takeaways: [
            'Conversations may be stored and used for training.',
            'Never share personal or sensitive data with AI tools.',
            'Training without creator consent is an open ethical issue.'
          ],
          check: {
            q: 'Which is safest to paste into a public AI chatbot?',
            options: [
              'A classmate\u2019s full name and phone number',
              'Your account password',
              'A paragraph from a public-domain novel',
              'Your medical records'
            ],
            answer: 2,
            explain: 'Public-domain text contains no private information. The other options expose sensitive personal data.'
          }
        },
        {
          id: 'algorithmic-bias',
          title: 'Algorithmic Bias & Fairness',
          minutes: 7,
          intro: 'Algorithmic bias happens when an AI system produces results that are systematically unfair to certain groups of people.',
          sections: [
            {
              h: 'Where bias comes from',
              p: 'Bias can enter through training data that underrepresents some groups, through labels that reflect human prejudice, or through design choices about what the model should optimize. A hiring model trained on past hiring decisions can learn to repeat past discrimination.'
            },
            {
              h: 'Real consequences',
              p: 'Researchers have documented facial recognition systems with much higher error rates for darker-skinned women than for lighter-skinned men. When biased systems are used in policing, lending, or hiring, real people are harmed.'
            },
            {
              h: 'Building fairer systems',
              p: 'Fairness work includes collecting diverse data, testing results across groups, publishing audits, and keeping humans responsible for high-stakes decisions. As a user, you can notice stereotypes in AI outputs and report them.'
            }
          ],
          callout: {
            title: 'Spot it yourself',
            body: 'Ask an image generator for a picture of a doctor, a nurse, and an engineer. Notice who appears by default. Defaults reveal patterns in the training data.'
          },
          takeaways: [
            'Bias enters through data, labels, and design choices.',
            'Biased AI in high-stakes areas causes real harm.',
            'Diverse data, audits, and human oversight reduce bias.'
          ],
          check: {
            q: 'A loan model trained only on historical approvals keeps rejecting one neighborhood. What is the most likely cause?',
            options: [
              'The model is broken and random.',
              'It learned patterns of past bias in its training data.',
              'The neighborhood has no residents.',
              'Loan models cannot be biased.'
            ],
            answer: 1,
            explain: 'Models trained on historical decisions can learn and repeat historical discrimination.'
          }
        },
        {
          id: 'disclosure-citation',
          title: 'Responsible AI Disclosure & APA/MLA Citation',
          minutes: 7,
          intro: 'When AI contributes to your work, honesty means telling your reader how. Both APA and MLA now provide official guidance for citing generative AI.',
          sections: [
            {
              h: 'Write a disclosure statement',
              p: 'A disclosure statement explains which tool you used, what you used it for, and what you did yourself. For example: I used ChatGPT to brainstorm topic ideas and to check my grammar. All research, writing, and analysis are my own.'
            },
            {
              h: 'APA style',
              p: 'APA treats the company as the author. Format: OpenAI. (2024). ChatGPT (May 13 version) [Large language model]. https://chat.openai.com. In your text, write (OpenAI, 2024) and describe the prompt you used.'
            },
            {
              h: 'MLA style',
              p: 'MLA describes the prompt in the title position. Format: "Summarize the causes of World War I" prompt. ChatGPT, 13 May version, OpenAI, 20 May 2024, chat.openai.com. Include the date you generated the response.'
            }
          ],
          callout: {
            title: 'Best practice',
            body: 'Save a copy or screenshot of every AI conversation you cite. AI responses change over time and cannot be reproduced later.'
          },
          takeaways: [
            'A disclosure states the tool, the purpose, and your own contribution.',
            'APA lists the company as author with the model version.',
            'MLA puts your prompt in the title position with the access date.'
          ],
          check: {
            q: 'In APA style, who is listed as the author when citing ChatGPT?',
            options: ['The student', 'ChatGPT', 'OpenAI', 'No author is listed'],
            answer: 2,
            explain: 'APA lists the organization that created the model, OpenAI, as the author.'
          }
        }
      ]
    },
    {
      id: 'autonomy',
      title: 'Future of Autonomous Systems',
      tagline: 'AI agents, human oversight, cybersecurity, and how AI is reshaping careers.',
      icon: 'rocket',
      accent: 'violet',
      lessons: [
        {
          id: 'agentic-workflows',
          title: 'Agentic Workflows',
          minutes: 7,
          intro: 'A chatbot answers a question. An AI agent pursues a goal: it plans steps, uses tools, checks results, and keeps going until the task is done.',
          sections: [
            {
              h: 'The agent loop',
              p: 'Agents work in a loop: observe the situation, plan the next step, act by calling a tool such as web search or a calculator, then review the result. The loop repeats until the goal is reached or the agent asks a human for help.'
            },
            {
              h: 'Tools give agents reach',
              p: 'Agents become powerful when they can use tools: browsing websites, running code, reading files, sending emails, or booking appointments. Each new tool also creates new ways for things to go wrong.'
            },
            {
              h: 'Where agents shine and struggle',
              p: 'Agents are useful for multi-step, repetitive tasks like researching options, sorting files, or testing software. They struggle when goals are vague, when mistakes compound over many steps, or when tasks require judgment about values.'
            }
          ],
          callout: {
            title: 'Example',
            body: 'Goal: find three summer coding camps under 500 dollars near me. An agent might search the web, open each camp page, extract prices and dates, compare them, and present a table.'
          },
          takeaways: [
            'Agents pursue goals through an observe, plan, act, review loop.',
            'Tools extend what agents can do, and what can go wrong.',
            'Small errors can compound across many agent steps.'
          ],
          check: {
            q: 'What most distinguishes an AI agent from a basic chatbot?',
            options: [
              'Agents use larger fonts.',
              'Agents plan and take multi-step actions using tools toward a goal.',
              'Agents never make mistakes.',
              'Agents only work offline.'
            ],
            answer: 1,
            explain: 'Agents plan, call tools, and iterate toward a goal instead of giving a single reply.'
          }
        },
        {
          id: 'human-in-the-loop',
          title: 'Human-in-the-Loop Safeguards',
          minutes: 6,
          intro: 'Human-in-the-loop means people stay involved at key decision points, especially when an AI action is costly, irreversible, or affects other people.',
          sections: [
            {
              h: 'Approval checkpoints',
              p: 'Well-designed agents pause and ask for confirmation before high-stakes actions, such as spending money, deleting data, or sending messages on your behalf. A human reviewing the plan catches errors the AI cannot see.'
            },
            {
              h: 'Levels of autonomy',
              p: 'Systems range from human-in-the-loop, where people approve each action, to human-on-the-loop, where people monitor and can intervene, to fully autonomous. The higher the stakes, the more human control is appropriate.'
            },
            {
              h: 'Avoiding automation bias',
              p: 'Automation bias is the tendency to trust a machine\u2019s suggestion even when it is wrong. A human checkpoint only works if the human actually thinks critically instead of clicking approve on everything.'
            }
          ],
          callout: {
            title: 'Design question',
            body: 'Would you let an AI automatically submit your college application? Most people would want to review it first. That instinct is human-in-the-loop design.'
          },
          takeaways: [
            'Humans should approve costly or irreversible AI actions.',
            'Autonomy levels should match the stakes of the task.',
            'Automation bias can make human oversight meaningless.'
          ],
          check: {
            q: 'An AI agent is about to permanently delete 2,000 files. What safeguard is most appropriate?',
            options: [
              'Let it proceed automatically.',
              'Require human confirmation before deletion.',
              'Turn off all logging.',
              'Run it faster.'
            ],
            answer: 1,
            explain: 'Irreversible, high-impact actions should require a human checkpoint.'
          }
        },
        {
          id: 'cybersecurity',
          title: 'Cybersecurity & Threat Telemetry',
          minutes: 7,
          intro: 'AI is now used on both sides of cybersecurity: attackers use it to scale scams, and defenders use it to detect threats faster than any human team could.',
          sections: [
            {
              h: 'AI-powered threats',
              p: 'Attackers use AI to write convincing phishing emails without spelling mistakes, clone voices for phone scams, and create deepfake videos. Prompt injection is a newer attack where hidden instructions in a web page or document trick an AI agent into doing something harmful.'
            },
            {
              h: 'Threat telemetry',
              p: 'Telemetry is the constant stream of data that computers and networks produce, such as login attempts, file changes, and network traffic. Security teams use machine learning to scan billions of these events and flag unusual patterns, like a login from two countries within minutes.'
            },
            {
              h: 'Your personal defenses',
              p: 'Use a password manager and multi-factor authentication, verify unexpected requests through a second channel, and agree on a family code word to defeat voice-clone scams. Be skeptical of urgency, which is the most common ingredient in any scam.'
            }
          ],
          callout: {
            title: 'Red flag',
            body: 'A message that creates urgency, asks for secrecy, and requests money or credentials is a scam until proven otherwise, no matter how real it sounds.'
          },
          takeaways: [
            'AI makes phishing, voice cloning, and deepfakes easier.',
            'Telemetry plus machine learning helps defenders spot anomalies.',
            'Multi-factor authentication and verification beat most scams.'
          ],
          check: {
            q: 'What is prompt injection?',
            options: [
              'A faster way to type prompts',
              'Hidden instructions in content that trick an AI into harmful actions',
              'A vaccine for computers',
              'A method for training models'
            ],
            answer: 1,
            explain: 'Prompt injection hides malicious instructions inside content an AI reads, hijacking its behavior.'
          }
        },
        {
          id: 'future-of-work',
          title: 'The Future of Work',
          minutes: 6,
          intro: 'AI is changing which tasks people do at work far more than it is erasing entire careers. The skills you build now will shape how you fit into that future.',
          sections: [
            {
              h: 'Tasks, not jobs',
              p: 'Most jobs are bundles of tasks. AI tends to automate routine tasks, like drafting standard emails or sorting data, while people focus on judgment, relationships, creativity, and hands-on work. Many roles will be reshaped rather than replaced.'
            },
            {
              h: 'Durable human skills',
              p: 'Skills that stay valuable include critical thinking, clear communication, collaboration, ethical judgment, and the ability to learn new tools quickly. Knowing how to evaluate AI output is becoming a core workplace skill in itself.'
            },
            {
              h: 'New careers are emerging',
              p: 'Fields like AI safety, data annotation, machine learning operations, AI policy, and prompt design barely existed a decade ago. Skilled trades, healthcare, and education remain in high demand and benefit from AI assistance.'
            }
          ],
          callout: {
            title: 'Reflect',
            body: 'Pick a career you are interested in. Which of its tasks could AI help with, and which require a human? Your answer is a roadmap for the skills to build.'
          },
          takeaways: [
            'AI reshapes tasks more often than it eliminates whole jobs.',
            'Critical thinking and communication are durable skills.',
            'Entirely new AI-related careers are emerging.'
          ],
          check: {
            q: 'According to most research, how is AI most likely to affect jobs?',
            options: [
              'Every job will disappear within five years.',
              'It will change many tasks within jobs, reshaping roles.',
              'It will have no effect at all.',
              'Only artists will be affected.'
            ],
            answer: 1,
            explain: 'AI tends to automate specific tasks, which reshapes roles more often than it removes them entirely.'
          }
        }
      ]
    }
  ];

  NP.findLesson = function (lessonId) {
    for (const mod of NP.MODULES) {
      const index = mod.lessons.findIndex((l) => l.id === lessonId);
      if (index !== -1) return { module: mod, lesson: mod.lessons[index], index };
    }
    return null;
  };

  NP.findModule = function (moduleId) {
    return NP.MODULES.find((m) => m.id === moduleId) || null;
  };

  NP.TOTAL_LESSONS = NP.MODULES.reduce((sum, m) => sum + m.lessons.length, 0);

  NP.DAILY_FACTS = [
    'The term "artificial intelligence" was coined in 1955 for a 1956 summer workshop at Dartmouth College.',
    'A single token is roughly three quarters of an English word.',
    'Backpropagation, the core training method for neural networks, was popularized in 1986.',
    'Lowering a model\u2019s temperature makes its answers more predictable and less creative.',
    'Human-in-the-loop design keeps people in control of high-stakes AI decisions.',
    'APA and MLA both publish official guidance for citing generative AI tools.',
    'Few-shot prompting means giving the AI a few examples of the output you want.'
  ];
})(window.NP = window.NP || {});
