import express from "express";
import authRoutes from "./routes/auth_routes.mjs";
import { requireAuth } from "./modules/auth_middleware.mjs";
import session from "express-session";

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

app.use((req, res, next) => {
  if (req.user) {
    req.user = req.user;
  }
  next();
});

app.use("/auth", authRoutes);

app.use(express.static("user_app"));

app.get("/games", requireAuth, (req, res) => {
  res.json({ message: "You are logged in", user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});