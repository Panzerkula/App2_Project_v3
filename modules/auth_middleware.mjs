export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Login required" });
  }
  req.user = req.session.user;
  next();
}