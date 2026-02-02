import express from "express";
import { requireAuth } from "../modules/auth_middleware.mjs";

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

//----------------------------------------------------

export default router;