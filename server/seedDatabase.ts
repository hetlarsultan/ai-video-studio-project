#!/usr/bin/env node

/**
 * Database Seeding Script
 * Run this script to populate the database with predefined templates
 * 
 * Usage: npx tsx server/seedDatabase.ts
 */

import { seedTemplates } from "./seedTemplates";

async function main() {
  console.log("🚀 Starting database seeding...\n");
  
  try {
    await seedTemplates();
    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database seeding failed:", error);
    process.exit(1);
  }
}

main();
