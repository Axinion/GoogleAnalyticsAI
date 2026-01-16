import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteByTrackingId } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trackingId = searchParams.get('id');

  if (!trackingId) {
    return new NextResponse('Tracking ID is required', { status: 400 });
  }

  try {
    const website = await getWebsiteByTrackingId(trackingId);

    if (!website) {
      return new NextResponse('Invalid tracking ID', { status: 404 });
    }

    // Serve the tracking script
    const trackingScript = `
(function() {
  'use strict';

  // Configuration
  var config = {
    trackingId: '${trackingId}',
    endpoint: '${process.env.NEXT_PUBLIC_API_URL || ''}/api/track-data',
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  };

  // Utility functions
  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }

  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get or create session ID
  var sessionId = getCookie('analytics_session_${trackingId}');
  if (!sessionId) {
    sessionId = generateId();
    setCookie('analytics_session_${trackingId}', sessionId, 1); // 1 day
  }

  // Get or create visitor ID
  var visitorId = getCookie('analytics_visitor_${trackingId}');
  if (!visitorId) {
    visitorId = generateId();
    setCookie('analytics_visitor_${trackingId}', visitorId, 365); // 1 year
  }

  // Track page view
  function trackPageView() {
    var data = {
      trackingId: config.trackingId,
      sessionId: sessionId,
      visitorId: visitorId,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: screen.width + 'x' + screen.height,
      viewport: window.innerWidth + 'x' + window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Send data to server
    var xhr = new XMLHttpRequest();
    xhr.open('POST', config.endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  }

  // Track page view on load
  trackPageView();

  // Track page view on history change (SPA support)
  var currentPath = window.location.pathname;
  var observer = new MutationObserver(function() {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      trackPageView();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Track time on page
  var startTime = Date.now();
  window.addEventListener('beforeunload', function() {
    var timeSpent = Math.round((Date.now() - startTime) / 1000);
    // Could send time spent data here if needed
  });
})();
`;

    return new NextResponse(trackingScript, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving tracking script:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}