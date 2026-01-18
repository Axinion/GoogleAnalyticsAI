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
  gradient?: string;
}

export function MetricCard({ title, value, icon, change, loading, gradient = 'from-blue-500 to-purple-600' }: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="mt-4 h-10 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">{value}</p>
        {change && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            change.type === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            <svg
              className={`w-4 h-4 ${change.type === 'increase' ? 'rotate-0' : 'rotate-180'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>{Math.abs(change.value)}% from last period</span>
          </div>
        )}
      </div>
    </div>
  );
}