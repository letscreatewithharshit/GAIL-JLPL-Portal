import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
const router = Router();
const username = process.env.ADMIN_USERNAME || "admin";
const passwordHash =
  process.env.ADMIN_PASSWORD_HASH ||
  (process.env.ADMIN_PASSWORD
    ? bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12)
    : null);

router.post("/login", async (req, res, next) => {
  try {
    // Temporary local development login bypass
    const isLocalRequest = [
      "127.0.0.1",
      "::1",
      "::ffff:127.0.0.1"
    ].includes(req.socket.remoteAddress);

    const bypassEnabled =
      process.env.ADMIN_LOGIN_BYPASS === "true" &&
      process.env.NODE_ENV !== "production" &&
      isLocalRequest;

    if (bypassEnabled) {
      const adminUsername = process.env.ADMIN_USERNAME || "admin";

      const token = jwt.sign(
        { sub: "single-admin", username: adminUsername },
        process.env.JWT_SECRET,
        { expiresIn: "4h" }
      );

      return res.json({
        token,
        admin: { username: adminUsername },
        bypass: true
      });
    }

    // Normal secure login
    const input = z.object({
      username: z.string().min(1).max(100),
      password: z.string().min(12).max(200)
    }).parse(req.body);

    if (!passwordHash) {
      return res.status(503).json({
        error: "Admin password is not configured."
      });
    }

    const validUser = input.username === username;
    const validPassword = await bcrypt.compare(
      input.password,
      passwordHash
    );

    if (!validUser || !validPassword) {
      return res.status(401).json({
        error: "Username or password is incorrect"
      });
    }

    const token = jwt.sign(
      { sub: "single-admin", username },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({ token, admin: { username } });

  } catch (e) {
    next(e);
  }
});

export default router;
