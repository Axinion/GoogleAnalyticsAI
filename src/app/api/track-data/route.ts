import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteByTrackingId, createSession, createPageView, getSessionBySessionId, updateSession, createEvent } from '@/lib/db/queries';

// Event handler functions
async function handlePageView(data: any, website: any, request: NextRequest) {
  const {
    sessionId,
    visitorId,
    path,
    title,
    referrer,
    url,
    timestamp,
    country,
    city,
    region,
    device,
    browser,
    browserVersion,
    os,
    osVersion,
    userAgent,
    language,
    screenResolution,
    viewport,
    timezone,
    isLiveUser,
    activeTime,
    pageLoadTime,
    domReadyTime
  } = data;

  // Check if session exists
  let session = await getSessionBySessionId(sessionId);

  if (!session) {
    // Create new session
    const sessionData = await createSession({
      websiteId: website.id,
      sessionId: sessionId,
      visitorId: visitorId,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: userAgent,
      country: country || 'Unknown',
      city: city || 'Unknown',
      region: region || 'Unknown',
      device: device || 'desktop',
      browser: browser || 'Unknown',
      os: os || 'Unknown',
      startTime: new Date(timestamp),
      pageViews: 1,
      isNewVisitor: true, // Simplified - would check if visitor exists
      timezone: timezone,
      language: language,
      screenResolution: screenResolution,
      viewport: viewport,
      browserVersion: browserVersion,
      osVersion: osVersion,
      isLiveUser: isLiveUser || false
    });
    session = sessionData[0];
  } else {
    // Update existing session page views
    await updateSession(session.id, {
      pageViews: (session.pageViews || 0) + 1,
      lastActivity: new Date(timestamp)
    });
  }

  // Create page view
  await createPageView({
    sessionId: session.id,
    websiteId: website.id,
    path: path || '/',
    title: title || '',
    referrer: referrer || '',
    duration: 0, // Will be updated on page leave
    timestamp: new Date(timestamp),
    pageLoadTime: pageLoadTime || 0,
    domReadyTime: domReadyTime || 0
  });
}

async function handlePageLeave(data: any, website: any) {
  const { sessionId, timeSpent, previousPath } = data;

  // Update the previous page view with duration
  // This would require additional database queries to find and update the last page view
  // For now, we'll create an event
  await createEvent({
    websiteId: website.id,
    sessionId: sessionId,
    eventType: 'page_leave',
    eventData: { timeSpent, path: previousPath },
    timestamp: new Date()
  });
}

async function handleSessionEnd(data: any, website: any) {
  const { sessionId, sessionDuration, timeSpent, path } = data;

  const session = await getSessionBySessionId(sessionId);
  if (session) {
    await updateSession(session.id, {
      endTime: new Date(),
      duration: sessionDuration,
      lastActivity: new Date()
    });
  }

  await createEvent({
    websiteId: website.id,
    sessionId: sessionId,
    eventType: 'session_end',
    eventData: { sessionDuration, lastPageTimeSpent: timeSpent, lastPath: path },
    timestamp: new Date()
  });
}

async function handleHeartbeat(data: any, website: any) {
  const { sessionId, activeTime } = data;

  const session = await getSessionBySessionId(sessionId);
  if (session) {
    await updateSession(session.id, {
      lastActivity: new Date(),
      activeTime: activeTime
    });
  }
}

async function handleFormSubmit(data: any, website: any) {
  const { sessionId, formId, formAction, formMethod } = data;

  await createEvent({
    websiteId: website.id,
    sessionId: sessionId,
    eventType: 'form_submit',
    eventData: { formId, formAction, formMethod },
    timestamp: new Date()
  });
}

async function handleOutboundLink(data: any, website: any) {
  const { sessionId, linkUrl, linkText } = data;

  await createEvent({
    websiteId: website.id,
    sessionId: sessionId,
    eventType: 'outbound_link',
    eventData: { linkUrl, linkText },
    timestamp: new Date()
  });
}

async function handleError(data: any, website: any) {
  const { sessionId, errorMessage, errorFilename, errorLine, errorColumn } = data;

  await createEvent({
    websiteId: website.id,
    sessionId: sessionId,
    eventType: 'javascript_error',
    eventData: { errorMessage, errorFilename, errorLine, errorColumn },
    timestamp: new Date()
  });
}

async function handlePerformance(data: any, website: any) {
  const { sessionId, pageLoadTime, domReadyTime, firstPaint, firstContentfulPaint } = data;

  await createEvent({
    websiteId: website.id,
    sessionId: sessionId,
    eventType: 'performance',
    eventData: { pageLoadTime, domReadyTime, firstPaint, firstContentfulPaint },
    timestamp: new Date()
  });
}

async function handleCustomEvent(data: any, website: any) {
  const { sessionId, eventName, properties } = data;

  await createEvent({
    websiteId: website.id,
    sessionId: sessionId,
    eventType: 'custom_event',
    eventData: { eventName, properties },
    timestamp: new Date()
  });
}

async function handleGoal(data: any, website: any) {
  const { sessionId, goalName, value } = data;

  await createEvent({
    websiteId: website.id,
    sessionId: sessionId,
    eventType: 'goal',
    eventData: { goalName, value },
    timestamp: new Date()
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      trackingId,
      sessionId,
      visitorId,
      type = 'pageview',
      path,
      title,
      referrer,
      url,
      timestamp,
      sessionStartTime,
      pageStartTime,
      // Geographic data
      country,
      city,
      region,
      timezone,
      // Device and browser info
      device,
      browser,
      browserVersion,
      os,
      osVersion,
      screenResolution,
      viewport,
      colorDepth,
      pixelRatio,
      touchSupport,
      cookiesEnabled,
      language,
      languages,
      platform,
      userAgent,
      // Additional tracking data
      isLiveUser,
      activeTime,
      pageLoadTime,
      domReadyTime,
      timeSpent,
      sessionDuration,
      previousPath,
      formId,
      formAction,
      formMethod,
      linkUrl,
      linkText,
      errorMessage,
      errorFilename,
      errorLine,
      errorColumn,
      firstPaint,
      firstContentfulPaint,
      eventName,
      properties,
      goalName,
      value
    } = data;

    if (!trackingId || !sessionId || !visitorId) {
      return NextResponse.json({ error: 'Missing required tracking data' }, { status: 400 });
    }

    // Verify website exists
    const website = await getWebsiteByTrackingId(trackingId);
    if (!website) {
      return NextResponse.json({ error: 'Invalid tracking ID' }, { status: 404 });
    }

    // Handle different event types
    switch (type) {
      case 'pageview':
        await handlePageView(data, website, request);
        break;
      case 'pageleave':
        await handlePageLeave(data, website);
        break;
      case 'sessionend':
        await handleSessionEnd(data, website);
        break;
      case 'heartbeat':
        await handleHeartbeat(data, website);
        break;
      case 'formsubmit':
        await handleFormSubmit(data, website);
        break;
      case 'outboundlink':
        await handleOutboundLink(data, website);
        break;
      case 'error':
        await handleError(data, website);
        break;
      case 'performance':
        await handlePerformance(data, website);
        break;
      case 'custom':
        await handleCustomEvent(data, website);
        break;
      case 'goal':
        await handleGoal(data, website);
        break;
      default:
        await handlePageView(data, website, request);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}