import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js'; // Assuming server.js exports the prisma client

const router = express.Router();

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;
const GOOGLE_TOKEN_INFO_URL = process.env.GOOGLE_TOKEN_INFO_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const BASE_URL =  process.env.BASE_URL;
const GOOGLE_CALLBACK_URL = `${BASE_URL}/google/callback`;

const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

// Google OAuth login endpoint
router.get("/google-auth", async (req, res) => {
  const state = "some_state";
  const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
  const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;
  res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
});

// Google OAuth callback endpoint
router.get("/google/callback", async (req, res) => {
  console.log(req.query);
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${BASE_URL}/login?error=missing_code`);
  }

  const data = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_CALLBACK_URL,
    grant_type: "authorization_code",
  };

  try {
    // Exchange authorization code for access token & ID token
    const response = await fetch(GOOGLE_ACCESS_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const access_token_data = await response.json();

    if (!access_token_data.id_token) {
      return res.redirect(`${BASE_URL}/login?error=token_error`);
    }

    // Fetch user info from Google's token info endpoint
    const token_info_response = await fetch(
      `${GOOGLE_TOKEN_INFO_URL}?id_token=${access_token_data.id_token}`
    );
    const user_info = await token_info_response.json();

    if (!user_info.email) {
      return res.redirect(`${BASE_URL}/login?error=user_info_error`);
    }

    console.log("User Info:", user_info);

    // Check if the user already exists in the database
    let user = await prisma.user.findUnique({
      where: { email: user_info.email },
    });

    // If the user doesn't exist, create a new user with only essential fields
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: user_info.email,
          googleId: user_info.sub, // Google ID
          name: user_info.name,
        },
      });
    }

    // Generate JWT token for the user
    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
        picture: user_info.picture,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set a cookie and redirect
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, 
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.redirect(`${BASE_URL}/logged-in`);
    
  } catch (error) {
    console.error("OAuth Error:", error);
    res.redirect(`${BASE_URL}/login?error=server_error`);
  }
});
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
