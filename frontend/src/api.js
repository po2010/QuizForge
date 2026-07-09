const API = `${import.meta.env.BASE_URL}api`;

function getToken() {
  return localStorage.getItem("quizforge_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(name, email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function getMe() {
  return request("/auth/me");
}

export function getQuizzes(search = "", tag = "all") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (tag && tag !== "all") params.set("tag", tag);
  return request(`/quizzes?${params}`);
}

export function getQuiz(id) {
  return request(`/quizzes/${id}`);
}

export function getQuizTags() {
  return request("/quizzes/tags");
}

export function getQuizStats() {
  return request("/quizzes/stats");
}

export function createQuiz(data) {
  return request("/quizzes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyQuizzes() {
  return request("/quizzes/my/all");
}

export function verifyRoom(roomCode) {
  return request("/quizzes/verify-room", {
    method: "POST",
    body: JSON.stringify({ roomCode }),
  });
}

export function submitAttempt(quizId, answers, startedAt) {
  return request("/attempts", {
    method: "POST",
    body: JSON.stringify({ quizId, answers, startedAt }),
  });
}

export function getLeaderboard(quizId) {
  const params = quizId ? `?quizId=${quizId}` : "";
  return request(`/attempts${params}`);
}

export function getMyAttempts() {
  return request("/attempts/my");
}