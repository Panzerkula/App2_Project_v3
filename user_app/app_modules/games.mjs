function totalScore(player) {
  return player.scores.reduce((sum, s) => sum + s, 0);
}

export function renderGameView(game, handlers) {
  renderScoresTable(game);

  const waiting = document.getElementById("waiting-controls");
  const round = document.getElementById("round-controls");
  const finish = document.getElementById("finish-game-btn");

  if (waiting) waiting.hidden = game.status !== "waiting";
  if (round) round.hidden = game.status !== "started";
  if (finish) finish.hidden = game.status === "waiting";

  wireBack(handlers.onBack);

  if (game.status === "waiting") {
    wireAddPlayer(game.id, handlers);
    wireStartGame(game.id, handlers);
  }

  if (game.status === "started") {
    renderRoundInputs(game);
    wireAddRound(game.id, handlers);
    wireFinishGame(game.id, handlers);
  }
}

function renderScoresTable(game) {
  const headRow = document.getElementById("scores-head-row");
  const body = document.getElementById("scores-body");

  body.innerHTML = "";
  headRow.querySelectorAll(".round-col").forEach(el => el.remove());

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

    tr.innerHTML = `
      <td>${player.username}</td>
      ${player.scores.map(s => `<td>${s}</td>`).join("")}
      <td><strong>${totalScore(player)}</strong></td>
    `;

    body.appendChild(tr);
  }
}

function renderRoundInputs(game) {
  const container = document.getElementById("score-inputs");
  container.innerHTML = "";

  for (const player of game.players) {
    const row = document.createElement("div");
    row.innerHTML = `
      <span>${player.username}</span>
      <input type="number" data-user="${player.username}" />
    `;
    container.appendChild(row);
  }
}

function wireAddPlayer(gameId, h) {
  const btn = document.getElementById("add-player-btn");
  const input = document.getElementById("new-player-name");

  btn.addEventListener("click", async () => {
    const username = input.value.trim();
    if (!username) return;

    await h.onAddPlayer(gameId, username);
    h.onReload(gameId);
  });
}

function wireStartGame(gameId, h) {
  const btn = document.getElementById("start-game-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const confirmed = await h.showModal({
      title: "Start Game",
      message: "Lock players?",
      confirmText: "Start"
    });

    if (!confirmed) return;

    await h.onStartGame(gameId);
    h.onReload(gameId);
  });
}

function wireAddRound(gameId, h) {
  document.getElementById("add-round-btn")
    .addEventListener("click", async () => {
      const inputs = document.querySelectorAll("#score-inputs input");

      const scores = [...inputs].map(input => ({
        username: input.dataset.user,
        score: Number(input.value || 0)
      }));

      await h.onAddScores(gameId, scores);
      h.onReload(gameId);
    });
}

function wireFinishGame(gameId, h) {
  const btn = document.getElementById("finish-game-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const confirmed = await h.showModal({
      title: "Finish Game",
      message: "Finalize game?",
      confirmText: "Finish"
    });

    if (!confirmed) return;

    await h.onFinishGame(gameId);
    h.onBack();
  });
}

function wireBack(onBack) {
  const btn = document.getElementById("back-to-dashboard-btn");
  if (!btn) return;
  btn.addEventListener("click", onBack);
}