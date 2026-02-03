export function validateRoundScores(req, res, next) {
  const { scores } = req.body;

  if (!Array.isArray(scores) || scores.length === 0) {
    return res.status(400).json({
      error: "Scores must be a non-empty array"
    });
  }

  for (const entry of scores) {
    if (
      typeof entry !== "object" ||
      typeof entry.username !== "string" ||
      entry.username.trim() === "" ||
      typeof entry.score !== "number" ||
      !Number.isInteger(entry.score) ||
      entry.score < 0
    ) {
      return res.status(400).json({
        error: "Each score must be { username: string, score: non-negative integer }"
      });
    }
  }

  next();
}