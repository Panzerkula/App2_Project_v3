import express from "express";
import { requireAuth } from "../modules/auth_middleware.mjs";
import { validateRoundScores } from "../modules/scores_middleware.mjs";

const router = express.Router();

const games = [];
let nextGameId = 1;

//-----------------Create game---------------------

router.post("/", requireAuth, (req, res) => {
  const user = req.user;

  const newGame = {
    id: nextGameId++,
    ownerId: user.id,
    players: [
      {
        userId: user.id,
        username: user.username,
        scores: []
      }
    ],
    status: "waiting",
    createdAt: new Date().toISOString()
  };

  games.push(newGame);

  res.status(201).json(newGame);
});

//----------------Get All Games---------------------

router.get("/", requireAuth, (req, res) => {
  const userId = req.user.id;

  const userGames = games.filter(
    g => g.players.some(p => p.userId === userId)
  );

  res.json(userGames);
});

//---------------Get Specific Game------------------

router.get("/:id", requireAuth, (req, res) => {
  const gameId = Number(req.params.id);

  const game = games.find(g => g.id === gameId);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const isPlayer = game.players.some(
    p => p.userId === req.user.id
  );

  if (!isPlayer) {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json(game);
});

//------------------Add player---------------------

router.post("/:id/players", requireAuth, (req, res) => {
  const gameId = Number(req.params.id);
  const { username } = req.body;

  const game = games.find(g => g.id === gameId);
  if (!game) return res.status(404).json({ error: "Game not found" });

  const alreadyInGame = game.players.some(p => p.username === username);
  if (alreadyInGame) {
    return res.status(409).json({ error: "Player already in game" });
  }

  if (game.status !== "waiting") {
    return res.status(409).json({
      error: "Cannot add players after game has started"
    });
  }

  game.players.push({
    userId: null,
    username,
    scores: []
  });

  res.status(201).json(game);
});

//------------------Add scores-----------------------

router.post("/:id/scores",requireAuth,validateRoundScores,(req, res) => {
  const gameId = Number(req.params.id);
  const { scores } = req.body;
  const game = games.find(g => g.id === gameId);
  
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  if (game.status === "finished") {
    return res.status(409).json({
      error: "Game is finished"
    });
  }

  for (const { username, score } of scores) {
    const player = game.players.find(p => p.username === username);
    if (!player) continue;
      player.scores.push(score);
    }

    if (scores.length !== game.players.length) {
      return res.status(400).json({
      error: "Scores must be provided for all players"
    });
  }

  res.json(game);
});

//-------------------Finish game---------------------

router.post("/:id/finish", requireAuth, (req, res) => {
  const game = games.find(g => g.id === Number(req.params.id));
  if (!game) return res.status(404).json({ error: "Game not found" });

  if (game.ownerId !== req.user.id) {
    return res.status(403).json({ error: "Only owner can finish game" });
  }

  if (game.status === "finished") {
    return res.status(409).json({
      error: "Game already finished"
    });
  }

  game.status = "finished";
  res.json(game);
});

export default router;