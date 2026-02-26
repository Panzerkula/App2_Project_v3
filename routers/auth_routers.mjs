import express from "express";
import { requireAuth } from "../modules/auth_middleware.mjs";
import { hashPassword, verifyPassword } from "../modules/password.mjs";
import {
  checkLoginRateLimit,
  registerFailedAttempt,
  resetAttempts,
} from "../modules/login_rate_limiter.mjs";
import { requireAdmin } from "../modules/admin_middleware.mjs";
import { pool } from "../modules/db.mjs";
import { loadSql } from "../modules/sql.mjs";

const router = express.Router();

/* ---------------- SIGNUP ---------------- */

router.post("/signup", async (req, res) => {
  const { username, password, mail, acceptTos, profilePic } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  if (!mail || !mail.includes("@"))
    return res.status(400).json({ error: "Invalid email address" });

  if (acceptTos !== true)
    return res.status(400).json({ error: "TOS must be accepted" });

  try {
    const checkSql = await loadSql("get_user_by_username.sql");
    const existing = await pool.query(checkSql, [username]);

    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Username already taken" });

    const { hash, salt } = hashPassword(password);

    const insertSql = await loadSql("create_user.sql");

    await pool.query(insertSql, [
      username,
      mail,
      hash,
      salt,
      username === "admin" ? "admin" : "user",
      profilePic ?? "/assets/no_pic.png",
      new Date().toISOString(),
    ]);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

//---------------Edit user Router------------------------------

router.put("/me", requireAuth, async (req, res) => {
  const { username, password, profilePic } = req.body;
  const userId = req.session.user.id;

  try {
    const getSql = await loadSql("get_user_by_id.sql");
    const existingUserResult = await pool.query(getSql, [userId]);
    const existingUser = existingUserResult.rows[0];

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (username && username !== existingUser.username) {
      const checkSql = await loadSql("get_user_by_username.sql");
      const usernameCheck = await pool.query(checkSql, [username]);

      if (usernameCheck.rows.length > 0) {
        return res.status(409).json({ error: "Username already taken" });
      }
    }

    let newHash = null;
    let newSalt = null;

    if (password) {
      const result = hashPassword(password);
      newHash = result.hash;
      newSalt = result.salt;
    }

    const updateSql = await loadSql("update_user.sql");

    const updateResult = await pool.query(updateSql, [
      username ?? null,
      newHash,
      newSalt,
      profilePic ?? null,
      userId,
    ]);

    const updatedUser = updateResult.rows[0];

    if (username) {
      req.session.user.username = updatedUser.username;
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

//------------Delete User Router--------------------------------

router.delete("/me", requireAuth, async (req, res) => {
  try {
    const sql = await loadSql("delete_user.sql");
    await pool.query(sql, [req.session.user.id]);

    req.session.destroy(() => {
      res.json({ success: true });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

//---------------Login Router----------------------------------

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const key = `${req.ip}:${username}`;

  if (!checkLoginRateLimit(key))
    return res.status(429).json({ error: "Too many attempts" });

  try {
    const sql = await loadSql("get_user_by_username.sql");
    const result = await pool.query(sql, [username]);

    const user = result.rows[0];

    if (!user) {
      registerFailedAttempt(key);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = verifyPassword(
      password,
      user.password_salt,
      user.password_hash,
    );

    if (!valid) {
      registerFailedAttempt(key);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    resetAttempts(key);

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
//---------------Logout Router------------------------------------------

router.post("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

//-------------Current session router-----------------------------------

router.get("/me", requireAuth, async (req, res) => {
  const sql = await loadSql("get_user_by_id.sql");
  const result = await pool.query(sql, [req.session.user.id]);

  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    id: user.id,
    username: user.username,
    mail: user.mail,
    profilePic: user.profilePic,
    createdAt: user.consent?.tosAcceptedAt,
  });
});

//---------------List users router-----------------------------------

router.get("/users", requireAuth, async (req, res) => {
  try {
    const sql = await loadSql("list_users.sql");
    const result = await pool.query(sql);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

//-----------------Admin router-------------------------------------

router.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const sql = await loadSql("list_users.sql");
    const result = await pool.query(sql);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
