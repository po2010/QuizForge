import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();

function generateToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const token = generateToken(user);
    res.status(201).json({ user: user.toPublicJSON(), token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }

    const token = generateToken(user);
    res.json({ user: user.toPublicJSON(), token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login." });
  }
});

// GET /api/auth/me
router.get("/me", auth, (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

export default router;