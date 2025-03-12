import express from "express"

import dotenv from 'dotenv';
import { askDeepseek } from "./deepseek-func.js";
dotenv.config()
const PORT = process.env.PORT || 5000;
export const app = express();
// Middleware to parse JSON
app.use(express.json());

app.post("/deepseek/chat", async (req, res) => {
    try {
        console.log(req.body)
        const {products, calories} = req.body;
        const response = await askDeepseek(products, calories);
        console.log(response)
        res.json(response); 
    }
    catch(error){
        console.error("DeepSeek API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch response from DeepSeek API" });
    }
    
})
// Define a simple route
app.get("/", (req, res) => {
    res.send("Hello, Express!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const GOOGLE_CALLBACK_URL = "http://localhost:5000/google/callback"; // Do not URL encode here

const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

app.get("/google-auth", async (req, res) => {
  console.log('hi')
  const state = "some_state";
  const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
  const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;
  res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
});


const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;

app.get("/google/callback", async (req, res) => {
  console.log(req.query);

  const { code } = req.query;

  const data = {
    code,

    client_id: GOOGLE_CLIENT_ID,

    client_secret: GOOGLE_CLIENT_SECRET,

    redirect_uri: "http://localhost:5000/google/callback",

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
  res.status(token_info_response.status).json(await token_info_response.json());
//   res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
  res.redirect(`http://localhost:3000/`);
});