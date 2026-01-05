import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RunsTable } from '@/components/dashboard/RunsTable';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { getRuns, TestRun } from '@/services/api';

// Mock data for preview
const mockRuns: TestRun[] = [
  { id: 1, executionDate: '2024-01-07T14:30:00Z', totalTests: 83, passCount: 78, failCount: 5, skipCount: 0, status: 'Healthy' },
  { id: 2, executionDate: '2024-01-06T10:15:00Z', totalTests: 85, passCount: 74, failCount: 11, skipCount: 0, status: 'Unhealthy' },
  { id: 3, executionDate: '2024-01-05T16:45:00Z', totalTests: 75, passCount: 69, failCount: 6, skipCount: 0, status: 'Healthy' },
  { id: 4, executionDate: '2024-01-04T09:00:00Z', totalTests: 80, passCount: 72, failCount: 8, skipCount: 0, status: 'Healthy' },
  { id: 5, executionDate: '2024-01-03T11:30:00Z', totalTests: 83, passCount: 68, failCount: 15, skipCount: 0, status: 'Unhealthy' },
  { id: 6, executionDate: '2024-01-02T08:00:00Z', totalTests: 79, passCount: 75, failCount: 4, skipCount: 0, status: 'Healthy' },
  { id: 7, executionDate: '2024-01-01T15:20:00Z', totalTests: 82, passCount: 70, failCount: 12, skipCount: 0, status: 'Unhealthy' },
];

export default function TestRuns() {
  const { daysNumber } = useDateFilter();
  const [runs, setRuns] = useState<TestRun[]>(mockRuns);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRuns = async () => {
      setIsLoading(true);
      try {
        const data = await getRuns({ days: daysNumber });
        setRuns(data);
      } catch (error) {
        console.log('Using mock data - backend not available');
        setRuns(mockRuns);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRuns();
  }, [daysNumber]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Runs</h1>
          <p className="text-muted-foreground">
            View all test run history
          </p>
        </div>

        {/* Runs Table */}
        <RunsTable data={runs} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
