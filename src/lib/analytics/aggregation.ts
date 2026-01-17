import { db } from '@/lib/db/index';
import { sessions, pageViews, events, analyticsSummary } from '@/lib/db/schema';
import { eq, and, gte, lte, sql, count, sum, avg } from 'drizzle-orm';

export async function aggregateAnalyticsData(websiteId: string, date: Date) {
  // Set date range for the day
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  const dateFilter = and(
    gte(sessions.startTime, startOfDay),
    lte(sessions.startTime, endOfDay)
  );

  // Aggregate session data
  const sessionStats = await db
    .select({
      totalSessions: count(),
      totalVisitors: sql<number>`count(distinct ${sessions.visitorId})`,
      totalDuration: sum(sessions.duration),
      newVisitors: sql<number>`count(case when ${sessions.isNewVisitor} = true then 1 end)`,
      liveUsers: sql<number>`count(case when ${sessions.lastActivity} > ${new Date(Date.now() - 5 * 60 * 1000)} then 1 end)`
    })
    .from(sessions)
    .where(and(eq(sessions.websiteId, websiteId), dateFilter));

  // Aggregate page view data
  const pageViewStats = await db
    .select({
      totalPageViews: count(),
      avgTimeOnPage: avg(pageViews.duration),
      uniquePages: sql<number>`count(distinct ${pageViews.path})`
    })
    .from(pageViews)
    .where(and(eq(pageViews.websiteId, websiteId), dateFilter));

  // Calculate bounce rate (sessions with only 1 page view)
  const bounceRateResult = await db
    .select({
      bouncedSessions: sql<number>`count(case when ${sessions.pageViews} = 1 then 1 end)`,
      totalSessions: count()
    })
    .from(sessions)
    .where(and(eq(sessions.websiteId, websiteId), dateFilter));

  const bounceRate = bounceRateResult[0]?.totalSessions > 0
    ? (bounceRateResult[0].bouncedSessions / bounceRateResult[0].totalSessions) * 100
    : 0;

  // Aggregate device/browser data
  const deviceStats = await db
    .select({
      device: sessions.device,
      count: count()
    })
    .from(sessions)
    .where(and(eq(sessions.websiteId, websiteId), dateFilter))
    .groupBy(sessions.device);

  const browserStats = await db
    .select({
      browser: sessions.browser,
      count: count()
    })
    .from(sessions)
    .where(and(eq(sessions.websiteId, websiteId), dateFilter))
    .groupBy(sessions.browser);

  const osStats = await db
    .select({
      os: sessions.os,
      count: count()
    })
    .from(sessions)
    .where(and(eq(sessions.websiteId, websiteId), dateFilter))
    .groupBy(sessions.os);

  // Aggregate geographic data
  const countryStats = await db
    .select({
      country: sessions.country,
      count: count()
    })
    .from(sessions)
    .where(and(eq(sessions.websiteId, websiteId), dateFilter, sql`${sessions.country} is not null`))
    .groupBy(sessions.country);

  // Aggregate event data
  const eventStats = await db
    .select({
      eventType: events.eventType,
      count: count()
    })
    .from(events)
    .where(and(eq(events.websiteId, websiteId), dateFilter))
    .groupBy(events.eventType);

  // Calculate top pages
  const topPages = await db
    .select({
      path: pageViews.path,
      title: pageViews.title,
      views: count(),
      avgTime: avg(pageViews.duration)
    })
    .from(pageViews)
    .where(and(eq(pageViews.websiteId, websiteId), dateFilter))
    .groupBy(pageViews.path, pageViews.title)
    .orderBy(sql`count(*) desc`)
    .limit(20);

  // Calculate top referrers
  const topReferrers = await db
    .select({
      referrer: pageViews.referrer,
      count: count()
    })
    .from(pageViews)
    .where(and(
      eq(pageViews.websiteId, websiteId),
      dateFilter,
      sql`${pageViews.referrer} is not null and ${pageViews.referrer} != ''`
    ))
    .groupBy(pageViews.referrer)
    .orderBy(sql`count(*) desc`)
    .limit(20);

  // Prepare aggregated data
  const aggregatedData = {
    websiteId: websiteId,
    date: startOfDay,
    totalSessions: sessionStats[0]?.totalSessions || 0,
    totalPageViews: pageViewStats[0]?.totalPageViews || 0,
    totalVisitors: sessionStats[0]?.totalVisitors || 0,
    newVisitors: sessionStats[0]?.newVisitors || 0,
    bounceRate: bounceRate.toString(), // Convert to string for decimal field
    avgSessionDuration: (sessionStats[0]?.totalDuration && sessionStats[0]?.totalSessions
      ? Math.round((Number(sessionStats[0].totalDuration) / sessionStats[0].totalSessions) / 60 * 100) / 100 // Convert to minutes
      : 0).toString(), // Convert to string for decimal field
    // Store detailed breakdowns as JSON
    deviceBreakdown: deviceStats.filter(item => item.device !== null).map(item => ({ device: item.device!, count: item.count })),
    browserBreakdown: browserStats.filter(item => item.browser !== null).map(item => ({ browser: item.browser!, count: item.count })),
    osBreakdown: osStats.filter(item => item.os !== null).map(item => ({ os: item.os!, count: item.count })),
    countryBreakdown: countryStats.filter(item => item.country !== null).map(item => ({ country: item.country!, count: item.count })),
    eventBreakdown: eventStats.filter(item => item.eventType !== null).map(item => ({ eventType: item.eventType!, count: item.count })),
    topPages: topPages.filter(item => item.path !== null).map(item => ({
      path: item.path!,
      title: item.title || '',
      views: item.views,
      avgTime: Number(item.avgTime) || 0
    })),
    topReferrers: topReferrers.filter(item => item.referrer !== null).map(item => ({
      referrer: item.referrer!,
      count: item.count
    })),
    uniquePages: pageViewStats[0]?.uniquePages || 0,
    avgTimeOnPage: Math.round(Number(pageViewStats[0]?.avgTimeOnPage) || 0)
  };

  // Store or update the aggregated data
  await db.insert(analyticsSummary).values(aggregatedData)
    .onConflictDoUpdate({
      target: [analyticsSummary.websiteId, analyticsSummary.date],
      set: aggregatedData
    });

  return aggregatedData;
}

export async function aggregateDateRange(websiteId: string, startDate: Date, endDate: Date) {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const results = [];
  for (const date of dates) {
    try {
      const result = await aggregateAnalyticsData(websiteId, date);
      results.push(result);
    } catch (error) {
      console.error(`Error aggregating data for ${date.toISOString()}:`, error);
    }
  }

  return results;
}

export async function getAggregatedMetrics(websiteId: string, startDate: Date, endDate: Date) {
  return await db
    .select()
    .from(analyticsSummary)
    .where(and(
      eq(analyticsSummary.websiteId, websiteId),
      gte(analyticsSummary.date, startDate),
      lte(analyticsSummary.date, endDate)
    ))
    .orderBy(analyticsSummary.date);
}