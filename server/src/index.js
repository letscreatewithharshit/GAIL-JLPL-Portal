import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import authRoutes from "./routes/auth.js";
import portalRoutes from "./routes/portal.js";
import { prisma } from "./db.js";
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error(
    "Set a random JWT_SECRET of at least 32 characters in server/.env",
  );
}
const app = express();
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
      .split(",")
      .map((s) => s.trim()),
    credentials: false,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(
  "/uploads",
  express.static(path.resolve("uploads"), { fallthrough: false, maxAge: "1d" }),
);
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  authRoutes,
);
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", service: "GAIL Regional O&M Portal API" }),
);
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  portalRoutes,
);
const clientDist = path.resolve("../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api|uploads).*/, (req, res) =>
    res.sendFile(path.join(clientDist, "index.html")),
  );
}
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ZodError")
    return res
      .status(400)
      .json({ error: "Validation failed", details: err.errors });
  if (err.statusCode === 400)
    return res.status(400).json({ error: err.message });
  if (err.code === "P2025")
    return res.status(404).json({ error: "Record not found" });
  if (err.code === "P2003" || err.code === "P2002")
    return res
      .status(400)
      .json({
        error: "This record conflicts with existing data or is still in use",
      });
  res.status(500).json({ error: "Internal server error" });
});
const port = Number(process.env.PORT || 5000);
const server = app.listen(port, () =>
  console.log(`GAIL portal API listening on http://localhost:${port}`),
);
async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
