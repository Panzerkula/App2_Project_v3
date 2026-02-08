import express from "express";
import { requireAuth } from "../modules/auth_middleware.mjs";
import { validateRoundScores } from "../modules/scores_middleware.mjs";
import { loadGame, requirePlayer, forbidIfFinished, requireGameOwner } from "../modules/game_middleware.mjs";
import { requireAdmin } from "../modules/admin_middleware.mjs";

const router = express.Router();

const games = [];
let nextGameId = 1;

//-----------------Create game---------------------

router.post("/", requireAuth, (req, res) => {
  const user = req.user;
  const { name } = req.body;

  const newGame = {
    id: nextGameId++,
    ownerId: user.id,
    name: name || "Untitled Game",
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

router.get("/:id", requireAuth, loadGame(games), requirePlayer, (req, res) =>
  {res.json(req.game); 
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

//-------------------Start game---------------------

router.post("/:id/start",
  requireAuth,
  loadGame(games),
  requireGameOwner,
  forbidIfFinished,
  (req, res) => {
    if (req.game.status !== "waiting") {
      return res.status(409).json({ error: "Game already started" });
    }

    req.game.status = "started";
    res.json(req.game);
  }
);

//------------------Add scores-----------------------

router.post("/:id/scores",
  requireAuth,
  loadGame(games),
  requirePlayer,
  forbidIfFinished,
  validateRoundScores,
  (req, res) => {
    const game = req.game; const { scores } = req.body;

    if (game.status !== "started") {
      return res.status(409).json({ error: "Game has not started yet" });
    }
    
    for (const { username, score } of scores) {
      const player = game.players.find(p => p.username === username);
      
      if (player) {
        player.scores.push(score);
      }
    }

    res.json(game);
  }
);

//-------------------Finish game---------------------

router.post("/:id/finish", 
  requireAuth,
  loadGame(games),
  requireGameOwner,
  forbidIfFinished,
  (req, res) => {
    req.game.status = "finished";
    res.json(req.game);
  }
);

//----------------Get all games Admin--------------

router.get("/admin/games", requireAuth, requireAdmin, (req, res) => {
  res.json(games);
});

export default router;