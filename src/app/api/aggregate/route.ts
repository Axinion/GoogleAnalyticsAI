import { NextRequest, NextResponse } from 'next/server';
import { aggregateAnalyticsData } from '@/lib/analytics/aggregation';

export async function POST(request: NextRequest) {
  try {
    const { websiteId, date } = await request.json();

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    const targetDate = date ? new Date(date) : new Date();

    // Run aggregation for the specified date
    await aggregateAnalyticsData(websiteId, targetDate);

    return NextResponse.json({ success: true, message: 'Analytics data aggregated successfully' });
  } catch (error) {
    console.error('Error aggregating analytics data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to trigger aggregation for all websites (for cron jobs)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    const date = searchParams.get('date');

    const targetDate = date ? new Date(date) : new Date();

    if (websiteId) {
      // Aggregate for specific website
      await aggregateAnalyticsData(websiteId, targetDate);
      return NextResponse.json({ success: true, message: `Analytics data aggregated for website ${websiteId}` });
    } else {
      // Aggregate for all websites (this would be called by a cron job)
      // In a real implementation, you'd get all website IDs and aggregate for each
      return NextResponse.json({ error: 'Website ID required for aggregation' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in aggregation endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}