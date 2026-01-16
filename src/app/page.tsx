'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">Analytics</h1>
            </div>
            {userId ? (
              <Link
                href="/dashboard"
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/sign-in"
                  className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Understand Your Visitors
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Get comprehensive analytics insights for your websites. Track visitor behavior, monitor performance, and make data-driven decisions in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {!userId ? (
                <>
                  <Link
                    href="/sign-up"
                    className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition inline-block text-center"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/sign-in"
                    className="px-8 py-4 text-lg font-semibold text-blue-600 border-2 border-blue-600 hover:bg-blue-50 rounded-lg transition inline-block text-center"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-8 py-4 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition inline-block text-center"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
            <p className="mt-6 text-sm text-gray-500">
              ✓ Free tier available • ✓ No credit card required • ✓ Easy setup
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-12 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-xl text-gray-700 font-semibold">
                  Real-time Analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Everything You Need
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "👁️",
                title: "Real-time Visitors",
                description: "Track active visitors on your website right now with live updates"
              },
              {
                icon: "📄",
                title: "Page Analytics",
                description: "Detailed metrics for each page including views, time spent, and bounce rate"
              },
              {
                icon: "🌍",
                title: "Geographic Data",
                description: "See where your visitors are coming from with country and city breakdown"
              },
              {
                icon: "📱",
                title: "Device Tracking",
                description: "Understand your traffic across desktop, mobile, and tablet devices"
              },
              {
                icon: "🔍",
                title: "Browser Insights",
                description: "Track which browsers and operating systems your users prefer"
              },
              {
                icon: "⚡",
                title: "Fast & Lightweight",
                description: "Our tracking script is only 2KB and won't slow down your website"
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Simple 3-Step Setup
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Account",
                description: "Sign up in seconds with Google or Email"
              },
              {
                step: "2",
                title: "Add Website",
                description: "Create a new website property and get your tracking ID"
              },
              {
                step: "3",
                title: "Install Script",
                description: "Copy and paste the tracking script to your website"
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Simple Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for getting started",
                features: ["Up to 10,000 events/month", "1 website", "Basic analytics", "Email support"]
              },
              {
                name: "Professional",
                price: "$29",
                description: "For growing websites",
                features: ["500,000 events/month", "Unlimited websites", "Advanced analytics", "Priority support"],
                highlighted: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large scale operations",
                features: ["Unlimited events", "Custom integration", "API access", "Dedicated support"]
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-8 transition ${
                  plan.highlighted
                    ? "bg-blue-600 text-white ring-2 ring-blue-600 transform scale-105"
                    : "bg-white text-gray-900"
                }`}
              >
                <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                <p className={`text-sm mb-4 ${plan.highlighted ? "text-blue-100" : "text-gray-600"}`}>
                  {plan.description}
                </p>
                <div className="text-4xl font-bold mb-6">
                  {plan.price}
                  {plan.price !== "Custom" && <span className="/month text-lg font-normal">/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <span className="mr-3">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 font-semibold rounded-lg transition ${
                    plan.highlighted
                      ? "bg-white text-blue-600 hover:bg-gray-100"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of website owners tracking their analytics with our platform
          </p>
          {!userId ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="px-8 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-100 rounded-lg transition inline-block"
              >
                Get Started Free
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-4 text-lg font-semibold border-2 border-white text-white hover:bg-blue-700 rounded-lg transition inline-block"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="px-8 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-100 rounded-lg transition inline-block"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Analytics</h4>
              <p className="text-sm">
                The simplest way to understand your website visitors
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2024 Analytics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
