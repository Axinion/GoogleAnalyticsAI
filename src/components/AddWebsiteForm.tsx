'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Website {
  id: string;
  name: string;
  domain: string;
  trackingId: string;
  timezone: string;
  localTracking: boolean;
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export default function AddWebsiteForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    timezone: 'UTC',
    localTracking: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdWebsite, setCreatedWebsite] = useState<Website | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create website');
      }

      const data = await response.json();
      setCreatedWebsite(data.website);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingScript = (trackingId: string, localTracking: boolean) => {
    const baseUrl = localTracking ? 'http://localhost:3000' : 'https://your-analytics-domain.com';
    return `<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/api/track.js?id=${trackingId}';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;
  };

  if (createdWebsite) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Website Created Successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your website "{createdWebsite.name}" has been added to your analytics dashboard.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Tracking Script</h3>
          <p className="text-sm text-gray-600">
            Copy and paste this script into the &lt;head&gt; section of your website to start tracking analytics.
          </p>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">JavaScript</span>
              <button
                onClick={() => navigator.clipboard.writeText(generateTrackingScript(createdWebsite.trackingId, createdWebsite.localTracking))}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
              >
                Copy
              </button>
            </div>
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{generateTrackingScript(createdWebsite.trackingId, createdWebsite.localTracking)}</code>
            </pre>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => setCreatedWebsite(null)}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Add Another Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Website Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="My Website"
          required
        />
      </div>

      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
          Domain
        </label>
        <input
          type="text"
          id="domain"
          value={formData.domain}
          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="example.com"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter the domain without http:// or https://
        </p>
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
          Timezone
        </label>
        <select
          id="timezone"
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="localTracking"
          type="checkbox"
          checked={formData.localTracking}
          onChange={(e) => setFormData({ ...formData, localTracking: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="localTracking" className="ml-2 block text-sm text-gray-900">
          Enable local tracking (for development)
        </label>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Website'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}