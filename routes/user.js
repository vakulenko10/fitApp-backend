import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../server.js";  

const router = express.Router();
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is not defined in environment variables!");
  process.exit(1); 
}


const authenticateToken = (req, res, next) => {
  console.log('here we are, req.headers:', req.headers)
  const authHeader = req.headers.authorization;
  console.log("authHeader:", authHeader)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log('token:', token)
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('there is an error:', err)
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
    console.log('decoded:', decoded)
    req.email = decoded.email; 
    console.log('req.userId:', req.email)
    next();
  });
};

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.email },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        age: true,
        height: true,
        weight: true,
        activityLevel: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to retrieve profile" });
  }
});

export default router;
