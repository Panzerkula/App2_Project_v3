export function validateRoundScores(req, res, next) {
  const { scores } = req.body;

  if (!scores || typeof scores !== "object") {
    return res.status(400).json({ error: "Invalid score format" });
  }

  next();
}