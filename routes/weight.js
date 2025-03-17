import express from "express";
import { prisma } from "../server.js";
import { authenticateToken } from "../utils/authenticateToken.js";

const router = express.Router();

// Add weight record (Only one per day)
router.post("/add", authenticateToken, async (req, res) => {
  const { weight } = req.body;
  
  if (!weight) {
    return res.status(400).json({ error: "Weight value is required" });
  }

  try {
    // Get the current date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Check if the user has already recorded weight today
    const existingRecord = await prisma.weightTracking.findFirst({
      where: {
        userId: req.userId,
        recordedAt: {
          gte: new Date(today), // Greater than or equal to today's date
        },
      },
    });

    if (existingRecord) {
      return res.status(400).json({ error: "You can only log weight once per day." });
    }

    // Create new weight record
    const newRecord = await prisma.weightTracking.create({
      data: {
        userId: req.userId,
        weight,
      },
    });

    // Update user's current weight
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { weight },
    });

    res.json({ ...newRecord, user: updatedUser });

  } catch (error) {
    console.error("Error adding weight record:", error);
    res.status(500).json({ error: "Failed to add weight record" });
  }
});
router.put("/update/:id", authenticateToken, async (req, res) => {
  const { weight } = req.body;
  const { id } = req.params;

  if (!weight) {
    return res.status(400).json({ error: "Weight value is required" });
  }

  try {
    const record = await prisma.weightTracking.findUnique({
      where: { id },
    });

    if (!record || record.userId !== req.userId) {
      return res.status(404).json({ error: "Weight record not found" });
    }

    // Get the date limit (3 days ago)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Check if the record is within the allowed time frame
    const recordDate = new Date(record.recordedAt);
    if (recordDate < threeDaysAgo) {
      return res.status(400).json({ error: "You can only edit records from the last 3 days." });
    }

    // Update the weight record
    const updatedRecord = await prisma.weightTracking.update({
      where: { id },
      data: { weight },
    });

    res.json({ message: "Weight record updated successfully", updatedRecord });

  } catch (error) {
    console.error("Error updating weight record:", error);
    res.status(500).json({ error: "Failed to update weight record" });
  }
});
// Get weight history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const history = await prisma.weightTracking.findMany({
      where: { userId: req.userId },
      orderBy: { recordedAt: "desc" },
    });

    res.json({ history });
  } catch (error) {
    console.error("Error fetching weight history:", error);
    res.status(500).json({ error: "Failed to retrieve weight history" });
  }
});

export default router;
