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
      where:  req.email?{ email: req?.email}:{id: req.userId},
      select: { apiKey: true },
    });

    // Calling the askDeepseek function
    const mealPlan = await askDeepseek(products, excludedProducts, calories, user.apiKey);

    // Returning the generated meal plan
    res.status(200).json({ mealPlan });

  } catch (error) {
    console.error('DeepSeek API Error:', error);
    res.status(500).json({ error: 'Failed to fetch response from DeepSeek API' });
  }
});

export default router;
