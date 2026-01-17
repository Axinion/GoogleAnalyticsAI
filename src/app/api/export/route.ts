import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { exportAnalyticsData } from '@/lib/analytics/export';

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
    const format = searchParams.get('format') || 'json'; // json, csv

    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Supported: json, csv' }, { status: 400 });
    }

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    const dateRange = {
      from: fromDate ? new Date(fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: toDate ? new Date(toDate) : new Date()
    };

    const data = await exportAnalyticsData(websiteId, dateRange, format as 'json' | 'csv');

    // Set appropriate headers based on format
    const headers = new Headers();

    switch (format) {
      case 'csv':
        headers.set('Content-Type', 'text/csv');
        headers.set('Content-Disposition', `attachment; filename="analytics-${websiteId}-${dateRange.from.toISOString().split('T')[0]}-to-${dateRange.to.toISOString().split('T')[0]}.csv"`);
        break;
      default:
        headers.set('Content-Type', 'application/json');
        headers.set('Content-Disposition', `attachment; filename="analytics-${websiteId}-${dateRange.from.toISOString().split('T')[0]}-to-${dateRange.to.toISOString().split('T')[0]}.json"`);
    }

    return new Response(data, { headers });
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}