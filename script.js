const KEYS = {
  users: "quizforge_users_v2",
  session: "quizforge_session_v2",
  quizzes: "quizforge_quizzes_v2",
  attempts: "quizforge_attempts_v2",
};

const page = document.body.dataset.page;
const protectedPage = document.body.dataset.protected === "true";

const seedQuizzes = [
  {
    id: "seed-web-basics",
    title: "Web Basics Challenge",
    description: "HTML, CSS, and JavaScript fundamentals for beginners.",
    tags: ["web", "html", "javascript"],
    visibility: "public",
    roomCode: "",
    timer: 30,
    creatorId: "system",
    creatorName: "QuizForge",
    createdAt: "2026-07-09",
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "Which language gives a web page its structure?",
        options: ["HTML", "CSS", "SQL", "JSON"],
        correct: "HTML",
      },
      {
        id: "q2",
        type: "truefalse",
        prompt: "CSS can be used to change colors, spacing, and layout.",
        options: ["True", "False"],
        correct: "True",
      },
      {
        id: "q3",
        type: "fill",
        prompt: "The JavaScript method used to select one matching element is document.____.",
        options: [],
        correct: "querySelector",
      },
    ],
  },
  {
    id: "seed-science-sprint",
    title: "Science Sprint",
    description: "A fast mixed science quiz with multiple question formats.",
    tags: ["science", "school", "quick"],
    visibility: "public",
    roomCode: "",
    timer: 20,
    creatorId: "system",
    creatorName: "QuizForge",
    createdAt: "2026-07-09",
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "What force keeps planets in orbit around the Sun?",
        options: ["Friction", "Gravity", "Magnetism", "Elasticity"],
        correct: "Gravity",
      },
      {
        id: "q2",
        type: "fill",
        prompt: "H2O is commonly called ____.",
        options: [],
        correct: "water",
      },
      {
        id: "q3",
        type: "truefalse",
        prompt: "Plants absorb carbon dioxide during photosynthesis.",
        options: ["True", "False"],
        correct: "True",
      },
    ],
  },
];

let builderQuestions = [];
let activeTag = "all";
let attemptState = null;

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getUsers() {
  return read(KEYS.users, []);
}

function getQuizzes() {
  ensureSeedData();
  return read(KEYS.quizzes, []);
}

function saveQuizzes(quizzes) {
  write(KEYS.quizzes, quizzes);
}

function getAttempts() {
  return read(KEYS.attempts, []);
}

function saveAttempts(attempts) {
  write(KEYS.attempts, attempts);
}

function getSessionId() {
  return localStorage.getItem(KEYS.session);
}

function getCurrentUser() {
  const sessionId = getSessionId();
  return getUsers().find((user) => user.id === sessionId) || null;
}

function setStatus(element, message, type = "") {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = `status-message ${type}`.trim();
}

function ensureSeedData() {
  if (!localStorage.getItem(KEYS.quizzes)) {
    write(KEYS.quizzes, seedQuizzes);
  }
}

function requireAuth() {
  if (protectedPage && !getCurrentUser()) {
    const next = encodeURIComponent(location.pathname.split("/").pop() + location.search);
    location.href = `login.html?next=${next}`;
    return false;
  }

  return true;
}

function setupNav() {
  const user = getCurrentUser();
  const authLink = document.querySelector("[data-auth-link]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  if (authLink) {
    if (user) {
      authLink.textContent = "Logout";
      authLink.href = "#logout";
      authLink.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem(KEYS.session);
        location.href = "index.html";
      });
    } else {
      authLink.textContent = "Login";
      authLink.href = "login.html";
    }
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }
}

function setupRegister() {
  const form = document.querySelector("#register-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name")).trim();
    const email = normalize(data.get("email"));
    const password = String(data.get("password"));
    const status = document.querySelector("[data-status]");
    const users = getUsers();

    if (users.some((user) => user.email === email)) {
      setStatus(status, "An account with this email already exists.", "bad");
      return;
    }

    const user = { id: id("user"), name, email, password, createdAt: new Date().toISOString() };
    users.push(user);
    write(KEYS.users, users);
    localStorage.setItem(KEYS.session, user.id);
    location.href = "dashboard.html";
  });
}

function setupLogin() {
  const form = document.querySelector("#login-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = normalize(data.get("email"));
    const password = String(data.get("password"));
    const status = document.querySelector("[data-status]");
    const user = getUsers().find((item) => item.email === email && item.password === password);

    if (!user) {
      setStatus(status, "Email or password is incorrect.", "bad");
      return;
    }

    localStorage.setItem(KEYS.session, user.id);
    const next = new URLSearchParams(location.search).get("next") || "dashboard.html";
    location.href = next;
  });
}

function quizCard(quiz, options = {}) {
  const card = document.createElement("article");
  card.className = "quiz-card";

  const tags = quiz.tags.map((tag) => `<span class="tag-pill">${tag}</span>`).join("");
  const room = quiz.visibility === "private" ? `<span class="privacy-pill">Room ${quiz.roomCode}</span>` : "";
  const attemptHref = quiz.visibility === "private" ? `quiz.html?id=${quiz.id}&room=${quiz.roomCode}` : `quiz.html?id=${quiz.id}`;

  card.innerHTML = `
    <div class="card-topline">
      <span class="privacy-pill">${quiz.visibility}</span>
      ${room}
    </div>
    <h3>${escapeHtml(quiz.title)}</h3>
    <p>${escapeHtml(quiz.description)}</p>
    <div class="tag-list">${tags}</div>
    <small>${quiz.questions.length} questions | ${quiz.timer}s each | by ${escapeHtml(quiz.creatorName)}</small>
    <div class="card-actions">
      <a class="button primary" href="${attemptHref}">Attempt</a>
      <a class="button secondary" href="leaderboard.html?id=${quiz.id}">Leaderboard</a>
    </div>
  `;

  if (options.manage) {
    const actions = card.querySelector(".card-actions");
    const copy = document.createElement("button");
    copy.className = "button secondary";
    copy.type = "button";
    copy.textContent = "Copy link";
    copy.addEventListener("click", () => {
      const link = `${location.origin}${location.pathname.replace(/[^/]+$/, "")}${attemptHref}`;
      navigator.clipboard?.writeText(link);
      copy.textContent = "Copied";
      setTimeout(() => {
        copy.textContent = "Copy link";
      }, 1200);
    });
    actions.append(copy);
  }

  return card;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupHome() {
  const list = document.querySelector("#quiz-list");
  if (!list) {
    return;
  }

  const search = document.querySelector("#quiz-search");
  const tagFilter = document.querySelector("#tag-filter");
  const roomForm = document.querySelector("[data-room-form]");
  const stat = document.querySelector('[data-stat="quiz-count"]');
  const quizzes = getQuizzes();
  const publicQuizzes = quizzes.filter((quiz) => quiz.visibility === "public");
  const tags = ["all", ...new Set(publicQuizzes.flatMap((quiz) => quiz.tags))];

  stat.textContent = String(quizzes.length);
  tagFilter.innerHTML = "";
  tags.forEach((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tag-pill";
    button.textContent = tag;
    button.addEventListener("click", () => {
      activeTag = tag;
      renderDiscover();
    });
    tagFilter.append(button);
  });

  search.addEventListener("input", renderDiscover);

  roomForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = normalize(new FormData(roomForm).get("roomCode")).toUpperCase();
    const quiz = getQuizzes().find((item) => item.visibility === "private" && item.roomCode.toUpperCase() === code);

    if (quiz) {
      location.href = `quiz.html?id=${quiz.id}&room=${quiz.roomCode}`;
      return;
    }

    alert("No private quiz found for that room number.");
  });

  function renderDiscover() {
    const query = normalize(search.value);
    list.innerHTML = "";
    tagFilter.querySelectorAll(".tag-pill").forEach((button) => {
      button.classList.toggle("active", button.textContent === activeTag);
    });

    const filtered = publicQuizzes.filter((quiz) => {
      const matchesTag = activeTag === "all" || quiz.tags.includes(activeTag);
      const haystack = normalize(`${quiz.title} ${quiz.description} ${quiz.tags.join(" ")}`);
      return matchesTag && haystack.includes(query);
    });

    if (filtered.length === 0) {
      list.innerHTML = '<div class="panel"><h3>No quizzes found</h3><p>Try another search or tag.</p></div>';
      return;
    }

    filtered.forEach((quiz) => list.append(quizCard(quiz)));
  }

  renderDiscover();
}

function setupDashboard() {
  const user = getCurrentUser();
  if (!user || page !== "dashboard") {
    return;
  }

  document.querySelector("[data-user-name]").textContent = user.name;
  const quizzes = getQuizzes().filter((quiz) => quiz.creatorId === user.id);
  const attempts = getAttempts().filter((attempt) => attempt.userId === user.id);
  document.querySelector('[data-dashboard-stat="created"]').textContent = quizzes.length;
  document.querySelector('[data-dashboard-stat="attempts"]').textContent = attempts.length;
  document.querySelector('[data-dashboard-stat="public"]').textContent = quizzes.filter((quiz) => quiz.visibility === "public").length;
  document.querySelector('[data-dashboard-stat="private"]').textContent = quizzes.filter((quiz) => quiz.visibility === "private").length;

  const recent = document.querySelector("#recent-attempts");
  recent.innerHTML = "";
  attempts.slice(-5).reverse().forEach((attempt) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `<strong>${escapeHtml(attempt.quizTitle)}</strong><span>${attempt.score}/${attempt.total} in ${attempt.timeTaken}s</span>`;
    recent.append(item);
  });

  if (!recent.children.length) {
    recent.innerHTML = '<div class="list-item"><strong>No attempts yet</strong><span>Attempt a public quiz to see activity here.</span></div>';
  }
}

function setupCreate() {
  if (page !== "create") {
    return;
  }

  const form = document.querySelector("#quiz-form");
  const type = document.querySelector("#question-type");
  const prompt = document.querySelector("#question-prompt");
  const options = document.querySelector("#question-options");
  const answer = document.querySelector("#question-answer");
  const optionsRow = document.querySelector("#options-row");
  const preview = document.querySelector("#question-preview");
  const status = document.querySelector("[data-builder-status]");
  const visibility = document.querySelector("#visibility-select");
  const roomRow = document.querySelector("#room-code-row");

  type.addEventListener("change", () => {
    optionsRow.hidden = type.value !== "mcq";
    options.value = type.value === "truefalse" ? "True\nFalse" : "";
    answer.placeholder = type.value === "fill" ? "Exact text answer" : "Correct option";
  });

  visibility.addEventListener("change", () => {
    roomRow.hidden = visibility.value !== "private";
  });

  document.querySelector("#add-question").addEventListener("click", () => {
    const question = buildQuestion(type.value, prompt.value, options.value, answer.value);

    if (!question) {
      setStatus(status, "Complete the question fields before adding.", "bad");
      return;
    }

    builderQuestions.push(question);
    prompt.value = "";
    options.value = "";
    answer.value = "";
    renderQuestionPreview(preview);
    setStatus(status, "Question added.", "good");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const user = getCurrentUser();
    const data = new FormData(form);
    const roomCode = String(data.get("roomCode") || "").trim().toUpperCase() || generateRoomCode();

    if (builderQuestions.length === 0) {
      setStatus(status, "Add at least one question before publishing.", "bad");
      return;
    }

    const quiz = {
      id: id("quiz"),
      title: String(data.get("title")).trim(),
      description: String(data.get("description")).trim(),
      tags: String(data.get("tags") || "")
        .split(",")
        .map((tag) => normalize(tag))
        .filter(Boolean),
      visibility: String(data.get("visibility")),
      roomCode: String(data.get("visibility")) === "private" ? roomCode : "",
      timer: Number(data.get("timer")),
      creatorId: user.id,
      creatorName: user.name,
      createdAt: new Date().toISOString(),
      questions: builderQuestions,
    };

    const quizzes = getQuizzes();
    quizzes.push(quiz);
    saveQuizzes(quizzes);
    builderQuestions = [];
    location.href = "my-quizzes.html";
  });

  renderQuestionPreview(preview);
}

function buildQuestion(type, prompt, optionsText, answerText) {
  const cleanPrompt = String(prompt).trim();
  const cleanAnswer = String(answerText).trim();

  if (!cleanPrompt || !cleanAnswer) {
    return null;
  }

  if (type === "mcq") {
    const options = optionsText
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean);

    if (options.length < 2 || !options.includes(cleanAnswer)) {
      return null;
    }

    return { id: id("question"), type, prompt: cleanPrompt, options, correct: cleanAnswer };
  }

  if (type === "truefalse") {
    const normalized = normalize(cleanAnswer);
    if (!["true", "false"].includes(normalized)) {
      return null;
    }

    return {
      id: id("question"),
      type,
      prompt: cleanPrompt,
      options: ["True", "False"],
      correct: normalized === "true" ? "True" : "False",
    };
  }

  return { id: id("question"), type, prompt: cleanPrompt, options: [], correct: cleanAnswer };
}

function renderQuestionPreview(container) {
  container.innerHTML = "";

  if (builderQuestions.length === 0) {
    container.innerHTML = '<div class="list-item"><strong>No questions yet</strong><span>Add at least one to publish.</span></div>';
    return;
  }

  builderQuestions.forEach((question, index) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `<strong>${index + 1}. ${escapeHtml(question.prompt)}</strong><span>${question.type} | answer: ${escapeHtml(question.correct)}</span>`;
    container.append(item);
  });
}

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function setupMyQuizzes() {
  if (page !== "my-quizzes") {
    return;
  }

  const user = getCurrentUser();
  const list = document.querySelector("#my-quiz-list");
  const quizzes = getQuizzes().filter((quiz) => quiz.creatorId === user.id);
  list.innerHTML = "";

  if (quizzes.length === 0) {
    list.innerHTML = '<div class="panel"><h2>No quizzes yet</h2><p>Create your first quiz and publish it.</p><a class="button primary" href="create.html">Create quiz</a></div>';
    return;
  }

  quizzes.forEach((quiz) => list.append(quizCard(quiz, { manage: true })));
}

function setupAttempt() {
  if (page !== "quiz") {
    return;
  }

  const params = new URLSearchParams(location.search);
  const quiz = getQuizzes().find((item) => item.id === params.get("id"));
  const gate = document.querySelector("#room-gate");
  const panel = document.querySelector("#attempt-panel");

  if (!quiz) {
    panel.hidden = false;
    panel.innerHTML = '<h1>Quiz not found</h1><p>This quiz may have been removed.</p><a class="button primary" href="index.html">Back to discover</a>';
    return;
  }

  document.querySelector("#attempt-leaderboard").href = `leaderboard.html?id=${quiz.id}`;

  if (quiz.visibility === "private" && params.get("room") !== quiz.roomCode) {
    gate.hidden = false;
    document.querySelector("#room-unlock-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const code = String(new FormData(event.currentTarget).get("roomCode")).trim().toUpperCase();
      if (code === quiz.roomCode) {
        location.href = `quiz.html?id=${quiz.id}&room=${quiz.roomCode}`;
      } else {
        setStatus(document.querySelector("[data-room-status]"), "Incorrect room number.", "bad");
      }
    });
    return;
  }

  panel.hidden = false;
  startAttempt(quiz);
}

function startAttempt(quiz) {
  attemptState = {
    quiz,
    index: 0,
    score: 0,
    answers: [],
    startedAt: Date.now(),
    timeLeft: quiz.timer,
    timerId: null,
    answered: false,
  };
  renderAttemptQuestion();
}

function renderAttemptQuestion() {
  const state = attemptState;
  const question = state.quiz.questions[state.index];
  state.answered = false;
  state.timeLeft = state.quiz.timer;

  document.querySelector("#attempt-category").textContent = state.quiz.title;
  document.querySelector("#attempt-timer").textContent = `${state.timeLeft}s`;
  document.querySelector("#attempt-count").textContent = `Question ${state.index + 1} of ${state.quiz.questions.length}`;
  document.querySelector("#attempt-score").textContent = `Score ${state.score}`;
  document.querySelector("#attempt-progress").style.width = `${(state.index / state.quiz.questions.length) * 100}%`;
  document.querySelector("#attempt-question").textContent = question.prompt;
  document.querySelector("#attempt-feedback").textContent = "";
  document.querySelector("#attempt-feedback").className = "feedback";
  document.querySelector("#attempt-next").disabled = true;
  document.querySelector("#attempt-next").textContent = state.index === state.quiz.questions.length - 1 ? "Finish" : "Next";

  const answers = document.querySelector("#attempt-answers");
  answers.innerHTML = "";

  if (question.type === "fill") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Type your answer";
    const submit = document.createElement("button");
    submit.className = "button primary";
    submit.type = "button";
    submit.textContent = "Submit answer";
    submit.addEventListener("click", () => gradeAttempt(input.value));
    answers.append(input, submit);
  } else {
    question.options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "answer-button";
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => gradeAttempt(option, button));
      answers.append(button);
    });
  }

  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    document.querySelector("#attempt-timer").textContent = `${state.timeLeft}s`;
    if (state.timeLeft <= 0) {
      gradeAttempt("");
    }
  }, 1000);
}

function gradeAttempt(answer, selectedButton) {
  const state = attemptState;
  if (state.answered) {
    return;
  }

  const question = state.quiz.questions[state.index];
  const correct = normalize(answer) === normalize(question.correct);
  state.answered = true;
  clearInterval(state.timerId);

  if (correct) {
    state.score += 1;
  }

  state.answers.push({ questionId: question.id, answer, correct });
  document.querySelector("#attempt-score").textContent = `Score ${state.score}`;
  const feedback = document.querySelector("#attempt-feedback");
  feedback.textContent = correct ? "Correct answer." : `Correct answer: ${question.correct}`;
  feedback.classList.add(correct ? "good" : "bad");

  document.querySelectorAll(".answer-button").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("correct", normalize(button.textContent) === normalize(question.correct));
  });

  if (selectedButton && !correct) {
    selectedButton.classList.add("wrong");
  }

  document.querySelector("#attempt-next").disabled = false;
}

function setupAttemptNext() {
  const button = document.querySelector("#attempt-next");
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    attemptState.index += 1;
    if (attemptState.index >= attemptState.quiz.questions.length) {
      finishAttempt();
      return;
    }
    renderAttemptQuestion();
  });
}

function finishAttempt() {
  const state = attemptState;
  const user = getCurrentUser();
  const timeTaken = Math.round((Date.now() - state.startedAt) / 1000);
  const attempt = {
    id: id("attempt"),
    quizId: state.quiz.id,
    quizTitle: state.quiz.title,
    userId: user.id,
    userName: user.name,
    score: state.score,
    total: state.quiz.questions.length,
    timeTaken,
    createdAt: new Date().toISOString(),
  };

  const attempts = getAttempts();
  attempts.push(attempt);
  saveAttempts(attempts);

  const panel = document.querySelector("#attempt-panel");
  panel.innerHTML = `
    <span class="eyebrow">Round complete</span>
    <h1>You scored ${attempt.score}/${attempt.total}</h1>
    <p>Your result has been saved to this quiz leaderboard.</p>
    <div class="hero-actions">
      <a class="button primary" href="leaderboard.html?id=${state.quiz.id}">View leaderboard</a>
      <a class="button secondary" href="index.html">Discover more</a>
    </div>
  `;
}

function setupLeaderboard() {
  if (page !== "leaderboard") {
    return;
  }

  const params = new URLSearchParams(location.search);
  const quiz = getQuizzes().find((item) => item.id === params.get("id"));
  const title = document.querySelector("#leaderboard-title");
  const subtitle = document.querySelector("#leaderboard-subtitle");
  const table = document.querySelector("#leaderboard-table");

  if (!quiz) {
    title.textContent = "All quiz attempts";
    subtitle.textContent = "Choose a quiz from Discover to see a specific leaderboard.";
  } else {
    title.textContent = quiz.title;
    subtitle.textContent = `${quiz.questions.length} questions | ${quiz.timer}s each | ${quiz.visibility}`;
  }

  const attempts = getAttempts()
    .filter((attempt) => !quiz || attempt.quizId === quiz.id)
    .sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);

  table.innerHTML = "";
  if (attempts.length === 0) {
    table.innerHTML = '<div class="leaderboard-row"><strong>No attempts yet</strong><span>Be the first to play this quiz.</span></div>';
    return;
  }

  attempts.forEach((attempt, index) => {
    const row = document.createElement("div");
    row.className = "leaderboard-row";
    row.innerHTML = `
      <div><strong>#${index + 1} ${escapeHtml(attempt.userName)}</strong><span>${escapeHtml(attempt.quizTitle)}</span></div>
      <div><strong>${attempt.score}/${attempt.total}</strong><span>${attempt.timeTaken}s</span></div>
    `;
    table.append(row);
  });
}

if (requireAuth()) {
  setupNav();
  setupRegister();
  setupLogin();
  setupHome();
  setupDashboard();
  setupCreate();
  setupMyQuizzes();
  setupAttempt();
  setupAttemptNext();
  setupLeaderboard();
}
