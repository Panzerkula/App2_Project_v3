const app = document.getElementById("app");
let currentUser = null;

function totalScore(player) {
  return player.scores.reduce((sum, s) => sum + s, 0);
}

// --------------innerHTML----------------

function signInHTML() {
  return `
    <img src="/assets/header.png">

    <section id="login-section">
      <h2>Login</h2>
      <form id="login-form">
        <input name="username" type="text" placeholder="Username" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
        <p>Don't have an account? Click <a href="#" id="create-account-link">here</p>
      </form>
    </section>

    <pre id="output"></pre>
  `
}

function signUpHTML() {
  return `
    <img src="/assets/header.png">

    <section id="signup-section">
      <h2>Create Account</h2>
      <form id="signup-form">
        <input name="username" type="text" placeholder="Username" required />
        <input name="password" type="password" placeholder="Password" required />
        <input name="mail" type="email" placeholder="Email" required />

        <label>
          <input type="checkbox" name="acceptTos" />
          I accept the <a href="#" id="tos-link">Terms of Service and Data Privacy Policy</a>
        </label>

        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already have an account?
        <a href="#" id="back-to-signin-link">Log in</a>
      </p>
    </section>
    <div id="tos-modal" class="modal hidden">
      <div class="modal-content">
        <button id="close-tos">&times;</button>
          <pre id="tos-body"></pre>
        </div>
      </div>
    </div>

    <pre id="output"></pre>
  `;
}

function loggedInHTML(user) {
  return `
    <img src="/assets/header.png">

    <section id="dashboard-section">
      <h2>Welcome, <span id="username">${user.username}</span></h2>

      <img
        id="profile-pic"
        src="${user.profilePic}"
        alt="Profile picture"
        style="width:120px; height:120px; border-radius:50%; object-fit:cover;"
        onerror="this.src='/assets/no_pic.png'">
      
      <button id="create-game-btn">+ New Game</button>

      <h3>Your Games</h3>
      <ul id="games-list"></ul>

      <button id="user-view-btn">Account</button>
      <button id="logout-btn">Logout</button>
    </section>

    <pre id="output"></pre>
  `;
}

function userViewHTML(user) {
  return `
    <img src="/assets/header.png">

    <section id="user-section">
      <h2>Your Account</h2>
      <img
        id="profile-pic"
        src="${user.profilePic}"
        alt="Profile picture"
        style="width:120px;height:120px;border-radius:50%;object-fit:cover;">

      <p><strong>Username:</strong> ${user.username}</p>
      <p><strong>Email:</strong> ${user.mail}</p>

      <button id="edit-user-btn">Edit account</button>
      <button id="delete-user-btn">Delete account</button>
      <button id="back-to-dashboard-btn">Home</button>
    </section>

    <pre id="output"></pre>
  `;
}

function editAccountHTML() {
  return `
    <img src="/assets/header.png">

    <section id="editAccount-section">
      <h2>Edit Account</h2>

      <form id="edit-form">
        <input name="username" type="text" placeholder="New username (optional)" />
        <input name="password" type="password" placeholder="New password (optional)" />

        <button type="submit">Confirm</button>
        <button type="button" id="return-to-loggedIn">Home</button>
      </form>
    </section>

    <pre id="output"></pre>
  `;
}

function gameDetailHTML(game) {
  return `
    <img src="/assets/header.png">
    <section id="detailView-section">

      ${game.status !== "finished" ? `
        <h3>Add Player</h3>
        <input id="new-player-name" type="text" placeholder="Player name" />
        <button id="add-player-btn">Add Player</button> ` : ""}

      <h3>Scores</h3>
      <table border="0.1">
        <thead>
          <tr>
            <th>Player</th>
            ${game.players[0]?.scores.map((_, i) =>
              `<th>Round ${i + 1}</th>`).join("")}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${game.players.map(p => `
            <tr>
            <td>${p.username}</td>
            ${p.scores.map(s => `<td>${s}</td>`).join("")}
            <td><strong>${totalScore(p)}</strong></td>
          </tr>
          `).join("")}
        </tbody>
      </table>

      ${game.status !== "finished" ? `
      <h3>Add Round</h3>
      <div id="score-inputs">
        ${game.players.map(p =>
        `<div>${p.username}:<input type="number" data-user="${p.username}" /></div>
        `).join("")}
      </div>
      <button id="add-round-btn">Add Round</button>
      ` : ""}
      <button id="back-to-dashboard-btn">Home</button>
      ${game.status !== "finished" ? ` <button id="finish-game-btn">Finish Game</button> ` : ""}
  `;
}

// ----------------Ui handlers----------------

function showSignUp() {
  app.innerHTML = signUpHTML();
  wireSignup();
  wireTosModal();
  wireBackToSignIn();
}

function showSignIn() {
  app.innerHTML = signInHTML();
  wireLogin();
  wireCreateAccountLink();
}

function showDashBoard() {
  app.innerHTML = loggedInHTML(currentUser);
  wireLogout();
  wireCreateGame();
  wireUserView();
  loadGames();
}

function showUserView() {
  app.innerHTML = userViewHTML(currentUser);
  wireEditAccount();
  wireDeleteAccount();
  wireBackToDashboard();
}

function showEditUser(user) {
  app.innerHTML = editAccountHTML(user);
  wireEditForm();
  wireReturnFromEdit();
}

function showGameDetail(game) {
  app.innerHTML = gameDetailHTML(game);
  wireBackToDashboard();
  if (game.status !== "finished") { 
    wireAddPlayer(game.id); 
    wireAddRound(game.id);
    wireFinishGame(game.id);
  }

}

// ----------------Check me----------------

async function loadCurrentUser() {
  const res = await fetch("/auth/me", {
    credentials: "same-origin"
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
      acceptTos: signupForm.acceptTos.checked
    };

    const res = await fetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload)
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
      password: loginForm.password.value
    };

    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload)
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

// ----------------Logout----------------

function wireLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn.addEventListener("click", async () => {
    await fetch("/auth/logout", {
      method: "POST",
      credentials: "same-origin"
    });

    showSignIn();
  });
}

// ---------------User view---------------

function wireUserView() {
  document.getElementById("user-view-btn").addEventListener("click", showUserView);
}

// -------------Delete Account-------------

function wireDeleteAccount() {

  const btn = document.getElementById("delete-user-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account?"
    );

    if (!confirmed) return;

    const res = await fetch("/auth/me", {
      method: "DELETE",
      credentials: "same-origin"
    });

    if (res.ok) {
      showSignIn();
    }
  });
}

// --------------Edit account---------------

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
      password: editForm.password.value || undefined
    };

    const res = await fetch("/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload)
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
      body: JSON.stringify({ name })
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
    credentials: "same-origin"
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
    credentials: "same-origin"
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
      body: JSON.stringify({ username })
    });

    if (!res.ok) {
      alert("Could not add player");
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

    const scores = [...inputs].map(input => ({
      username: input.dataset.user,
      score: Number(input.value || 0)
    }));

    const res = await fetch(`/games/${gameId}/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ scores })
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
      credentials: "same-origin"
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
  })
}

//-----------------------------------------------

loadCurrentUser();