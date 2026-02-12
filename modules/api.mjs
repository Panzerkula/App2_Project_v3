async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "API error");
  }

  return data;
}

export const api = {

  // ---------- Auth ----------
  
  signup: (payload) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request("/auth/logout", { method: "POST" }),

  me: () =>
    request("/auth/me"),

  updateMe: (payload) =>
    request("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteMe: () =>
    request("/auth/me", { method: "DELETE" }),

  // ---------- Games ----------

  getGames: () =>
    request("/games"),

  getGame: (id) =>
    request(`/games/${id}`),

  createGame: (name) =>
    request("/games", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  addPlayer: (gameId, username) =>
    request(`/games/${gameId}/players`, {
      method: "POST",
      body: JSON.stringify({ username }),
    }),

  startGame: (gameId) =>
    request(`/games/${gameId}/start`, {
      method: "POST",
    }),

  addScores: (gameId, scores) =>
    request(`/games/${gameId}/scores`, {
      method: "POST",
      body: JSON.stringify({ scores }),
    }),

  finishGame: (gameId) =>
    request(`/games/${gameId}/finish`, {
      method: "POST",
    }),
};