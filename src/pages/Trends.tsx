import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrends, getFailurePatterns, TrendData, FailurePattern } from "@/services/api";
import { useDateFilter } from "@/contexts/DateFilterContext";
import { TrendingUp, TrendingDown, Clock, BarChart3, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";

// Mock data fallbacks
const generateMockTrendData = (days: number): TrendData[] => {
  const data: TrendData[] = [];
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, "yyyy-MM-dd"),
      passRate: Math.floor(Math.random() * 15) + 80,
      failCount: Math.floor(Math.random() * 20),
      totalTests: Math.floor(Math.random() * 50) + 100,
      avgDuration: Math.floor(Math.random() * 120) + 30,
      maxDuration: Math.floor(Math.random() * 300) + 100,
      minDuration: Math.floor(Math.random() * 20) + 5,
    });
  }
  return data;
};

const generateMockFailurePatterns = (): FailurePattern[] => [
  { category: "Timeout", count: 45, trend: "up" },
  { category: "Assertion", count: 32, trend: "down" },
  { category: "Connection", count: 28, trend: "up" },
  { category: "Null Pointer", count: 18, trend: "stable" },
  { category: "Out of Memory", count: 12, trend: "down" },
  { category: "Other", count: 8, trend: "stable" },
];

export default function Trends() {
  const { daysNumber } = useDateFilter();
  const [trendsData, setTrendsData] = useState<TrendData[]>([]);
  const [failurePatterns, setFailurePatterns] = useState<FailurePattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [trends, patterns] = await Promise.all([
          getTrends(daysNumber),
          getFailurePatterns(daysNumber),
        ]);
        setTrendsData(trends);
        setFailurePatterns(patterns);
      } catch (error) {
        console.log("Using mock data - backend not available");
        setTrendsData(generateMockTrendData(daysNumber));
        setFailurePatterns(generateMockFailurePatterns());
      }
      setIsLoading(false);
    };
    fetchData();
  }, [daysNumber]);

  const formattedTrends = trendsData.map((item) => ({
    ...item,
    formattedDate: format(parseISO(item.date), "MMM dd"),
    passRate: Math.round(item.passRate * 10) / 10,
  }));

  // Use execution time data from trends API (avgDuration, maxDuration, minDuration)
  const formattedExecution = trendsData.map((item) => ({
    formattedDate: format(parseISO(item.date), "MMM dd"),
    avgTime: item.avgDuration ?? 0,
    maxTime: item.maxDuration ?? 0,
    minTime: item.minDuration ?? 0,
  }));

  const avgPassRate = trendsData.length > 0
    ? Math.round((trendsData.reduce((sum, d) => sum + d.passRate, 0) / trendsData.length) * 10) / 10
    : 0;

  const totalFailures = trendsData.reduce((sum, d) => sum + d.failCount, 0);
  
  const avgExecutionTime = trendsData.length > 0
    ? Math.round(trendsData.reduce((sum, d) => sum + (d.avgDuration ?? 0), 0) / trendsData.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trends Analytics</h1>
          <p className="text-muted-foreground">
            Detailed analysis of test performance over time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Pass Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgPassRate}%</div>
              <p className="text-xs text-muted-foreground">
                Over the last {daysNumber} days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Failures</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFailures}</div>
              <p className="text-xs text-muted-foreground">
                Across all test runs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
              <Clock className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgExecutionTime}s</div>
              <p className="text-xs text-muted-foreground">
                Per test case
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pass Rate Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Pass Rate Trend
            </CardTitle>
            <CardDescription>
              Daily pass rate percentage over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={formattedTrends}>
                  <defs>
                    <linearGradient id="passRateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="passRate"
                    stroke="hsl(var(--chart-2))"
                    fill="url(#passRateGradient)"
                    strokeWidth={2}
                    name="Pass Rate (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Two Column Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Failure Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Failure Patterns
              </CardTitle>
              <CardDescription>
                Distribution of failure types
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={failurePatterns} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis
                      dataKey="category"
                      type="category"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--chart-4))"
                      radius={[0, 4, 4, 0]}
                      name="Occurrences"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Failure Count Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Daily Failures
              </CardTitle>
              <CardDescription>
                Number of test failures per day
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formattedTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="formattedDate"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar
                      dataKey="failCount"
                      fill="hsl(var(--destructive))"
                      radius={[4, 4, 0, 0]}
                      name="Failures"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Execution Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Execution Time Trends
            </CardTitle>
            <CardDescription>
              Test suite execution times (min, avg, max) in seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedExecution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}s`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="maxTime"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={false}
                    name="Max Time"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgTime"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                    name="Avg Time"
                  />
                  <Line
                    type="monotone"
                    dataKey="minTime"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                    name="Min Time"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
