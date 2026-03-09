document.documentElement.classList.add('js');

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
      // Ignore storage errors (e.g., private mode); toggle still works for current session.
    }
  });
}

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

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');

if (menuBtn && navMenu) {
  menuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navMenu.classList.remove('show'));
  });
}

const chatInput = document.getElementById('chatInput');
const chatStream = document.getElementById('chatStream');
const chatLaunch = document.getElementById('chatLaunch');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatWave = document.getElementById('chatWave');

const chatReplies = {
  experience: "Khushi is currently a Teaching Assistant at Texas A&M (SCMT 489/340), with prior internships in business analysis, software development, and business development.",
  projects: "Featured projects include AetherMart, AggieLink, CDAC Virtual Learning Simulator, DataAnalyzer, ManageMart, and Loan Analysis.",
  leadership: "Leadership roles include Marketing Coordinator at BITS TAMU, Chairperson of DJS Express, and Publicity Head at CSI.",
  research: "Research areas include explainable AI in healthcare, YOLO-based parking detection, and ayurinformatics integration.",
  skills: "Core stack includes Python, SQL, R, JavaScript, React, Java, C/C++, AWS, GCP, MongoDB, BI tools, and ML libraries.",
  awards: "Awards include 2nd Prize at CMIS Graduate Case Competition 2025 and 3rd Prize at Google Labs x Aggies-in-Tech Makeathon 2025."
};

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
    }, 12);
  }, 420);
}

function resolveReply(raw) {
  const q = (raw || "").toLowerCase();
  if (q.includes("award")) return chatReplies.awards;
  if (q.includes("project") || q.includes("aethermart") || q.includes("aggielink")) return chatReplies.projects;
  if (q.includes("research") || q.includes("paper")) return chatReplies.research;
  if (q.includes("leader")) return chatReplies.leadership;
  if (q.includes("skill") || q.includes("tech")) return chatReplies.skills;
  if (q.includes("experience") || q.includes("intern") || q.includes("ta")) return chatReplies.experience;
  return "I can summarize experience, projects, leadership, research, skills, and awards. Try one of the chips above.";
}

window.chatQuick = (topic) => {
  const prompt = `Summarize ${topic}`;
  appendMessage("user", prompt);
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
  appendMessage("bot", "Hi, I am Mochi. Ask me to summarize any part of Khushi's resume.");
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
if (askBtn) {
  askBtn.addEventListener('click', () => window.chatAsk());
}

if (chatInput) {
  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      window.chatAsk();
    }
  });
}

if (chatWave) {
  window.setTimeout(() => chatWave.classList.add('show'), 250);
  window.setTimeout(() => chatWave.classList.remove('show'), 4200);
}

if (chatLaunch && chatPanel) {
  chatLaunch.addEventListener('click', () => {
    chatPanel.classList.add('open');
    chatLaunch.hidden = true;
    if (chatWave) chatWave.classList.remove('show');
    if (chatInput) chatInput.focus();
  });
}

if (chatClose && chatPanel && chatLaunch) {
  chatClose.addEventListener('click', () => {
    chatPanel.classList.remove('open');
    chatLaunch.hidden = false;
  });
}
