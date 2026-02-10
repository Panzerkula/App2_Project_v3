const app = document.getElementById("app");
let currentUser = null;

function totalScore(player) {
  return player.scores.reduce((sum, s) => sum + s, 0);
}

async function loadView(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load view: ${path}`);
  }
  return await res.text();
}

// --------------innerHTML----------------

function gameDetailHTML(game) {
  return `
    <div class="app-header">
      <img src="/assets/header.svg" alt="Game Score Tracker">
    </div>
    
    <section id="detailView-section">

      ${
        game.status === "waiting"
          ? `
        <h3>Add Player</h3>
        <input id="new-player-name" type="text" placeholder="Player name" maxlength="20"/>
        <button id="add-player-btn">Add Player</button>
        <button id="start-game-btn">Start Game</button>
      `
          : ""
      }

      <h3>Scores</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Player</th>
            ${game.players[0]?.scores
              .map((_, i) => `<th>Round ${i + 1}</th>`)
              .join("")}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${game.players
              .map(
                (p) => `
            <tr>
            <td>${p.username}</td>
            ${p.scores.map((s) => `<td>${s}</td>`).join("")}
            <td><strong>${totalScore(p)}</strong></td>
          </tr>
          `,
              )
              .join("")}
        </tbody>
      </table>

      ${
        game.status === "started"
          ? `
        <h3>Add Round</h3>
        <div id="score-inputs">
          ${game.players
            .map(
              (p) => `
            <div class="score-row">
              <span class="player-name">${p.username}</span>
              <input type="number" data-user="${p.username}" maxlength="20"/>
            </div>
          `,
            )
            .join("")}
        </div>
        <button id="add-round-btn">Add Round</button>
      `
          : ""
      }

      <button id="back-to-dashboard-btn">Home</button>

      ${
        game.status === "started"
          ? `
        <button id="finish-game-btn">Finish Game</button>
      `
          : ""
      }
    </section>
  `;
}

// ----------------Ui handlers----------------

async function showSignUp() {
  app.innerHTML = await loadView("/views/signup_view.html");
  wireSignup();
  wireTosModal();
  wireBackToSignIn();
}

async function showSignIn() {
  app.innerHTML = await loadView("/views/login_view.html");
  wireLogin();
  wireCreateAccountLink();
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
  app.innerHTML = await loadView("views/account_view.html");
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

function showGameDetail(game) {
  app.innerHTML = gameDetailHTML(game);
  wireBackToDashboard();

  if (game.status === "waiting") {
    wireAddPlayer(game.id);
    wireStartGame(game.id);
  }

  if (game.status === "started") {
    wireAddRound(game.id);
    wireFinishGame(game.id);
  }
}

// ----------------Check me----------------

async function loadCurrentUser() {
  const res = await fetch("/auth/me", {
    credentials: "same-origin",
  });

  if (!res.ok) {
    showSignIn();
    return;
  }

  const user = await res.json();
  currentUser = user;
  showDashBoard();
}

// ----------------Signup----------------

function wireSignup() {
  const signupForm = document.getElementById("signup-form");
  const output = document.getElementById("output");

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      username: signupForm.username.value,
      password: signupForm.password.value,
      mail: signupForm.mail.value,
      acceptTos: signupForm.acceptTos.checked,
    };

    const res = await fetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);

    if (res.ok) {
      showSignIn();
    }
  });
}

function wireCreateAccountLink() {
  const link = document.getElementById("create-account-link");

  link.addEventListener("click", (e) => {
    e.preventDefault();
    showSignUp();
  });
}

// ----------------Login----------------

function wireLogin() {
  const loginForm = document.getElementById("login-form");
  const output = document.getElementById("output");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      username: loginForm.username.value,
      password: loginForm.password.value,
    };

    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);

    if (res.ok) {
      loadCurrentUser();
    }
  });
}

function wireBackToSignIn() {
  const link = document.getElementById("back-to-signin-link");

  link.addEventListener("click", (e) => {
    e.preventDefault();
    showSignIn();
  });
}

function renderDashboardView() {
  document.getElementById("username").textContent = currentUser.username;

  const img = document.getElementById("profile-pic");
  img.src = currentUser.profilePic;
  img.onerror = () => (img.src = "/assets/no_pic.png");
}

// ----------------Logout----------------

function wireLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn.addEventListener("click", async () => {
    await fetch("/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });

    showSignIn();
  });
}

// ---------------User view---------------

function wireUserView() {
  document
    .getElementById("user-view-btn")
    .addEventListener("click", showUserView);
}

// -------------Delete Account-------------

function wireDeleteAccount() {
  const btn = document.getElementById("delete-user-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const confirmed = confirm("Are you sure you want to delete your account?");

    if (!confirmed) return;

    const res = await fetch("/auth/me", {
      method: "DELETE",
      credentials: "same-origin",
    });

    if (res.ok) {
      showSignIn();
    }
  });
}

// --------------Edit account---------------

function renderAccountView(user) {
  document.getElementById("account-username").textContent = user.username;
  document.getElementById("account-email").textContent = user.mail;

  const img = document.getElementById("profile-pic");
  img.src = user.profilePic || "/assets/no_pic.png";
}

function wireEditAccount() {
  const btn = document.getElementById("edit-user-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    showEditUser(currentUser);
  });
}

function wireEditForm() {
  const editForm = document.getElementById("edit-form");
  const output = document.getElementById("output");

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      username: editForm.username.value || undefined,
      password: editForm.password.value || undefined,
    };

    const res = await fetch("/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);

    if (res.ok) {
      await loadCurrentUser();
    }
  });
}

function wireReturnFromEdit() {
  const returnBtn = document.getElementById("return-to-loggedIn");

  returnBtn.addEventListener("click", () => {
    showDashBoard();
  });
}

// ------------------ToS-------------------

function wireTosModal() {
  const tosLink = document.getElementById("tos-link");
  const modal = document.getElementById("tos-modal");
  const closeTos = document.getElementById("close-tos");
  const tosBody = document.getElementById("tos-body");

  tosLink.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!tosBody.textContent) {
      const res = await fetch("/terms_of_service.md");
      console.log("ToS status:", res.status);
      const text = await res.text();
      tosBody.textContent = text;
    }

    modal.classList.remove("hidden");
  });

  closeTos.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
}

//-----------------Create game------------------------

function wireCreateGame() {
  const btn = document.getElementById("create-game-btn");

  btn.addEventListener("click", async () => {
    const name = prompt("Name your game:");

    if (!name) return;
    const res = await fetch("/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      alert("Failed to create game");
      return;
    }

    await loadGames();
  });
}

//------------------Load games------------------------

async function loadGames() {
  const list = document.getElementById("games-list");
  list.innerHTML = "<li>Loading...</li>";

  const res = await fetch("/games", {
    credentials: "same-origin",
  });

  if (!res.ok) {
    list.innerHTML = "<li>Failed to load games</li>";
    return;
  }

  const games = await res.json();

  if (games.length === 0) {
    list.innerHTML = "<li>No games yet</li>";
    return;
  }

  list.innerHTML = "";

  for (const game of games) {
    const li = document.createElement("li");
    li.textContent = `${game.name} (${game.status})`;

    li.addEventListener("click", () => {
      selectGame(game.id);
    });

    list.appendChild(li);
  }
}

//-----------------Game Details-----------------

async function selectGame(gameId) {
  const res = await fetch(`/games/${gameId}`, {
    credentials: "same-origin",
  });

  if (!res.ok) {
    alert("Failed to load game");
    return;
  }

  const game = await res.json();
  showGameDetail(game);
}

//------------------Add player------------------

function wireAddPlayer(gameId) {
  const btn = document.getElementById("add-player-btn");
  const input = document.getElementById("new-player-name");

  btn.addEventListener("click", async () => {
    const username = input.value.trim();
    if (!username) return;

    const res = await fetch(`/games/${gameId}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      alert("Could not add player");
      return;
    }

    selectGame(gameId);
  });
}

//-----------------Start game---------------------

function wireStartGame(gameId) {
  const btn = document.getElementById("start-game-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const confirmed = confirm("Start the game? Players will be locked.");
    if (!confirmed) return;

    const res = await fetch(`/games/${gameId}/start`, {
      method: "POST",
      credentials: "same-origin",
    });

    if (!res.ok) {
      alert("Failed to start game");
      return;
    }

    selectGame(gameId);
  });
}

//-----------------Add round---------------------

function wireAddRound(gameId) {
  const btn = document.getElementById("add-round-btn");

  btn.addEventListener("click", async () => {
    const inputs = document.querySelectorAll("#score-inputs input");

    const scores = [...inputs].map((input) => ({
      username: input.dataset.user,
      score: Number(input.value || 0),
    }));

    const res = await fetch(`/games/${gameId}/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ scores }),
    });

    if (!res.ok) {
      alert("Failed to add scores");
      return;
    }

    selectGame(gameId);
  });
}

//---------------Finish Game-------------------

function wireFinishGame(gameId) {
  const btn = document.getElementById("finish-game-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const confirmed = confirm("Finish and save this game?");
    if (!confirmed) return;

    const res = await fetch(`/games/${gameId}/finish`, {
      method: "POST",
      credentials: "same-origin",
    });

    if (!res.ok) {
      alert("Failed to finish game");
      return;
    }

    showDashBoard();
  });
}

//-------------Back to Dashboard---------------

function wireBackToDashboard() {
  const btn = document.getElementById("back-to-dashboard-btn");

  if (!btn) return;
  btn.addEventListener("click", async () => {
    showDashBoard();
  });
}

//-----------------------------------------------

loadCurrentUser();
