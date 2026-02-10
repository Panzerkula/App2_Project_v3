import express from "express";
import authRouters from "./routers/auth_routers.mjs";
import { requireAuth } from "./modules/auth_middleware.mjs";
import { requireAdmin } from "./modules/admin_middleware.mjs";
import session from "express-session";
import gamesRouters from "./routers/games_routers.mjs";
import path from "path";

const app = express();
const PORT = 3000;

app.use(
  session({
    secret: "dev-secret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(express.json());

app.use("/auth", authRouters);

app.use(express.static("user_app"));

app.use(
  "/assets",
  express.static(path.join(process.cwd(), "assets"))
);

app.use(
  "/views",
  express.static(path.join(process.cwd(), "views"))
);

app.use("/games", gamesRouters);

app.get("/games", requireAuth, (req, res) => {
  res.json({ message: "You are logged in", user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});