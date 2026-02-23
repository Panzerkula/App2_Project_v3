export function renderDashboardView(getUser) {
  const user = getUser();
  document.getElementById("username").textContent = user.username;

  const img = document.getElementById("profile-pic");
  img.src = user.profilePic;
  img.onerror = () => (img.src = "/assets/no_pic.png");
}

export function wireLogout(api, showSignIn) {
  document.getElementById("logout-btn")
    .addEventListener("click", async () => {
      await api.logout();
      showSignIn();
    });
}

export function wireCreateGame(api, showModal, reloadGames) {
  document.getElementById("create-game-btn")
    .addEventListener("click", async () => {
      const name = await showModal({
        title: "Create Game",
        message: "Enter game name",
        input: true,
        confirmText: "Create"
      });

      if (!name) return;

      await api.createGame(name);
      reloadGames();
    });
}

export async function loadGames(api, onSelect) {
  const list = document.getElementById("games-list");
  const games = await api.getGames();

  list.innerHTML = "";
  for (const game of games) {
    const li = document.createElement("li");
    li.textContent = `${game.name} (${game.status})`;
    li.addEventListener("click", () => onSelect(game.id));
    list.appendChild(li);
  }
}

export function wireUserView(showUserView) {
  const btn = document.getElementById("user-view-btn");
  if (!btn) return;
  btn.addEventListener("click", showUserView);
}