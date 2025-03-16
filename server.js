import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"; // Import JWT library
import bcrypt from 'bcryptjs';
import { askDeepseek } from "./deepseek-func.js";
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
dotenv.config();
import authRoutes from './routes/auth.js';
import userRoutes from "./routes/user.js";


const PORT = process.env.PORT || 5000;
export const app = express();

// Middleware to parse JSON
app.use(express.json());
// app.use(cookieParser()); 
app.use('/auth', authRoutes);
app.use("/user", userRoutes);




// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
