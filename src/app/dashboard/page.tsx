'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserNav } from "@/components/UserNav";
import { MetricCard } from "@/components/MetricCard";
import { WebsiteSelector } from "@/components/WebsiteSelector";
import { DateRangePicker } from "@/components/DateRangePicker";
import { TimePeriodToggle } from "@/components/TimePeriodToggle";
import { BreakdownChart } from "@/components/BreakdownChart";
import { TopItemsChart } from "@/components/TopItemsChart";
import { GeographicData } from "@/components/GeographicData";
import { ReferralSources } from "@/components/ReferralSources";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";

interface Website {
  id: string;
  name: string;
  domain: string;
}

interface EnhancedMetrics {
  totalSessions: number;
  totalPageViews: number;
  totalVisitors: number;
  newVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  avgTimeOnPage: number;
  uniquePages: number;
  deviceBreakdown: Array<{ device: string; count: number }>;
  browserBreakdown: Array<{ browser: string; count: number }>;
  osBreakdown: Array<{ os: string; count: number }>;
  countryBreakdown: Array<{ country: string; count: number }>;
  eventBreakdown: Array<{ eventType: string; count: number }>;
  topPages: Array<{ path: string; title?: string; views: number; avgTime?: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  liveUsers: number;
}

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<EnhancedMetrics | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{
    date: string;
    sessions?: number;
    pageViews?: number;
    visitors?: number;
    bounceRate?: number;
  }>>([]);
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
        realtime: 'true',
      });

      // Fetch enhanced metrics
      const metricsResponse = await fetch(`/api/enhanced-metrics?${params}`);
      if (!metricsResponse.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData.metrics);

      // Fetch time series data
      const timeSeriesResponse = await fetch(`/api/time-series?${params}`);
      if (timeSeriesResponse.ok) {
        const timeSeriesData = await timeSeriesResponse.json();
        setTimeSeriesData(timeSeriesData.timeSeriesData);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Data</span>
              </div>
              <UserNav />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
                <p className="text-blue-100 text-lg">
                  Here's what's happening with your website analytics today.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics?.liveUsers || 0}</div>
                    <div className="text-sm text-blue-200">Live Users</div>
                  </div>
                  <div className="w-px h-12 bg-blue-400"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics?.totalSessions || 0}</div>
                    <div className="text-sm text-blue-200">Sessions Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Header Controls */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
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
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`}
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
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <MetricCard
            title="Total Sessions"
            value={metrics?.totalSessions || 0}
            gradient="from-blue-500 to-cyan-500"
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
            gradient="from-green-500 to-emerald-500"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            loading={loading || refreshing}
          />
          <MetricCard
            title="Avg. Session Duration"
            value={`${Math.round((metrics?.avgSessionDuration || 0) / 60)}m`}
            gradient="from-purple-500 to-pink-500"
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
            gradient="from-orange-500 to-red-500"
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
            gradient="from-indigo-500 to-purple-600"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            loading={loading || refreshing}
          />
        </div>

        {/* Analytics Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Device Breakdown */}
          <BreakdownChart
            data={metrics?.deviceBreakdown.map(d => ({ name: d.device, value: d.count })) || []}
            title="Device Types"
          />

          {/* Browser Breakdown */}
          <BreakdownChart
            data={metrics?.browserBreakdown.map(d => ({ name: d.browser, value: d.count })) || []}
            title="Browser Usage"
          />

          {/* OS Breakdown */}
          <BreakdownChart
            data={metrics?.osBreakdown.map(d => ({ name: d.os, value: d.count })) || []}
            title="Operating Systems"
          />

          {/* Referral Sources */}
          <ReferralSources referrers={metrics?.topReferrers || []} />
        </div>

        {/* Geographic Data */}
        <div className="mb-8">
          <GeographicData countries={metrics?.countryBreakdown || []} />
        </div>

        {/* Top Pages and Referrers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TopItemsChart
            data={metrics?.topPages.map(p => ({ name: p.path, value: p.views })) || []}
            title="Top Pages"
            color="#3B82F6"
          />

          <TopItemsChart
            data={metrics?.topReferrers.map(r => ({ name: r.referrer || 'Direct', value: r.count })) || []}
            title="Top Referrers"
            color="#10B981"
          />
        </div>

        {/* Time Series Chart */}
        <TimeSeriesChart
          data={timeSeriesData}
          title="Trends Over Time"
          metrics={['sessions', 'pageViews', 'visitors']}
        />
      </main>
    </div>
  );
}
