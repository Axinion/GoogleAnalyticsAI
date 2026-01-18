import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription, createSubscription, updateSubscription, cancelSubscription, getPlanById } from '@/lib/db/queries';
import { syncUserWithDatabase } from '@/lib/auth';

// GET /api/billing/subscription - Get current user's subscription
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await syncUserWithDatabase();
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = await getUserSubscription(dbUser.id);
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/billing/subscription - Create or update subscription
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await syncUserWithDatabase();
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { planId, clerkSubscriptionId, status, currentPeriodStart, currentPeriodEnd } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Check if plan exists
    const plan = await getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check if user already has an active subscription
    const existingSubscription = await getUserSubscription(dbUser.id);

    if (existingSubscription) {
      // Update existing subscription
      const updatedSubscription = await updateSubscription(existingSubscription.id, {
        planId,
        clerkSubscriptionId,
        status: status || 'active',
        currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart) : undefined,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : undefined,
        updatedAt: new Date(),
      });

      return NextResponse.json({ subscription: updatedSubscription[0] });
    } else {
      // Create new subscription
      const newSubscription = await createSubscription({
        userId: dbUser.id,
        planId,
        clerkSubscriptionId,
        status: status || 'active',
        startDate: new Date(),
        currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart) : new Date(),
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : undefined,
      });

      return NextResponse.json({ subscription: newSubscription[0] }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/billing/subscription - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await syncUserWithDatabase();
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = await getUserSubscription(dbUser.id);
    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const cancelledSubscription = await cancelSubscription(subscription.id);
    return NextResponse.json({ subscription: cancelledSubscription[0] });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}