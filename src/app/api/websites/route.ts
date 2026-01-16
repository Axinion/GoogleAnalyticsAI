import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getWebsitesByUserId, createWebsite } from '@/lib/db/queries';
import { syncUserWithDatabase } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sync user with database and get database user ID
    const dbUser = await syncUserWithDatabase();
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const websites = await getWebsitesByUserId(dbUser.id);

    return NextResponse.json({ websites });
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sync user with database and get database user ID
    const dbUser = await syncUserWithDatabase();
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, domain, timezone, localTracking } = body;

    if (!name || !domain) {
      return NextResponse.json({ error: 'Name and domain are required' }, { status: 400 });
    }

    // Generate unique tracking ID
    const trackingId = `GA-${randomUUID().slice(0, 8).toUpperCase()}`;

    const website = await createWebsite({
      userId: dbUser.id,
      name,
      domain,
      trackingId,
      timezone: timezone || 'UTC',
      localTracking: localTracking || false,
    });

    return NextResponse.json({ website: website[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating website:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}