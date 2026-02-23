export function initSignupView(state) {
  const form = document.getElementById("signup-form");
  if (!form) return;

  form.username.value = state.signup.username;
  form.password.value = state.signup.password;
  form.mail.value = state.signup.mail;
  form.acceptTos.checked = state.signup.acceptTos;

  form.username.addEventListener("input", e => {
    state.signup.username = e.target.value;
  });

  form.password.addEventListener("input", e => {
    state.signup.password = e.target.value;
  });

  form.mail.addEventListener("input", e => {
    state.signup.mail = e.target.value;
  });

  form.acceptTos.addEventListener("change", e => {
    state.signup.acceptTos = e.target.checked;
  });
}

export function initLoginView(state) {
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  if (!username || !password) return;

  username.value = state.login.username;
  password.value = state.login.password;

  username.addEventListener("input", e => {
    state.login.username = e.target.value;
  });

  password.addEventListener("input", e => {
    state.login.password = e.target.value;
  });
}

export function wireSignup(api, onSuccess) {
  const form = document.getElementById("signup-form");
  const output = document.getElementById("output");

  form.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      await api.signup({
        username: form.username.value,
        password: form.password.value,
        mail: form.mail.value,
        acceptTos: form.acceptTos.checked
      });
      onSuccess();
    } catch (err) {
      output.textContent = err.message;
    }
  });
}

export function wireLogin(api, onSuccess) {
  const form = document.getElementById("login-form");
  const output = document.getElementById("output");

  form.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      await api.login({
        username: form.username.value,
        password: form.password.value
      });
      onSuccess();
    } catch (err) {
      output.textContent = err.message;
    }
  });
}

export function wireCreateAccountLink(showSignUp) {
  const link = document.getElementById("create-account-link");
  if (!link) return;
  link.addEventListener("click", e => {
    e.preventDefault();
    showSignUp();
  });
}

export function wireBackToSignIn(showSignIn) {
  const link = document.getElementById("back-to-signin-link");
  if (!link) return;
  link.addEventListener("click", e => {
    e.preventDefault();
    showSignIn();
  });
}

export function wireTosLink(showTos) {
  const link = document.getElementById("tos-link");
  if (!link) return;
  link.addEventListener("click", e => {
    e.preventDefault();
    showTos();
  });
}

export function wireBackFromTos(showSignUp) {
  const btn = document.getElementById("back-from-tos-btn");
  if (!btn) return;
  btn.addEventListener("click", showSignUp);
}