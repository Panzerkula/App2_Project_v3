import express from "express";

const router = express.Router();

const users = [];
let nextUserId = 1;

//---------------Signup Route------------------------------

router.post("/signup", (req, res) => {
const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const existingUser = users.find(u => u.username === username);

  if (existingUser) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const newUser = {
    id: nextUserId++,
    username,
    password
  };

  users.push(newUser);

  res.status(201).json({ success: true });
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

router.get("/me", (req, res) => {
  res.json(req.user || null);
});

//------------------------------------------------------------

export default router;