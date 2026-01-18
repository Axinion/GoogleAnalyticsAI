'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TimeSeriesChartProps {
  data: Array<{
    date: string;
    sessions?: number;
    pageViews?: number;
    visitors?: number;
    bounceRate?: number;
  }>;
  title: string;
  metrics?: Array<'sessions' | 'pageViews' | 'visitors' | 'bounceRate'>;
}

const METRIC_CONFIG = {
  sessions: { color: '#3B82F6', label: 'Sessions' },
  pageViews: { color: '#10B981', label: 'Page Views' },
  visitors: { color: '#F59E0B', label: 'Visitors' },
  bounceRate: { color: '#EF4444', label: 'Bounce Rate (%)' },
};

export function TimeSeriesChart({
  data,
  title,
  metrics = ['sessions', 'pageViews', 'visitors']
}: TimeSeriesChartProps) {
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString(),
    bounceRate: item.bounceRate ? Math.round(item.bounceRate * 100) / 100 : undefined,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {metrics.map(metric => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={METRIC_CONFIG[metric].color}
                strokeWidth={2}
                name={METRIC_CONFIG[metric].label}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}