import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../server.js";  

const router = express.Router();
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;


if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables!");
    process.exit(1); 
  }