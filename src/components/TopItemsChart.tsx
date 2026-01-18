'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopItemsChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
  color?: string;
  maxItems?: number;
}

export function TopItemsChart({ data, title, color = '#3B82F6', maxItems = 10 }: TopItemsChartProps) {
  const chartData = data
    .slice(0, maxItems)
    .map((item) => ({
      name: item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name,
      value: item.value,
      fullName: item.name,
    }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [value, 'Count']}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.name === label);
                return item?.fullName || label;
              }}
            />
            <Bar dataKey="value" fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}