import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteByTrackingId, createSession, createPageView, getSessionBySessionId } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      trackingId,
      sessionId,
      visitorId,
      path,
      title,
      referrer,
      url,
      timestamp,
      userAgent,
      language,
      screenResolution,
      viewport,
      timezone,
    } = data;

    if (!trackingId || !sessionId || !visitorId) {
      return NextResponse.json({ error: 'Missing required tracking data' }, { status: 400 });
    }

    // Verify website exists
    const website = await getWebsiteByTrackingId(trackingId);
    if (!website) {
      return NextResponse.json({ error: 'Invalid tracking ID' }, { status: 404 });
    }

    // Parse user agent for device info
    const ua = userAgent || '';
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android(?=.*\bMobile\b)|Tablet/i.test(ua);
    const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Opera')) browser = 'Opera';

    // Detect OS
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    // Get location info (simplified - in production you'd use a geo IP service)
    const country = 'Unknown'; // Would be determined by IP
    const city = 'Unknown';

    // Check if session exists
    let session = await getSessionBySessionId(sessionId);

    if (!session) {
      // Create new session
      const sessionData = await createSession({
        websiteId: website.id,
        sessionId: sessionId,
        visitorId: visitorId,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: ua,
        country: country,
        city: city,
        device: device,
        browser: browser,
        os: os,
        startTime: new Date(timestamp),
        pageViews: 1,
        isNewVisitor: true, // Simplified - would check if visitor exists
      });
      session = sessionData[0];
    } else {
      // Update existing session page views
      // Note: In a real implementation, you'd update the pageViews count
    }

    // Create page view
    await createPageView({
      sessionId: session.id,
      websiteId: website.id,
      path: path || '/',
      title: title || '',
      referrer: referrer || '',
      duration: 0, // Will be updated later
      timestamp: new Date(timestamp),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}