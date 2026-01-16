import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Sync Clerk user with database
 * Creates or updates user record in the database
 */
export async function syncUserWithDatabase() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return null;
  }

  try {
    // Check if user exists in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, user.emailAddresses[0]?.emailAddress || ""))
      .limit(1);

    if (existingUser.length > 0) {
      // User already exists, update if needed
      return existingUser[0];
    }

    // Create new user in database
    const newUser = await db
      .insert(users)
      .values({
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.firstName + " " + user.lastName || user.username || "User",
        password: "", // Not used for OAuth users
      })
      .returning();

    return newUser[0];
  } catch (error) {
    console.error("Error syncing user with database:", error);
    return null;
  }
}

/**
 * Get authenticated user's data from Clerk
 */
export async function getAuthenticatedUser() {
  const user = await currentUser();
  return user;
}

/**
 * Check if user is authenticated
 */
export async function isUserAuthenticated() {
  const { userId } = await auth();
  return !!userId;
}

/**
 * Get user ID from Clerk session
 */
export async function getUserId() {
  const { userId } = await auth();
  return userId;
}
