'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BreakdownChartProps {
  data: Array<{ name: string; value: number; fill?: string }>;
  title: string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#EC4899', // pink
  '#6B7280', // gray
];

export function BreakdownChart({ data, title, colors = DEFAULT_COLORS }: BreakdownChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.fill || colors[index % colors.length],
  }));

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 group">
      <h3 className="text-lg font-bold text-gray-900 mb-6 group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value, 'Count']}
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
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}