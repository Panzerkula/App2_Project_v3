import { api } from "../modules/api.mjs";

const app = document.getElementById("app");
let currentUser = null;

// ---------------- Utilities ----------------

function totalScore(player) {
  return player.scores.reduce((sum, s) => sum + s, 0);
}

async function loadView(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load view: ${path}`);
  return await res.text();
}

// ---------------- View Navigation ----------------

async function showSignUp() {
  app.innerHTML = await loadView("/views/signup_view.html");
  wireSignup();
  wireTosLink();
  wireBackToSignIn();
}

async function showSignIn() {
  app.innerHTML = await loadView("/views/login_view.html");
  wireLogin();
  wireCreateAccountLink();
}

async function showTosView() {
  app.innerHTML = await loadView("/views/terms_of_service.html");
  wireBackFromTos();
}

async function showDashBoard() {
  app.innerHTML = await loadView("/views/dashboard_view.html");
  renderDashboardView();
  wireLogout();
  wireCreateGame();
  wireUserView();
  loadGames();
}

async function showUserView() {
  app.innerHTML = await loadView("/views/account_view.html");
  renderAccountView(currentUser);
  wireEditAccount();
  wireDeleteAccount();
  wireBackToDashboard();
}

async function showEditUser() {
  app.innerHTML = await loadView("/views/edit_view.html");
  wireEditForm();
  wireReturnFromEdit();
}

async function showGameDetail(game) {
  const html = await loadView("/views/game_view.html");
  app.innerHTML = html;
  renderGameView(game);
  wireBackToDashboard();
}

// ---------------- Game Rendering ----------------

function renderGameView(game) {
  renderScoresTable(game);

  const waitingControls = document.getElementById("waiting-controls");
  const roundControls = document.getElementById("round-controls");
  const finishBtn = document.getElementById("finish-game-btn");

  if (waitingControls) waitingControls.hidden = true;
  if (roundControls) roundControls.hidden = true;
  if (finishBtn) finishBtn.hidden = true;

  if (game.status === "waiting") {
    if (waitingControls) waitingControls.hidden = false;

    wireAddPlayer(game.id);
    wireStartGame(game.id);
  } else if (game.status === "started") {
    if (roundControls) roundControls.hidden = false;
    if (finishBtn) finishBtn.hidden = false;

    renderRoundInputs(game);
    wireAddRound(game.id);
    wireFinishGame(game.id);
  } else if (game.status === "finished") {
    if (roundControls) roundControls.hidden = true;
    if (finishBtn) finishBtn.hidden = false;
  }
}

function renderScoresTable(game) {
  const headRow = document.getElementById("scores-head-row");
  const body = document.getElementById("scores-body");

  body.innerHTML = "";
  headRow.querySelectorAll(".round-col").forEach((el) => el.remove());

  const rounds = game.players[0]?.scores.length || 0;
  const totalHeader = headRow.lastElementChild;

  for (let i = 0; i < rounds; i++) {
    const th = document.createElement("th");
    th.textContent = `Round ${i + 1}`;
    th.classList.add("round-col");
    headRow.insertBefore(th, totalHeader);
  }

  for (const player of game.players) {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.textContent = player.username;
    tr.appendChild(nameTd);

    for (const score of player.scores) {
      const td = document.createElement("td");
      td.textContent = score;
      tr.appendChild(td);
    }

    const totalTd = document.createElement("td");
    totalTd.innerHTML = `<strong>${totalScore(player)}</strong>`;
    tr.appendChild(totalTd);

    body.appendChild(tr);
  }
}

function renderRoundInputs(game) {
  const container = document.getElementById("score-inputs");
  container.innerHTML = "";

  for (const player of game.players) {
    const row = document.createElement("div");
    row.className = "score-row";

    const label = document.createElement("span");
    label.className = "player-name";
    label.textContent = player.username;

    const input = document.createElement("input");
    input.type = "number";
    input.dataset.user = player.username;

    row.append(label, input);
    container.appendChild(row);
  }
}

// ---------------- Auth ----------------

async function loadCurrentUser() {
  try {
    currentUser = await api.me();
    showDashBoard();
  } catch {
    showSignIn();
  }
}

function wireSignup() {
  const form = document.getElementById("signup-form");
  const output = document.getElementById("output");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      username: form.username.value,
      password: form.password.value,
      mail: form.mail.value,
      acceptTos: form.acceptTos.checked,
    };

    try {
      await api.signup(payload);
      showSignIn();
    } catch (err) {
      output.textContent = err.message;
    }
  });
}

function wireLogin() {
  const form = document.getElementById("login-form");
  const output = document.getElementById("output");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      username: form.username.value,
      password: form.password.value,
    };

    try {
      await api.login(payload);
      loadCurrentUser();
    } catch (err) {
      output.textContent = err.message;
    }
  });
}

function wireLogout() {
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await api.logout();
    showSignIn();
  });
}

function wireCreateAccountLink() {
  const link = document.getElementById("create-account-link");
  if (!link) return;

  link.addEventListener("click", (e) => {
    e.preventDefault();
    showSignUp();
  });
}

function wireTosLink() {
  const tosLink = document.getElementById("tos-link");
  if (!tosLink) return;

  tosLink.addEventListener("click", (e) => {
    e.preventDefault();
    showTosView();
  });
}

function wireBackFromTos() {
  const btn = document.getElementById("back-from-tos-btn");
  if (!btn) return;

  btn.addEventListener("click", showSignUp);
}

// ---------------- Dashboard ----------------

function renderDashboardView() {
  document.getElementById("username").textContent = currentUser.username;

  const img = document.getElementById("profile-pic");
  img.src = currentUser.profilePic;
  img.onerror = () => (img.src = "/assets/no_pic.png");
}

async function loadGames() {
  const list = document.getElementById("games-list");

  try {
    const games = await api.getGames();

    if (!games.length) {
      list.innerHTML = "<li>No games yet</li>";
      return;
    }

    list.innerHTML = "";

    for (const game of games) {
      const li = document.createElement("li");
      li.textContent = `${game.name} (${game.status})`;
      li.addEventListener("click", () => selectGame(game.id));
      list.appendChild(li);
    }
  } catch {
    console.log("Failed to load games");
  }
}

async function selectGame(gameId) {
  try {
    const game = await api.getGame(gameId);
    showGameDetail(game);
  } catch {
    console.log("Failed to load game");
  }
}

// ------------------ Account -------------------

function renderAccountView(user) {
  document.getElementById("account-username").textContent = user.username;
  document.getElementById("account-email").textContent = user.mail;

  const img = document.getElementById("profile-pic");
  img.src = user.profilePic || "/assets/no_pic.png";
}

function wireUserView() {
  const btn = document.getElementById("user-view-btn");
  if (!btn) return;

  btn.addEventListener("click", showUserView);
}

function wireEditAccount() {
  const btn = document.getElementById("edit-user-btn");
  if (!btn) return;

  btn.addEventListener("click", showEditUser);
}

function wireDeleteAccount() {
  const btn = document.getElementById("delete-user-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;

    try {
      await api.deleteMe();
      showSignIn();
    } catch {
      alert("Failed to delete account");
    }
  });
}

function wireEditForm() {
  const form = document.getElementById("edit-form");
  const output = document.getElementById("output");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      username: form.username.value || undefined,
      password: form.password.value || undefined,
    };

    try {
      await api.updateMe(payload);
      await loadCurrentUser();
    } catch (err) {
      output.textContent = err.message;
    }
  });
}

function wireReturnFromEdit() {
  const btn = document.getElementById("return-to-loggedIn");
  if (!btn) return;

  btn.addEventListener("click", showDashBoard);
}

function wireBackToSignIn() {
  const link = document.getElementById("back-to-signin-link");
  if (!link) return;

  link.addEventListener("click", (e) => {
    e.preventDefault();
    showSignIn();
  });
}

// ---------------- Game Actions ----------------

function wireCreateGame() {
  document
    .getElementById("create-game-btn")
    .addEventListener("click", async () => {
      const name = prompt("Name your game:");
      if (!name) return;

      try {
        await api.createGame(name);
        loadGames();
      } catch {
        console.log("Failed to create game");
      }
    });
}

function wireAddPlayer(gameId) {
  const btn = document.getElementById("add-player-btn");
  const input = document.getElementById("new-player-name");

  btn.addEventListener("click", async () => {
    const username = input.value.trim();
    if (!username) return;

    try {
      await api.addPlayer(gameId, username);
      selectGame(gameId);
    } catch {
      console.log("Could not add player");
    }
  });
}

function wireStartGame(gameId) {
  const btn = document.getElementById("start-game-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    if (!confirm("Start the game? Players will be locked.")) return;

    try {
      await api.startGame(gameId);
      selectGame(gameId);
    } catch {
      console.log("Failed to start game");
    }
  });
}

function wireAddRound(gameId) {
  document
    .getElementById("add-round-btn")
    .addEventListener("click", async () => {
      const inputs = document.querySelectorAll("#score-inputs input");

      const scores = [...inputs].map((input) => ({
        username: input.dataset.user,
        score: Number(input.value || 0),
      }));

      try {
        await api.addScores(gameId, scores);
        selectGame(gameId);
      } catch {
        console.log("Failed to add scores");
      }
    });
}

function wireFinishGame(gameId) {
  const btn = document.getElementById("finish-game-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    if (!confirm("Finish and save this game?")) return;

    try {
      await api.finishGame(gameId);
      showDashBoard();
    } catch {
      console.log("Failed to finish game");
    }
  });
}

function wireBackToDashboard() {
  const btn = document.getElementById("back-to-dashboard-btn");
  if (!btn) return;

  btn.addEventListener("click", showDashBoard);
}

// ---------------- Init ----------------

loadCurrentUser();
