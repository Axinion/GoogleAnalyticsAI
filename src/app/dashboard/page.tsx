'use client';

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center">
              <p className="text-sm text-gray-600">User ID: {userId}</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome to your Dashboard
          </h2>
          <p className="text-gray-600">
            This is your main analytics dashboard. Here you'll be able to:
          </p>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600">
            <li>View analytics for your websites</li>
            <li>Track visitor sessions and page views</li>
            <li>Manage your analytics properties</li>
            <li>View subscription and billing information</li>
          </ul>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Next Steps:</strong> Complete your profile and add your
              first website to start collecting analytics.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
