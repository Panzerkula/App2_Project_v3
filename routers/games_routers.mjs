import express from "express";
import { requireAuth } from "../modules/auth_middleware.mjs";
import { requireAdmin } from "../modules/admin_middleware.mjs";
import { validateRoundScores } from "../modules/scores_middleware.mjs";
import { pool } from "../modules/db.mjs";
import { loadSql } from "../modules/sql.mjs";

const router = express.Router();

/* =========================================================
   Helper: Build Game Object From Joined Rows
========================================================= */

function buildGameFromRows(rows) {
  if (!rows.length) return null;

  const game = {
    id: rows[0].game_id,
    ownerId: rows[0].owner_id,
    name: rows[0].name,
    status: rows[0].status,
    createdAt: rows[0].created_at,
    startedAt: rows[0].started_at,
    finishedAt: rows[0].finished_at,
    players: []
  };

  const playerMap = new Map();

  for (const row of rows) {
    if (!row.player_id) continue;

    if (!playerMap.has(row.player_id)) {
      playerMap.set(row.player_id, {
        userId: row.user_id,
        username: row.username,
        scores: []
      });
    }

    if (row.round_number !== null) {
      playerMap.get(row.player_id).scores.push(row.score);
    }
  }

  game.players = Array.from(playerMap.values());

  return game;
}

/* =========================================================
   Create Game
========================================================= */

router.post("/", requireAuth, async (req, res) => {
  const { name } = req.body;
  const user = req.user;

  try {
    const createGameSql = await loadSql("games", "create_game.sql");
    const gameResult = await pool.query(createGameSql, [
      user.id,
      name || "Untitled Game"
    ]);

    const game = gameResult.rows[0];

    const addOwnerSql = await loadSql("games", "add_game_owner_as_player.sql");
    await pool.query(addOwnerSql, [
      game.id,
      user.id,
      user.username
    ]);

    const fullSql = await loadSql("games", "get_game_full.sql");
    const fullResult = await pool.query(fullSql, [game.id]);

    res.status(201).json(buildGameFromRows(fullResult.rows));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =========================================================
   Get All Games For User
========================================================= */

router.get("/", requireAuth, async (req, res) => {
  try {
    const sql = await loadSql("games", "get_games_for_user.sql");
    const result = await pool.query(sql, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =========================================================
   Get Specific Game
========================================================= */

router.get("/:id", requireAuth, async (req, res) => {
  const gameId = Number(req.params.id);

  try {
    const sql = await loadSql("games", "get_game_full.sql");
    const result = await pool.query(sql, [gameId]);

    if (!result.rows.length)
      return res.status(404).json({ error: "Game not found" });

    const game = buildGameFromRows(result.rows);

    const isPlayer = game.players.some(
      p => p.userId === req.user.id
    );

    if (!isPlayer)
      return res.status(403).json({ error: "Not part of this game" });

    res.json(game);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =========================================================
   Add Player
========================================================= */

router.post("/:id/players", requireAuth, async (req, res) => {
  const gameId = Number(req.params.id);
  const { username } = req.body;

  try {
    const fullSql = await loadSql("games", "get_game_full.sql");
    const fullResult = await pool.query(fullSql, [gameId]);

    if (!fullResult.rows.length)
      return res.status(404).json({ error: "Game not found" });

    const game = buildGameFromRows(fullResult.rows);

    if (game.status !== "waiting")
      return res.status(409).json({
        error: "Cannot add players after game has started"
      });

    const insertSql = await loadSql("games", "add_player.sql");

    await pool.query(insertSql, [gameId, username]);

    const updated = await pool.query(fullSql, [gameId]);

    res.status(201).json(buildGameFromRows(updated.rows));

  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Player already in game" });
    }

    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =========================================================
   Start Game
========================================================= */

router.post("/:id/start", requireAuth, async (req, res) => {
  const gameId = Number(req.params.id);

  try {
    const fullSql = await loadSql("games", "get_game_full.sql");
    const fullResult = await pool.query(fullSql, [gameId]);

    if (!fullResult.rows.length)
      return res.status(404).json({ error: "Game not found" });

    const game = buildGameFromRows(fullResult.rows);

    if (game.ownerId !== req.user.id)
      return res.status(403).json({ error: "Only owner can start game" });

    if (game.status !== "waiting")
      return res.status(409).json({ error: "Game already started" });

    const startSql = await loadSql("games", "start_game.sql");
    await pool.query(startSql, [gameId]);

    const updated = await pool.query(fullSql, [gameId]);
    res.json(buildGameFromRows(updated.rows));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =========================================================
   Add Scores
========================================================= */

router.post(
  "/:id/scores",
  requireAuth,
  validateRoundScores,
  async (req, res) => {
    const gameId = Number(req.params.id);
    const { scores } = req.body;

    try {
      const fullSql = await loadSql("games", "get_game_full.sql");
      const fullResult = await pool.query(fullSql, [gameId]);

      if (!fullResult.rows.length)
        return res.status(404).json({ error: "Game not found" });

      const game = buildGameFromRows(fullResult.rows);

      if (game.status !== "started")
        return res.status(409).json({
          error: "Game has not started yet"
        });

      const nextRoundSql = await loadSql("games", "get_next_round.sql");
      const roundResult = await pool.query(nextRoundSql, [gameId]);
      const roundNumber = roundResult.rows[0].next_round;

      const getPlayerSql = await loadSql("games", "get_player_by_username.sql");
      const insertScoreSql = await loadSql("games", "insert_score.sql");

      for (const { username, score } of scores) {
        const playerResult = await pool.query(getPlayerSql, [
          gameId,
          username
        ]);

        const player = playerResult.rows[0];
        if (!player) continue;

        await pool.query(insertScoreSql, [
          gameId,
          player.id,
          roundNumber,
          score
        ]);
      }

      const updated = await pool.query(fullSql, [gameId]);
      res.json(buildGameFromRows(updated.rows));

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

/* =========================================================
   Finish Game
========================================================= */

router.post("/:id/finish", requireAuth, async (req, res) => {
  const gameId = Number(req.params.id);

  try {
    const fullSql = await loadSql("games", "get_game_full.sql");
    const fullResult = await pool.query(fullSql, [gameId]);

    if (!fullResult.rows.length)
      return res.status(404).json({ error: "Game not found" });

    const game = buildGameFromRows(fullResult.rows);

    if (game.ownerId !== req.user.id)
      return res.status(403).json({ error: "Only owner can finish game" });

    if (game.status === "finished")
      return res.status(409).json({ error: "Game already finished" });

    const finishSql = await loadSql("games", "finish_game.sql");
    await pool.query(finishSql, [gameId]);

    const updated = await pool.query(fullSql, [gameId]);
    res.json(buildGameFromRows(updated.rows));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =========================================================
   Admin: Get All Games
========================================================= */

router.get("/admin/games", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "select * from games order by created_at desc"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;