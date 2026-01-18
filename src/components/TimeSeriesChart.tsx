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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 group">
      <h3 className="text-lg font-bold text-gray-900 mb-6 group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {metrics.map(metric => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={METRIC_CONFIG[metric].color}
                strokeWidth={3}
                name={METRIC_CONFIG[metric].label}
                dot={{ r: 4, fill: METRIC_CONFIG[metric].color }}
                activeDot={{ r: 6, fill: METRIC_CONFIG[metric].color, stroke: '#fff', strokeWidth: 2 }}
                animationBegin={0}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}