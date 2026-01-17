import { NextRequest, NextResponse } from 'next/server';
import { aggregateDateRange } from '@/lib/analytics/aggregation';
import { getWebsitesByUserId } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    // Simple API key validation (in production, use proper authentication)
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const days = parseInt(searchParams.get('days') || '1');
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Get all websites (in production, you'd want to batch this or use a queue)
    // For now, we'll aggregate for a sample website
    const sampleWebsiteId = searchParams.get('websiteId');

    if (!sampleWebsiteId) {
      return NextResponse.json({ error: 'Website ID required for demo' }, { status: 400 });
    }

    console.log(`Starting aggregation for website ${sampleWebsiteId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const results = await aggregateDateRange(sampleWebsiteId, startDate, endDate);

    console.log(`Aggregation completed. Processed ${results.length} days.`);

    return NextResponse.json({
      success: true,
      message: `Aggregated data for ${results.length} days`,
      processedDays: results.length,
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString()
      }
    });
  } catch (error) {
    console.error('Error in cron aggregation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}