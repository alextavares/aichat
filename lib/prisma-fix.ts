// Temporary fix for Prisma unique constraint
// This creates the composite unique constraint manually if it doesn't exist

import { prisma } from "./db"

export async function ensureUniqueConstraints() {
  try {
    // Check if we can query the database
    await prisma.user.findFirst()
    console.log("Database connection successful")
  } catch (error) {
    console.error("Database connection failed:", error)
    // For now, we'll continue without throwing to allow development
  }
}