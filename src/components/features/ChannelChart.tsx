import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import type { ChannelStats } from '@/types';
import { Users } from 'lucide-react';

interface ChannelChartProps {
  data: (ChannelStats | { name: string; value: number; 响应率: number })[];
}

export const ChannelChart = ({ data }: ChannelChartProps) => {
  const chartData = data.map((item) => {
    if ('channel' in item) {
      return {
        name: item.channel,
        value: item.totalUnits,
        responded: item.respondedUnits,
        rate: item.responseRate,
      };
    }
    return {
      name: item.name,
      value: item.value,
      responded: Math.round((item.响应率 / 100) * item.value),
      rate: item.响应率,
    };
  });

  const COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EF4444'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg">
          <p className="text-sm font-semibold text-slate-700 mb-2">{data.name}</p>
          <p className="text-sm text-slate-600">单位数: {data.value}</p>
          <p className="text-sm text-green-600">已反馈: {data.responded}</p>
          <p className="text-sm text-blue-600">响应率: {data.rate}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            渠道分布
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-200 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                formatter={(value, entry: any) => (
                  <span className="text-sm text-slate-600">
                    {value} ({entry.payload.value}个单位)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
