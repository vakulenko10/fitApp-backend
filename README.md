# 🧠 FitApp – Backend API

This is the backend for the FitApp project, built using Node.js, Express, and Prisma. It handles authentication, user data, calorie calculations, and communicates with the frontend via RESTful APIs.

---

## 🚀 Live Demo

🔗 [https://fit-app-frontend.vercel.app](https://fit-app-frontend.vercel.app) – hosted on **Vercel**

---

## 👨‍💻 Contributors
- [@VladyslavNz](https://github.com/VladyslavNz) – Full Stack Developer, UI/UX Designer
- [@scarfacegrizl](https://github.com/scarfacegrizl) – Frontend Developer, UI/UX Designer
- [@Makc240305](https://github.com/Makc240305) – Frontend Developer, Database Engineer
- [@vakulenko10](https://github.com/vakulenko10) – Full Stack Developer, QA, Project Manager
- [@AsakuraAv](https://github.com/AsakuraAv) – Frontend Developer
- [@Bohdan-Sandovenko](https://github.com/Bohdan-Sandovenko) – Frontend Developer
- [@akaAIBOT](https://github.com/akaAIBOT) – Backend Developer, Database Engineer
- [@MakxsL](https://github.com/MakxsL) – Backend Developer

---

## 🧠 Key Features

- ⚖️ **Calorie Intake Calculator** – Calculates your optimal daily calorie intake based on your goals and body parameters.
- 🍱 **AI-Powered Recipe Generator** – Suggests meal recipes that match your calorie goals and food preferences.
- 📈 **Weight Tracking Charts** – Visualize your weight progress with dynamic Recharts.
- 📜 **Meal Plan History** – Keep a detailed history of your daily or weekly meal plans.

---
### 🖥 Backend Setup

> Prerequisites: Node.js, PostgreSQL or Supabase, Prisma CLI

1. **Clone the backend repository**
   ```bash
   git clone https://github.com/vakulenko10/fitApp-backend .

2. **Run this command in your terminal**
   ```bash
   npm install
   ```
3. **Configure environment variables as in env.template**
    ```bash 
    PORT=5000
    # go to https://openrouter.ai/deepseek/deepseek-r1-zero:free/api and create an API key
    DEEPSEEK_API_KEY=...
    
    # go to supabase and create a new project
    DATABASE_URL=...
    
    
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    
    GOOGLE_OAUTH_URL=https://accounts.google.com/o/oauth2/v2/auth
    
    GOOGLE_ACCESS_TOKEN_URL=https://oauth2.googleapis.com/token
    
    GOOGLE_TOKEN_INFO_URL=https://oauth2.googleapis.com/tokeninfo
    
    JWT_SECRET=...
    
    FRONTEND_URL=http://localhost:5173
    
    NODE_ENV=development
    BASE_URL=http://localhost:5000
    ```
4. **Generate Prisma Client and Apply Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
5. **Start the backend server**
    ```bash
     npm run dev
---
# 📘API Documentation
This API powers the backend of **FitApp** 
> Base URL: `http://localhost:5000` (or your deployed backend URL)
--

## 🔐 Authentication Routes

### `POST /login`
Logs in a user with email and password.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```
### `POST /register`
Registers a new user.

**Body:**
```json
{
   "email": "user@example.com",
  "password": "your_password",
  "name": "John Doe"
}
```
### `GET /google-auth`
Initiates Google OAuth login process.
## 👤 User Profile

### `GET /user/profile`
Returns the current authenticated user's profile data.

**Headers:**
```json
{
   "Authorization": "Bearer your_token"
}
```
### `PUT /user/profile`
Updates the user's profile information.

**Headers:**
```json
{
   "Authorization": "Bearer your_token"
}
```


**Body:**
```json
{
  "name": "Updated Name"
}
```

## 🍽️ Meal Plans
### `POST /mealplan/generate`
Generates a personalized meal plan based on user's profile. for authenticated user
**Headers:**
```json
{
   "Authorization": "Bearer your_token"
}
```
**Body:**
```json
{
    "products":["banana", "strawberry", "milk", "chicken", "rice", "bread"],
    "excludedProducts":["fish", "raspberry", "nuts", "pork", "potato", "cheese"],
    "preferences": 'i want to get recipees with (salmon) but without *peanuts'
    "calories": 1500
}
```
### `POST /mealplan/generate-unauthorized`
Generates a personalized meal plan based on user's profile. for unauthorized user

**Body:**
```json
{
    "products":["banana", "strawberry", "milk", "chicken", "rice", "bread"],
    "excludedProducts":["fish", "raspberry", "nuts", "pork", "potato", "cheese"],
    "preferences": 'i want to get recipees with (salmon) but without *peanuts'
    "calories": 1500
}
```
### `GET /mealplan/history`
Returns the user's past meal plans.
**Headers:**
```json
{
   "Authorization": "Bearer your_token"
}
```
## ⚖️ Weight Tracking
### `POST /weight/add`
Generates a personalized meal plan based on user's profile. for authenticated user

**Headers:**
```json
{
   "Authorization": "Bearer your_token"
}
```
**Body:**
```json
{
  "weight": 70.5
}
```
### `GET /weight/history`
Retrieves the user's full weight tracking history.

**Headers:**
```json
{
   "Authorization": "Bearer your_token"
}
```
### `PUT /weight/update/:id`
Updates a specific weight entry by its ID.

**Headers:**
```json
{
   "Authorization": "Bearer your_token"
}
```
**Body:**
```json
{
  "weight": 72.0
}
```
**Deployed with render.com**

## 💬 Contact

If you have any questions, suggestions, or want to collaborate — feel free to reach out to the contributors

> Built with passion by the FitApp Team 💪
