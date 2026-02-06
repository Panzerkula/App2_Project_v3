import express from "express";
import { requireAuth } from "../modules/auth_middleware.mjs";
import { hashPassword, verifyPassword } from "../modules/password.mjs"

const router = express.Router();

const users = [];
let nextUserId = 1;

//---------------Signup Router------------------------------

router.post("/signup", (req, res) => {
  const { username, password, mail, acceptTos, profilePic } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  if (!mail || !mail.includes("@")) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  if (acceptTos !== true) {
    return res.status(400).json({ error: "You must accept the Terms of Service" });
  }

  if (users.some(u => u.username === username)) {
    return res.status(409).json({ error: "Username already taken" });
  }

  if (users.some(u => u.mail === mail)) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const { hash, salt } = hashPassword(password);

  const newUser = {
    id: nextUserId++,
    username,
    passwordHash: hash,
    passwordSalt: salt,
    mail,
    profilePic: profilePic ?? "/assets/no_pic.png",
    consent: {
      tosAcceptedAt: new Date().toISOString()
    }
  };

  users.push(newUser);
  res.status(201).json({ success: true });
});

//---------------Edit user Router------------------------------

router.put("/me", requireAuth, (req, res) => {
  const user = users.find(u => u.id === req.session.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { username, password, profilePic } = req.body;

  if (username) {
    if (users.some(u => u.username === username && u.id !== user.id)) {
      return res.status(409).json({ error: "Username already taken" });
    }
    user.username = username;
    req.session.user.username = username;
  }

  if (password) {
    const { hash, salt } = hashPassword(password);
    user.passwordHash = hash;
    user.passwordSalt = salt;
  }

  if (profilePic) {
    user.profilePic = profilePic;
  }

  res.json({ success: true });
});

//------------Delete User Router--------------------------------

router.delete("/me", requireAuth, (req, res) => {
  const index = users.findIndex(u => u.id === req.session.user.id);

  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(index, 1);
  req.session.destroy(() => res.json({ success: true }));
});

//---------------Login Router----------------------------------

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const valid = verifyPassword(
    password,
    user.passwordSalt,
    user.passwordHash
  );

  if (!valid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  req.session.user = {
    id: user.id,
    username: user.username
  };

  res.json({ success: true });
});

//---------------Logout Router------------------------------------------

router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

//-------------Current session router-----------------------------------

router.get("/me", requireAuth, (req, res) => {
  const user = users.find(u => u.id === req.session.user.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    id: user.id,
    username: user.username,
    mail: user.mail,
    profilePic: user.profilePic,
    createdAt: user.consent?.tosAcceptedAt
  });
});

//---------------List users router-----------------------------------

router.get("/users", requireAuth, (req, res) => {
  res.json(
    users.map(u => ({
      id: u.id,
      username: u.username,
      mail: u.mail,
      profilePic: u.profilePic,
      createdAt: u.consent?.tosAcceptedAt
    }))
  );
});

//------------------------------------------------------------

export default router;