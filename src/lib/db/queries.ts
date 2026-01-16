import { db } from "./index";
import { users, websites, sessions, pageViews, subscriptions, transactions, analyticsSummary } from "./schema";
import { eq, and, gte, lte, sql, count, sum, avg } from "drizzle-orm";

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

export async function getSessionBySessionId(sessionId: string) {
  return db.query.sessions.findFirst({
    where: eq(sessions.sessionId, sessionId),
  });
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

// Dashboard Metrics queries
export async function getDashboardMetrics(websiteId: string, fromDate?: Date, toDate?: Date) {
  let dateFilter = sql`TRUE`;
  if (fromDate && toDate) {
    dateFilter = and(gte(sessions.startTime, fromDate), lte(sessions.startTime, toDate)) as any;
  }

  // Total Visitors (unique sessions)
  const totalVisitorsResult = await db
    .select({ count: count() })
    .from(sessions)
    .where(and(eq(sessions.websiteId, websiteId), dateFilter));

  // Total Page Views
  const totalPageViewsResult = await db
    .select({ count: count() })
    .from(pageViews)
    .where(and(eq(pageViews.websiteId, websiteId), dateFilter));

  // Total Active Time (sum of session durations in minutes)
  const totalActiveTimeResult = await db
    .select({ total: sum(sessions.duration) })
    .from(sessions)
    .where(and(eq(sessions.websiteId, websiteId), dateFilter, sql`${sessions.duration} IS NOT NULL`));

  // Average Time on Page (average of page view durations in seconds)
  const avgTimeOnPageResult = await db
    .select({ avg: avg(pageViews.duration) })
    .from(pageViews)
    .where(and(eq(pageViews.websiteId, websiteId), dateFilter, sql`${pageViews.duration} IS NOT NULL`));

  // Live Users (sessions active in last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const liveUsersResult = await db
    .select({ count: count() })
    .from(sessions)
    .where(and(
      eq(sessions.websiteId, websiteId),
      gte(sessions.startTime, fiveMinutesAgo),
      sql`${sessions.endTime} IS NULL OR ${sessions.endTime} > ${fiveMinutesAgo}`
    ));

  return {
    totalVisitors: totalVisitorsResult[0]?.count || 0,
    totalPageViews: totalPageViewsResult[0]?.count || 0,
    totalActiveTime: Math.round((Number(totalActiveTimeResult[0]?.total) || 0) / 60), // Convert to minutes
    avgTimeOnPage: Math.round(Number(avgTimeOnPageResult[0]?.avg) || 0), // In seconds
    liveUsers: liveUsersResult[0]?.count || 0,
  };
}
