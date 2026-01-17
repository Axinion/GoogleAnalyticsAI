import { getEnhancedMetrics, getSessionsByWebsiteId, getPageViewsByWebsiteId, getEventsByWebsiteId } from '@/lib/db/queries';

export async function exportAnalyticsData(websiteId: string, dateRange: { from: Date; to: Date }, format: 'json' | 'csv' = 'json') {
  // Get comprehensive data
  const metrics = await getEnhancedMetrics(websiteId, dateRange);
  const sessions = await getSessionsByWebsiteId(websiteId, 10000); // Large limit for export
  const pageViews = await getPageViewsByWebsiteId(websiteId, 10000);
  const events = await getEventsByWebsiteId(websiteId, 10000);

  // Filter by date range
  const filteredSessions = sessions.filter(s =>
    s.startTime >= dateRange.from && s.startTime <= dateRange.to
  );
  const filteredPageViews = pageViews.filter(pv =>
    pv.timestamp >= dateRange.from && pv.timestamp <= dateRange.to
  );
  const filteredEvents = events.filter(e =>
    e.timestamp >= dateRange.from && e.timestamp <= dateRange.to
  );

  const exportData = {
    metadata: {
      websiteId,
      dateRange: {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      },
      exportedAt: new Date().toISOString(),
      totalRecords: {
        sessions: filteredSessions.length,
        pageViews: filteredPageViews.length,
        events: filteredEvents.length
      }
    },
    summary: metrics,
    sessions: filteredSessions.map(session => ({
      id: session.id,
      sessionId: session.sessionId,
      visitorId: session.visitorId,
      startTime: session.startTime?.toISOString(),
      endTime: session.endTime?.toISOString(),
      duration: session.duration,
      activeTime: session.activeTime,
      pageViews: session.pageViews,
      isNewVisitor: session.isNewVisitor,
      isLiveUser: session.isLiveUser,
      lastActivity: session.lastActivity?.toISOString(),
      // Geographic data
      country: session.country,
      city: session.city,
      region: session.region,
      // Device data
      device: session.device,
      browser: session.browser,
      browserVersion: session.browserVersion,
      os: session.os,
      osVersion: session.osVersion,
      // Technical data
      timezone: session.timezone,
      language: session.language,
      screenResolution: session.screenResolution,
      viewport: session.viewport,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress
    })),
    pageViews: filteredPageViews.map(pv => ({
      id: pv.id,
      sessionId: pv.sessionId,
      path: pv.path,
      title: pv.title,
      referrer: pv.referrer,
      duration: pv.duration,
      pageLoadTime: pv.pageLoadTime,
      domReadyTime: pv.domReadyTime,
      timestamp: pv.timestamp?.toISOString()
    })),
    events: filteredEvents.map(event => ({
      id: event.id,
      sessionId: event.sessionId,
      eventType: event.eventType,
      eventData: event.eventData,
      timestamp: event.timestamp?.toISOString()
    }))
  };

  switch (format) {
    case 'csv':
      return exportToCSV(exportData);
    default:
      return JSON.stringify(exportData, null, 2);
  }
}

function exportToCSV(data: any): string {
  const csvParts: string[] = [];

  // Summary section
  csvParts.push('=== SUMMARY ===');
  csvParts.push('Metric,Value');
  csvParts.push(`Total Sessions,${data.summary.totalSessions}`);
  csvParts.push(`Total Page Views,${data.summary.totalPageViews}`);
  csvParts.push(`Total Visitors,${data.summary.totalVisitors}`);
  csvParts.push(`New Visitors,${data.summary.newVisitors}`);
  csvParts.push(`Bounce Rate,${data.summary.bounceRate}%`);
  csvParts.push(`Avg Session Duration,${data.summary.avgSessionDuration} min`);
  csvParts.push(`Avg Time on Page,${data.summary.avgTimeOnPage} sec`);
  csvParts.push(`Unique Pages,${data.summary.uniquePages}`);
  csvParts.push(`Live Users,${data.summary.liveUsers}`);
  csvParts.push('');

  // Device breakdown
  csvParts.push('=== DEVICE BREAKDOWN ===');
  csvParts.push('Device,Count');
  data.summary.deviceBreakdown.forEach((item: any) => {
    csvParts.push(`${item.device},${item.count}`);
  });
  csvParts.push('');

  // Browser breakdown
  csvParts.push('=== BROWSER BREAKDOWN ===');
  csvParts.push('Browser,Count');
  data.summary.browserBreakdown.forEach((item: any) => {
    csvParts.push(`${item.browser},${item.count}`);
  });
  csvParts.push('');

  // Sessions
  csvParts.push('=== SESSIONS ===');
  csvParts.push('Session ID,Visitor ID,Start Time,Duration,Page Views,Country,City,Device,Browser,OS');
  data.sessions.forEach((session: any) => {
    csvParts.push([
      session.sessionId,
      session.visitorId,
      session.startTime,
      session.duration || '',
      session.pageViews,
      session.country || '',
      session.city || '',
      session.device,
      session.browser,
      session.os
    ].join(','));
  });
  csvParts.push('');

  // Page Views
  csvParts.push('=== PAGE VIEWS ===');
  csvParts.push('Path,Title,Duration,Page Load Time,DOM Ready Time,Timestamp');
  data.pageViews.forEach((pv: any) => {
    csvParts.push([
      `"${pv.path}"`,
      `"${pv.title || ''}"`,
      pv.duration || '',
      pv.pageLoadTime || '',
      pv.domReadyTime || '',
      pv.timestamp
    ].join(','));
  });
  csvParts.push('');

  // Events
  csvParts.push('=== EVENTS ===');
  csvParts.push('Event Type,Event Data,Timestamp');
  data.events.forEach((event: any) => {
    csvParts.push([
      event.eventType,
      `"${JSON.stringify(event.eventData)}"`,
      event.timestamp
    ].join(','));
  });

  return csvParts.join('\n');
}