import { api } from "../modules/api.mjs";

import * as auth from "./app_modules/auth.mjs";
import * as dashboard from "./app_modules/dashboard.mjs";
import * as games from "./app_modules/games.mjs";
import * as account from "./app_modules/account.mjs";
import { showModal } from "./app_modules/modal.mjs";

const app = document.getElementById("app");

//----------- Globals -------------

let currentUser = null;

const state = {
  login: { username: "", password: "" },
  signup: {
    username: "",
    password: "",
    mail: "",
    acceptTos: false,
  },
};

function getCurrentUser() {
  return currentUser;
}

async function loadView(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load view: ${path}`);
  return await res.text();
}

async function mountView(path, initFn) {
  const html = await loadView(path);
  app.innerHTML = html;
  if (initFn) initFn();
}

async function loadGlobalUI() {
  const container = document.getElementById("global-ui");
  container.innerHTML = await loadView("/views/ui_modal.html");
}

// ---------------- Navigation ----------------

async function showSignIn() {
  await mountView("/views/login_view.html", () => {
    auth.initLoginView(state);
    auth.wireLogin(api, loadCurrentUser);
    auth.wireCreateAccountLink(showSignUp);
  });
}

async function showSignUp() {
  await mountView("/views/signup_view.html", () => {
    auth.initSignupView(state);
    auth.wireSignup(api, showSignIn);
    auth.wireBackToSignIn(showSignIn);
    auth.wireTosLink(showTosView);
  });
}

async function showTosView() {
  await mountView("/views/terms_of_service_view.html", () => {
    auth.wireBackFromTos(showSignUp);
  });
}

async function showDashboard() {
  await mountView("/views/dashboard_view.html", () => {
    dashboard.renderDashboardView(getCurrentUser);
    dashboard.wireLogout(api, showSignIn);
    dashboard.wireCreateGame(api, showModal, reloadGames);
    dashboard.wireUserView(showUserView);
    reloadGames();
  });
}

async function showUserView() {
  await mountView("/views/account_view.html", () => {
    account.renderAccountView(getCurrentUser());
    account.wireEditAccount(showEditUser);
    account.wireDeleteAccount(api, showSignIn);
    account.wireBackToDashboard(showDashboard);
  });
}

async function showEditUser() {
  await mountView("/views/edit_view.html", () => {
    account.wireEditForm(api, loadCurrentUser);
    account.wireReturnFromEdit(showDashboard);
  });
}

async function showGameDetail(game) {
  await mountView("/views/game_view.html", () => {
    games.renderGameView(game, {
      onBack: showDashboard,
      onAddPlayer: (id, username) => api.addPlayer(id, username),
      onStartGame: (id) => api.startGame(id),
      onAddScores: (id, scores) => api.addScores(id, scores),
      onFinishGame: (id) => api.finishGame(id),
      onReload: selectGame,
      showModal,
    });
  });
}

//---------------- Games -----------------

async function reloadGames() {
  await dashboard.loadGames(api, selectGame);
}

async function selectGame(gameId) {
  try {
    const game = await api.getGame(gameId);
    showGameDetail(game);
  } catch {
    console.log("Failed to load game");
  }
}

//---------------- Users ------------------

async function loadCurrentUser() {
  try {
    currentUser = await api.me();
    showDashboard();
  } catch {
    showSignIn();
  }
}

//----------------- Init ------------------

async function init() {
  await loadGlobalUI();
  await loadCurrentUser();
}

init();
