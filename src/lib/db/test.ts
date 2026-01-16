import { db } from "@/lib/db";
import { users, plans } from "@/lib/db/schema";

async function testDatabaseConnection() {
  try {
    console.log("Testing database connection...");

    // Test 1: Check if we can query the users table
    const allUsers = await db.select().from(users).limit(1);
    console.log("✓ Users table accessible");

    // Test 2: Check if we can query the plans table
    const allPlans = await db.select().from(plans).limit(1);
    console.log("✓ Plans table accessible");

    // Test 3: Insert a test plan
    const newPlan = await db
      .insert(plans)
      .values({
        name: "Test Plan",
        price: "0",
        features: ["test"],
      })
      .returning();
    console.log("✓ Insert operation successful:", newPlan);

    // Test 4: Clean up - delete the test plan
    await db.delete(plans).where((p) => p.id.isNotNull());
    console.log("✓ Delete operation successful");

    console.log("\n✅ Database connection test passed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    process.exit(1);
  }
}

testDatabaseConnection();
