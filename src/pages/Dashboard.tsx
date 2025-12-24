import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UploadReportDialog } from '@/components/dashboard/UploadReportDialog';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { TopFailuresCard } from '@/components/dashboard/TopFailuresCard';
import { FlakyTestsAlert } from '@/components/dashboard/FlakyTestsAlert';
import { RunsTable } from '@/components/dashboard/RunsTable';
import {
  getTrends,
  getTopFailures,
  getFlakyTests,
  getRuns,
  TrendData,
  TopFailure,
  FlakyTest,
  TestRun,
} from '@/services/api';

// Mock data for preview
const mockTrends: TrendData[] = [
  { date: '2024-01-01', passRate: 85, failCount: 12, totalTests: 80 },
  { date: '2024-01-02', passRate: 88, failCount: 10, totalTests: 83 },
  { date: '2024-01-03', passRate: 82, failCount: 15, totalTests: 83 },
  { date: '2024-01-04', passRate: 90, failCount: 8, totalTests: 80 },
  { date: '2024-01-05', passRate: 92, failCount: 6, totalTests: 75 },
  { date: '2024-01-06', passRate: 87, failCount: 11, totalTests: 85 },
  { date: '2024-01-07', passRate: 94, failCount: 5, totalTests: 83 },
];

const mockTopFailures: TopFailure[] = [
  { errorMessage: 'NullPointerException at UserService.java:42', count: 15, testName: 'testUserLogin' },
  { errorMessage: 'Timeout waiting for element to be visible', count: 12, testName: 'testCheckout' },
  { errorMessage: 'AssertionError: expected 200 but was 500', count: 8, testName: 'testAPIResponse' },
  { errorMessage: 'Connection refused to database', count: 5, testName: 'testDatabaseQuery' },
];

const mockFlakyTests: FlakyTest[] = [
  { testName: 'testAsyncDataLoad', className: 'DataLoaderTest', flakyScore: 0.45, passCount: 11, failCount: 9 },
  { testName: 'testWebSocketConnection', className: 'WebSocketTest', flakyScore: 0.38, passCount: 13, failCount: 7 },
];

const mockRuns: TestRun[] = [
  { id: 1, executionDate: '2024-01-07T14:30:00Z', totalTests: 83, passed: 78, failed: 5, skipped: 0, status: 'PASSED' },
  { id: 2, executionDate: '2024-01-06T10:15:00Z', totalTests: 85, passed: 74, failed: 11, skipped: 0, status: 'FAILED' },
  { id: 3, executionDate: '2024-01-05T16:45:00Z', totalTests: 75, passed: 69, failed: 6, skipped: 0, status: 'PASSED' },
  { id: 4, executionDate: '2024-01-04T09:00:00Z', totalTests: 80, passed: 72, failed: 8, skipped: 0, status: 'PASSED' },
  { id: 5, executionDate: '2024-01-03T11:30:00Z', totalTests: 83, passed: 68, failed: 15, skipped: 0, status: 'FAILED' },
];

export default function Dashboard() {
  const [trends, setTrends] = useState<TrendData[]>(mockTrends);
  const [topFailures, setTopFailures] = useState<TopFailure[]>(mockTopFailures);
  const [flakyTests, setFlakyTests] = useState<FlakyTest[]>(mockFlakyTests);
  const [runs, setRuns] = useState<TestRun[]>(mockRuns);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [trendsData, failuresData, flakyData, runsData] = await Promise.all([
        getTrends(30),
        getTopFailures(5),
        getFlakyTests(30),
        getRuns(),
      ]);
      setTrends(trendsData);
      setTopFailures(failuresData);
      setFlakyTests(flakyData);
      setRuns(runsData);
    } catch (error) {
      console.log('Using mock data - backend not available');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate metrics from trends
  const latestPassRate = trends.length > 0 ? trends[trends.length - 1].passRate : 0;
  const totalRuns = runs.length;
  const avgPassRate = trends.reduce((acc, t) => acc + t.passRate, 0) / trends.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your test execution metrics</p>
          </div>
          <UploadReportDialog onSuccess={fetchData} />
        </div>

        {/* Metrics Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Runs"
            value={totalRuns}
            subtitle="All time"
            icon={Activity}
            variant="default"
          />
          <MetricCard
            title="Avg Pass Rate"
            value={`${avgPassRate.toFixed(1)}%`}
            subtitle="Last 30 days"
            icon={TrendingUp}
            trend={{ value: 2.5, isPositive: true }}
            variant="default"
          />
          <MetricCard
            title="Latest Pass Rate"
            value={`${latestPassRate}%`}
            subtitle="Most recent run"
            icon={CheckCircle2}
            variant="success"
          />
          <MetricCard
            title="Active Failures"
            value={topFailures.reduce((acc, f) => acc + f.count, 0)}
            subtitle="Needs attention"
            icon={XCircle}
            variant="destructive"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TrendsChart data={trends} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-1">
            <TopFailuresCard data={topFailures} isLoading={isLoading} />
          </div>
        </div>

        {/* Flaky Tests Alert */}
        <FlakyTestsAlert data={flakyTests} isLoading={isLoading} />

        {/* Runs Table */}
        <RunsTable data={runs} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
