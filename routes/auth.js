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

  const data = {
    code,

    client_id: GOOGLE_CLIENT_ID,

    client_secret: GOOGLE_CLIENT_SECRET,

    redirect_uri: `${BASE_URL}/google/callback`,

    grant_type: "authorization_code",
  };

  console.log(data);

  // exchange authorization code for access token & id_token

  const response = await fetch(GOOGLE_ACCESS_TOKEN_URL, {
    method: "POST",

    body: JSON.stringify(data),
  });

  const access_token_data = await response.json();
  const { id_token } = access_token_data;

  console.log(id_token);

  // verify and extract the information in the id token

  const token_info_response = await fetch(
    `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
  );
  const user_info = await token_info_response.json();
  if (!user_info.email) {
    return res.redirect(`${BASE_URL}/login?error=user_info_error`);
  }
  
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

  const token = jwt.sign(
    {
      email: user.email,
      name: user.name,
      picture: user_info.picture,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.send(`
    <html>
      <body>
        <script>  
          window.opener.postMessage(${JSON.stringify({ user, profileImageURL:user_info.picture, token})}, "${FRONTEND_URL}");
          window.close();
        </script>
      </body>
    </html>
  `);
  // res.status(token_info_response.status).json({ user, token })
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

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "Strict",
    //   maxAge: 60 * 60 * 1000, // 1 hour expiration
    // });

    // res.json({ token });
    res.json({ user, token });

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
