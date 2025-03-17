import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import cors from 'cors'
export const prisma = new PrismaClient();
dotenv.config();
import authRoutes from './routes/auth.js';
import userRoutes from "./routes/user.js";
import mealplanRoutes from "./routes/mealplan.js";


const PORT = process.env.PORT || 5000;
export const app = express();

app.use(cors());

app.use(cors({
  origin: 'http://localhost:5173', // Allow only your frontend
}));

// Middleware to parse JSON
app.use(express.json());
// app.use(cookieParser()); 
app.use('/auth', authRoutes);
app.use("/user", userRoutes);
app.use("/mealplan", mealplanRoutes);




// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
