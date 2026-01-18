import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAllPlans, getUserSubscription, createSubscription, updateSubscription, cancelSubscription } from '@/lib/db/queries';
import { syncUserWithDatabase } from '@/lib/auth';
import { initializePricingPlans } from '@/lib/billing';

// GET /api/billing/plans - Get all pricing plans
export async function GET(request: NextRequest) {
  try {
    const plans = await getAllPlans();
    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/billing/init - Initialize pricing plans (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you might want to implement proper admin check)
    const dbUser = await syncUserWithDatabase();
    if (!dbUser || dbUser.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await initializePricingPlans();
    return NextResponse.json({ message: 'Pricing plans initialized successfully' });
  } catch (error) {
    console.error('Error initializing plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}