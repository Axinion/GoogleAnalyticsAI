'use client';

import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  loading?: boolean;
}

export function MetricCard({ title, value, icon, change, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-4 h-8 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm mt-1 ${
            change.type === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}% from last period
          </p>
        )}
      </div>
    </div>
  );
}