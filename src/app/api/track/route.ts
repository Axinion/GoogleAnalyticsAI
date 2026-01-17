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
    heartbeatInterval: 30 * 1000, // 30 seconds for active time tracking
    geoApiUrl: 'https://ipapi.co/json/', // Free IP geolocation service
  };

  // State variables
  var sessionStartTime = Date.now();
  var lastActivityTime = Date.now();
  var pageStartTime = Date.now();
  var totalActiveTime = 0;
  var isActive = true;
  var heartbeatTimer = null;
  var geoData = null;
  var currentPath = window.location.pathname;

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

  // Get geographic data
  function getGeoData() {
    return new Promise(function(resolve) {
      if (geoData) {
        resolve(geoData);
        return;
      }

      var xhr = new XMLHttpRequest();
      xhr.open('GET', config.geoApiUrl, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              geoData = JSON.parse(xhr.responseText);
              resolve(geoData);
            } catch (e) {
              resolve({ country: 'Unknown', city: 'Unknown', region: 'Unknown' });
            }
          } else {
            resolve({ country: 'Unknown', city: 'Unknown', region: 'Unknown' });
          }
        }
      };
      xhr.send();
    });
  }

  // Enhanced device and browser detection
  function getDeviceInfo() {
    var ua = navigator.userAgent;
    var platform = navigator.platform;

    // Device type
    var isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    var isTablet = /iPad|Android(?=.*\bMobile\b)|Tablet/i.test(ua);
    var device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    // Browser detection
    var browser = 'Unknown';
    var browserVersion = 'Unknown';

    if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
      browser = 'Chrome';
      var match = ua.match(/Chrome\\/(\\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
      var match = ua.match(/Firefox\\/(\\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Android')) {
      browser = 'Safari';
      var match = ua.match(/Version\\/(\\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (ua.includes('Edg')) {
      browser = 'Edge';
      var match = ua.match(/Edg\\/(\\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (ua.includes('OPR') || ua.includes('Opera')) {
      browser = 'Opera';
      var match = ua.match(/(?:OPR|Opera)\\/(\\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (ua.includes('MSIE') || ua.includes('Trident')) {
      browser = 'Internet Explorer';
      var match = ua.match(/(?:MSIE |rv:)(\\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }

    // OS detection
    var os = 'Unknown';
    var osVersion = 'Unknown';

    if (platform.includes('Win')) {
      os = 'Windows';
      if (ua.includes('Windows NT 10.0')) osVersion = '10';
      else if (ua.includes('Windows NT 6.3')) osVersion = '8.1';
      else if (ua.includes('Windows NT 6.2')) osVersion = '8';
      else if (ua.includes('Windows NT 6.1')) osVersion = '7';
      else if (ua.includes('Windows NT 6.0')) osVersion = 'Vista';
      else if (ua.includes('Windows NT 5.1')) osVersion = 'XP';
    } else if (platform.includes('Mac')) {
      os = 'macOS';
      var match = ua.match(/Mac OS X ([\\d_]+)/);
      if (match) {
        osVersion = match[1].replace(/_/g, '.');
      }
    } else if (platform.includes('Linux')) {
      os = 'Linux';
      if (ua.includes('Android')) {
        os = 'Android';
        var match = ua.match(/Android ([\\d.]+)/);
        osVersion = match ? match[1] : 'Unknown';
      } else if (ua.includes('Ubuntu')) {
        osVersion = 'Ubuntu';
      }
    } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
      os = 'iOS';
      var match = ua.match(/OS ([\\d_]+)/);
      if (match) {
        osVersion = match[1].replace(/_/g, '.');
      }
    }

    return {
      device: device,
      browser: browser,
      browserVersion: browserVersion,
      os: os,
      osVersion: osVersion,
      screenResolution: screen.width + 'x' + screen.height,
      viewport: window.innerWidth + 'x' + window.innerHeight,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window,
      cookiesEnabled: navigator.cookieEnabled,
      language: navigator.language,
      languages: navigator.languages ? navigator.languages.join(',') : navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: platform,
      userAgent: ua
    };
  }

  // Activity tracking
  function updateActivity() {
    lastActivityTime = Date.now();
    if (!isActive) {
      isActive = true;
      sendHeartbeat();
    }
  }

  // Track user activity
  function trackActivity() {
    var events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(function(event) {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for inactivity every 5 seconds
    setInterval(function() {
      if (Date.now() - lastActivityTime > 5 * 60 * 1000) { // 5 minutes of inactivity
        isActive = false;
      }
    }, 5000);
  }

  // Send heartbeat for active time tracking
  function sendHeartbeat() {
    if (!isActive) return;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', config.endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      trackingId: config.trackingId,
      sessionId: sessionId,
      visitorId: visitorId,
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
      activeTime: Math.round((Date.now() - sessionStartTime) / 1000)
    }));
  }

  // Start heartbeat
  function startHeartbeat() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(sendHeartbeat, config.heartbeatInterval);
  }

  // Stop heartbeat
  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
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

  // Track page view with enhanced data
  function trackPageView(additionalData) {
    getGeoData().then(function(geo) {
      var deviceInfo = getDeviceInfo();
      var data = {
        trackingId: config.trackingId,
        sessionId: sessionId,
        visitorId: visitorId,
        type: 'pageview',
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        sessionStartTime: new Date(sessionStartTime).toISOString(),
        pageStartTime: new Date(pageStartTime).toISOString(),
        // Geographic data
        country: geo.country || 'Unknown',
        city: geo.city || 'Unknown',
        region: geo.region || 'Unknown',
        timezone: deviceInfo.timezone,
        // Device and browser info
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
        os: deviceInfo.os,
        osVersion: deviceInfo.osVersion,
        screenResolution: deviceInfo.screenResolution,
        viewport: deviceInfo.viewport,
        colorDepth: deviceInfo.colorDepth,
        pixelRatio: deviceInfo.pixelRatio,
        touchSupport: deviceInfo.touchSupport,
        cookiesEnabled: deviceInfo.cookiesEnabled,
        language: deviceInfo.language,
        languages: deviceInfo.languages,
        platform: deviceInfo.platform,
        userAgent: deviceInfo.userAgent,
        // Additional data
        isLiveUser: true, // For live user detection
        activeTime: Math.round((Date.now() - sessionStartTime) / 1000),
        pageLoadTime: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : 0,
        domReadyTime: performance.timing ? performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart : 0,
        // Merge additional data if provided
        ...additionalData
      };

      // Send data to server
      var xhr = new XMLHttpRequest();
      xhr.open('POST', config.endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    });
  }

  // Track page view on load
  trackPageView();

  // Track page view on history change (SPA support)
  var observer = new MutationObserver(function() {
    if (window.location.pathname !== currentPath) {
      // Send page leave event with time spent
      var timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
      trackPageView({
        type: 'pageleave',
        timeSpent: timeSpent,
        previousPath: currentPath
      });

      // Update current path and track new page view
      currentPath = window.location.pathname;
      pageStartTime = Date.now();
      trackPageView();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Handle browser navigation (back/forward buttons)
  window.addEventListener('popstate', function() {
    setTimeout(function() {
      if (window.location.pathname !== currentPath) {
        var timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
        trackPageView({
          type: 'pageleave',
          timeSpent: timeSpent,
          previousPath: currentPath
        });

        currentPath = window.location.pathname;
        pageStartTime = Date.now();
        trackPageView();
      }
    }, 100);
  });

  // Track time on page and session duration
  window.addEventListener('beforeunload', function() {
    var timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    var sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);

    // Send final page leave and session end data
    var xhr = new XMLHttpRequest();
    xhr.open('POST', config.endpoint, false); // Synchronous for beforeunload
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      trackingId: config.trackingId,
      sessionId: sessionId,
      visitorId: visitorId,
      type: 'sessionend',
      path: currentPath,
      timeSpent: timeSpent,
      sessionDuration: sessionDuration,
      timestamp: new Date().toISOString()
    }));
  });

  // Start activity tracking and heartbeat
  trackActivity();
  startHeartbeat();

  // Handle visibility change (tab switching)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      stopHeartbeat();
      isActive = false;
    } else {
      isActive = true;
      lastActivityTime = Date.now();
      startHeartbeat();
    }
  });

  // Track form submissions
  document.addEventListener('submit', function(e) {
    trackPageView({
      type: 'formsubmit',
      formId: e.target.id || 'unknown',
      formAction: e.target.action || '',
      formMethod: e.target.method || 'unknown'
    });
  });

  // Track outbound links
  document.addEventListener('click', function(e) {
    var target = e.target.closest('a');
    if (target && target.href) {
      var url = new URL(target.href);
      var currentUrl = new URL(window.location.href);

      // Check if it's an outbound link
      if (url.hostname !== currentUrl.hostname) {
        trackPageView({
          type: 'outboundlink',
          linkUrl: target.href,
          linkText: target.textContent.trim()
        });
      }
    }
  });

  // Track errors
  window.addEventListener('error', function(e) {
    trackPageView({
      type: 'error',
      errorMessage: e.message,
      errorFilename: e.filename,
      errorLine: e.lineno,
      errorColumn: e.colno
    });
  });

  // Track performance metrics
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (performance.timing) {
        trackPageView({
          type: 'performance',
          pageLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
          domReadyTime: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          firstPaint: performance.getEntriesByType('paint')[0] ? performance.getEntriesByType('paint')[0].startTime : 0,
          firstContentfulPaint: performance.getEntriesByType('paint')[1] ? performance.getEntriesByType('paint')[1].startTime : 0
        });
      }
    }, 0);
  });

  // Expose tracking methods globally for manual tracking
  window.AnalyticsTracker = {
    trackEvent: function(eventName, properties) {
      trackPageView({
        type: 'custom',
        eventName: eventName,
        properties: properties || {}
      });
    },
    trackGoal: function(goalName, value) {
      trackPageView({
        type: 'goal',
        goalName: goalName,
        value: value || 0
      });
    }
  };
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