import express from 'express';
import { prisma } from '../server.js';  
import dotenv from 'dotenv';
import { authenticateToken } from '../utils/authenticateToken.js';
import { askDeepseek } from '../deepseek-func.js';
dotenv.config();

const router = express.Router();

router.post('/generate', authenticateToken, async (req, res) => {
  try {
    console.log(req.body);
    const { products, excludedProducts, calories } = req.body;

    // Fetch user's API key from the database
    const user = await prisma.user.findUnique({
      where: req.email ? { email: req?.email } : { id: req.userId },
      select: { apiKey: true, id: true }, // Include user id for meal plan association
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calling the askDeepseek function to get the meal plan
    const mealPlanText = await askDeepseek(products, excludedProducts, calories, user.apiKey);

    // Store the meal plan in the database
    const newMealPlan = await prisma.mealPlan.create({
      data: {
        userId: user.id,
        calorieIntake: calories, // You may adjust this depending on how you want to store calories
        includedProducts: JSON.stringify(products), // Save as JSON
        excludedProducts: JSON.stringify(excludedProducts), // Save as JSON
        generatedText: JSON.stringify(mealPlanText)
      },
    });

    // Returning the generated meal plan and saving it in the database
    res.status(200).json({
      mealPlan: mealPlanText,
      storedMealPlan: newMealPlan, // Optional: you can return the stored meal plan info
    });

  } catch (error) {
    console.error('DeepSeek API Error:', error);
    res.status(500).json({ error: 'Failed to fetch response from DeepSeek API' });
  }
});

export default router;
