'use client';

interface TimePeriodToggleProps {
  period: 'hourly' | 'daily';
  onPeriodChange: (period: 'hourly' | 'daily') => void;
  loading?: boolean;
}

export function TimePeriodToggle({ period, onPeriodChange, loading }: TimePeriodToggleProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onPeriodChange('hourly')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          period === 'hourly'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Hourly
      </button>
      <button
        onClick={() => onPeriodChange('daily')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          period === 'daily'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Daily
      </button>
    </div>
  );
}