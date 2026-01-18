'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserNav } from "@/components/UserNav";
import { WebsiteSelector } from "@/components/WebsiteSelector";

interface Website {
  id: string;
  name: string;
  domain: string;
  trackingId: string;
  createdAt: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [websiteName, setWebsiteName] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (userId) {
      loadWebsites();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedWebsiteId && websites.length > 0) {
      const website = websites.find(w => w.id === selectedWebsiteId);
      if (website) {
        setSelectedWebsite(website);
        setWebsiteName(website.name);
        setWebsiteDomain(website.domain);
        setIsActive(website.isActive);
      }
    }
  }, [selectedWebsiteId, websites]);

  const loadWebsites = async () => {
    try {
      const response = await fetch('/api/websites');
      if (!response.ok) {
        throw new Error('Failed to fetch websites');
      }
      const data = await response.json();
      setWebsites(data.websites);
      if (data.websites.length > 0 && !selectedWebsiteId) {
        setSelectedWebsiteId(data.websites[0].id);
      }
    } catch (error) {
      console.error('Error loading websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWebsiteId) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/websites/${selectedWebsiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: websiteName,
          domain: websiteDomain,
          isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update website');
      }

      // Reload websites to get updated data
      await loadWebsites();

      // Show success message (you could add a toast notification here)
      alert('Website updated successfully!');
    } catch (error) {
      console.error('Error updating website:', error);
      alert('Failed to update website. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteWebsite = async () => {
    if (!selectedWebsiteId) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/websites/${selectedWebsiteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete website');
      }

      // Reload websites
      await loadWebsites();

      // Reset selected website
      setSelectedWebsiteId(null);
      setSelectedWebsite(null);

      // Show success message
      alert('Website deleted successfully!');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting website:', error);
      alert('Failed to delete website. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const generateTrackingScript = () => {
    if (!selectedWebsite) return '';

    const script = `(function() {
  'use strict';

  // Configuration
  var config = {
    trackingId: '${selectedWebsite.trackingId}',
    endpoint: '${typeof window !== 'undefined' ? window.location.origin : ''}/api/track-data',
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
    var d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

  // Generate or retrieve visitor ID
  function getVisitorId() {
    var visitorId = getCookie('ga_visitor_id');
    if (!visitorId) {
      visitorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      setCookie('ga_visitor_id', visitorId, 365); // 1 year
    }
    return visitorId;
  }

  // Generate or retrieve session ID
  function getSessionId() {
    var sessionId = getCookie('ga_session_id');
    var sessionStart = getCookie('ga_session_start');

    if (!sessionId || !sessionStart || (Date.now() - parseInt(sessionStart)) > config.sessionTimeout) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      setCookie('ga_session_id', sessionId, 0); // Session cookie
      setCookie('ga_session_start', Date.now().toString(), 0); // Session cookie
    }
    return sessionId;
  }

  // Get device information
  function getDeviceInfo() {
    var ua = navigator.userAgent;
    var device = 'desktop';
    var os = 'Unknown';
    var browser = 'Unknown';
    var browserVersion = 'Unknown';

    // Device detection
    if (/Mobi|Android/i.test(ua)) {
      device = 'mobile';
    } else if (/Tablet|iPad/i.test(ua)) {
      device = 'tablet';
    }

    // OS detection
    if (ua.indexOf('Windows NT') !== -1) os = 'Windows';
    else if (ua.indexOf('Mac OS X') !== -1) os = 'macOS';
    else if (ua.indexOf('Linux') !== -1) os = 'Linux';
    else if (ua.indexOf('Android') !== -1) os = 'Android';
    else if (ua.indexOf('iOS') !== -1 || ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) os = 'iOS';

    // Browser detection
    if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Edg') === -1) {
      browser = 'Chrome';
      browserVersion = ua.split('Chrome/')[1].split(' ')[0];
    } else if (ua.indexOf('Firefox') !== -1) {
      browser = 'Firefox';
      browserVersion = ua.split('Firefox/')[1];
    } else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) {
      browser = 'Safari';
      browserVersion = ua.split('Version/')[1].split(' ')[0];
    } else if (ua.indexOf('Edg') !== -1) {
      browser = 'Edge';
      browserVersion = ua.split('Edg/')[1].split(' ')[0];
    }

    return {
      device: device,
      os: os,
      browser: browser,
      browserVersion: browserVersion,
      screenResolution: screen.width + 'x' + screen.height,
      viewport: window.innerWidth + 'x' + window.innerHeight
    };
  }

  // Get geographic information
  function getGeoInfo(callback) {
    if (geoData) {
      callback(geoData);
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', config.geoApiUrl, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            geoData = JSON.parse(xhr.responseText);
            callback(geoData);
          } catch (e) {
            callback(null);
          }
        } else {
          callback(null);
        }
      }
    };
    xhr.send();
  }

  // Send tracking data
  function sendData(data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', config.endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (callback) callback(xhr.status === 200);
      }
    };
    xhr.send(JSON.stringify(data));
  }

  // Track page view
  function trackPageView() {
    var deviceInfo = getDeviceInfo();
    var data = {
      trackingId: config.trackingId,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      eventType: 'pageview',
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
      device: deviceInfo.device,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      browserVersion: deviceInfo.browserVersion,
      screenResolution: deviceInfo.screenResolution,
      viewport: deviceInfo.viewport,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isNewVisitor: !getCookie('ga_visitor_id'),
      isLiveUser: true
    };

    getGeoInfo(function(geo) {
      if (geo) {
        data.country = geo.country_name;
        data.city = geo.city;
        data.region = geo.region;
      }
      sendData(data);
    });
  }

  // Track user activity
  function trackActivity() {
    lastActivityTime = Date.now();
    isActive = true;
  }

  // Heartbeat for active time tracking
  function startHeartbeat() {
    heartbeatTimer = setInterval(function() {
      var currentTime = Date.now();
      var timeSinceActivity = currentTime - lastActivityTime;

      if (timeSinceActivity < 30000) { // 30 seconds of inactivity threshold
        totalActiveTime += 30000;
        isActive = true;
      } else {
        isActive = false;
      }

      // Send heartbeat data
      var data = {
        trackingId: config.trackingId,
        sessionId: getSessionId(),
        visitorId: getVisitorId(),
        eventType: 'heartbeat',
        timestamp: currentTime,
        activeTime: totalActiveTime,
        isActive: isActive,
        path: window.location.pathname
      };
      sendData(data);
    }, config.heartbeatInterval);
  }

  // Track events
  function trackEvent(eventType, eventData) {
    var data = {
      trackingId: config.trackingId,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      eventType: eventType,
      timestamp: Date.now(),
      path: window.location.pathname,
      ...eventData
    };
    sendData(data);
  }

  // Initialize tracking
  function init() {
    // Track initial page view
    trackPageView();

    // Start heartbeat
    startHeartbeat();

    // Track user activity
    document.addEventListener('mousedown', trackActivity);
    document.addEventListener('keydown', trackActivity);
    document.addEventListener('scroll', trackActivity);
    document.addEventListener('touchstart', trackActivity);

    // Track page visibility changes
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        trackEvent('page_hidden', { activeTime: totalActiveTime });
      } else {
        trackEvent('page_visible', { activeTime: totalActiveTime });
      }
    });

    // Track before unload
    window.addEventListener('beforeunload', function() {
      trackEvent('page_unload', {
        activeTime: totalActiveTime,
        sessionDuration: Date.now() - sessionStartTime
      });
    });

    // Track form submissions
    document.addEventListener('submit', function(e) {
      trackEvent('form_submit', {
        formId: e.target.id || 'unknown',
        formAction: e.target.action || window.location.href
      });
    });

    // Track outbound links
    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      if (target && target.href && target.host !== window.location.host) {
        trackEvent('outbound_link', {
          linkUrl: target.href,
          linkText: target.textContent || target.innerText || 'unknown'
        });
      }
    });
  }

  // Start tracking
  init();

  // Expose tracking functions globally
  window.ga = {
    trackEvent: trackEvent,
    trackPageView: trackPageView
  };
})();`;

    return script;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Tracking script copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard. Please copy manually.');
    });
  };

  if (!isLoaded || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Settings
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <UserNav />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Website Selector */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <WebsiteSelector
                  websites={websites}
                  selectedWebsiteId={selectedWebsiteId}
                  onWebsiteChange={setSelectedWebsiteId}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>

        {selectedWebsite && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Website Configuration */}
            <div className="space-y-8">
              {/* Configuration Details */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Configuration Details
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website Name</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedWebsite.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{selectedWebsite.domain}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg font-mono">{selectedWebsite.trackingId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${selectedWebsite.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm ${selectedWebsite.isActive ? 'text-green-700' : 'text-red-700'}`}>
                          {selectedWebsite.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {new Date(selectedWebsite.createdAt).toLocaleDateString()} at {new Date(selectedWebsite.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Update Configuration */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update Configuration
                </h3>

                <form onSubmit={handleUpdateWebsite} className="space-y-4">
                  <div>
                    <label htmlFor="websiteName" className="block text-sm font-medium text-gray-700 mb-1">
                      Website Name
                    </label>
                    <input
                      type="text"
                      id="websiteName"
                      value={websiteName}
                      onChange={(e) => setWebsiteName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="websiteDomain" className="block text-sm font-medium text-gray-700 mb-1">
                      Domain
                    </label>
                    <input
                      type="url"
                      id="websiteDomain"
                      value={websiteDomain}
                      onChange={(e) => setWebsiteDomain(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Website is active
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Website
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-200">
                <h3 className="text-lg font-bold text-red-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Danger Zone
                </h3>

                {!showDeleteConfirm ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Once you delete this website, there is no going back. This will permanently delete all analytics data associated with this website.
                    </p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Website
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-red-600 mb-4 font-medium">
                      Are you sure you want to delete "{selectedWebsite.name}"? This action cannot be undone.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDeleteWebsite}
                        disabled={deleting}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Yes, Delete Website
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Script */}
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Tracking Script
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateTrackingScript())}
                    className="flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200 text-sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </h3>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Add this tracking script to your website's <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">&lt;head&gt;</code> section to start collecting analytics data.
                  </p>

                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-xs leading-relaxed">
                      <code>{generateTrackingScript()}</code>
                    </pre>
                  </div>
                </div>

                {/* Alternative Installation Methods */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900">Alternative Installation Methods</h4>

                  {/* HTML Installation */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Basic HTML</h5>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <pre className="text-gray-800 text-xs">
                        <code>{`<script>
(function() {
  var script = document.createElement('script');
  script.src = '${typeof window !== 'undefined' ? window.location.origin : ''}/api/track?id=${selectedWebsite?.trackingId}';
  script.async = true;
  document.head.appendChild(script);
})();
</script>`}</code>
                      </pre>
                    </div>
                  </div>

                  {/* React/Next.js Installation */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">React/Next.js</h5>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <pre className="text-gray-800 text-xs">
                        <code>{`import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = \`${typeof window !== 'undefined' ? window.location.origin : ''}/api/track?id=${selectedWebsite?.trackingId}\`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return <Component {...pageProps} />;
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Implementation Guide
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Copy the tracking script</h4>
                      <p className="text-sm text-gray-600">Use the copy button above to copy the full tracking script.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Add to your website</h4>
                      <p className="text-sm text-gray-600">Paste the script in your HTML &lt;head&gt; section or use the framework-specific method.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Start collecting data</h4>
                      <p className="text-sm text-gray-600">Visit your website and check the dashboard for real-time analytics data.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}