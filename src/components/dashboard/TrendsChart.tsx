import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendData } from '@/services/api';
import { format, parseISO } from 'date-fns';

interface TrendsChartProps {
  data: TrendData[];
  isLoading?: boolean;
}

export function TrendsChart({ data, isLoading }: TrendsChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: format(parseISO(item.date), 'MMM dd'),
    passRate: Math.round(item.passRate * 100) / 100,
  }));

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border flex-1 flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Test Trends</h3>
        <p className="text-sm text-muted-foreground">Pass rate and failure count over time</p>
      </div>

      <div className="flex-1 min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="passRate"
              name="Pass Rate %"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--chart-2))' }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="failCount"
              name="Failures"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--chart-3))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
