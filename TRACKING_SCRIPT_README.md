# Google Analytics Clone - Tracking Script

A lightweight, framework-agnostic JavaScript tracking script for collecting comprehensive analytics data.

## Features

- **Page Views**: Automatic tracking of page views and navigation
- **Session Duration**: Tracks how long users stay on your site
- **Active Time Tracking**: Monitors actual user activity vs. idle time
- **Geographic Data**: Collects country, city, and region information
- **Device Information**: Detects device type, OS, browser, and versions
- **Live User Detection**: Identifies currently active users
- **Performance Metrics**: Tracks page load times and DOM ready times
- **Event Tracking**: Custom events, goals, form submissions, outbound links
- **Error Tracking**: JavaScript errors and performance issues
- **Framework Compatibility**: Works with React, Next.js, Angular, Vue, HTML, and more

## Installation

### Basic HTML

Add this script tag to your HTML `<head>` section, replacing `YOUR_TRACKING_ID` with your actual tracking ID:

```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/api/track?id=YOUR_TRACKING_ID';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
```

### React/Next.js

```jsx
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Load tracking script
    const script = document.createElement('script');
    script.src = `${process.env.NEXT_PUBLIC_API_URL}/api/track?id=YOUR_TRACKING_ID`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

### Angular

Add to your `index.html`:

```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/api/track?id=YOUR_TRACKING_ID';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
```

Or use Angular's script loading:

```typescript
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  ngOnInit() {
    const script = document.createElement('script');
    script.src = `${environment.apiUrl}/api/track?id=YOUR_TRACKING_ID`;
    script.async = true;
    document.head.appendChild(script);
  }
}
```

### Vue.js

```javascript
// main.js
const app = createApp(App);

// Add tracking script
const script = document.createElement('script');
script.src = `${import.meta.env.VITE_API_URL}/api/track?id=YOUR_TRACKING_ID`;
script.async = true;
document.head.appendChild(script);

app.mount('#app');
```

## Manual Event Tracking

Once the script is loaded, you can track custom events:

```javascript
// Track custom events
window.AnalyticsTracker.trackEvent('button_click', {
  buttonId: 'signup-btn',
  page: 'landing'
});

// Track goals
window.AnalyticsTracker.trackGoal('signup_completed', 1);

// Track custom metrics
window.AnalyticsTracker.trackEvent('video_played', {
  videoId: 'intro-video',
  duration: 45,
  completed: false
});
```

## Data Collected

### Automatic Data
- **Page Views**: URL, title, referrer, time spent
- **Session Data**: Session ID, visitor ID, start/end times
- **Geographic**: Country, city, region (via IP geolocation)
- **Device**: Mobile/desktop/tablet, screen resolution, viewport
- **Browser**: Name, version, user agent
- **OS**: Name, version, platform
- **Performance**: Page load time, DOM ready time, paint metrics
- **Activity**: Active time, idle detection, live user status

### Event Types
- `pageview`: Page visits
- `pageleave`: When user leaves a page
- `sessionend`: Session termination
- `heartbeat`: Active user pings
- `form_submit`: Form submissions
- `outbound_link`: External link clicks
- `error`: JavaScript errors
- `performance`: Page performance metrics
- `custom_event`: User-defined events
- `goal`: Conversion goals

## Configuration

The script includes several configurable options:

```javascript
// In the tracking script (automatically configured)
var config = {
  trackingId: 'YOUR_TRACKING_ID',
  endpoint: '/api/track-data',
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  heartbeatInterval: 30 * 1000, // 30 seconds
  geoApiUrl: 'https://ipapi.co/json/'
};
```

## Privacy & Compliance

- **GDPR Compliant**: Only collects data after script loads
- **No Personal Data**: Doesn't collect emails, names, or PII
- **Cookie Usage**: Uses first-party cookies for session/visitor tracking
- **IP Anonymization**: IP addresses are not stored long-term
- **Opt-out**: Users can disable tracking by blocking the script

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Impact

- **Script Size**: ~8KB minified
- **Load Time**: Asynchronous loading, doesn't block page render
- **Network Requests**: Minimal - only sends data when events occur
- **CPU Usage**: Lightweight activity monitoring

## Troubleshooting

### Script Not Loading
- Check that `YOUR_TRACKING_ID` is valid
- Verify the API endpoint is accessible
- Check browser console for errors

### Data Not Appearing
- Ensure database is properly configured
- Check API logs for errors
- Verify tracking ID exists in your database

### Events Not Tracking
- Make sure the script has fully loaded before calling `AnalyticsTracker` methods
- Check that event parameters are properly formatted

## API Reference

### AnalyticsTracker.trackEvent(eventName, properties)
Tracks a custom event.

**Parameters:**
- `eventName` (string): Name of the event
- `properties` (object): Additional event data

### AnalyticsTracker.trackGoal(goalName, value)
Tracks a conversion goal.

**Parameters:**
- `goalName` (string): Name of the goal
- `value` (number): Goal value (optional)

## Security

- All data is sent over HTTPS
- No sensitive information is collected
- Server-side validation prevents malicious data injection
- Rate limiting prevents abuse

## Contributing

To extend the tracking script:

1. Modify the script in `/src/app/api/track/route.ts`
2. Update the API handlers in `/src/app/api/track-data/route.ts`
3. Add new database fields if needed
4. Update this documentation

## License

This tracking script is part of the Google Analytics Clone project.