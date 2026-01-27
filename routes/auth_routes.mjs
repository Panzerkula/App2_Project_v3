import express from "express";

const router = express.Router();

router.post("/login", (req, res) => {
  req.user = { id: 1, username: "demo" };
  res.json({ success: true });
});

router.post("/logout", (req, res) => {
  req.user = null;
  res.json({ success: true });
});

router.get("/me", (req, res) => {
  res.json(req.user || null);
});

export default router;