const app = document.getElementById("app");

// --------------innerHTML----------------

function loggedOutHTML() {
  return `
    <h1>Mexican Train Score Tracker</h1>

    <section id="signup-section">
      <h2>Create Account</h2>
      <form id="signup-form">
        <input name="username" type="text" placeholder="Username" required />
        <input name="password" type="password" placeholder="Password" required />
        <input name="mail" type="text" placeholder="Email" required />

        <label>
          <input type="checkbox" name="acceptTos" />I accept the <a href="#" id="tos-link">Terms of Service</a>
        </label>

        <div id="tos-modal" class="modal hidden">
          <div class="modal-content">
          <button id="close-tos">&times;</button>
          <div id="tos-body"></div>
        </div>
      </div>

        <button type="submit">Sign Up</button>
      </form>
    </section>

    <section id="login-section">
      <p>Or if you already have an account:</p>
      <h2>Login</h2>
      <form id="login-form">
        <input name="username" type="text" placeholder="Username" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </section>

    <pre id="output"></pre>
  `;
}

function loggedInHTML(username) {
  return `
    <h1>Mexican Train Score Tracker</h1>

    <section id="logoutDelete-section">
      <h2>Welcome <span id="username">${username}</span></h2>
      <button id="logout-btn">Logout</button>
      <button id="delete-account-btn">Delete Account</button>
    </section>

    <pre id="output"></pre>
  `;
}

// ----------------Ui----------------

function showLoggedOutUI() {
  app.innerHTML = loggedOutHTML();
  wireSignup();
  wireLogin();
  wireTosModal();
}

function showLoggedInUI(username) {
  app.innerHTML = loggedInHTML(username);
  wireLogout();
  wireDeleteAccount();
}

// ----------------Check me----------------

async function loadCurrentUser() {
  const res = await fetch("/auth/me", {
    credentials: "same-origin"
  });

  if (!res.ok) {
    showLoggedOutUI();
    return;
  }

  const user = await res.json();
  showLoggedInUI(user.username);
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

// ----------------Logout----------------

function wireLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn.addEventListener("click", async () => {
    await fetch("/auth/logout", {
      method: "POST",
      credentials: "same-origin"
    });

    showLoggedOutUI();
  });
}

// -------------Delete Account-------------

function wireDeleteAccount() {
  const deleteAccountBtn =
    document.getElementById("delete-account-btn");

  deleteAccountBtn.addEventListener("click", async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account?"
    );

    if (!confirmed) return;

    const res = await fetch("/auth/me", {
      method: "DELETE",
      credentials: "same-origin"
    });

    if (res.ok) {
      showLoggedOutUI();
    }
  });
}

// ------------ToS-------------------

function wireTosModal() {
  const tosLink = document.getElementById("tos-link");
  const modal = document.getElementById("tos-modal");
  const closeBtn = document.getElementById("close-tos");
  const tosBody = document.getElementById("tos-body");

  tosLink.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!tosBody.textContent) {
      const res = await fetch("/terms_of_service.md");
      const text = await res.text();
      tosBody.textContent = text;
    }

    modal.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
}

//-----------------------------------------------

loadCurrentUser();