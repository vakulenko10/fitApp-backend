import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js'; // Assuming server.js exports the prisma client

const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id, username: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000, // 1 hour expiration
    });

    res.json({ token });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth route can be added here, or other authentication-related routes
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  // Check if the required fields are provided
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  try {
    // Check if the user already exists
    let user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10); // Use salt rounds (10 is common)

    // Create the new user in the database
    user = await prisma.user.create({
      data: {
        email,
        passwordHash, // Store the hashed password
        name,
      },
    });

    // Generate a JWT token for the newly registered user
    const token = jwt.sign({ userId: user.id, username: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set the token as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000, // 1 hour expiration
    });

    // Respond with the token
    res.json({ token });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});
export default router;
