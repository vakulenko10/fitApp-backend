import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"; // Import JWT library
import { askDeepseek } from "./deepseek-func.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
export const app = express();

// Middleware to parse JSON
app.use(express.json());

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
app.get("/google-auth", async (req, res) => {
  const state = "some_state";
  const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
  const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;
  res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
});

// Google OAuth callback endpoint
app.get("/google/callback", async (req, res) => {
  console.log(req.query);
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=missing_code`);
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
      return res.redirect(`${FRONTEND_URL}/login?error=token_error`);
    }

    // Fetch user info from Google's token info endpoint
    const token_info_response = await fetch(
      `${GOOGLE_TOKEN_INFO_URL}?id_token=${access_token_data.id_token}`
    );
    const user_info = await token_info_response.json();

    if (!user_info.email) {
      return res.redirect(`${FRONTEND_URL}/login?error=user_info_error`);
    }

    console.log("User Info:", user_info);

    // Generate JWT token for the user
    const token = jwt.sign(
      {
        email: user_info.email,
        name: user_info.name,
        picture: user_info.picture,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Redirect to frontend with token
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === "production", // Secure only in HTTPS
      sameSite: "Strict", // Prevent CSRF
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    res.redirect(`${FRONTEND_URL}/logged-in`);
    
    console.log(res)
  } catch (error) {
    console.error("OAuth Error:", error);
    res.redirect(`${FRONTEND_URL}/login?error=server_error`);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
