import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDashboardMetrics } from '@/lib/db/queries';

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

    const dateRange = {
      from: fromDate ? new Date(fromDate) : undefined,
      to: toDate ? new Date(toDate) : undefined,
    };

    const metrics = await getDashboardMetrics(websiteId, dateRange.from, dateRange.to);

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}