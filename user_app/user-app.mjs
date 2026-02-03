const app = document.getElementById("app");
let currentUser = null;

// --------------innerHTML----------------

function signInHTML() {
  return `
    <h1>Mexican Train Score Tracker</h1>

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
    <h1>Mexican Train Score Tracker</h1>

    <section id="signup-section">
      <h2>Create Account</h2>
      <form id="signup-form">
        <input name="username" type="text" placeholder="Username" required />
        <input name="password" type="password" placeholder="Password" required />
        <input name="mail" type="email" placeholder="Email" required />

        <label>
          <input type="checkbox" name="acceptTos" />
          I accept the <a href="#" id="tos-link">Terms of Service</a>
        </label>

        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already have an account?
        <a href="#" id="back-to-signin-link">Back to sign in</a>
      </p>
    </section>
    <div id="tos-modal" class="modal hidden">
      <div class="modal-content">
      <button id="close-tos">&times;</button>
      <div id="tos-body"></div>
    </div>
  </div>
  
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
      <button id="edit-account-btn">Edit Account</button>
    </section>

    <pre id="output"></pre>
  `;
}

function editAccountHTML() {
  return `
    <h1>Mexican Train Score Tracker</h1>

    <section id="editAccount-section">
      <h2>Edit Account</h2>

      <form id="edit-form">
        <input name="username" type="text" placeholder="New username (optional)" />
        <input name="password" type="password" placeholder="New password (optional)" />

        <button type="submit">Confirm</button>
        <button type="button" id="return-to-loggedIn">Return</button>
      </form>
    </section>

    <pre id="output"></pre>
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

function showLoggedInUI(username) {
  app.innerHTML = loggedInHTML(username);
  wireLogout();
  wireDeleteAccount();
  wireEditAccount();
}

function showEditUserUI(user) {
  app.innerHTML = editAccountHTML(user);
  wireEditForm();
  wireReturnFromEdit();
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

// -------------Delete Account-------------

function wireDeleteAccount() {
  const deleteAccountBtn = document.getElementById("delete-account-btn");

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
      showSignIn();
    }
  });
}

// --------------Edit account---------------

function wireEditAccount() {
  const editAccountBtn = document.getElementById("edit-account-btn");

  editAccountBtn.addEventListener("click", () => {
    showEditUserUI(currentUser);
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
    showLoggedInUI(currentUser.username);
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

//-----------------------------------------------

loadCurrentUser();