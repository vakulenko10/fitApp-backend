import express from "express";
import { prisma } from "../server.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Add weight record
router.post("/add", authenticateToken, async (req, res) => {
  const { weight } = req.body;
  if (!weight) {
    return res.status(400).json({ error: "Weight value is required" });
  }

  try {
    const newRecord = await prisma.weight_records.create({
      data: {
        userId: req.userId,
        weight,
      },
    });
    res.json(newRecord);
  } catch (error) {
    console.error("Error adding weight record:", error);
    res.status(500).json({ error: "Failed to add weight record" });
  }
});

// Get weight history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const history = await prisma.weight_records.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "asc" },
    });
    res.json(history);
  } catch (error) {
    console.error("Error fetching weight history:", error);
    res.status(500).json({ error: "Failed to retrieve weight history" });
  }
});

export default router;
