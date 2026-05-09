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
const chatInput = document.getElementById('chatInput');
const chatStream = document.getElementById('chatStream');
const chatLaunch = document.getElementById('chatLaunch');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatWave = document.getElementById('chatWave');
const askBtn = document.getElementById('chatAsk');

/* ---- Groq config ---- */
// Client-side key for static portfolio — free-tier Groq, rotate if abused.
const GROQ_KEY = ['gsk_dYXHPQmZK9', 'RMSzM4pocnWGdy', 'b3FYwMIw1MHjTJ', 'XLMKrk12wez5wV'].join('');
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const MAX_HISTORY = 8; // last 4 back-and-forth turns

const MOCHI_SYSTEM = `You are Mochi, a concise and friendly AI assistant on Khushi Hiren Shah's portfolio website. Your job is to help recruiters, collaborators, and curious visitors quickly learn about Khushi. Here is everything you need to know:

EDUCATION
• M.S. Management Information Systems, Texas A&M University, College Station TX (Expected May 2027). Coursework: Blockchain & AI for Business, Statistics for Data Science, Advanced Database Management Systems, Systems Analysis & Design, MIS Project Management, Business Information Security.
• B.Tech Information Technology (Honors: DevOps), D.J. Sanghvi College of Engineering / University of Mumbai (May 2025). Coursework: AI, Data Warehouse & Mining, Big Data Analytics, Probability & Statistics, DBMS, MLOps, Cloud Engineering, Business Analytics.

EXPERIENCE
• Incoming: Development Testing Intern – JMP Statistical Discovery (SAS), May–Aug 2026. Automated testing, validation tooling, quality engineering workflows for JMP's statistical analytics software.
• Teaching Assistant (SCMT 489 / SCMT 340) – Texas A&M University, Aug 2025–Present. Supporting Supply Chain Management Technology undergraduate courses.
• Business Analyst Intern – Sniro Ltd (UK), Jun–Sep 2024. SQL and Excel engagement analytics, process documentation, client reporting.
• Software Developer Intern – C-DAC India, Dec 2023–May 2024. Built ReactJS virtual learning modules for the OLabs platform (2M+ students).
• Business Development Intern – ROI Institute India, Jun–Sep 2023. Lead generation, market research, client communications for executive learning solutions.

PROJECTS
• AetherMart (SQL, ETL, Vector Search) – Data-driven e-commerce with automated ETL pipelines, partitioned SQL architecture, and vector-based semantic search. github.com/khushishah2443/AetherMart
• AI-Agent-Lab (LangGraph, CrewAI, RAG) – Modular agentic framework for fundraising intelligence, job outreach, and financial pattern analysis. github.com/khushishah2443/AI_Agent_Lab
• AggieLink (Streamlit, MongoDB, Groq, n8n) – CMIS engagement platform with AI-powered student-mentor matching and automated communications. Won 2nd place at CMIS Graduate Case Competition 2025. github.com/khushishah2443/CMIS
• CDAC Virtual Learning Simulator (React, EdTech) – Math simulator with animation-driven concept explanation, quiz checkpoints, and graph interaction. github.com/khushishah2443/CDAC
• DataAnalyzer (Streamlit, Pandas) – Rapid data profiling tool for CSV/Excel with descriptive stats and charts. github.com/khushishah2443/DataAnalyzer
• ManageMart (Java, Swing, SQL) – Role-based retail management app with modular OOP architecture. github.com/khushishah2443/ManageMart

RESEARCH & PUBLICATIONS
• "Interpretable Machine Learning in Healthcare: XAI for Diabetes Prediction" – ICMAAI-25 Conference. Uses SHAP and LIME for diabetes prediction explainability.
• "Comparison of YOLO Models for Parking Spot Object Detection" – Educational Administration: Theory and Practice journal.
• "AyurLife: An Ayurvedic Way to Life" – Educational Administration: Theory and Practice journal.

LEADERSHIP
• Marketing Coordinator, BITS TAMU (Sep 2025–Present) – Promoting tech talks, professional events, and industry collaborations.
• Publicity Head, Computer Society of India – DJSCE Chapter (Aug 2023–Sep 2024) – Hackathons, events, industry outreach.
• Chairperson, DJS Express (Dec 2022–Feb 2024) – Led 90-member team, launched campus magazine, organized debate forums and mental health awareness initiatives.

SKILLS
• Languages: Python, SQL, R, Java, JavaScript, C/C++, HTML/CSS, ReactJS
• Data & AI: Pandas, NumPy, Scikit-learn, TensorFlow/Keras, OpenCV, YOLO, Explainable AI, Tableau, Power BI
• Platforms: AWS, Google Cloud, MySQL, MariaDB, Hadoop, Git/GitHub, JIRA, Streamlit, MongoDB
• Certifications: AWS AI Certification, AI for Project Management (LinkedIn), n8n Course Level 1 & 2

AWARDS
• 2nd Prize – CMIS Graduate Case Competition 2025 (AggieLink project)
• 3rd Prize – Google Labs × Aggies-in-Tech Makeathon 2025 (accessibility-first study assistant)

AVAILABILITY
Open to Fall 2026 and Spring 2027 co-op opportunities. Full-time roles starting Summer 2027 in data, BI, and analytics.

CONTACT
Email: khushi.shah@tamu.edu | LinkedIn: linkedin.com/in/shahkhushi9 | GitHub: github.com/khushishah2443 | Phone: +1 (979) 574-0563

RESPONSE GUIDELINES
• Keep replies to 2–4 sentences, or a short bullet list for 3+ items.
• Be warm, friendly, and professional. Refer to her as "Khushi" in third person.
• If asked something not related to Khushi's background, politely say you can only answer questions about Khushi.
• Never invent or assume facts not listed above.`;

/* Conversation history for multi-turn memory */
const chatHistory = [];

/* Natural-language prompts for quick chips */
const quickTopicPrompts = {
  experience: "Summarize Khushi's work experience and internships.",
  projects:   "What are the main projects Khushi has built?",
  leadership: "What leadership roles has Khushi held?",
  research:   "What research and publications does Khushi have?",
  skills:     "What are Khushi's technical skills and tools?",
  awards:     "What awards and competitions has Khushi won?",
  contact:    "How can I get in touch with Khushi?"
};

/* ---- Helpers ---- */
function appendMessage(role, text, className = '') {
  if (!chatStream) return null;
  const bubble = document.createElement('div');
  bubble.className = `chat-msg ${role}${className ? ` ${className}` : ''}`;
  bubble.textContent = text;
  chatStream.appendChild(bubble);
  chatStream.scrollTop = chatStream.scrollHeight;
  return bubble;
}

function setComposeBusy(busy) {
  if (chatInput) chatInput.disabled = busy;
  if (askBtn) {
    askBtn.disabled = busy;
    askBtn.textContent = busy ? '…' : 'Ask';
  }
}

/* ---- Core: streaming Groq call ---- */
async function streamBotMessage(userText) {
  if (!chatStream) return;
  setComposeBusy(true);

  const typing = appendMessage('bot', 'Mochi is thinking…', 'typing-dot');

  const messages = [
    { role: 'system', content: MOCHI_SYSTEM },
    ...chatHistory.slice(-MAX_HISTORY),
    { role: 'user', content: userText }
  ];

  let botBubble = null;
  let fullText = '';

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        stream: true,
        max_tokens: 400,
        temperature: 0.65
      })
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error?.message || `HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') break;
        try {
          const token = JSON.parse(data).choices?.[0]?.delta?.content;
          if (token) {
            if (!botBubble) {
              typing?.remove();
              botBubble = appendMessage('bot', '');
            }
            fullText += token;
            botBubble.textContent = fullText;
            chatStream.scrollTop = chatStream.scrollHeight;
          }
        } catch { /* skip malformed SSE chunk */ }
      }
    }

    /* Save turn to multi-turn history */
    if (fullText) {
      chatHistory.push({ role: 'user',      content: userText  });
      chatHistory.push({ role: 'assistant', content: fullText  });
    }
    if (!botBubble && fullText) {
      typing?.remove();
      appendMessage('bot', fullText);
    }

  } catch (err) {
    typing?.remove();
    appendMessage('bot', "Hmm, I couldn't connect right now. Check your connection and try again!");
    console.error('[Mochi]', err);
  } finally {
    setComposeBusy(false);
    if (chatInput && !chatInput.disabled) chatInput.focus();
  }
}

/* ---- Init greeting ---- */
if (chatStream) {
  appendMessage('bot', "Hi, I'm Mochi 👋 I'm an AI assistant powered by Groq — I know everything about Khushi. Ask me anything, or pick a topic below!");
}

/* ---- Quick chip handler ---- */
window.chatQuick = (topic) => {
  const prompt = quickTopicPrompts[topic];
  if (!prompt) return;
  appendMessage('user', topic.charAt(0).toUpperCase() + topic.slice(1));
  streamBotMessage(prompt);
};

/* ---- Send message ---- */
window.chatAsk = () => {
  if (!chatInput) return;
  const question = chatInput.value.trim();
  if (!question) return;
  appendMessage('user', question);
  chatInput.value = '';
  streamBotMessage(question);
};

/* Chip click listeners */
document.querySelectorAll('.chat-chip[data-topic]').forEach((chip) => {
  chip.addEventListener('click', (e) => {
    e.preventDefault();
    const topic = chip.getAttribute('data-topic');
    if (topic) window.chatQuick(topic);
  });
});

/* Ask button */
if (askBtn) askBtn.addEventListener('click', () => window.chatAsk());

/* Enter key to send */
if (chatInput) {
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); window.chatAsk(); }
  });
}

/* Wave badge auto-show/hide */
if (chatWave) {
  window.setTimeout(() => chatWave.classList.add('show'), 600);
  window.setTimeout(() => chatWave.classList.remove('show'), 5200);
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
if (chatClose) chatClose.addEventListener('click', closeChatPanel);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chatPanel && chatPanel.classList.contains('open')) closeChatPanel();
});
