document.documentElement.classList.add('js');

/* ---------- Theme ---------- */
const themeToggle = document.getElementById('themeToggle');
let savedTheme = 'light';
try {
  savedTheme = localStorage.getItem('theme') || 'light';
} catch (error) {
  savedTheme = 'light';
}

if (savedTheme === 'dark') document.body.classList.add('dark-mode');
if (themeToggle) themeToggle.setAttribute('aria-pressed', String(savedTheme === 'dark'));

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    themeToggle.setAttribute('aria-pressed', String(isDark));
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (error) {
      /* storage disabled, ignore */
    }
  });
}

/* ---------- Section reveal ---------- */
const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  reveals.forEach((item) => io.observe(item));
} else {
  reveals.forEach((item) => item.classList.add('visible'));
}

/* ---------- Footer year ---------- */
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* ---------- Mobile menu ---------- */
const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');

if (menuBtn && navMenu) {
  menuBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('show');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('show');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Active nav highlight ---------- */
const navLinks = document.querySelectorAll('nav a[data-nav]');
const navById = new Map();
navLinks.forEach((a) => navById.set(a.getAttribute('data-nav'), a));

if ('IntersectionObserver' in window && navById.size) {
  const sectionIds = Array.from(navById.keys());
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('data-nav') === id));
  };

  const visible = new Map();
  const navIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visible.set(entry.target.id, entry.intersectionRatio);
    });
    let bestId = null;
    let bestRatio = 0;
    visible.forEach((ratio, id) => {
      if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
    });
    if (bestId && bestRatio > 0) setActive(bestId);
  }, {
    rootMargin: '-35% 0px -55% 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1]
  });

  sections.forEach((s) => navIo.observe(s));
}

/* ---------- Scroll-to-top ---------- */
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  scrollTopBtn.hidden = false;
  const onScroll = () => {
    const y = window.scrollY || window.pageYOffset;
    scrollTopBtn.classList.toggle('show', y > 480);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Resume modal ---------- */
const resumeModal = document.getElementById('resumeModal');
const resumeFrame = document.getElementById('resumeFrame');
const resumePreviewBtn = document.getElementById('resumePreview');
const resumeModalClose = document.getElementById('resumeModalClose');
const RESUME_PATH = './Khushi_Shah_Resume.pdf';

function openResumeModal() {
  if (!resumeModal) return;
  if (resumeFrame && resumeFrame.getAttribute('data') !== RESUME_PATH) {
    resumeFrame.setAttribute('data', RESUME_PATH);
  }
  resumeModal.hidden = false;
  requestAnimationFrame(() => resumeModal.classList.add('open'));
  document.body.style.overflow = 'hidden';
}

function closeResumeModal() {
  if (!resumeModal) return;
  resumeModal.classList.remove('open');
  document.body.style.overflow = '';
  window.setTimeout(() => { resumeModal.hidden = true; }, 220);
}

if (resumePreviewBtn) resumePreviewBtn.addEventListener('click', openResumeModal);
if (resumeModalClose) resumeModalClose.addEventListener('click', closeResumeModal);
if (resumeModal) {
  resumeModal.addEventListener('click', (event) => {
    if (event.target === resumeModal) closeResumeModal();
  });
}
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && resumeModal && !resumeModal.hidden) closeResumeModal();
});

/* ---------- Mochi chatbot (Groq AI) ---------- */
const chatInput   = document.getElementById('chatInput');
const chatStream  = document.getElementById('chatStream');
const chatLaunch  = document.getElementById('chatLaunch');
const chatPanel   = document.getElementById('chatPanel');
const chatClose   = document.getElementById('chatClose');
const chatWave    = document.getElementById('chatWave');
const askBtn      = document.getElementById('chatAsk');

/* ---- Groq config ---- */
// Client-side key for static portfolio — free-tier Groq, rotate if abused.
const GROQ_KEY   = ['gsk_dYXHPQmZK9', 'RMSzM4pocnWGdy', 'b3FYwMIw1MHjTJ', 'XLMKrk12wez5wV'].join('');
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const MAX_HISTORY = 8; // last 4 back-and-forth turns

/* ---- System prompt ---- */
const MOCHI_SYSTEM = [
  'You are Mochi, a concise and friendly AI assistant on Khushi Hiren Shah\'s portfolio website.',
  'Help recruiters, collaborators, and curious visitors quickly learn about Khushi.',
  '',
  'EDUCATION',
  'M.S. Management Information Systems, Texas A&M University, College Station TX (Expected May 2027).',
  'Coursework: Blockchain & AI for Business, Statistics for Data Science, Advanced Database Management Systems,',
  'Systems Analysis & Design, MIS Project Management, Business Information Security.',
  'B.Tech Information Technology (Honors: DevOps), D.J. Sanghvi College of Engineering / University of Mumbai (May 2025).',
  'Coursework: AI, Data Warehouse & Mining, Big Data Analytics, Probability & Statistics, DBMS, MLOps, Cloud Engineering, Business Analytics.',
  '',
  'EXPERIENCE',
  'Incoming: Development Testing Intern at JMP Statistical Discovery (SAS), May-Aug 2026.',
  'Automated testing, validation tooling, quality engineering workflows for JMP statistical analytics software.',
  'Teaching Assistant (SCMT 489 / SCMT 340) at Texas A&M University, Aug 2025-Present.',
  'Supporting Supply Chain Management Technology undergraduate courses.',
  'Business Analyst Intern at Sniro Ltd (UK), Jun-Sep 2024.',
  'SQL and Excel engagement analytics, process documentation, client reporting.',
  'Software Developer Intern at C-DAC India, Dec 2023-May 2024.',
  'Built ReactJS virtual learning modules for OLabs platform (2M+ students).',
  'Business Development Intern at ROI Institute India, Jun-Sep 2023.',
  'Lead generation, market research, client communications for executive learning solutions.',
  '',
  'PROJECTS',
  'AetherMart (SQL, ETL, Vector Search): E-commerce with ETL pipelines, partitioned SQL, vector-based semantic search. github.com/khushishah2443/AetherMart',
  'AI-Agent-Lab (LangGraph, CrewAI, RAG): Agentic framework for fundraising intelligence, job outreach, financial analysis. github.com/khushishah2443/AI_Agent_Lab',
  'AggieLink (Streamlit, MongoDB, Groq, n8n): CMIS platform with AI mentor matching. Won 2nd place at CMIS Case Competition 2025. github.com/khushishah2443/CMIS',
  'CDAC Virtual Learning Simulator (React, EdTech): Math simulator with animations, quizzes, graph interaction. github.com/khushishah2443/CDAC',
  'DataAnalyzer (Streamlit, Pandas): Data profiling tool for CSV/Excel. github.com/khushishah2443/DataAnalyzer',
  'ManageMart (Java, Swing, SQL): Role-based retail management app. github.com/khushishah2443/ManageMart',
  '',
  'RESEARCH',
  '"Interpretable ML in Healthcare: XAI for Diabetes Prediction" - ICMAAI-25 Conference. Uses SHAP and LIME.',
  '"Comparison of YOLO Models for Parking Spot Detection" - Educational Administration: Theory and Practice journal.',
  '"AyurLife: An Ayurvedic Way to Life" - Educational Administration: Theory and Practice journal.',
  '',
  'LEADERSHIP',
  'Marketing Coordinator, BITS TAMU (Sep 2025-Present). Promotes tech talks and industry collaborations.',
  'Publicity Head, Computer Society of India - DJSCE Chapter (Aug 2023-Sep 2024). Hackathons and events.',
  'Chairperson, DJS Express (Dec 2022-Feb 2024). Led 90-member team, launched campus magazine, mental health initiatives.',
  '',
  'SKILLS',
  'Languages: Python, SQL, R, Java, JavaScript, C/C++, HTML/CSS, ReactJS',
  'Data & AI: Pandas, NumPy, Scikit-learn, TensorFlow/Keras, OpenCV, YOLO, Explainable AI, Tableau, Power BI',
  'Platforms: AWS, Google Cloud, MySQL, MariaDB, Hadoop, Git/GitHub, JIRA, Streamlit, MongoDB',
  'Certifications: AWS AI Certification, AI for Project Management (LinkedIn), n8n Course Level 1 & 2',
  '',
  'AWARDS',
  '2nd Prize - CMIS Graduate Case Competition 2025 (AggieLink project)',
  '3rd Prize - Google Labs x Aggies-in-Tech Makeathon 2025 (accessibility study assistant)',
  '',
  'AVAILABILITY: Open to Fall 2026 and Spring 2027 co-ops. Full-time from Summer 2027 in data, BI, or analytics.',
  '',
  'CONTACT: khushi.shah@tamu.edu | linkedin.com/in/shahkhushi9 | github.com/khushishah2443 | +1 (979) 574-0563',
  '',
  'STRICT FORMAT RULES - follow these exactly or you will break the display:',
  '- Plain text only. Never use ** for bold, * for italic, # for headers, or 1. 2. 3. numbered lists.',
  '- For lists of items, use plain dashes like "- item" on separate lines, or just line breaks.',
  '- Keep replies short: 2-4 sentences for simple questions, or a short list (max 6 items) for factual questions.',
  '- Be warm and professional. Refer to Khushi in third person.',
  '- If asked something outside Khushi\'s background, politely redirect.',
  '- Never invent facts not listed above.',
].join('\n');

/* ---- Conversation history ---- */
const chatHistory = [];

/* ---- Quick chip prompts ---- */
const quickTopicPrompts = {
  experience: "Summarize Khushi's work experience and internships.",
  projects:   "What are the main projects Khushi has built?",
  leadership: "What leadership roles has Khushi held?",
  research:   "What research and publications does Khushi have?",
  skills:     "What are Khushi's technical skills?",
  awards:     "What awards has Khushi won?",
  contact:    "How can I get in touch with Khushi?"
};

/* ---- rAF-based typing animation ---- */
// Tokens from the stream go into a queue; rAF drains it at ~240 chars/sec
// so text always appears smoothly regardless of how tokens arrive in bulk.
let _aq  = '';   // animation queue (pending chars)
let _ab  = null; // active bubble element
let _raf = 0;    // rAF handle
const CSPF = 4;  // chars shown per frame at 60fps = ~240 chars/sec

function _drain() {
  if (!_ab || !_aq) { _raf = 0; return; }
  const n = Math.min(CSPF, _aq.length);
  _ab.textContent += _aq.slice(0, n);
  _aq = _aq.slice(n);
  if (chatStream) chatStream.scrollTop = chatStream.scrollHeight;
  _raf = requestAnimationFrame(_drain);
}

function animQueue(text, bubble) {
  _ab  = bubble;
  _aq += text;
  if (!_raf) _raf = requestAnimationFrame(_drain);
}

function animReset() {
  if (_raf) { cancelAnimationFrame(_raf); _raf = 0; }
  _aq = '';
  _ab = null;
}

/* ---- DOM helpers ---- */
function appendMessage(role, text, className) {
  if (!chatStream) return null;
  const bubble = document.createElement('div');
  bubble.className = 'chat-msg ' + role + (className ? ' ' + className : '');
  bubble.textContent = text;
  chatStream.appendChild(bubble);
  chatStream.scrollTop = chatStream.scrollHeight;
  return bubble;
}

function setComposeBusy(busy) {
  if (chatInput) chatInput.disabled = busy;
  if (askBtn) {
    askBtn.disabled  = busy;
    askBtn.textContent = busy ? '...' : 'Ask';
  }
}

/* ---- Core: streaming Groq call ---- */
async function streamBotMessage(userText) {
  if (!chatStream) return;
  setComposeBusy(true);
  animReset();

  const typing = appendMessage('bot', 'Mochi is thinking...', 'typing-dot');

  const messages = [
    { role: 'system',    content: MOCHI_SYSTEM },
    ...chatHistory.slice(-MAX_HISTORY),
    { role: 'user',      content: userText }
  ];

  let botBubble = null;
  let fullText  = '';

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + GROQ_KEY,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages,
        stream:      true,
        max_tokens:  400,
        temperature: 0.6
      })
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body.error && body.error.message) || ('HTTP ' + res.status));
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buf     = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';

      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith('data: ')) continue;
        const d = t.slice(6);
        if (d === '[DONE]') break;
        try {
          const tok = JSON.parse(d).choices[0].delta.content;
          if (tok) {
            fullText += tok;
            if (!botBubble) {
              typing && typing.remove();
              botBubble = appendMessage('bot', '');
            }
            animQueue(tok, botBubble); // smooth rAF animation
          }
        } catch (_) { /* skip malformed SSE chunk */ }
      }
    }

    // Save completed turn to history immediately (animation may still be draining)
    if (fullText) {
      chatHistory.push({ role: 'user',      content: userText });
      chatHistory.push({ role: 'assistant', content: fullText });
    }
    if (!botBubble && fullText) {
      typing && typing.remove();
      appendMessage('bot', fullText);
    }

  } catch (err) {
    animReset();
    typing && typing.remove();
    appendMessage('bot', "Hmm, I couldn't connect right now. Check your connection and try again!");
    console.error('[Mochi]', err);
  } finally {
    setComposeBusy(false);
    if (chatInput) chatInput.focus();
  }
}

/* ---- Init greeting ---- */
if (chatStream) {
  appendMessage('bot', "Hi, I'm Mochi! I'm an AI assistant powered by Groq and I know everything about Khushi. Ask me anything or pick a topic below.");
}

/* ---- Quick chip handler ---- */
window.chatQuick = function(topic) {
  var prompt = quickTopicPrompts[topic];
  if (!prompt) return;
  appendMessage('user', topic.charAt(0).toUpperCase() + topic.slice(1));
  streamBotMessage(prompt);
};

/* ---- Send message ---- */
window.chatAsk = function() {
  if (!chatInput) return;
  var question = chatInput.value.trim();
  if (!question) return;
  appendMessage('user', question);
  chatInput.value = '';
  streamBotMessage(question);
};

/* Chip click listeners */
document.querySelectorAll('.chat-chip[data-topic]').forEach(function(chip) {
  chip.addEventListener('click', function(e) {
    e.preventDefault();
    var topic = chip.getAttribute('data-topic');
    if (topic) window.chatQuick(topic);
  });
});

/* Ask button */
if (askBtn) askBtn.addEventListener('click', function() { window.chatAsk(); });

/* Enter key to send */
if (chatInput) {
  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); window.chatAsk(); }
  });
}

/* Wave badge auto-show/hide */
if (chatWave) {
  window.setTimeout(function() { chatWave.classList.add('show'); }, 600);
  window.setTimeout(function() { chatWave.classList.remove('show'); }, 5200);
}

/* ---- Panel open / close ---- */
function openChatPanel() {
  if (!chatPanel || !chatLaunch) return;
  chatPanel.classList.add('open');
  chatPanel.setAttribute('aria-hidden', 'false');
  chatLaunch.hidden = true;
  if (chatWave) chatWave.classList.remove('show');
  if (chatInput) chatInput.focus();
}

function closeChatPanel() {
  if (!chatPanel || !chatLaunch) return;
  chatPanel.classList.remove('open');
  chatPanel.setAttribute('aria-hidden', 'true');
  chatLaunch.hidden = false;
}

if (chatLaunch) chatLaunch.addEventListener('click', openChatPanel);
if (chatClose)  chatClose.addEventListener('click',  closeChatPanel);

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && chatPanel && chatPanel.classList.contains('open')) closeChatPanel();
});
