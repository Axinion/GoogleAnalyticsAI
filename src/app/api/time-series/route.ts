import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAggregatedMetrics } from '@/lib/analytics/aggregation';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const websiteId = searchParams.get('websiteId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    if (!fromDate || !toDate) {
      return NextResponse.json({ error: 'Date range is required' }, { status: 400 });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    const aggregatedData = await getAggregatedMetrics(websiteId, startDate, endDate);

    // Transform the data for the time series chart
    const timeSeriesData = aggregatedData.map(day => ({
      date: day.date.toISOString().split('T')[0], // YYYY-MM-DD format
      sessions: day.totalSessions,
      pageViews: day.totalPageViews,
      visitors: day.totalVisitors,
      bounceRate: parseFloat(day.bounceRate || '0'),
      avgSessionDuration: parseFloat(day.avgSessionDuration || '0'),
      avgTimeOnPage: day.avgTimeOnPage,
    }));

    return NextResponse.json({ timeSeriesData });
  } catch (error) {
    console.error('Error fetching time series data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}