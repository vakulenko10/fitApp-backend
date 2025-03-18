import express from "express";

import { prisma } from "../server.js";  

const router = express.Router();
import dotenv from "dotenv";
import { authenticateToken } from "../utils/authenticateToken.js";
dotenv.config();



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
        currentCalorieIntake: true,
        apiKey: true
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
router.put("/profile", authenticateToken, async (req, res) => {
    try {
      const { name, gender, age, height, weight, activityLevel, currentCalorieIntake } = req.body;
  
      const updatedUser = await prisma.user.update({
        where: { id: req.userId },
        data: { name, gender, age, height, weight, activityLevel,currentCalorieIntake },
      });
  
      res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

export default router;
