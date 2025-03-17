/*
  Warnings:

  - Added the required column `generatedText` to the `MealPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MealPlan" ADD COLUMN     "generatedText" TEXT NOT NULL;
