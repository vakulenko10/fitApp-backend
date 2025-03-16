import express from "express";

import { prisma } from "../server.js";  

const router = express.Router();
import dotenv from "dotenv";
import { authenticateToken } from "../utils/authenticateToken.js";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is not defined in environment variables!");
  process.exit(1); 
}



router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const profileImageURL = req.profileImageURL
    // const {email, userId} = req;
    console.log('email:', req?.email, "userId:", req?.userId)
    const user = await prisma.user.findUnique({
      where: req.email?{ email: req?.email}:{id: req.userId},
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
        currentCalorieIntake: true
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({...user, "profileImageURL":profileImageURL});
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to retrieve profile" });
  }
});

export default router;
