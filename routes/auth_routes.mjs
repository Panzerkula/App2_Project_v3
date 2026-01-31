import express from "express";
import { requireAuth } from "../modules/auth_middleware.mjs";

const router = express.Router();

const users = [];
let nextUserId = 1;

//---------------Signup Route------------------------------

router.post("/signup", (req, res) => {
  const {
    username,
    password,
    mail,
    acceptTos,
  } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password required"
    });
  }

  if (acceptTos !== true) {
    return res.status(400).json({
      error: "You must accept the Terms of Service and Privacy Policy"
    });
  }

  const existingUser = users.find(u => u.username === username);

  if (existingUser) {
    return res.status(409).json({
      error: "Username already taken"
    });
  }

  const newUser = {
    id: nextUserId++,
    username,
    password,
    mail,
    consent: {
      tosAcceptedAt: new Date().toISOString(),
    }
  };

  users.push(newUser);

  res.status(201).json({ success: true });
});

//---------------Delete Route---------------------------------

router.delete("/me", requireAuth, (req, res) => {
  const userId = req.session.user.id;

  const index = users.findIndex(u => u.id === userId);

  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(index, 1);

  req.session.destroy(() => {
    res.json({ success: true });
  });
});

//---------------Login Route----------------------------------

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  req.session.user = {
    id: user.id,
    username: user.username
  };

  res.json({ success: true });
});

//---------------Logout Route---------------------------------

router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

//---------------Me Route-------------------------------------

router.get("/me", requireAuth, (req, res) => {
  res.json(req.user);
});

//------------------------------------------------------------

export default router;