import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getWebsitesByUserId } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const websites = await getWebsitesByUserId(userId);

    return NextResponse.json({ websites });
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}