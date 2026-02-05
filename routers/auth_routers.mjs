import express from "express";
import { requireAuth } from "../modules/auth_middleware.mjs";

const router = express.Router();

const users = [];
let nextUserId = 1;

//---------------Signup Router------------------------------

router.post("/signup", (req, res) => {

  const {
    username,
    password,
    mail,
    acceptTos,
    profilePic
  } = req.body;

  const existingUser = users.find(u => u.username === username);
  const existingMail = users.find(u => u.mail === mail);
  const profilePicPath = profilePic ?? "/assets/no_pic.png"

  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password required"
    });
  }

  if (!mail) {
    return res.status(400).json({
      error: "Email required"
    });
  }

  if (existingMail) {
    return res.status(409).json({
      error: "Email already in use"
    });
  }

  if (acceptTos !== true) {
    return res.status(400).json({
      error: "You must accept the Terms of Service"
    });
  }

  if (existingUser) {
    return res.status(409).json({
      error: "Username already taken"
    });
  }

  if (!mail || !mail.includes("@")) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const newUser = {
    id: nextUserId++,
    username,
    password,
    mail,
    profilePic: profilePicPath,
    consent: {
      tosAcceptedAt: new Date().toISOString(),
    }
  };

  users.push(newUser);
  res.status(201).json({ success: true });
});

//---------------Delete Router---------------------------------

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

//---------------Edit user Router------------------------------

router.put("/me", requireAuth, (req, res) => {
  
  const userId = req.session.user.id;
  const { username, password } = req.body;
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (username) {
    const usernameTaken = users.some(
      u => u.username === username && u.id !== userId
    );

    if (usernameTaken) {
      return res.status(409).json({ error: "Username already taken" });
    }

    user.username = username;
    req.session.user.username = username;
  }

  if (password) {
    user.password = password;
  }

  res.json({ success: true });
});

//---------------Login Router----------------------------------

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

//---------------Logout Router------------------------------------------

router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

//-------------Current session router-----------------------------------

router.get("/me", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const user = users.find(u => u.id === userId);

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
  
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    mail: u.mail,
    profilePic: u.profilePic,
    createdAt: u.consent?.tosAcceptedAt
  }));

  res.json(safeUsers);
});

//------------------------------------------------------------

export default router;