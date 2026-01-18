import { createPlan, getAllPlans } from '@/lib/db/queries';

// Pricing plans configuration
export const PRICING_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    maxWebsites: 1,
    maxSessions: 1000, // 1K sessions per month
    features: [
      '1 website',
      '1,000 sessions/month',
      'Basic analytics',
      'Real-time tracking',
      '7-day data retention'
    ],
    clerkPlanId: null,
    isPopular: false,
  },
  PRO: {
    name: 'Pro',
    price: 29,
    maxWebsites: 10,
    maxSessions: 100000, // 100K sessions per month
    features: [
      '10 websites',
      '100,000 sessions/month',
      'Advanced analytics',
      'Real-time tracking',
      'Unlimited data retention',
      'Custom dashboards',
      'Export data',
      'Priority support'
    ],
    clerkPlanId: 'pro_plan', // This will be set up in Clerk
    isPopular: true,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 99,
    maxWebsites: 100,
    maxSessions: 1000000, // 1M sessions per month
    features: [
      '100 websites',
      '1,000,000 sessions/month',
      'All Pro features',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'White-label option'
    ],
    clerkPlanId: 'enterprise_plan', // This will be set up in Clerk
    isPopular: false,
  },
};

/**
 * Initialize pricing plans in the database
 * This should be run once during setup
 */
export async function initializePricingPlans() {
  const existingPlans = await getAllPlans();
  
  if (existingPlans.length > 0) {
    console.log('Pricing plans already exist');
    return;
  }

  console.log('Creating pricing plans...');

  for (const [key, plan] of Object.entries(PRICING_PLANS)) {
    await createPlan({
      name: plan.name,
      price: plan.price.toString(),
      features: plan.features,
      maxWebsites: plan.maxWebsites,
      maxSessions: plan.maxSessions,
      clerkPlanId: plan.clerkPlanId,
      isPopular: plan.isPopular,
    });
  }

  console.log('Pricing plans created successfully');
}

/**
 * Get pricing plan by Clerk plan ID
 */
export function getPlanByClerkId(clerkPlanId: string) {
  return Object.values(PRICING_PLANS).find(plan => plan.clerkPlanId === clerkPlanId);
}

/**
 * Get free plan
 */
export function getFreePlan() {
  return PRICING_PLANS.FREE;
}