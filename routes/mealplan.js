import express from "express";
import { prisma } from "../server.js";
import dotenv from "dotenv";
import { authenticateToken } from "../utils/authenticateToken.js";
import { askDeepseek } from "../deepseek-func.js";
dotenv.config();

const router = express.Router();

router.post("/generate", authenticateToken, async (req, res) => {
  try {
    console.log(req.body);
    const { products, excludedProducts, calories, preferences } = req.body;

    // Fetch user's API key from the database
    const user = await prisma.user.findUnique({
      where: req.email ? { email: req?.email } : { id: req.userId },
      select: { apiKey: true, id: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calling the askDeepseek function to get the meal plan
    const mealPlanText = await askDeepseek(
      products,
      excludedProducts,
      calories,
      preferences, // Pass the full preferences text directly
      user.apiKey
    );

    // Store the meal plan in the database
    const newMealPlan = await prisma.mealPlan.create({
      data: {
        userId: user.id,
        calorieIntake: calories,
        includedProducts: JSON.stringify(products),
        excludedProducts: JSON.stringify(excludedProducts),
        generatedText: JSON.stringify(mealPlanText),
        preferences: preferences || null,
      },
    });

    // Returning the generated meal plan and saving it in the database
    res.status(200).json({
      mealPlan: mealPlanText,
      storedMealPlan: newMealPlan,
    });
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch response from DeepSeek API" });
  }
});

router.post("/generate-unauthorized", async (req, res) => {
  try {
    console.log(req.body);
    const { products, excludedProducts, calories } = req.body;

    // Calling the askDeepseek function to get the meal plan
    const mealPlanText = await askDeepseek(
      products,
      excludedProducts,
      calories
    );

    // Returning the generated meal plan without storing it in the database
    res.status(200).json({
      mealPlan: mealPlanText,
    });
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch response from DeepSeek API" });
  }
});

router.get("/history", authenticateToken, async (req, res) => {
  try {
    // Fetch the user from the database based on the authentication token
    const user = await prisma.user.findUnique({
      where: req.email ? { email: req?.email } : { id: req.userId },
      select: { id: true }, // Only need the user ID to fetch meal plans
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Retrieve all meal plans associated with the authenticated user
    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        userId: user.id, // Get meal plans for the authenticated user
      },
      orderBy: {
        createdAt: "desc", // Order by creation date, most recent first
      },
    });

    // Return the meal plans
    res.status(200).json({
      mealPlans,
    });
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    res.status(500).json({ error: "Failed to fetch meal plans" });
  }
});

export default router;
