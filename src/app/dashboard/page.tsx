'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserNav } from "@/components/UserNav";
import { MetricCard } from "@/components/MetricCard";
import { WebsiteSelector } from "@/components/WebsiteSelector";
import { DateRangePicker } from "@/components/DateRangePicker";
import { TimePeriodToggle } from "@/components/TimePeriodToggle";

interface Website {
  id: string;
  name: string;
  domain: string;
}

interface DashboardMetrics {
  totalVisitors: number;
  totalPageViews: number;
  totalActiveTime: number;
  avgTimeOnPage: number;
  liveUsers: number;
}

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [timePeriod, setTimePeriod] = useState<'hourly' | 'daily'>('daily');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    if (selectedWebsiteId) {
      loadMetrics();
    }
  }, [selectedWebsiteId, dateRange]);

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

  const loadMetrics = async () => {
    if (!selectedWebsiteId) return;

    setRefreshing(true);
    try {
      const params = new URLSearchParams({
        websiteId: selectedWebsiteId,
        fromDate: dateRange.from.toISOString(),
        toDate: dateRange.to.toISOString(),
      });

      const response = await fetch(`/api/metrics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadMetrics();
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Controls */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <WebsiteSelector
                  websites={websites}
                  selectedWebsiteId={selectedWebsiteId}
                  onWebsiteChange={setSelectedWebsiteId}
                  loading={loading}
                />
                <button
                  onClick={() => router.push('/dashboard/add-website')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Website
                </button>
              </div>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                loading={loading}
              />
            </div>
            <div className="flex items-center gap-4">
              <TimePeriodToggle
                period={timePeriod}
                onPeriodChange={setTimePeriod}
                loading={loading}
              />
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg
                  className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard
            title="Total Visitors"
            value={metrics?.totalVisitors || 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            loading={loading || refreshing}
          />
          <MetricCard
            title="Page Views"
            value={metrics?.totalPageViews || 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            loading={loading || refreshing}
          />
          <MetricCard
            title="Active Time"
            value={`${metrics?.totalActiveTime || 0}m`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            loading={loading || refreshing}
          />
          <MetricCard
            title="Avg. Time on Page"
            value={`${metrics?.avgTimeOnPage || 0}s`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            loading={loading || refreshing}
          />
          <MetricCard
            title="Live Users"
            value={metrics?.liveUsers || 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            loading={loading || refreshing}
          />
        </div>

        {/* Placeholder for Charts/Graphs */}
        <div className="bg-white rounded-lg shadow p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Charts and graphs will be implemented here</p>
          </div>
        </div>
      </main>
    </div>
  );
}
