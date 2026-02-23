export function renderAccountView(user) {
  document.getElementById("account-username").textContent = user.username;
  document.getElementById("account-email").textContent = user.mail;

  const img = document.getElementById("profile-pic");
  img.src = user.profilePic || "/assets/no_pic.png";
}

export function wireEditAccount(showEdit) {
  const btn = document.getElementById("edit-user-btn");
  if (!btn) return;
  btn.addEventListener("click", showEdit);
}

export function wireDeleteAccount(api, onSuccess) {
  const btn = document.getElementById("delete-user-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    if (!confirm("Delete account?")) return;
    await api.deleteMe();
    onSuccess();
  });
}

export function wireEditForm(api, reloadUser) {
  const form = document.getElementById("edit-form");
  const output = document.getElementById("output");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api.updateMe({
        username: form.username.value || undefined,
        password: form.password.value || undefined,
      });
      reloadUser();
    } catch (err) {
      output.textContent = err.message;
    }
  });
}

export function wireReturnFromEdit(showDashboard) {
  const btn = document.getElementById("return-to-loggedIn");
  if (!btn) return;
  btn.addEventListener("click", showDashboard);
}

export function wireBackToDashboard(showDashboard) {
  const btn = document.getElementById("back-to-dashboard-btn");
  if (!btn) return;
  btn.addEventListener("click", showDashboard);
}
