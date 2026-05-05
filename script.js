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

/* ---------- Mochi chatbot ---------- */
const chatInput = document.getElementById('chatInput');
const chatStream = document.getElementById('chatStream');
const chatLaunch = document.getElementById('chatLaunch');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatWave = document.getElementById('chatWave');

const chatReplies = {
  experience: "Khushi is an incoming Development Testing Intern at JMP Statistical Discovery (Summer 2026) and currently a Teaching Assistant at Texas A&M (SCMT 489 / SCMT 340). Past internships: Sniro Ltd (Business Analyst, UK), C-DAC India (Software Developer), and ROI Institute India (Business Development).",
  projects: "Featured projects: AetherMart (e-commerce + ETL + vector search), AI-Agent-Lab (LangGraph & CrewAI agents), AggieLink (CMIS engagement platform), CDAC Virtual Learning Simulator (React EdTech), DataAnalyzer (Streamlit profiler), and ManageMart (Java retail system).",
  leadership: "Leadership: Marketing Coordinator at BITS TAMU (current), Publicity Head for the DJSCE chapter of the Computer Society of India, and Chairperson of DJS Express where she led a 90-member team and launched a campus magazine.",
  research: "Three publications: 'Interpretable ML in Healthcare: XAI for Diabetes Prediction' (ICMAAI-25), 'Comparison of YOLO Models for Parking Spot Detection,' and 'AyurLife: An Ayurvedic Way to Life.'",
  skills: "Core stack: Python, SQL, R, JavaScript, React, Java, C/C++. Data & AI: Pandas, NumPy, Scikit-learn, TensorFlow, OpenCV, YOLO, Tableau, Power BI. Platforms: AWS, GCP, MongoDB, MySQL, Hadoop, n8n, Streamlit.",
  awards: "2nd Prize at the CMIS Graduate Case Competition 2025 (AggieLink) and 3rd Prize at the Google Labs × Aggies-in-Tech Makeathon 2025 (accessibility-first study assistant).",
  contact: "Best ways to reach Khushi: email khushi.shah@tamu.edu, LinkedIn (in/shahkhushi9), or the form at the bottom of the page."
};

const greetings = [
  "Hi, I'm Mochi 👋 I can summarize Khushi's resume. Try a chip below or ask away.",
  "Hey there, Mochi here. Ask me about projects, awards, or what Khushi's working on next.",
  "Hi! I'm Mochi. Want a quick tour of Khushi's experience, research, or projects?"
];

function appendMessage(role, text, className = "") {
  if (!chatStream) return null;
  const bubble = document.createElement("div");
  bubble.className = `chat-msg ${role}${className ? ` ${className}` : ""}`;
  bubble.textContent = text;
  chatStream.appendChild(bubble);
  chatStream.scrollTop = chatStream.scrollHeight;
  return bubble;
}

function typeBotMessage(text) {
  if (!chatStream) return;
  const typing = appendMessage("bot", "Mochi is typing", "typing-dot");
  window.setTimeout(() => {
    if (typing) typing.remove();
    const bubble = appendMessage("bot", "");
    let i = 0;
    const timer = window.setInterval(() => {
      bubble.textContent += text.charAt(i);
      i += 1;
      chatStream.scrollTop = chatStream.scrollHeight;
      if (i >= text.length) window.clearInterval(timer);
    }, 11);
  }, 380);
}

function resolveReply(raw) {
  const q = (raw || "").toLowerCase().trim();
  if (!q) return greetings[0];
  if (/(hi|hello|hey|yo|sup)\b/.test(q)) return greetings[Math.floor(Math.random() * greetings.length)];
  if (q.includes("award") || q.includes("prize") || q.includes("won")) return chatReplies.awards;
  if (q.includes("contact") || q.includes("email") || q.includes("reach")) return chatReplies.contact;
  if (q.includes("research") || q.includes("paper") || q.includes("publication")) return chatReplies.research;
  if (q.includes("leader") || q.includes("club") || q.includes("organization")) return chatReplies.leadership;
  if (q.includes("skill") || q.includes("tech") || q.includes("stack") || q.includes("tool")) return chatReplies.skills;
  if (q.includes("jmp") || q.includes("intern") || /\bta\b/.test(q) || q.includes("teach") || q.includes("experience") || q.includes("work") || q.includes("job")) return chatReplies.experience;
  if (q.includes("project") || q.includes("aethermart") || q.includes("aggielink") || q.includes("agent")) return chatReplies.projects;
  if (q.includes("avail") || q.includes("hiring") || q.includes("co-op") || q.includes("coop") || q.includes("full-time") || q.includes("opportunity")) {
    return "Khushi is open to Fall 2026 and Spring 2027 co-op opportunities, and full-time roles starting Summer 2027 in data, BI, and analytics.";
  }
  return "I can summarize experience, projects, leadership, research, skills, awards, or how to contact Khushi. Try one of the chips above.";
}

window.chatQuick = (topic) => {
  const prompt = topic.charAt(0).toUpperCase() + topic.slice(1);
  appendMessage("user", `Tell me about ${prompt.toLowerCase()}`);
  typeBotMessage(chatReplies[topic] || resolveReply(prompt));
};

window.chatAsk = () => {
  if (!chatInput) return;
  const question = chatInput.value.trim();
  if (!question) return;
  appendMessage("user", question);
  chatInput.value = "";
  typeBotMessage(resolveReply(question));
};

if (chatStream) {
  appendMessage("bot", greetings[0]);
}

const chipList = document.querySelectorAll('.chat-chip[data-topic]');
chipList.forEach((chip) => {
  chip.addEventListener('click', (event) => {
    event.preventDefault();
    const topic = chip.getAttribute('data-topic');
    if (topic) window.chatQuick(topic);
  });
});

const askBtn = document.getElementById('chatAsk');
if (askBtn) askBtn.addEventListener('click', () => window.chatAsk());

if (chatInput) {
  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      window.chatAsk();
    }
  });
}

if (chatWave) {
  window.setTimeout(() => chatWave.classList.add('show'), 600);
  window.setTimeout(() => chatWave.classList.remove('show'), 5200);
}

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

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && chatPanel && chatPanel.classList.contains('open')) closeChatPanel();
});
