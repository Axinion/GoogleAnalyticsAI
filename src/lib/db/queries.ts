import { db } from "./index";
import { users, websites, sessions, pageViews, subscriptions, transactions, analyticsSummary } from "./schema";
import { eq, and, gte, lte } from "drizzle-orm";

// User queries
export async function getUserById(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function createUser(data: typeof users.$inferInsert) {
  return db.insert(users).values(data).returning();
}

// Website queries
export async function getWebsitesByUserId(userId: string) {
  return db.query.websites.findMany({
    where: eq(websites.userId, userId),
  });
}

export async function getWebsiteById(websiteId: string) {
  return db.query.websites.findFirst({
    where: eq(websites.id, websiteId),
    with: {
      sessions: true,
      pageViews: true,
      analyticsSummary: true,
    },
  });
}

export async function getWebsiteByTrackingId(trackingId: string) {
  return db.query.websites.findFirst({
    where: eq(websites.trackingId, trackingId),
  });
}

export async function createWebsite(data: typeof websites.$inferInsert) {
  return db.insert(websites).values(data).returning();
}

// Session queries
export async function createSession(data: typeof sessions.$inferInsert) {
  return db.insert(sessions).values(data).returning();
}

export async function getSessionsByWebsiteId(websiteId: string, limit: number = 100) {
  return db.query.sessions.findMany({
    where: eq(sessions.websiteId, websiteId),
    limit,
    orderBy: (sessions, { desc }) => desc(sessions.startTime),
  });
}

export async function updateSession(
  sessionId: string,
  data: Partial<typeof sessions.$inferInsert>
) {
  return db.update(sessions).set(data).where(eq(sessions.id, sessionId)).returning();
}

// Page View queries
export async function createPageView(data: typeof pageViews.$inferInsert) {
  return db.insert(pageViews).values(data).returning();
}

export async function getPageViewsBySessionId(sessionId: string) {
  return db.query.pageViews.findMany({
    where: eq(pageViews.sessionId, sessionId),
    orderBy: (pageViews, { asc }) => asc(pageViews.timestamp),
  });
}

export async function getPageViewsByWebsiteId(websiteId: string, limit: number = 100) {
  return db.query.pageViews.findMany({
    where: eq(pageViews.websiteId, websiteId),
    limit,
    orderBy: (pageViews, { desc }) => desc(pageViews.timestamp),
  });
}

// Subscription queries
export async function getUserSubscriptions(userId: string) {
  return db.query.subscriptions.findMany({
    where: eq(subscriptions.userId, userId),
    with: {
      plan: true,
      transactions: true,
    },
  });
}

export async function createSubscription(data: typeof subscriptions.$inferInsert) {
  return db.insert(subscriptions).values(data).returning();
}

export async function updateSubscription(
  subscriptionId: string,
  data: Partial<typeof subscriptions.$inferInsert>
) {
  return db.update(subscriptions).set(data).where(eq(subscriptions.id, subscriptionId)).returning();
}

// Transaction queries
export async function createTransaction(data: typeof transactions.$inferInsert) {
  return db.insert(transactions).values(data).returning();
}

export async function getTransactionsBySubscriptionId(subscriptionId: string) {
  return db.query.transactions.findMany({
    where: eq(transactions.subscriptionId, subscriptionId),
    orderBy: (transactions, { desc }) => desc(transactions.createdAt),
  });
}

// Analytics Summary queries
export async function getAnalyticsSummaryByWebsiteId(websiteId: string, fromDate?: Date, toDate?: Date) {
  let whereCondition = eq(analyticsSummary.websiteId, websiteId);

  if (fromDate && toDate) {
    whereCondition = and(
      eq(analyticsSummary.websiteId, websiteId),
      gte(analyticsSummary.date, fromDate),
      lte(analyticsSummary.date, toDate)
    ) as any;
  }

  return db.query.analyticsSummary.findMany({
    where: whereCondition,
    orderBy: (analyticsSummary, { asc }) => asc(analyticsSummary.date),
  });
}

export async function createOrUpdateAnalyticsSummary(data: typeof analyticsSummary.$inferInsert) {
  return db.insert(analyticsSummary).values(data).returning();
}
