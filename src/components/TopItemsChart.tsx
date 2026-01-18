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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 group">
      <h3 className="text-lg font-bold text-gray-900 mb-6 group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              formatter={(value, name) => [value, 'Count']}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.name === label);
                return item?.fullName || label;
              }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            />
            <Bar
              dataKey="value"
              fill={color}
              radius={[4, 4, 0, 0]}
              animationBegin={0}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}