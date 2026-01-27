export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Login required" });
  }
  next();
}

export function createGame(){
    const id = 1;
};