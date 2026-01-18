import { db } from "./index";
import { users, websites, sessions, pageViews, subscriptions, transactions, analyticsSummary, events } from "./schema";
import { eq, and, gte, lte, sql, count, sum, avg, desc } from "drizzle-orm";
import { getAggregatedMetrics } from '@/lib/analytics/aggregation';

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

export async function updateWebsite(websiteId: string, data: Partial<typeof websites.$inferInsert>) {
  return db.update(websites).set(data).where(eq(websites.id, websiteId)).returning();
}

export async function deleteWebsite(websiteId: string) {
  return db.delete(websites).where(eq(websites.id, websiteId)).returning();
}

// Session queries
export async function createSession(data: any) {
  // Filter out fields that don't exist in the schema
  const filteredData = {
    websiteId: data.websiteId,
    sessionId: data.sessionId,
    visitorId: data.visitorId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    country: data.country,
    city: data.city,
    region: data.region,
    device: data.device,
    browser: data.browser,
    os: data.os,
    startTime: data.startTime,
    pageViews: data.pageViews,
    isNewVisitor: data.isNewVisitor,
    timezone: data.timezone,
    language: data.language,
    screenResolution: data.screenResolution,
    viewport: data.viewport,
    browserVersion: data.browserVersion,
    osVersion: data.osVersion,
    isLiveUser: data.isLiveUser
  };

  return db.insert(sessions).values(filteredData).returning();
}

export async function getSessionBySessionId(sessionId: string) {
  return db.query.sessions.findFirst({
    where: eq(sessions.sessionId, sessionId),
  });
}

export async function getSessionsByWebsiteId(websiteId: string, limit: number = 100) {
  return db.query.sessions.findMany({
    where: eq(sessions.websiteId, websiteId),
    limit,
    orderBy: (sessions, { desc }) => desc(sessions.startTime),
  });
}

export async function updateSession(sessionId: string, data: Partial<typeof sessions.$inferInsert>) {
  return db.update(sessions).set(data).where(eq(sessions.id, sessionId)).returning();
}

export async function createEvent(data: typeof events.$inferInsert) {
  return db.insert(events).values(data).returning();
}

export async function getEventsByWebsiteId(websiteId: string, limit: number = 100) {
  return db.query.events.findMany({
    where: eq(events.websiteId, websiteId),
    limit,
    orderBy: (events, { desc }) => desc(events.timestamp),
  });
}

export async function getEventsBySessionId(sessionId: string) {
  return db.query.events.findMany({
    where: eq(events.sessionId, sessionId),
    orderBy: (events, { asc }) => asc(events.timestamp),
  });
}

// Page View queries
export async function createPageView(data: any) {
  // Filter out fields that don't exist in the schema
  const filteredData = {
    sessionId: data.sessionId,
    websiteId: data.websiteId,
    path: data.path,
    title: data.title,
    referrer: data.referrer,
    duration: data.duration,
    pageLoadTime: data.pageLoadTime,
    domReadyTime: data.domReadyTime,
    timestamp: data.timestamp
  };

  return db.insert(pageViews).values(filteredData).returning();
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

// Real-time metrics for live dashboard updates
export async function getRealtimeMetrics(websiteId: string) {
  const now = new Date();

  // Live users (active in last 5 minutes)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const liveUsersResult = await db
    .select({ count: count() })
    .from(sessions)
    .where(and(
      eq(sessions.websiteId, websiteId),
      gte(sessions.lastActivity, fiveMinutesAgo)
    ));

  // Active users in last hour
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const activeUsersHourResult = await db
    .select({ count: count() })
    .from(sessions)
    .where(and(
      eq(sessions.websiteId, websiteId),
      gte(sessions.startTime, oneHourAgo)
    ));

  // Today's sessions
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaySessionsResult = await db
    .select({ count: count() })
    .from(sessions)
    .where(and(
      eq(sessions.websiteId, websiteId),
      gte(sessions.startTime, todayStart)
    ));

  // Today's page views
  const todayPageViewsResult = await db
    .select({ count: count() })
    .from(pageViews)
    .where(and(
      eq(pageViews.websiteId, websiteId),
      gte(pageViews.timestamp, todayStart)
    ));

  // Top pages (last 24 hours)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const topPagesResult = await db
    .select({
      path: pageViews.path,
      title: pageViews.title,
      count: count()
    })
    .from(pageViews)
    .where(and(
      eq(pageViews.websiteId, websiteId),
      gte(pageViews.timestamp, yesterday)
    ))
    .groupBy(pageViews.path, pageViews.title)
    .orderBy(desc(count()))
    .limit(10);

  // Recent events (last 10)
  const recentEventsResult = await db
    .select()
    .from(events)
    .where(and(
      eq(events.websiteId, websiteId),
      gte(events.timestamp, oneHourAgo)
    ))
    .orderBy(desc(events.timestamp))
    .limit(10);

  // Device breakdown (today)
  const deviceBreakdownResult = await db
    .select({
      device: sessions.device,
      count: count()
    })
    .from(sessions)
    .where(and(
      eq(sessions.websiteId, websiteId),
      gte(sessions.startTime, todayStart)
    ))
    .groupBy(sessions.device);

  // Browser breakdown (today)
  const browserBreakdownResult = await db
    .select({
      browser: sessions.browser,
      count: count()
    })
    .from(sessions)
    .where(and(
      eq(sessions.websiteId, websiteId),
      gte(sessions.startTime, todayStart)
    ))
    .groupBy(sessions.browser);

  return {
    liveUsers: liveUsersResult[0]?.count || 0,
    activeUsersHour: activeUsersHourResult[0]?.count || 0,
    todaySessions: todaySessionsResult[0]?.count || 0,
    todayPageViews: todayPageViewsResult[0]?.count || 0,
    topPages: topPagesResult.map(row => ({
      path: row.path,
      title: row.title,
      views: row.count
    })),
    recentEvents: recentEventsResult.map(event => ({
      type: event.eventType,
      timestamp: event.timestamp,
      data: event.eventData
    })),
    deviceBreakdown: deviceBreakdownResult.map(row => ({
      device: row.device,
      count: row.count
    })),
    browserBreakdown: browserBreakdownResult.map(row => ({
      browser: row.browser,
      count: row.count
    }))
  };
}

// Enhanced metrics that intelligently uses aggregated data for historical queries
export async function getEnhancedMetrics(websiteId: string, dateRange?: { from?: Date; to?: Date }, includeRealtime: boolean = false) {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // If no date range specified, get last 30 days
  const fromDate = dateRange?.from || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const toDate = dateRange?.to || now;

  // Determine if we need real-time data (today's data)
  const needsRealtime = includeRealtime || toDate >= yesterday;

  let metrics: {
    totalSessions: number;
    totalPageViews: number;
    totalVisitors: number;
    newVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
    avgTimeOnPage: number;
    uniquePages: number;
    deviceBreakdown: Array<{ device: string; count: number }>;
    browserBreakdown: Array<{ browser: string; count: number }>;
    osBreakdown: Array<{ os: string; count: number }>;
    countryBreakdown: Array<{ country: string; count: number }>;
    eventBreakdown: Array<{ eventType: string; count: number }>;
    topPages: Array<{ path: string; title?: string; views: number; avgTime?: number }>;
    topReferrers: Array<{ referrer: string; count: number }>;
    liveUsers: number;
  } = {
    totalSessions: 0,
    totalPageViews: 0,
    totalVisitors: 0,
    newVisitors: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    avgTimeOnPage: 0,
    uniquePages: 0,
    deviceBreakdown: [],
    browserBreakdown: [],
    osBreakdown: [],
    countryBreakdown: [],
    eventBreakdown: [],
    topPages: [],
    topReferrers: [],
    liveUsers: 0
  };

  // Get aggregated data for historical dates
  if (toDate < yesterday) {
    // Use only aggregated data
    const aggregatedData = await getAggregatedMetrics(websiteId, fromDate, toDate);

    // Sum up the aggregated data
    metrics = aggregatedData.reduce((acc, day) => ({
      totalSessions: acc.totalSessions + day.totalSessions,
      totalPageViews: acc.totalPageViews + day.totalPageViews,
      totalVisitors: acc.totalVisitors + day.totalVisitors,
      newVisitors: acc.newVisitors + day.newVisitors,
      bounceRate: acc.bounceRate + (parseFloat(day.bounceRate || '0') * day.totalSessions), // Weighted average
      avgSessionDuration: acc.avgSessionDuration + (parseFloat(day.avgSessionDuration || '0') * day.totalSessions), // Weighted average
      avgTimeOnPage: acc.avgTimeOnPage + (day.avgTimeOnPage * day.totalPageViews), // Weighted average
      uniquePages: Math.max(acc.uniquePages, day.uniquePages), // Max unique pages
      deviceBreakdown: mergeBreakdowns(acc.deviceBreakdown, day.deviceBreakdown || []),
      browserBreakdown: mergeBreakdowns(acc.browserBreakdown, day.browserBreakdown || []),
      osBreakdown: mergeBreakdowns(acc.osBreakdown, day.osBreakdown || []),
      countryBreakdown: mergeBreakdowns(acc.countryBreakdown, day.countryBreakdown || []),
      eventBreakdown: mergeBreakdowns(acc.eventBreakdown, day.eventBreakdown || []),
      topPages: mergeTopPages(acc.topPages, day.topPages || []),
      topReferrers: mergeTopReferrers(acc.topReferrers, day.topReferrers || []),
      liveUsers: acc.liveUsers // Keep the liveUsers from accumulator
    } as typeof metrics), metrics);

    // Calculate weighted averages
    const totalSessions = metrics.totalSessions;
    const totalPageViews = metrics.totalPageViews;

    if (totalSessions > 0) {
      metrics.bounceRate = Math.round((metrics.bounceRate / totalSessions) * 100) / 100;
      metrics.avgSessionDuration = Math.round((metrics.avgSessionDuration / totalSessions) * 100) / 100;
    }

    if (totalPageViews > 0) {
      metrics.avgTimeOnPage = Math.round(metrics.avgTimeOnPage / totalPageViews);
    }

  } else {
    // Mix of aggregated data and real-time data
    const yesterdayData = toDate >= yesterday ? await getAggregatedMetrics(websiteId, fromDate, yesterday) : [];
    const realtimeData = await getRealtimeMetrics(websiteId);

    // Aggregate yesterday's data
    const yesterdayMetrics = yesterdayData.reduce((acc, day) => ({
      totalSessions: acc.totalSessions + day.totalSessions,
      totalPageViews: acc.totalPageViews + day.totalPageViews,
      totalVisitors: acc.totalVisitors + day.totalVisitors,
      newVisitors: acc.newVisitors + day.newVisitors,
      bounceRate: acc.bounceRate + (parseFloat(day.bounceRate || '0') * day.totalSessions),
      avgSessionDuration: acc.avgSessionDuration + (parseFloat(day.avgSessionDuration || '0') * day.totalSessions),
      avgTimeOnPage: acc.avgTimeOnPage + (day.avgTimeOnPage * day.totalPageViews),
      uniquePages: Math.max(acc.uniquePages, day.uniquePages),
      deviceBreakdown: mergeBreakdowns(acc.deviceBreakdown, day.deviceBreakdown || []),
      browserBreakdown: mergeBreakdowns(acc.browserBreakdown, day.browserBreakdown || []),
      osBreakdown: mergeBreakdowns(acc.osBreakdown, day.osBreakdown || []),
      countryBreakdown: mergeBreakdowns(acc.countryBreakdown, day.countryBreakdown || []),
      eventBreakdown: mergeBreakdowns(acc.eventBreakdown, day.eventBreakdown || []),
      topPages: mergeTopPages(acc.topPages, day.topPages || []),
      topReferrers: mergeTopReferrers(acc.topReferrers, day.topReferrers || []),
    } as typeof acc), {
      totalSessions: 0,
      totalPageViews: 0,
      totalVisitors: 0,
      newVisitors: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      avgTimeOnPage: 0,
      uniquePages: 0,
      deviceBreakdown: [],
      browserBreakdown: [],
      osBreakdown: [],
      countryBreakdown: [],
      eventBreakdown: [],
      topPages: [],
      topReferrers: [],
    });

    // Add today's real-time data
    metrics = {
      totalSessions: yesterdayMetrics.totalSessions + realtimeData.todaySessions,
      totalPageViews: yesterdayMetrics.totalPageViews + realtimeData.todayPageViews,
      totalVisitors: yesterdayMetrics.totalVisitors + realtimeData.activeUsersHour, // Approximation
      newVisitors: yesterdayMetrics.newVisitors,
      bounceRate: yesterdayMetrics.totalSessions > 0 ? Math.round((yesterdayMetrics.bounceRate / yesterdayMetrics.totalSessions) * 100) / 100 : 0,
      avgSessionDuration: yesterdayMetrics.totalSessions > 0 ? Math.round((yesterdayMetrics.avgSessionDuration / yesterdayMetrics.totalSessions) * 100) / 100 : 0,
      avgTimeOnPage: yesterdayMetrics.totalPageViews > 0 ? Math.round(yesterdayMetrics.avgTimeOnPage / yesterdayMetrics.totalPageViews) : 0,
      uniquePages: yesterdayMetrics.uniquePages,
      deviceBreakdown: mergeBreakdowns(yesterdayMetrics.deviceBreakdown, realtimeData.deviceBreakdown),
      browserBreakdown: mergeBreakdowns(yesterdayMetrics.browserBreakdown, realtimeData.browserBreakdown),
      osBreakdown: yesterdayMetrics.osBreakdown, // No OS breakdown in realtime
      countryBreakdown: yesterdayMetrics.countryBreakdown, // No country breakdown in realtime
      eventBreakdown: yesterdayMetrics.eventBreakdown, // No event breakdown in realtime
      topPages: mergeTopPages(yesterdayMetrics.topPages, realtimeData.topPages.map(p => ({ ...p, avgTime: 0 }))),
      topReferrers: yesterdayMetrics.topReferrers, // No referrer breakdown in realtime
      liveUsers: realtimeData.liveUsers
    };
  }

  return metrics;
}

// Helper functions for merging breakdowns
function mergeBreakdowns(existing: any[], newData: any[]) {
  const merged = [...existing];
  newData.forEach(item => {
    const existingItem = merged.find(m => m.device === item.device || m.browser === item.browser || m.os === item.os || m.country === item.country || m.eventType === item.eventType);
    if (existingItem) {
      existingItem.count += item.count;
    } else {
      merged.push(item);
    }
  });
  return merged.sort((a, b) => b.count - a.count);
}

function mergeTopPages(existing: any[], newData: any[]) {
  const merged = [...existing];
  newData.forEach(item => {
    const existingItem = merged.find(m => m.path === item.path);
    if (existingItem) {
      existingItem.views += item.views;
      if (item.avgTime) {
        existingItem.avgTime = Math.round((existingItem.avgTime * existingItem.views + item.avgTime * item.views) / (existingItem.views + item.views));
      }
    } else {
      merged.push(item);
    }
  });
  return merged.sort((a, b) => b.views - a.views).slice(0, 20);
}

function mergeTopReferrers(existing: any[], newData: any[]) {
  const merged = [...existing];
  newData.forEach(item => {
    const existingItem = merged.find(m => m.referrer === item.referrer);
    if (existingItem) {
      existingItem.count += item.count;
    } else {
      merged.push(item);
    }
  });
  return merged.sort((a, b) => b.count - a.count).slice(0, 20);
}
