'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserNav } from "@/components/UserNav";

interface Plan {
  id: number;
  name: string;
  price: string;
  features: string[];
  maxWebsites: number;
  maxSessions: number;
  isPopular: boolean;
}

interface Subscription {
  id: string;
  planId: number;
  status: string;
  startDate: string;
  endDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
}

export default function BillingPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (userId) {
      loadBillingData();
    }
  }, [userId]);

  const loadBillingData = async () => {
    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        fetch('/api/billing'),
        fetch('/api/billing/subscription')
      ]);

      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData.plans);
      }

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        setSubscription(subscriptionData.subscription);
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: number) => {
    setUpgrading(true);
    try {
      // In a real implementation, this would redirect to Clerk billing
      // For now, we'll simulate the upgrade
      const response = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          status: 'active',
        }),
      });

      if (response.ok) {
        await loadBillingData();
        alert('Plan upgraded successfully!');
      } else {
        throw new Error('Failed to upgrade plan');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to upgrade plan. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadBillingData();
        alert('Subscription cancelled successfully.');
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  if (!isLoaded || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Billing & Subscription
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <UserNav />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Current Subscription */}
        {subscription && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Current Subscription</h2>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{subscription.plan.name} Plan</h3>
                  <p className="text-sm text-gray-600">
                    ${subscription.plan.price}/month • {subscription.plan.maxWebsites} websites • {subscription.plan.maxSessions.toLocaleString()} sessions/month
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: <span className={`font-medium ${subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      {subscription.status}
                    </span>
                    {subscription.cancelAtPeriodEnd && (
                      <span className="ml-2 text-orange-600">(Cancelling at period end)</span>
                    )}
                  </p>
                </div>
                <div className="flex space-x-3">
                  {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-lg text-gray-600">Select the perfect plan for your analytics needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 ${
                  plan.isPopular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-600">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="text-center">
                  {subscription?.planId === plan.id ? (
                    <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                      Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        plan.price === '0'
                          ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {upgrading ? 'Upgrading...' : plan.price === '0' ? 'Free Plan' : 'Upgrade Now'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Stats */}
        {subscription && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Usage Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Websites Used</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {/* This would show actual usage - for now showing placeholder */}
                  1 / {subscription.plan.maxWebsites}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sessions This Month</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {/* This would show actual usage - for now showing placeholder */}
                  0 / {subscription.plan.maxSessions.toLocaleString()}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}